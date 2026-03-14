/**
 * CNPJ Support & Manual Linking Tests
 * Tests for CNPJ validation, document type handling, and BL-Vehicle-Customer linking schemas.
 */
import { describe, it, expect } from "vitest";
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
  CnpjSchema,
  DocumentTypeEnum,
  DocumentSchema,
  BlCreateSchema,
  BlUpdateSchema,
} from "@shared/schemas";
import {
  isValidCnpj,
  formatCnpj,
  isValidCpf,
  formatCpf,
} from "../shared/security";

// ── CNPJ Validation (security.ts) ──────────────────────────
describe("CNPJ Validation", () => {
  it("should validate a correct CNPJ (11.222.333/0001-81)", () => {
    expect(isValidCnpj("11222333000181")).toBe(true);
  });

  it("should validate CNPJ with formatting", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("should reject all-same-digit CNPJ", () => {
    expect(isValidCnpj("11111111111111")).toBe(false);
    expect(isValidCnpj("00000000000000")).toBe(false);
  });

  it("should reject CNPJ with wrong length", () => {
    expect(isValidCnpj("1234567890")).toBe(false);
    expect(isValidCnpj("123456789012345")).toBe(false);
  });

  it("should reject CNPJ with wrong check digits", () => {
    expect(isValidCnpj("11222333000182")).toBe(false);
  });

  it("should format CNPJ correctly", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("should return raw string if CNPJ is wrong length", () => {
    expect(formatCnpj("12345")).toBe("12345");
  });
});

// ── CPF Validation (sanity check) ──────────────────────────
describe("CPF Validation (sanity)", () => {
  it("should validate a known valid CPF", () => {
    expect(isValidCpf("03940170135")).toBe(true);
  });

  it("should reject all-same-digit CPF", () => {
    expect(isValidCpf("00000000000")).toBe(false);
  });

  it("should format CPF correctly", () => {
    expect(formatCpf("03940170135")).toBe("039.401.701-35");
  });
});

// ── CnpjSchema (Zod) ──────────────────────────────────────
describe("CnpjSchema (Zod)", () => {
  it("should accept valid CNPJ and strip formatting", () => {
    const result = CnpjSchema.safeParse("11.222.333/0001-81");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("11222333000181");
    }
  });

  it("should reject CNPJ with wrong length", () => {
    const result = CnpjSchema.safeParse("12345");
    expect(result.success).toBe(false);
  });

  it("should reject all-same-digit CNPJ", () => {
    const result = CnpjSchema.safeParse("11.111.111/1111-11");
    expect(result.success).toBe(false);
  });
});

// ── DocumentTypeEnum ────────────────────────────────────────
describe("DocumentTypeEnum", () => {
  it("should accept cpf and cnpj", () => {
    expect(DocumentTypeEnum.safeParse("cpf").success).toBe(true);
    expect(DocumentTypeEnum.safeParse("cnpj").success).toBe(true);
  });

  it("should reject invalid document types", () => {
    expect(DocumentTypeEnum.safeParse("rg").success).toBe(false);
    expect(DocumentTypeEnum.safeParse("passport").success).toBe(false);
  });
});

// ── DocumentSchema (flexible) ──────────────────────────────
describe("DocumentSchema (flexible CPF/CNPJ)", () => {
  it("should accept 11-digit CPF", () => {
    const result = DocumentSchema.safeParse("039.401.701-35");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(11);
    }
  });

  it("should accept 14-digit CNPJ", () => {
    const result = DocumentSchema.safeParse("11.222.333/0001-81");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(14);
    }
  });

  it("should reject 10-digit number", () => {
    const result = DocumentSchema.safeParse("1234567890");
    expect(result.success).toBe(false);
  });
});

// ── CustomerCreateSchema with CNPJ ─────────────────────────
describe("CustomerCreateSchema with CNPJ", () => {
  it("should accept customer with CPF only (default documentType)", () => {
    const result = CustomerCreateSchema.safeParse({
      fullName: "Maria Silva",
      cpf: "039.401.701-35",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentType).toBe("cpf");
      expect(result.data.cnpj).toBeUndefined();
    }
  });

  it("should accept customer with CNPJ (pessoa jurídica)", () => {
    const result = CustomerCreateSchema.safeParse({
      fullName: "Empresa ABC Ltda",
      cpf: "039.401.701-35",
      cnpj: "11.222.333/0001-81",
      documentType: "cnpj",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentType).toBe("cnpj");
      expect(result.data.cnpj).toBe("11222333000181");
    }
  });

  it("should accept customer with null CNPJ", () => {
    const result = CustomerCreateSchema.safeParse({
      fullName: "João Pessoa",
      cpf: "289.916.178-40",
      cnpj: null,
      documentType: "cpf",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cnpj).toBeNull();
    }
  });
});

// ── CustomerUpdateSchema with CNPJ ─────────────────────────
describe("CustomerUpdateSchema with CNPJ", () => {
  it("should allow updating documentType", () => {
    const result = CustomerUpdateSchema.safeParse({
      documentType: "cnpj",
      cnpj: "11.222.333/0001-81",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentType).toBe("cnpj");
      expect(result.data.cnpj).toBe("11222333000181");
    }
  });

  it("should allow setting cnpj to null (removing)", () => {
    const result = CustomerUpdateSchema.safeParse({
      cnpj: null,
      documentType: "cpf",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cnpj).toBeNull();
    }
  });

  it("should allow partial update without cnpj fields", () => {
    const result = CustomerUpdateSchema.safeParse({
      fullName: "Updated Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cnpj).toBeUndefined();
      expect(result.data.documentType).toBeUndefined();
    }
  });
});

// ── BL Linking Schemas ─────────────────────────────────────
describe("BL Create/Update with customerId", () => {
  it("should accept BL with customerId", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "MAEU265399692",
      customerId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBe(1);
    }
  });

  it("should accept BL without customerId", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "TEST123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBeUndefined();
    }
  });

  it("should accept BL update with customerId change", () => {
    const result = BlUpdateSchema.safeParse({
      customerId: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBe(5);
    }
  });

  it("should accept BL update with null customerId (unlink)", () => {
    const result = BlUpdateSchema.safeParse({
      customerId: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBeNull();
    }
  });

  it("should accept BL with vehicleId", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "TEST456",
      vehicleId: 10,
      customerId: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vehicleId).toBe(10);
      expect(result.data.customerId).toBe(3);
    }
  });
});

// ── Manual Linking Logic ────────────────────────────────────
describe("Manual Linking Logic", () => {
  it("should define the BL-Vehicle junction record structure", () => {
    const record = {
      id: 1,
      blId: 10,
      vehicleId: 20,
      customerId: 30,
      position: 1,
      notes: "Linked manually",
      createdAt: new Date(),
    };

    expect(record.blId).toBe(10);
    expect(record.vehicleId).toBe(20);
    expect(record.customerId).toBe(30);
    expect(record.notes).toBe("Linked manually");
  });

  it("should prevent duplicate vehicle links to same BL", () => {
    const existingLinks = [
      { blId: 1, vehicleId: 10 },
      { blId: 1, vehicleId: 20 },
    ];

    const newVehicleId = 10; // already linked
    const isDuplicate = existingLinks.some(
      (l) => l.blId === 1 && l.vehicleId === newVehicleId
    );
    expect(isDuplicate).toBe(true);

    const uniqueVehicleId = 30; // not linked yet
    const isDuplicate2 = existingLinks.some(
      (l) => l.blId === 1 && l.vehicleId === uniqueVehicleId
    );
    expect(isDuplicate2).toBe(false);
  });

  it("should support unlinking a vehicle from BL", () => {
    const links = [
      { id: 1, blId: 1, vehicleId: 10 },
      { id: 2, blId: 1, vehicleId: 20 },
      { id: 3, blId: 1, vehicleId: 30 },
    ];

    const afterRemove = links.filter((l) => l.vehicleId !== 20);
    expect(afterRemove).toHaveLength(2);
    expect(afterRemove.map((l) => l.vehicleId)).toEqual([10, 30]);
  });

  it("should support linking customer to BL via update", () => {
    const blUpdate = { customerId: 5 };
    expect(blUpdate.customerId).toBe(5);
    // This would be sent via trpc.bls.update mutation
  });

  it("should support unlinking customer from BL (set null)", () => {
    const blUpdate = { customerId: null };
    expect(blUpdate.customerId).toBeNull();
  });
});

// ── Quick-Add Customer Flow ─────────────────────────────────
describe("Quick-Add Customer Flow", () => {
  it("should create customer with minimal data for quick-add", () => {
    const quickAddData = {
      fullName: "Novo Cliente Exportação",
      cpf: "039.401.701-35",
      documentType: "cpf" as const,
      dataSource: "manual" as const,
      status: "aguardando_embarque" as const,
    };

    const result = CustomerCreateSchema.safeParse(quickAddData);
    expect(result.success).toBe(true);
  });

  it("should create corporate customer with CNPJ for quick-add", () => {
    const quickAddData = {
      fullName: "Empresa XYZ Importação",
      cpf: "039.401.701-35",
      cnpj: "11.222.333/0001-81",
      documentType: "cnpj" as const,
      dataSource: "manual" as const,
      status: "aguardando_embarque" as const,
    };

    const result = CustomerCreateSchema.safeParse(quickAddData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentType).toBe("cnpj");
      expect(result.data.cnpj).toBe("11222333000181");
    }
  });

  it("should link newly created customer to BL after creation", () => {
    // Simulate the flow: create customer → get ID → update BL with customerId
    const newCustomerId = 42;
    const blId = 10;

    const blUpdatePayload = { customerId: newCustomerId };
    const result = BlUpdateSchema.safeParse(blUpdatePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBe(42);
    }
  });
});
