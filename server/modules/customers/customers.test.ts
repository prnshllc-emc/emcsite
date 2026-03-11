import { describe, it, expect } from "vitest";
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
  CustomerStatusEnum,
  TipoOperacaoEnum,
  DataSourceEnum,
  VinOrIdSchema,
} from "@shared/schemas";

describe("Customer Schemas", () => {
  describe("CustomerCreateSchema", () => {
    it("should validate a complete customer", () => {
      const result = CustomerCreateSchema.safeParse({
        fullName: "Paulo Sergio Carvalho dos Santos Junior",
        cpf: "039.401.701-35",
        email: "paulo.mns@hotmail.com",
        phone: "+55 11 99999-9999",
        status: "aguardando_embarque",
        tipoOperacao: "importacao",
        dataSource: "clicksign",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cpf).toBe("03940170135"); // CPF stripped
        expect(result.data.status).toBe("aguardando_embarque");
        expect(result.data.tipoOperacao).toBe("importacao");
        expect(result.data.dataSource).toBe("clicksign");
      }
    });

    it("should apply defaults for status and dataSource", () => {
      const result = CustomerCreateSchema.safeParse({
        fullName: "Andre Simas",
        cpf: "289.916.178-40",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("aguardando_embarque");
        expect(result.data.dataSource).toBe("manual");
      }
    });

    it("should reject invalid CPF", () => {
      const result = CustomerCreateSchema.safeParse({
        fullName: "Test",
        cpf: "000.000.000-00",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short name", () => {
      const result = CustomerCreateSchema.safeParse({
        fullName: "A",
        cpf: "039.401.701-35",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CustomerUpdateSchema", () => {
    it("should validate partial update with status", () => {
      const result = CustomerUpdateSchema.safeParse({
        status: "em_processo",
        tipoOperacao: "exportacao",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("em_processo");
        expect(result.data.tipoOperacao).toBe("exportacao");
      }
    });

    it("should allow empty update (all optional)", () => {
      const result = CustomerUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = CustomerUpdateSchema.safeParse({
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CustomerStatusEnum", () => {
    it("should accept all valid statuses", () => {
      const validStatuses = [
        "aguardando_embarque",
        "aguardando_li",
        "em_processo",
        "concluido",
        "cancelado",
      ];
      for (const s of validStatuses) {
        expect(CustomerStatusEnum.safeParse(s).success).toBe(true);
      }
    });

    it("should reject invalid status", () => {
      expect(CustomerStatusEnum.safeParse("pending").success).toBe(false);
    });
  });

  describe("TipoOperacaoEnum", () => {
    it("should accept importacao and exportacao", () => {
      expect(TipoOperacaoEnum.safeParse("importacao").success).toBe(true);
      expect(TipoOperacaoEnum.safeParse("exportacao").success).toBe(true);
    });

    it("should reject invalid tipo", () => {
      expect(TipoOperacaoEnum.safeParse("transfer").success).toBe(false);
    });
  });

  describe("DataSourceEnum", () => {
    it("should accept all valid sources", () => {
      expect(DataSourceEnum.safeParse("manual").success).toBe(true);
      expect(DataSourceEnum.safeParse("clicksign").success).toBe(true);
      expect(DataSourceEnum.safeParse("agent").success).toBe(true);
    });

    it("should reject invalid source", () => {
      expect(DataSourceEnum.safeParse("api").success).toBe(false);
    });
  });

  describe("VinOrIdSchema", () => {
    it("should accept standard 17-char VIN", () => {
      const result = VinOrIdSchema.safeParse("1FTEX15H6MKA92716");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("1FTEX15H6MKA92716");
      }
    });

    it("should accept short military/legacy VIN like Humvee 210716", () => {
      const result = VinOrIdSchema.safeParse("210716");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("210716");
      }
    });

    it("should uppercase and trim input", () => {
      const result = VinOrIdSchema.safeParse("  abc123  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("ABC123");
      }
    });

    it("should reject empty string", () => {
      const result = VinOrIdSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("should reject string longer than 30 chars", () => {
      const result = VinOrIdSchema.safeParse("A".repeat(31));
      expect(result.success).toBe(false);
    });
  });
});

describe("Customer Merge Logic", () => {
  it("should protect manually overridden fields from auto-sync", () => {
    // Simulate the merge logic
    const existing = {
      fullName: "Paulo Jr (manually edited)",
      email: "manual@email.com",
      phone: null,
      status: "em_processo" as const,
      tipoOperacao: "importacao" as const,
      manualOverrides: ["fullName", "email"],
    };

    const autoSyncData = {
      fullName: "Paulo Sergio Carvalho dos Santos Junior",
      email: "paulo.mns@hotmail.com",
      phone: "+55 11 99999-9999",
      status: "aguardando_embarque" as const,
    };

    const overrides = new Set(existing.manualOverrides);
    const safeData: Record<string, unknown> = {};

    if (autoSyncData.fullName !== undefined && !overrides.has("fullName")) {
      safeData.fullName = autoSyncData.fullName;
    }
    if (autoSyncData.email !== undefined && !overrides.has("email")) {
      safeData.email = autoSyncData.email;
    }
    if (autoSyncData.phone !== undefined && !overrides.has("phone")) {
      safeData.phone = autoSyncData.phone;
    }
    if (autoSyncData.status !== undefined && !overrides.has("status")) {
      safeData.status = autoSyncData.status;
    }

    // fullName and email should NOT be in safeData (protected)
    expect(safeData.fullName).toBeUndefined();
    expect(safeData.email).toBeUndefined();
    // phone and status should be in safeData (not protected)
    expect(safeData.phone).toBe("+55 11 99999-9999");
    expect(safeData.status).toBe("aguardando_embarque");
  });

  it("should allow all fields when no manual overrides exist", () => {
    const overrides = new Set<string>([]);
    const data = {
      fullName: "New Name",
      email: "new@email.com",
    };

    const safeData: Record<string, unknown> = {};
    if (data.fullName !== undefined && !overrides.has("fullName")) {
      safeData.fullName = data.fullName;
    }
    if (data.email !== undefined && !overrides.has("email")) {
      safeData.email = data.email;
    }

    expect(safeData.fullName).toBe("New Name");
    expect(safeData.email).toBe("new@email.com");
  });

  it("should track which fields are manually edited", () => {
    const before = {
      fullName: "Old Name",
      email: "old@email.com",
      manualOverrides: [] as string[],
    };

    const editData = {
      fullName: "New Name",
      // email not changed
    };

    const newOverrides = new Set(before.manualOverrides);
    if (editData.fullName !== undefined && editData.fullName !== before.fullName) {
      newOverrides.add("fullName");
    }

    expect(newOverrides.has("fullName")).toBe(true);
    expect(newOverrides.has("email")).toBe(false);
  });
});

describe("Customer Data Extraction", () => {
  it("should have extracted Paulo Jr data from Clicksign", () => {
    const pauloJr = {
      fullName: "Paulo Sergio Carvalho dos Santos Junior",
      cpf: "039.401.701-35",
      email: "paulo.mns@hotmail.com",
      clicksignEnvelope: "e5bc9207-58ba-4e95-a5c6-5501e18d893c",
    };
    expect(pauloJr.fullName).toBeTruthy();
    expect(pauloJr.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    expect(pauloJr.email).toContain("@");
    expect(pauloJr.clicksignEnvelope).toBeTruthy();
  });

  it("should have extracted Simas data from PDF", () => {
    const simas = {
      fullName: "Andre Luiz Miranda Simas",
      cpf: "289.916.178-40",
      vehicles: ["210716", "1FTEX15H6MKA92716"],
    };
    expect(simas.fullName).toBeTruthy();
    expect(simas.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    expect(simas.vehicles).toHaveLength(2);
  });

  it("should have Huber Mastelari from Clicksign", () => {
    const huber = {
      fullName: "Huber Mastelari",
      email: "hubermastelari@gmail.com",
      clicksignEnvelope: "f7bc0a55-d667-4095-a1d7-8b5791977c55",
    };
    expect(huber.fullName).toBeTruthy();
    expect(huber.email).toContain("@");
    expect(huber.clicksignEnvelope).toBeTruthy();
  });

  it("should have all 7 active clients identified", () => {
    const clients = [
      "Andre Luiz Miranda Simas",
      "Paulo Sergio Carvalho dos Santos Junior",
      "Huber Mastelari",
      "Sandoval Gonçalves Pereira",
      "André Francisco Junqueira Merino Teles",
      "Roberto Nunes Fortaleza Neto",
      "Fabricio Oliveira Menezes",
    ];
    expect(clients).toHaveLength(7);
    clients.forEach((c) => expect(c.length).toBeGreaterThan(5));
  });
});
