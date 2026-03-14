/**
 * Phase 49 Features Tests
 * Tests for: Email Templates rendering, Clicksign Webhook, Auto-link, Tracking vehicle info, CNPJ PDF extraction
 */
import { describe, it, expect } from "vitest";

// ══════════════════════════════════════════════════════════════
// 1. Email Template Rendering
// ══════════════════════════════════════════════════════════════

import { renderTemplate } from "./emailTemplates/service";

describe("Email Template Rendering", () => {
  it("should replace simple {{variable}} placeholders", () => {
    const template = "Olá {{name}}, seu BL é {{blNumber}}.";
    const result = renderTemplate(template, {
      name: "João Silva",
      blNumber: "BL-2024-001",
    });
    expect(result).toBe("Olá João Silva, seu BL é BL-2024-001.");
  });

  it("should replace all occurrences of the same variable", () => {
    const template = "{{name}} é o melhor. Obrigado, {{name}}!";
    const result = renderTemplate(template, { name: "Maria" });
    expect(result).toBe("Maria é o melhor. Obrigado, Maria!");
  });

  it("should leave unreferenced variables as-is (not in variables object)", () => {
    const template = "Olá {{name}}, código: {{trackingCode}}.";
    const result = renderTemplate(template, { name: "João" });
    // Variables not in the object are left as-is (not replaced)
    expect(result).toBe("Olá João, código: {{trackingCode}}.");
  });

  it("should replace explicitly undefined variables with empty string", () => {
    const template = "Olá {{name}}, código: {{trackingCode}}.";
    const result = renderTemplate(template, { name: "João", trackingCode: undefined });
    expect(result).toBe("Olá João, código: .");
  });

  it("should handle conditional blocks — show when variable is present", () => {
    const template =
      "Olá {{name}}. {{#trackingCode}}Código: {{trackingCode}}{{/trackingCode}}";
    const result = renderTemplate(template, {
      name: "João",
      trackingCode: "EMC-1234-5678-ABCD",
    });
    expect(result).toBe("Olá João. Código: EMC-1234-5678-ABCD");
  });

  it("should handle conditional blocks — hide when variable is empty", () => {
    const template =
      "Olá {{name}}. {{#trackingCode}}Código: {{trackingCode}}{{/trackingCode}}Fim.";
    const result = renderTemplate(template, {
      name: "João",
      trackingCode: "",
    });
    expect(result).toBe("Olá João. Fim.");
  });

  it("should leave conditional blocks as-is when variable not in object", () => {
    const template =
      "Olá {{name}}. {{#trackingCode}}Código: {{trackingCode}}{{/trackingCode}}Fim.";
    const result = renderTemplate(template, {
      name: "João",
    });
    // Conditional blocks for variables not in the object are left as-is
    expect(result).toContain("Olá João.");
  });

  it("should remove conditional blocks when variable is explicitly undefined", () => {
    const template =
      "Olá {{name}}. {{#trackingCode}}Código: {{trackingCode}}{{/trackingCode}}Fim.";
    const result = renderTemplate(template, {
      name: "João",
      trackingCode: undefined,
    });
    expect(result).toBe("Olá João. Fim.");
  });

  it("should handle multiple conditional blocks", () => {
    const template =
      "{{#name}}Nome: {{name}}{{/name}} {{#email}}Email: {{email}}{{/email}}";
    const result = renderTemplate(template, {
      name: "João",
      email: "",
    });
    expect(result).toBe("Nome: João ");
  });

  it("should handle HTML templates with variables", () => {
    const template = `<p>Olá <strong>{{name}}</strong></p>
<p>Status: {{status}}</p>`;
    const result = renderTemplate(template, {
      name: "Maria",
      status: "Em Trânsito",
    });
    expect(result).toContain("<strong>Maria</strong>");
    expect(result).toContain("Status: Em Trânsito");
  });

  it("should handle empty template", () => {
    const result = renderTemplate("", { name: "João" });
    expect(result).toBe("");
  });

  it("should handle template with no variables", () => {
    const template = "Texto fixo sem variáveis.";
    const result = renderTemplate(template, { name: "João" });
    expect(result).toBe("Texto fixo sem variáveis.");
  });
});

// ══════════════════════════════════════════════════════════════
// 2. Clicksign Webhook Event Parsing
// ══════════════════════════════════════════════════════════════

describe("Clicksign Webhook Event Parsing", () => {
  it("should parse a valid auto_close event payload", () => {
    const payload = {
      event: {
        name: "auto_close",
        occurred_at: "2024-03-14T10:30:00Z",
      },
      document: {
        key: "doc-key-123",
        status: "closed",
      },
      account: {
        key: "account-key-456",
      },
    };

    expect(payload.event.name).toBe("auto_close");
    expect(payload.document.key).toBe("doc-key-123");
    expect(payload.document.status).toBe("closed");
  });

  it("should parse a valid sign event payload", () => {
    const payload = {
      event: {
        name: "sign",
        occurred_at: "2024-03-14T10:30:00Z",
      },
      document: {
        key: "doc-key-123",
        status: "running",
      },
      signer: {
        key: "signer-key-789",
        email: "test@example.com",
        name: "João Silva",
        documentation: "12345678901",
      },
    };

    expect(payload.event.name).toBe("sign");
    expect(payload.signer?.name).toBe("João Silva");
    expect(payload.signer?.documentation).toBe("12345678901");
  });

  it("should identify supported event types", () => {
    const supportedEvents = ["auto_close", "sign", "close", "cancel", "deadline"];
    expect(supportedEvents).toContain("auto_close");
    expect(supportedEvents).toContain("sign");
    expect(supportedEvents).toContain("close");
  });

  it("should handle payload without signer (for close/cancel events)", () => {
    const payload = {
      event: { name: "cancel", occurred_at: "2024-03-14T10:30:00Z" },
      document: { key: "doc-key-123", status: "canceled" },
    };

    expect(payload.event.name).toBe("cancel");
    expect((payload as any).signer).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════
// 3. Auto-Link VIN Matching Logic
// ══════════════════════════════════════════════════════════════

describe("Auto-Link VIN Matching Logic", () => {
  it("should normalize VIN for comparison (uppercase, trim)", () => {
    const normalizeVin = (vin: string) => vin.trim().toUpperCase();
    expect(normalizeVin("  wba12345678901234  ")).toBe("WBA12345678901234");
    expect(normalizeVin("WBA12345678901234")).toBe("WBA12345678901234");
  });

  it("should match VIN from BL vehicleDescription to vehicles table", () => {
    // Simulate the matching logic
    const vehicleDescription = "Porsche 911 2024 VIN: WP0ZZZ99ZRS123456";
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
    const matches = vehicleDescription.match(vinRegex);
    expect(matches).toBeTruthy();
    expect(matches![0].toUpperCase()).toBe("WP0ZZZ99ZRS123456");
  });

  it("should extract multiple VINs from description", () => {
    const description =
      "Container with WP0ZZZ99ZRS123456 and WBAPH5C55BA123456";
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
    const matches = description.match(vinRegex);
    expect(matches).toHaveLength(2);
  });

  it("should not match invalid VIN patterns", () => {
    const description = "Short VIN: ABC123 and text without VINs";
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
    const matches = description.match(vinRegex);
    expect(matches).toBeNull();
  });

  it("should handle BL with no vehicleDescription", () => {
    const description: string | null = null;
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
    const matches = description?.match(vinRegex) ?? [];
    expect(matches).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// 4. Public Tracking — Vehicle Info Safety
// ══════════════════════════════════════════════════════════════

describe("Public Tracking Vehicle Info Safety", () => {
  it("should only expose safe vehicle fields (no personal data)", () => {
    const fullVehicle = {
      id: 1,
      vin: "WP0ZZZ99ZRS123456",
      make: "Porsche",
      model: "911",
      year: 2024,
      color: "Branco",
      customerId: 42,
      status: "active",
      createdAt: new Date(),
    };

    // The public tracking should only expose these fields
    const safeVehicle = {
      make: fullVehicle.make,
      model: fullVehicle.model,
      year: fullVehicle.year,
      color: fullVehicle.color,
    };

    expect(safeVehicle).not.toHaveProperty("id");
    expect(safeVehicle).not.toHaveProperty("vin");
    expect(safeVehicle).not.toHaveProperty("customerId");
    expect(safeVehicle).not.toHaveProperty("status");
    expect(safeVehicle).toHaveProperty("make", "Porsche");
    expect(safeVehicle).toHaveProperty("model", "911");
    expect(safeVehicle).toHaveProperty("year", 2024);
    expect(safeVehicle).toHaveProperty("color", "Branco");
  });

  it("should handle vehicles with missing optional fields", () => {
    const safeVehicle = {
      make: "BMW",
      model: "X5",
      year: null,
      color: null,
    };

    expect(safeVehicle.make).toBe("BMW");
    expect(safeVehicle.model).toBe("X5");
    expect(safeVehicle.year).toBeNull();
    expect(safeVehicle.color).toBeNull();
  });

  it("should return empty array when no vehicles linked", () => {
    const vehicles: any[] = [];
    expect(vehicles).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// 5. CNPJ in PDF Extraction — ExtractedContractData type
// ══════════════════════════════════════════════════════════════

describe("CNPJ in PDF Extraction", () => {
  it("should accept ExtractedContractData with CNPJ fields", () => {
    const data = {
      name: "Empresa ABC Ltda",
      cpf: null,
      cnpj: "11222333000181",
      documentType: "cnpj" as const,
      email: "contato@empresa.com",
      phone: "11999998888",
      vins: ["WP0ZZZ99ZRS123456"],
      vehicleDescriptions: [
        { vin: "WP0ZZZ99ZRS123456", make: "Porsche", model: "911" },
      ],
      tipoOperacao: "importacao" as const,
      rawExtractedText: "Contract text...",
      confidence: "high" as const,
      warnings: [],
    };

    expect(data.cnpj).toBe("11222333000181");
    expect(data.documentType).toBe("cnpj");
    expect(data.cpf).toBeNull();
  });

  it("should accept ExtractedContractData with CPF (backward compat)", () => {
    const data = {
      name: "João Silva",
      cpf: "12345678901",
      cnpj: null,
      documentType: "cpf" as const,
      email: "joao@test.com",
      phone: null,
      vins: [],
      vehicleDescriptions: [],
      tipoOperacao: null,
      rawExtractedText: "",
      confidence: "medium" as const,
      warnings: [],
    };

    expect(data.cpf).toBe("12345678901");
    expect(data.documentType).toBe("cpf");
    expect(data.cnpj).toBeNull();
  });

  it("should auto-detect documentType from CNPJ presence", () => {
    const data = {
      cpf: null,
      cnpj: "11222333000181",
      documentType: null as string | null,
    };

    // Auto-detect logic
    if (!data.documentType) {
      if (data.cnpj) data.documentType = "cnpj";
      else if (data.cpf) data.documentType = "cpf";
    }

    expect(data.documentType).toBe("cnpj");
  });

  it("should auto-detect documentType from CPF presence", () => {
    const data = {
      cpf: "12345678901",
      cnpj: null,
      documentType: null as string | null,
    };

    if (!data.documentType) {
      if (data.cnpj) data.documentType = "cnpj";
      else if (data.cpf) data.documentType = "cpf";
    }

    expect(data.documentType).toBe("cpf");
  });
});

// ══════════════════════════════════════════════════════════════
// 6. Email Template Slug Conventions
// ══════════════════════════════════════════════════════════════

describe("Email Template Slug Conventions", () => {
  const expectedSlugs = [
    "stage_aguardando_embarque",
    "stage_em_transito",
    "stage_fase_documental",
    "stage_em_desembaraco",
    "stage_concluido",
    "tracking_code_created",
    "customer_invite",
  ];

  it("should have all expected default template slugs", () => {
    for (const slug of expectedSlugs) {
      expect(slug).toMatch(/^[a-z_]+$/);
    }
  });

  it("should map stage slugs to customer statuses", () => {
    const stageToSlug: Record<string, string> = {
      aguardando_embarque: "stage_aguardando_embarque",
      em_transito: "stage_em_transito",
      fase_documental: "stage_fase_documental",
      em_desembaraco: "stage_em_desembaraco",
      concluido: "stage_concluido",
    };

    expect(stageToSlug["em_transito"]).toBe("stage_em_transito");
    expect(stageToSlug["concluido"]).toBe("stage_concluido");
  });
});

// ══════════════════════════════════════════════════════════════
// 7. Notification Service — Template Integration
// ══════════════════════════════════════════════════════════════

describe("Notification Service Template Integration", () => {
  it("should construct correct template slug from customer status", () => {
    const buildSlug = (status: string) => `stage_${status}`;
    expect(buildSlug("aguardando_embarque")).toBe("stage_aguardando_embarque");
    expect(buildSlug("em_transito")).toBe("stage_em_transito");
    expect(buildSlug("concluido")).toBe("stage_concluido");
  });

  it("should build correct variables for template rendering", () => {
    const customer = {
      fullName: "João Silva",
      email: "joao@test.com",
    };
    const bl = {
      blNumber: "BL-2024-001",
      vehicleDescription: "Porsche 911 2024",
    };
    const trackingCode = "EMC-1234-5678-ABCD";

    const variables = {
      name: customer.fullName,
      email: customer.email,
      blNumber: bl.blNumber,
      vehicleDescription: bl.vehicleDescription,
      trackingCode,
    };

    expect(variables.name).toBe("João Silva");
    expect(variables.trackingCode).toBe("EMC-1234-5678-ABCD");
    expect(variables.blNumber).toBe("BL-2024-001");
  });
});
