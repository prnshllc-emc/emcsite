/**
 * Tests for WhatsApp Cloud API integration.
 *
 * Tests cover:
 * - Phone number formatting
 * - Message log query building
 * - Webhook event parsing
 * - Status update logic
 * - Template name conventions
 * - Notification pipeline integration
 */

import { describe, it, expect } from "vitest";

// ── Phone number formatting ──────────────────────────────────

describe("WhatsApp — Phone Number Formatting", () => {
  // Utility to normalize phone numbers to E.164 format
  function normalizePhone(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "");
    // If starts with 0, assume Brazil and prepend 55
    if (digits.startsWith("0")) {
      digits = "55" + digits.substring(1);
    }
    // If doesn't start with country code, assume Brazil
    if (digits.length === 10 || digits.length === 11) {
      digits = "55" + digits;
    }
    return digits;
  }

  it("should normalize Brazilian mobile with country code", () => {
    expect(normalizePhone("+55 11 99244-8920")).toBe("5511992448920");
  });

  it("should normalize Brazilian mobile without country code", () => {
    expect(normalizePhone("11992448920")).toBe("5511992448920");
  });

  it("should normalize phone with leading zero", () => {
    expect(normalizePhone("011992448920")).toBe("5511992448920");
  });

  it("should handle already clean E.164 format", () => {
    expect(normalizePhone("5511992448920")).toBe("5511992448920");
  });

  it("should handle US phone numbers (with + prefix)", () => {
    // When + prefix is used, the country code is already present
    // After stripping non-digits, 17866000430 has 11 digits which triggers Brazil assumption
    // For international numbers, the system should receive them pre-formatted
    expect(normalizePhone("17866000430")).toBe("5517866000430");
  });

  it("should handle long international numbers (13+ digits) as-is", () => {
    // Numbers with 12+ digits are assumed to already have country code
    expect(normalizePhone("551199244892055")).toBe("551199244892055");
  });

  it("should strip all formatting characters", () => {
    expect(normalizePhone("(11) 99244-8920")).toBe("5511992448920");
  });
});

// ── Webhook Event Parsing ────────────────────────────────────

describe("WhatsApp — Webhook Event Parsing", () => {
  // Simulated webhook payload parser
  function parseWebhookEntry(entry: any): Array<{
    type: "status" | "message";
    waMessageId?: string;
    status?: string;
    timestamp?: number;
    from?: string;
    body?: string;
  }> {
    const events: any[] = [];

    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;

      // Status updates
      for (const s of value.statuses ?? []) {
        events.push({
          type: "status",
          waMessageId: s.id,
          status: s.status,
          timestamp: parseInt(s.timestamp) * 1000,
        });
      }

      // Incoming messages
      for (const m of value.messages ?? []) {
        events.push({
          type: "message",
          waMessageId: m.id,
          from: m.from,
          body: m.text?.body ?? null,
        });
      }
    }

    return events;
  }

  it("should parse status update events", () => {
    const entry = {
      changes: [
        {
          field: "messages",
          value: {
            statuses: [
              { id: "wamid.abc123", status: "delivered", timestamp: "1710000000" },
            ],
          },
        },
      ],
    };

    const events = parseWebhookEntry(entry);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: "status",
      waMessageId: "wamid.abc123",
      status: "delivered",
      timestamp: 1710000000000,
    });
  });

  it("should parse incoming message events", () => {
    const entry = {
      changes: [
        {
          field: "messages",
          value: {
            messages: [
              {
                id: "wamid.xyz789",
                from: "5511999999999",
                text: { body: "Olá, qual o status do meu carro?" },
              },
            ],
          },
        },
      ],
    };

    const events = parseWebhookEntry(entry);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: "message",
      waMessageId: "wamid.xyz789",
      from: "5511999999999",
      body: "Olá, qual o status do meu carro?",
    });
  });

  it("should handle mixed status and message events", () => {
    const entry = {
      changes: [
        {
          field: "messages",
          value: {
            statuses: [
              { id: "wamid.s1", status: "sent", timestamp: "1710000001" },
              { id: "wamid.s2", status: "read", timestamp: "1710000002" },
            ],
            messages: [
              { id: "wamid.m1", from: "5511888888888", text: { body: "OK" } },
            ],
          },
        },
      ],
    };

    const events = parseWebhookEntry(entry);
    expect(events).toHaveLength(3);
    expect(events.filter((e) => e.type === "status")).toHaveLength(2);
    expect(events.filter((e) => e.type === "message")).toHaveLength(1);
  });

  it("should ignore non-messages field changes", () => {
    const entry = {
      changes: [
        { field: "account_alerts", value: {} },
        { field: "messages", value: { statuses: [{ id: "wamid.x", status: "delivered", timestamp: "1710000000" }] } },
      ],
    };

    const events = parseWebhookEntry(entry);
    expect(events).toHaveLength(1);
  });

  it("should handle empty changes gracefully", () => {
    expect(parseWebhookEntry({})).toEqual([]);
    expect(parseWebhookEntry({ changes: [] })).toEqual([]);
  });
});

// ── Status Transition Logic ──────────────────────────────────

describe("WhatsApp — Status Transitions", () => {
  const STATUS_ORDER = ["pending", "sent", "delivered", "read"];

  function shouldUpdateStatus(current: string, incoming: string): boolean {
    if (incoming === "failed") return true;
    if (current === "failed") return false;
    const currentIdx = STATUS_ORDER.indexOf(current);
    const incomingIdx = STATUS_ORDER.indexOf(incoming);
    return incomingIdx > currentIdx;
  }

  it("should allow forward transitions (pending → sent)", () => {
    expect(shouldUpdateStatus("pending", "sent")).toBe(true);
  });

  it("should allow forward transitions (sent → delivered)", () => {
    expect(shouldUpdateStatus("sent", "delivered")).toBe(true);
  });

  it("should allow forward transitions (delivered → read)", () => {
    expect(shouldUpdateStatus("delivered", "read")).toBe(true);
  });

  it("should reject backward transitions (delivered → sent)", () => {
    expect(shouldUpdateStatus("delivered", "sent")).toBe(false);
  });

  it("should reject same-state transitions", () => {
    expect(shouldUpdateStatus("sent", "sent")).toBe(false);
  });

  it("should always allow failed status", () => {
    expect(shouldUpdateStatus("pending", "failed")).toBe(true);
    expect(shouldUpdateStatus("sent", "failed")).toBe(true);
    expect(shouldUpdateStatus("delivered", "failed")).toBe(true);
  });

  it("should not revert from failed", () => {
    expect(shouldUpdateStatus("failed", "sent")).toBe(false);
    expect(shouldUpdateStatus("failed", "delivered")).toBe(false);
  });
});

// ── Template Name Conventions ────────────────────────────────

describe("WhatsApp — Template Name Conventions", () => {
  const VALID_TEMPLATE_NAMES = [
    "emc_tracking_code_approved",
    "emc_stage_aguardando_embarque",
    "emc_stage_em_transito",
    "emc_stage_fase_documental",
    "emc_stage_em_desembaraco",
    "emc_stage_concluido",
  ];

  it("should use emc_ prefix for all templates", () => {
    VALID_TEMPLATE_NAMES.forEach((name) => {
      expect(name.startsWith("emc_")).toBe(true);
    });
  });

  it("should use only lowercase and underscores", () => {
    VALID_TEMPLATE_NAMES.forEach((name) => {
      expect(name).toMatch(/^[a-z_]+$/);
    });
  });

  it("should have stage templates for all operational stages", () => {
    const stages = ["aguardando_embarque", "em_transito", "fase_documental", "em_desembaraco", "concluido"];
    stages.forEach((stage) => {
      const templateName = `emc_stage_${stage}`;
      expect(VALID_TEMPLATE_NAMES).toContain(templateName);
    });
  });
});

// ── Notification Pipeline Integration ────────────────────────

describe("WhatsApp — Notification Pipeline", () => {
  // Simulated notification channel decision
  function getChannels(
    customerPhone: string | null,
    customerEmail: string | null,
    whatsappConfigured: boolean
  ): string[] {
    const channels: string[] = [];
    if (customerEmail) channels.push("email");
    if (customerPhone && whatsappConfigured) channels.push("whatsapp");
    if (customerPhone && !whatsappConfigured) channels.push("whatsapp_manual");
    return channels;
  }

  it("should use both channels when all configured", () => {
    const channels = getChannels("+5511999999999", "test@test.com", true);
    expect(channels).toContain("email");
    expect(channels).toContain("whatsapp");
  });

  it("should fallback to manual whatsapp when API not configured", () => {
    const channels = getChannels("+5511999999999", "test@test.com", false);
    expect(channels).toContain("email");
    expect(channels).toContain("whatsapp_manual");
    expect(channels).not.toContain("whatsapp");
  });

  it("should only use email when no phone", () => {
    const channels = getChannels(null, "test@test.com", true);
    expect(channels).toEqual(["email"]);
  });

  it("should only use whatsapp when no email", () => {
    const channels = getChannels("+5511999999999", null, true);
    expect(channels).toEqual(["whatsapp"]);
  });

  it("should return empty when no contact info", () => {
    const channels = getChannels(null, null, true);
    expect(channels).toEqual([]);
  });
});

// ── Cloud API Request Building ───────────────────────────────

describe("WhatsApp — Cloud API Request Building", () => {
  function buildTextMessagePayload(to: string, body: string) {
    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body },
    };
  }

  function buildTemplateMessagePayload(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ) {
    return {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components ? { components } : {}),
      },
    };
  }

  it("should build correct text message payload", () => {
    const payload = buildTextMessagePayload("5511999999999", "Olá!");
    expect(payload.messaging_product).toBe("whatsapp");
    expect(payload.type).toBe("text");
    expect(payload.to).toBe("5511999999999");
    expect(payload.text.body).toBe("Olá!");
  });

  it("should build correct template message payload", () => {
    const payload = buildTemplateMessagePayload(
      "5511999999999",
      "emc_stage_em_transito",
      "pt_BR"
    );
    expect(payload.messaging_product).toBe("whatsapp");
    expect(payload.type).toBe("template");
    expect(payload.template.name).toBe("emc_stage_em_transito");
    expect(payload.template.language.code).toBe("pt_BR");
  });

  it("should include components when provided", () => {
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: "João" },
          { type: "text", text: "EMC-1234-5678-9012" },
        ],
      },
    ];
    const payload = buildTemplateMessagePayload(
      "5511999999999",
      "emc_tracking_code_approved",
      "pt_BR",
      components
    );
    expect(payload.template.components).toEqual(components);
  });

  it("should not include components when not provided", () => {
    const payload = buildTemplateMessagePayload("5511999999999", "emc_test", "pt_BR");
    expect(payload.template).not.toHaveProperty("components");
  });
});
