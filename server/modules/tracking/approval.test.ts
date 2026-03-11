/**
 * Tracking Approval Workflow Tests — Unit tests for the approval queue,
 * auto-generation trigger, email/WhatsApp template generation, and
 * approve/reject flows.
 *
 * Tests pure functions and notification template builders without DB.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// ══════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATE TESTS
// ══════════════════════════════════════════════════════════════

describe("Approval Email Template", () => {
  // Inline the template builder logic for testing (mirrors notifications.ts)
  function buildEmailTemplate(params: {
    firstName: string;
    trackingCode: string;
    blNumber: string;
    vehicleDescription?: string;
  }): string {
    return [
      `Assunto: 🔑 Seu Código de Rastreamento — EMC`,
      "",
      `Olá, ${params.firstName}!`,
      "",
      "Temos boas notícias! Seu código de rastreamento está pronto.",
      "Com ele, você pode acompanhar seu envio em tempo real.",
      "",
      `📦 Código de Rastreamento: ${params.trackingCode}`,
      `📋 BL: ${params.blNumber}`,
      params.vehicleDescription ? `🚗 Veículo: ${params.vehicleDescription}` : "",
      "",
      "Como rastrear:",
      "1. Acesse https://enviandomeucarro.com/rastrear",
      `2. Insira o código: ${params.trackingCode}`,
      "3. Acompanhe cada etapa do seu envio",
      "",
      "Qualquer dúvida, estamos à disposição!",
      "",
      "Atenciosamente,",
      "Equipe EMC — Enviando Meu Carro",
    ].filter(Boolean).join("\n");
  }

  it("generates email with correct subject line", () => {
    const email = buildEmailTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).toContain("Assunto: 🔑 Seu Código de Rastreamento — EMC");
  });

  it("includes the customer first name in greeting", () => {
    const email = buildEmailTemplate({
      firstName: "Paulo",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).toContain("Olá, Paulo!");
  });

  it("includes the tracking code prominently", () => {
    const email = buildEmailTemplate({
      firstName: "André",
      trackingCode: "EMC-XY2Z-WV4U-TS6R",
      blNumber: "MAEU123456789",
    });
    expect(email).toContain("📦 Código de Rastreamento: EMC-XY2Z-WV4U-TS6R");
    expect(email).toContain("2. Insira o código: EMC-XY2Z-WV4U-TS6R");
  });

  it("includes the BL number", () => {
    const email = buildEmailTemplate({
      firstName: "Roberto",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).toContain("📋 BL: MAEU266193682");
  });

  it("includes vehicle description when provided", () => {
    const email = buildEmailTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
      vehicleDescription: "BMW 320i Series 3 E30 1992",
    });
    expect(email).toContain("🚗 Veículo: BMW 320i Series 3 E30 1992");
  });

  it("omits vehicle line when not provided", () => {
    const email = buildEmailTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).not.toContain("🚗 Veículo:");
  });

  it("includes tracking URL", () => {
    const email = buildEmailTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).toContain("https://enviandomeucarro.com/rastrear");
  });

  it("includes EMC signature", () => {
    const email = buildEmailTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(email).toContain("Equipe EMC — Enviando Meu Carro");
  });
});

describe("Approval WhatsApp Template", () => {
  function buildWhatsAppTemplate(params: {
    firstName: string;
    trackingCode: string;
    blNumber: string;
    vehicleDescription?: string;
  }): string {
    return [
      "🔑 *EMC — Seu Código de Rastreamento*",
      "",
      `Olá, ${params.firstName}!`,
      "",
      "Seu código de rastreamento está pronto:",
      `*${params.trackingCode}*`,
      "",
      params.vehicleDescription ? `Veículo: ${params.vehicleDescription}` : "",
      `BL: ${params.blNumber}`,
      "",
      "Acompanhe seu envio em tempo real:",
      "🔗 https://enviandomeucarro.com/rastrear",
      "",
      "_EMC — Enviando Meu Carro_",
    ].filter(Boolean).join("\n");
  }

  it("generates WhatsApp message with bold header", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("*EMC — Seu Código de Rastreamento*");
  });

  it("includes customer first name", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Huber",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("Olá, Huber!");
  });

  it("includes tracking code in bold", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-XY2Z-WV4U-TS6R",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("*EMC-XY2Z-WV4U-TS6R*");
  });

  it("includes BL number", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("BL: MAEU266193682");
  });

  it("includes vehicle description when provided", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
      vehicleDescription: "BMW 320i E30",
    });
    expect(msg).toContain("Veículo: BMW 320i E30");
  });

  it("omits vehicle line when not provided", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).not.toContain("Veículo:");
  });

  it("includes tracking URL", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("https://enviandomeucarro.com/rastrear");
  });

  it("includes italic EMC signature", () => {
    const msg = buildWhatsAppTemplate({
      firstName: "Fabricio",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      blNumber: "MAEU266193682",
    });
    expect(msg).toContain("_EMC — Enviando Meu Carro_");
  });
});

// ══════════════════════════════════════════════════════════════
// APPROVAL STATUS VALIDATION
// ══════════════════════════════════════════════════════════════

describe("Approval Status Transitions", () => {
  const validTransitions: Record<string, string[]> = {
    pending: ["approved", "rejected"],
    approved: [], // terminal — cannot change
    rejected: [], // terminal — cannot change
  };

  function isValidTransition(from: string, to: string): boolean {
    return (validTransitions[from] ?? []).includes(to);
  }

  it("allows pending → approved", () => {
    expect(isValidTransition("pending", "approved")).toBe(true);
  });

  it("allows pending → rejected", () => {
    expect(isValidTransition("pending", "rejected")).toBe(true);
  });

  it("blocks approved → rejected", () => {
    expect(isValidTransition("approved", "rejected")).toBe(false);
  });

  it("blocks approved → pending", () => {
    expect(isValidTransition("approved", "pending")).toBe(false);
  });

  it("blocks rejected → approved", () => {
    expect(isValidTransition("rejected", "approved")).toBe(false);
  });

  it("blocks rejected → pending", () => {
    expect(isValidTransition("rejected", "pending")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// AUTO-GENERATION TRIGGER LOGIC
// ══════════════════════════════════════════════════════════════

describe("Auto-generation Trigger Logic", () => {
  /**
   * Simulates the logic in bls/service.ts that decides whether to
   * trigger auto-generation when a BL is updated with a customerId.
   */
  function shouldTriggerAutoGeneration(
    newCustomerId: number | null | undefined,
    previousCustomerId: number | null | undefined
  ): boolean {
    // Only trigger if customerId is being set (not null) and is different from before
    if (!newCustomerId) return false;
    if (previousCustomerId === newCustomerId) return false;
    return true;
  }

  it("triggers when customerId is set for the first time", () => {
    expect(shouldTriggerAutoGeneration(5, null)).toBe(true);
    expect(shouldTriggerAutoGeneration(5, undefined)).toBe(true);
  });

  it("triggers when customerId is changed to a different customer", () => {
    expect(shouldTriggerAutoGeneration(7, 5)).toBe(true);
  });

  it("does NOT trigger when customerId is the same", () => {
    expect(shouldTriggerAutoGeneration(5, 5)).toBe(false);
  });

  it("does NOT trigger when customerId is null", () => {
    expect(shouldTriggerAutoGeneration(null, 5)).toBe(false);
  });

  it("does NOT trigger when customerId is undefined", () => {
    expect(shouldTriggerAutoGeneration(undefined, 5)).toBe(false);
  });

  it("does NOT trigger when both are null", () => {
    expect(shouldTriggerAutoGeneration(null, null)).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// DUPLICATE CODE PREVENTION
// ══════════════════════════════════════════════════════════════

describe("Duplicate Code Prevention Logic", () => {
  /**
   * Simulates the duplicate check in generateTrackingCode.
   * If there's an existing code that is pending or approved, reject.
   */
  function shouldAllowNewCode(
    existingStatus: "pending" | "approved" | "rejected" | null
  ): boolean {
    if (existingStatus === null) return true; // no existing code
    if (existingStatus === "rejected") return true; // rejected codes can be replaced
    return false; // pending or approved blocks new code
  }

  it("allows new code when no existing code", () => {
    expect(shouldAllowNewCode(null)).toBe(true);
  });

  it("allows new code when existing was rejected", () => {
    expect(shouldAllowNewCode("rejected")).toBe(true);
  });

  it("blocks new code when existing is pending", () => {
    expect(shouldAllowNewCode("pending")).toBe(false);
  });

  it("blocks new code when existing is approved", () => {
    expect(shouldAllowNewCode("approved")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// CONTACT AVAILABILITY FOR NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

describe("Contact Availability for Notifications", () => {
  interface CustomerContact {
    email: string | null;
    phone: string | null;
  }

  function getAvailableChannels(contact: CustomerContact): string[] {
    const channels: string[] = [];
    if (contact.email) channels.push("email");
    if (contact.phone) channels.push("whatsapp");
    return channels;
  }

  it("returns both channels when email and phone exist", () => {
    expect(getAvailableChannels({ email: "test@test.com", phone: "+5511999999999" }))
      .toEqual(["email", "whatsapp"]);
  });

  it("returns only email when phone is null", () => {
    expect(getAvailableChannels({ email: "test@test.com", phone: null }))
      .toEqual(["email"]);
  });

  it("returns only whatsapp when email is null", () => {
    expect(getAvailableChannels({ email: null, phone: "+5511999999999" }))
      .toEqual(["whatsapp"]);
  });

  it("returns empty array when no contact info", () => {
    expect(getAvailableChannels({ email: null, phone: null }))
      .toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════
// WHATSAPP URL BUILDER
// ══════════════════════════════════════════════════════════════

describe("WhatsApp URL Builder", () => {
  function buildWhatsAppUrl(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  it("strips non-digit characters from phone", () => {
    const url = buildWhatsAppUrl("+55 (11) 99999-9999", "Hello");
    expect(url).toContain("wa.me/5511999999999");
  });

  it("encodes message text", () => {
    const url = buildWhatsAppUrl("5511999999999", "Olá, tudo bem?");
    expect(url).toContain("text=Ol%C3%A1%2C%20tudo%20bem%3F");
  });

  it("handles international format", () => {
    const url = buildWhatsAppUrl("+1 (305) 555-1234", "Test");
    expect(url).toContain("wa.me/13055551234");
  });
});

// ══════════════════════════════════════════════════════════════
// PENDING NOTIFICATION CONTENT
// ══════════════════════════════════════════════════════════════

describe("Pending Notification Content", () => {
  function buildPendingNotification(params: {
    blNumber: string;
    trackingCode: string;
    customerName: string;
    autoGenerated: boolean;
  }): { title: string; content: string } {
    const source = params.autoGenerated ? "Auto-gerado" : "Criado manualmente";
    return {
      title: `⏳ Código Pendente de Aprovação — BL ${params.blNumber}`,
      content: [
        `Código: ${params.trackingCode}`,
        `BL: ${params.blNumber}`,
        `Cliente: ${params.customerName}`,
        `Origem: ${source}`,
      ].join("\n"),
    };
  }

  it("includes BL number in title", () => {
    const notif = buildPendingNotification({
      blNumber: "MAEU266193682",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Menezes",
      autoGenerated: true,
    });
    expect(notif.title).toContain("MAEU266193682");
  });

  it("shows 'Auto-gerado' for auto-generated codes", () => {
    const notif = buildPendingNotification({
      blNumber: "MAEU266193682",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Menezes",
      autoGenerated: true,
    });
    expect(notif.content).toContain("Origem: Auto-gerado");
  });

  it("shows 'Criado manualmente' for manual codes", () => {
    const notif = buildPendingNotification({
      blNumber: "MAEU266193682",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Menezes",
      autoGenerated: false,
    });
    expect(notif.content).toContain("Origem: Criado manualmente");
  });

  it("includes customer name", () => {
    const notif = buildPendingNotification({
      blNumber: "MAEU266193682",
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "André Simas",
      autoGenerated: true,
    });
    expect(notif.content).toContain("Cliente: André Simas");
  });
});

// ══════════════════════════════════════════════════════════════
// APPROVAL PREVIEW STRUCTURE
// ══════════════════════════════════════════════════════════════

describe("Approval Preview Structure", () => {
  interface ApprovalPreview {
    trackingCode: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    blNumber: string;
    vehicleDescription: string | null;
    emailTemplate: string | null;
    whatsAppTemplate: string | null;
  }

  function buildPreview(params: {
    trackingCode: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    blNumber: string;
    vehicleDescription: string | null;
  }): ApprovalPreview {
    const firstName = params.customerName.split(" ")[0];

    return {
      trackingCode: params.trackingCode,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      blNumber: params.blNumber,
      vehicleDescription: params.vehicleDescription,
      emailTemplate: params.customerEmail
        ? `Assunto: Código de Rastreamento\nOlá, ${firstName}!\nCódigo: ${params.trackingCode}`
        : null,
      whatsAppTemplate: params.customerPhone
        ? `Olá, ${firstName}!\nCódigo: *${params.trackingCode}*`
        : null,
    };
  }

  it("generates email template when email exists", () => {
    const preview = buildPreview({
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Oliveira Menezes",
      customerEmail: "fabricio@test.com",
      customerPhone: null,
      blNumber: "MAEU266193682",
      vehicleDescription: "BMW 320i E30",
    });
    expect(preview.emailTemplate).not.toBeNull();
    expect(preview.emailTemplate).toContain("Fabricio");
    expect(preview.whatsAppTemplate).toBeNull();
  });

  it("generates WhatsApp template when phone exists", () => {
    const preview = buildPreview({
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Oliveira Menezes",
      customerEmail: null,
      customerPhone: "+5511999999999",
      blNumber: "MAEU266193682",
      vehicleDescription: "BMW 320i E30",
    });
    expect(preview.whatsAppTemplate).not.toBeNull();
    expect(preview.whatsAppTemplate).toContain("Fabricio");
    expect(preview.emailTemplate).toBeNull();
  });

  it("generates both templates when both contacts exist", () => {
    const preview = buildPreview({
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Oliveira Menezes",
      customerEmail: "fabricio@test.com",
      customerPhone: "+5511999999999",
      blNumber: "MAEU266193682",
      vehicleDescription: "BMW 320i E30",
    });
    expect(preview.emailTemplate).not.toBeNull();
    expect(preview.whatsAppTemplate).not.toBeNull();
  });

  it("generates no templates when no contacts", () => {
    const preview = buildPreview({
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "Fabricio Oliveira Menezes",
      customerEmail: null,
      customerPhone: null,
      blNumber: "MAEU266193682",
      vehicleDescription: null,
    });
    expect(preview.emailTemplate).toBeNull();
    expect(preview.whatsAppTemplate).toBeNull();
  });

  it("uses first name only in templates", () => {
    const preview = buildPreview({
      trackingCode: "EMC-AB3D-EF7G-HJ9K",
      customerName: "André Francisco Junqueira Merino Teles",
      customerEmail: "andre@test.com",
      customerPhone: "+5511999999999",
      blNumber: "MAEU123456789",
      vehicleDescription: null,
    });
    expect(preview.emailTemplate).toContain("André");
    expect(preview.emailTemplate).not.toContain("Junqueira");
    expect(preview.whatsAppTemplate).toContain("André");
    expect(preview.whatsAppTemplate).not.toContain("Junqueira");
  });
});
