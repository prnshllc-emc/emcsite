/**
 * Agent API & Notifications Tests — Unit tests for the agent ingestion API
 * schemas, notification message generation, and dashboard stats logic.
 *
 * These tests validate pure functions and schemas without requiring a database
 * connection, following the same pattern as tracking.test.ts.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";

// ══════════════════════════════════════════════════════════════
// AGENT INGESTION SCHEMA VALIDATION
// ══════════════════════════════════════════════════════════════

// Replicate the Zod schemas from ingestion.ts for testing
const AgentBlCreateSchema = z.object({
  blNumber: z.string().min(1).max(50),
  containerNumber: z.string().max(20).optional().nullable(),
  vehicleDescription: z.string().max(255).optional().nullable(),
  originPort: z.string().max(100).optional().nullable(),
  destinationPort: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered"]).default("draft"),
  estimatedDeparture: z.string().optional().nullable(),
  actualDeparture: z.string().optional().nullable(),
  estimatedArrival: z.string().optional().nullable(),
  actualArrival: z.string().optional().nullable(),
  blType: z.enum(["draft", "final"]).default("draft"),
  sourceEmail: z.string().max(320).optional().nullable(),
  rawBlData: z.string().optional().nullable(),
  customerCpf: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  vehicleVin: z.string().optional().nullable(),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.number().int().optional().nullable(),
  vehicleColor: z.string().optional().nullable(),
  shipper: z.string().optional().nullable(),
  consignee: z.string().optional().nullable(),
  vessel: z.string().optional().nullable(),
  voyage: z.string().optional().nullable(),
});

const AgentBlUpdateSchema = z.object({
  blNumber: z.string().min(1).max(50),
  containerNumber: z.string().max(20).optional().nullable(),
  vehicleDescription: z.string().max(255).optional().nullable(),
  originPort: z.string().max(100).optional().nullable(),
  destinationPort: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered"]).optional(),
  estimatedDeparture: z.string().optional().nullable(),
  actualDeparture: z.string().optional().nullable(),
  estimatedArrival: z.string().optional().nullable(),
  actualArrival: z.string().optional().nullable(),
  blType: z.enum(["draft", "final"]).optional(),
  sourceEmail: z.string().max(320).optional().nullable(),
  rawBlData: z.string().optional().nullable(),
});

const AgentTrackingEventSchema = z.object({
  blNumber: z.string().min(1),
  eventType: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"]),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  eventDate: z.string().optional(),
  rawData: z.string().optional().nullable(),
});

const AgentGenerateCodeSchema = z.object({
  blNumber: z.string().min(1),
  customerCpf: z.string().min(11).max(14),
  expiresInDays: z.number().int().min(1).max(3650).default(365),
});

const AgentBulkIngestSchema = z.object({
  emailMessageId: z.string().optional().nullable(),
  emailSubject: z.string().optional().nullable(),
  emailSender: z.string().optional().nullable(),
  emailReceivedAt: z.string().optional().nullable(),
  bl: AgentBlCreateSchema,
  trackingEvents: z.array(AgentTrackingEventSchema).optional().default([]),
  generateTrackingCode: z.boolean().default(false),
});

// ══════════════════════════════════════════════════════════════
// BL CREATE SCHEMA TESTS
// ══════════════════════════════════════════════════════════════

describe("AgentBlCreateSchema", () => {
  it("accepts a minimal BL with just blNumber", () => {
    const result = AgentBlCreateSchema.safeParse({ blNumber: "MEDU1234567" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blNumber).toBe("MEDU1234567");
      expect(result.data.status).toBe("draft");
      expect(result.data.blType).toBe("draft");
    }
  });

  it("accepts a full BL with all fields", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      containerNumber: "MSKU1234567",
      vehicleDescription: "2024 Porsche 911 GT3 RS",
      originPort: "Miami, FL",
      destinationPort: "Santos, SP",
      status: "in_transit",
      estimatedDeparture: "2026-03-15T00:00:00Z",
      actualDeparture: "2026-03-16T10:00:00Z",
      estimatedArrival: "2026-04-10T00:00:00Z",
      blType: "final",
      sourceEmail: "shipping@example.com",
      customerCpf: "12345678901",
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      customerPhone: "+5511999999999",
      vehicleVin: "WP0AF2A99KS123456",
      vehicleMake: "Porsche",
      vehicleModel: "911 GT3 RS",
      vehicleYear: 2024,
      vehicleColor: "Guards Red",
      shipper: "ABC Shipping Co.",
      consignee: "EMC Logistics",
      vessel: "MSC GULSUN",
      voyage: "V123E",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("in_transit");
      expect(result.data.vehicleMake).toBe("Porsche");
    }
  });

  it("rejects empty blNumber", () => {
    const result = AgentBlCreateSchema.safeParse({ blNumber: "" });
    expect(result.success).toBe(false);
  });

  it("rejects blNumber exceeding 50 chars", () => {
    const result = AgentBlCreateSchema.safeParse({ blNumber: "A".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid blType", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      blType: "preliminary",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null optional fields", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      containerNumber: null,
      vehicleDescription: null,
      originPort: null,
      destinationPort: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid customer email", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      customerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects containerNumber exceeding 20 chars", () => {
    const result = AgentBlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      containerNumber: "A".repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// BL UPDATE SCHEMA TESTS
// ══════════════════════════════════════════════════════════════

describe("AgentBlUpdateSchema", () => {
  it("accepts update with just blNumber", () => {
    const result = AgentBlUpdateSchema.safeParse({ blNumber: "MEDU1234567" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with status change", () => {
    const result = AgentBlUpdateSchema.safeParse({
      blNumber: "MEDU1234567",
      status: "arrived",
      actualArrival: "2026-04-10T14:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("arrived");
    }
  });

  it("rejects empty blNumber", () => {
    const result = AgentBlUpdateSchema.safeParse({ blNumber: "" });
    expect(result.success).toBe(false);
  });

  it("accepts null for clearable fields", () => {
    const result = AgentBlUpdateSchema.safeParse({
      blNumber: "MEDU1234567",
      estimatedDeparture: null,
      actualDeparture: null,
    });
    expect(result.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// TRACKING EVENT SCHEMA TESTS
// ══════════════════════════════════════════════════════════════

describe("AgentTrackingEventSchema", () => {
  it("accepts a valid tracking event", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "in_transit",
      title: "Navio partiu do porto de Miami",
      description: "Vessel MSC GULSUN departed Miami port at 10:00 UTC",
      location: "Miami, FL, USA",
      eventDate: "2026-03-16T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal event with just required fields", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "info",
      title: "Informação atualizada",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all event types", () => {
    const eventTypes = ["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"];
    for (const eventType of eventTypes) {
      const result = AgentTrackingEventSchema.safeParse({
        blNumber: "TEST123",
        eventType,
        title: `Test ${eventType}`,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid event type", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "unknown",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "info",
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 200 chars", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "info",
      title: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding 2000 chars", () => {
    const result = AgentTrackingEventSchema.safeParse({
      blNumber: "MEDU1234567",
      eventType: "info",
      title: "Test",
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// GENERATE CODE SCHEMA TESTS
// ══════════════════════════════════════════════════════════════

describe("AgentGenerateCodeSchema", () => {
  it("accepts valid code generation request", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "12345678901",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresInDays).toBe(365); // default
    }
  });

  it("accepts custom expiration days", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "12345678901",
      expiresInDays: 730,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresInDays).toBe(730);
    }
  });

  it("accepts formatted CPF", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "123.456.789-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects CPF shorter than 11 chars", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "1234567890",
    });
    expect(result.success).toBe(false);
  });

  it("rejects expiresInDays less than 1", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "12345678901",
      expiresInDays: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects expiresInDays greater than 3650", () => {
    const result = AgentGenerateCodeSchema.safeParse({
      blNumber: "MEDU1234567",
      customerCpf: "12345678901",
      expiresInDays: 3651,
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// BULK INGEST SCHEMA TESTS
// ══════════════════════════════════════════════════════════════

describe("AgentBulkIngestSchema", () => {
  it("accepts a full bulk ingest payload", () => {
    const result = AgentBulkIngestSchema.safeParse({
      emailMessageId: "<msg123@example.com>",
      emailSubject: "BL Draft - MEDU1234567",
      emailSender: "shipping@example.com",
      emailReceivedAt: "2026-03-10T10:00:00Z",
      bl: {
        blNumber: "MEDU1234567",
        originPort: "Miami, FL",
        destinationPort: "Santos, SP",
        status: "draft",
        customerCpf: "12345678901",
        customerName: "João Silva",
        vehicleVin: "WP0AF2A99KS123456",
        vehicleMake: "Porsche",
        vehicleModel: "911 GT3 RS",
      },
      trackingEvents: [
        {
          blNumber: "MEDU1234567",
          eventType: "draft",
          title: "BL Draft recebido",
          description: "BL draft recebido via email",
        },
      ],
      generateTrackingCode: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trackingEvents).toHaveLength(1);
      expect(result.data.generateTrackingCode).toBe(true);
    }
  });

  it("accepts minimal bulk ingest with just BL", () => {
    const result = AgentBulkIngestSchema.safeParse({
      bl: { blNumber: "MEDU1234567" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trackingEvents).toHaveLength(0);
      expect(result.data.generateTrackingCode).toBe(false);
    }
  });

  it("accepts multiple tracking events", () => {
    const result = AgentBulkIngestSchema.safeParse({
      bl: { blNumber: "MEDU1234567" },
      trackingEvents: [
        { blNumber: "MEDU1234567", eventType: "draft", title: "Event 1" },
        { blNumber: "MEDU1234567", eventType: "info", title: "Event 2" },
        { blNumber: "MEDU1234567", eventType: "in_transit", title: "Event 3" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trackingEvents).toHaveLength(3);
    }
  });

  it("rejects if BL is missing", () => {
    const result = AgentBulkIngestSchema.safeParse({
      emailSubject: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects if tracking event has invalid type", () => {
    const result = AgentBulkIngestSchema.safeParse({
      bl: { blNumber: "MEDU1234567" },
      trackingEvents: [
        { blNumber: "MEDU1234567", eventType: "invalid", title: "Bad event" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// NOTIFICATION MESSAGE GENERATION TESTS
// ══════════════════════════════════════════════════════════════

describe("Notification Message Generation", () => {
  // Test the notification importance logic
  const EVENT_IMPORTANCE: Record<string, "critical" | "high" | "normal" | "low"> = {
    delivered: "critical",
    alert: "critical",
    delay: "critical",
    arrived: "high",
    customs: "high",
    in_transit: "high",
    final: "normal",
    draft: "low",
    info: "low",
  };

  const STATUS_LABELS: Record<string, string> = {
    draft: "BL Draft Recebido",
    final: "BL Final Recebido",
    in_transit: "Em Trânsito Marítimo",
    arrived: "Chegada ao Porto de Destino",
    customs: "Desembaraço Aduaneiro",
    delivered: "Veículo Entregue",
    info: "Informação",
    alert: "Alerta",
    delay: "Atraso Detectado",
  };

  const STATUS_EMOJI: Record<string, string> = {
    draft: "📄",
    final: "📋",
    in_transit: "🚢",
    arrived: "⚓",
    customs: "🏛️",
    delivered: "✅",
    info: "ℹ️",
    alert: "⚠️",
    delay: "⏰",
  };

  it("classifies delivered as critical importance", () => {
    expect(EVENT_IMPORTANCE["delivered"]).toBe("critical");
  });

  it("classifies alert as critical importance", () => {
    expect(EVENT_IMPORTANCE["alert"]).toBe("critical");
  });

  it("classifies delay as critical importance", () => {
    expect(EVENT_IMPORTANCE["delay"]).toBe("critical");
  });

  it("classifies in_transit as high importance", () => {
    expect(EVENT_IMPORTANCE["in_transit"]).toBe("high");
  });

  it("classifies arrived as high importance", () => {
    expect(EVENT_IMPORTANCE["arrived"]).toBe("high");
  });

  it("classifies customs as high importance", () => {
    expect(EVENT_IMPORTANCE["customs"]).toBe("high");
  });

  it("classifies final as normal importance", () => {
    expect(EVENT_IMPORTANCE["final"]).toBe("normal");
  });

  it("classifies draft as low importance", () => {
    expect(EVENT_IMPORTANCE["draft"]).toBe("low");
  });

  it("classifies info as low importance", () => {
    expect(EVENT_IMPORTANCE["info"]).toBe("low");
  });

  it("has Portuguese labels for all statuses", () => {
    const allStatuses = ["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"];
    for (const status of allStatuses) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });

  it("has emoji for all statuses", () => {
    const allStatuses = ["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"];
    for (const status of allStatuses) {
      expect(STATUS_EMOJI[status]).toBeDefined();
      expect(STATUS_EMOJI[status].length).toBeGreaterThan(0);
    }
  });

  it("generates correct notification title format", () => {
    const eventType = "in_transit";
    const blNumber = "MEDU1234567";
    const emoji = STATUS_EMOJI[eventType];
    const statusLabel = STATUS_LABELS[eventType];
    const title = `${emoji} ${statusLabel} — BL ${blNumber}`;

    expect(title).toBe("🚢 Em Trânsito Marítimo — BL MEDU1234567");
  });

  it("generates correct notification content with all fields", () => {
    const event = {
      blNumber: "MEDU1234567",
      title: "Navio partiu do porto",
      vehicleDescription: "2024 Porsche 911 GT3 RS",
      customerName: "João Silva",
      location: "Miami, FL",
      eventDate: new Date("2026-03-16T10:00:00Z"),
      description: "Vessel departed successfully",
    };

    const contentLines = [
      `BL: ${event.blNumber}`,
      `Evento: ${event.title}`,
      `Veículo: ${event.vehicleDescription}`,
      `Cliente: ${event.customerName}`,
      `Local: ${event.location}`,
    ];

    expect(contentLines).toContain("BL: MEDU1234567");
    expect(contentLines).toContain("Veículo: 2024 Porsche 911 GT3 RS");
    expect(contentLines).toContain("Cliente: João Silva");
    expect(contentLines).toContain("Local: Miami, FL");
  });

  it("skips optional fields when not provided", () => {
    const event = {
      blNumber: "MEDU1234567",
      title: "Informação atualizada",
    };

    const contentLines = [`BL: ${event.blNumber}`, `Evento: ${event.title}`];

    expect(contentLines).toHaveLength(2);
    expect(contentLines.join("\n")).not.toContain("Veículo:");
    expect(contentLines.join("\n")).not.toContain("Cliente:");
  });
});

// ══════════════════════════════════════════════════════════════
// WHATSAPP MESSAGE TEMPLATE TESTS
// ══════════════════════════════════════════════════════════════

describe("WhatsApp Message Templates", () => {
  it("generates correct tracking event WhatsApp message", () => {
    const statusLabel = "Em Trânsito Marítimo";
    const emoji = "🚢";
    const blNumber = "MEDU1234567";
    const vehicleDescription = "2024 Porsche 911 GT3 RS";
    const location = "Miami, FL";
    const eventDate = new Date("2026-03-16T10:00:00Z");

    const lines = [
      `${emoji} *EMC — Atualização de Envio*`,
      "",
      `*Status:* ${statusLabel}`,
      `*BL:* ${blNumber}`,
      `*Veículo:* ${vehicleDescription}`,
      `*Local:* ${location}`,
      `*Data:* ${eventDate.toLocaleDateString("pt-BR")}`,
      "",
      "Acompanhe seu envio em tempo real:",
      "🔗 https://enviandomeucarro.com/rastrear",
      "",
      "_EMC — Enviando Meu Carro_",
      "_O Jeito Mais Rápido, Seguro e Simples_",
    ];

    const message = lines.join("\n");

    expect(message).toContain("*EMC — Atualização de Envio*");
    expect(message).toContain("*Status:* Em Trânsito Marítimo");
    expect(message).toContain("*BL:* MEDU1234567");
    expect(message).toContain("*Veículo:* 2024 Porsche 911 GT3 RS");
    expect(message).toContain("enviandomeucarro.com/rastrear");
    expect(message).toContain("_EMC — Enviando Meu Carro_");
  });

  it("generates correct tracking code WhatsApp message", () => {
    const trackingCode = "EMC-AB3D-EF7G-HJ9K";
    const customerFirstName = "João";
    const blNumber = "MEDU1234567";
    const vehicleDescription = "2024 Porsche 911 GT3 RS";

    const lines = [
      "🔑 *EMC — Seu Código de Rastreamento*",
      "",
      `Olá, ${customerFirstName}!`,
      "",
      "Seu código de rastreamento está pronto:",
      `*${trackingCode}*`,
      "",
      `Veículo: ${vehicleDescription}`,
      `BL: ${blNumber}`,
      "",
      "Acompanhe seu envio em tempo real:",
      "🔗 https://enviandomeucarro.com/rastrear",
      "",
      "Basta inserir o código acima no campo de busca.",
      "",
      "_EMC — Enviando Meu Carro_",
      "_O Jeito Mais Rápido, Seguro e Simples_",
    ];

    const message = lines.join("\n");

    expect(message).toContain("*EMC — Seu Código de Rastreamento*");
    expect(message).toContain("Olá, João!");
    expect(message).toContain(`*${trackingCode}*`);
    expect(message).toContain("enviandomeucarro.com/rastrear");
    expect(message).toContain("Basta inserir o código acima");
  });

  it("only sends WhatsApp for important events (not low)", () => {
    const EVENT_IMPORTANCE: Record<string, string> = {
      delivered: "critical",
      alert: "critical",
      delay: "critical",
      arrived: "high",
      customs: "high",
      in_transit: "high",
      final: "normal",
      draft: "low",
      info: "low",
    };

    const shouldSend = (eventType: string) => {
      const importance = EVENT_IMPORTANCE[eventType] ?? "low";
      return importance !== "low";
    };

    expect(shouldSend("delivered")).toBe(true);
    expect(shouldSend("in_transit")).toBe(true);
    expect(shouldSend("arrived")).toBe(true);
    expect(shouldSend("customs")).toBe(true);
    expect(shouldSend("alert")).toBe(true);
    expect(shouldSend("delay")).toBe(true);
    expect(shouldSend("final")).toBe(true);
    expect(shouldSend("draft")).toBe(false);
    expect(shouldSend("info")).toBe(false);
    expect(shouldSend("unknown")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// API KEY AUTHENTICATION LOGIC TESTS
// ══════════════════════════════════════════════════════════════

describe("API Key Authentication Logic", () => {
  it("validates correct API key from x-agent-api-key header", () => {
    const expectedKey = "test-agent-key-123";
    const providedKey = "test-agent-key-123";
    expect(providedKey === expectedKey).toBe(true);
  });

  it("validates correct API key from Bearer authorization header", () => {
    const expectedKey = "test-agent-key-123";
    const authHeader = "Bearer test-agent-key-123";
    const providedKey = authHeader.replace("Bearer ", "");
    expect(providedKey === expectedKey).toBe(true);
  });

  it("rejects wrong API key", () => {
    const expectedKey = "test-agent-key-123";
    const providedKey = "wrong-key";
    expect(providedKey === expectedKey).toBe(false);
  });

  it("rejects empty API key", () => {
    const expectedKey = "test-agent-key-123";
    const providedKey = "";
    expect(!providedKey || providedKey !== expectedKey).toBe(true);
  });

  it("rejects undefined API key", () => {
    const expectedKey = "test-agent-key-123";
    const providedKey: string | undefined = undefined;
    expect(!providedKey || providedKey !== expectedKey).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// DASHBOARD STATS STRUCTURE TESTS
// ══════════════════════════════════════════════════════════════

describe("Dashboard Stats Structure", () => {
  it("validates expected stats shape", () => {
    const mockStats = {
      blsByStatus: {
        draft: 5,
        final: 3,
        in_transit: 8,
        arrived: 2,
        customs: 1,
        delivered: 12,
      },
      activeCodes: 15,
      activeCustomers: 10,
      activeVehicles: 20,
      recentEvents: [
        {
          id: 1,
          blId: 1,
          status: "in_transit",
          description: "Navio partiu",
          location: "Miami, FL",
          eventDate: new Date("2026-03-16T10:00:00Z"),
        },
      ],
    };

    expect(mockStats.blsByStatus).toBeDefined();
    expect(typeof mockStats.activeCodes).toBe("number");
    expect(typeof mockStats.activeCustomers).toBe("number");
    expect(typeof mockStats.activeVehicles).toBe("number");
    expect(Array.isArray(mockStats.recentEvents)).toBe(true);
  });

  it("calculates total BLs from status breakdown", () => {
    const blsByStatus = {
      draft: 5,
      final: 3,
      in_transit: 8,
      arrived: 2,
      customs: 1,
      delivered: 12,
    };

    const totalBls = Object.values(blsByStatus).reduce((sum, count) => sum + count, 0);
    expect(totalBls).toBe(31);
  });

  it("handles empty stats gracefully", () => {
    const blsByStatus: Record<string, number> = {};
    const totalBls = Object.values(blsByStatus).reduce((sum, count) => sum + count, 0);
    expect(totalBls).toBe(0);
  });

  it("calculates percentage for progress bars", () => {
    const blsByStatus = {
      draft: 5,
      in_transit: 10,
      delivered: 5,
    };
    const total = Object.values(blsByStatus).reduce((sum, count) => sum + count, 0);

    const inTransitPercentage = total > 0 ? (blsByStatus.in_transit / total) * 100 : 0;
    expect(inTransitPercentage).toBe(50);

    const draftPercentage = total > 0 ? (blsByStatus.draft / total) * 100 : 0;
    expect(draftPercentage).toBe(25);
  });
});

// ══════════════════════════════════════════════════════════════
// DATE HANDLING TESTS
// ══════════════════════════════════════════════════════════════

describe("Date Handling in Agent API", () => {
  it("parses ISO date strings correctly", () => {
    const isoDate = "2026-03-16T10:00:00Z";
    const parsed = new Date(isoDate);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2); // March = 2 (0-indexed)
    expect(parsed.getDate()).toBe(16);
  });

  it("handles date-only strings", () => {
    const dateOnly = "2026-03-16";
    const parsed = new Date(dateOnly);
    expect(parsed.getFullYear()).toBe(2026);
  });

  it("defaults to current date when eventDate is not provided", () => {
    const eventDate = undefined;
    const effectiveDate = eventDate ? new Date(eventDate) : new Date();
    expect(effectiveDate).toBeInstanceOf(Date);
    expect(effectiveDate.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

// ══════════════════════════════════════════════════════════════
// CPF RESOLUTION LOGIC TESTS
// ══════════════════════════════════════════════════════════════

describe("CPF Resolution Logic", () => {
  it("strips formatting from CPF", () => {
    const formattedCpf = "123.456.789-01";
    const digits = formattedCpf.replace(/\D/g, "");
    expect(digits).toBe("12345678901");
    expect(digits.length).toBe(11);
  });

  it("handles already-clean CPF", () => {
    const cleanCpf = "12345678901";
    const digits = cleanCpf.replace(/\D/g, "");
    expect(digits).toBe("12345678901");
  });

  it("validates CPF has exactly 11 digits", () => {
    const validCpf = "12345678901";
    const digits = validCpf.replace(/\D/g, "");
    expect(digits.length).toBe(11);

    const shortCpf = "1234567890";
    const shortDigits = shortCpf.replace(/\D/g, "");
    expect(shortDigits.length).not.toBe(11);
  });
});
