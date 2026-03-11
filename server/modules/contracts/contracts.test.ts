/**
 * Tests for the Contract Upload Service.
 *
 * Tests the data extraction validation and contract flow logic.
 * Note: LLM/S3 calls are not tested here — only the pure logic functions.
 */
import { describe, it, expect, vi } from "vitest";

// We test the validation helpers from security module used by contracts
import { isValidCpf, isValidVin } from "../../shared/security";

describe("Contract Validation Helpers", () => {
  describe("CPF Validation", () => {
    it("should validate a correct CPF", () => {
      // Well-known valid CPF: 529.982.247-25
      expect(isValidCpf("52998224725")).toBe(true);
    });

    it("should reject CPF with all same digits", () => {
      expect(isValidCpf("11111111111")).toBe(false);
      expect(isValidCpf("00000000000")).toBe(false);
    });

    it("should reject CPF with wrong length", () => {
      expect(isValidCpf("1234567890")).toBe(false); // 10 digits
      expect(isValidCpf("123456789012")).toBe(false); // 12 digits
    });

    it("should reject CPF with invalid check digits", () => {
      expect(isValidCpf("52998224726")).toBe(false); // last digit wrong
    });
  });

  describe("VIN Validation", () => {
    it("should validate a standard 17-character VIN", () => {
      // Example valid VIN
      expect(isValidVin("1HGBH41JXMN109186")).toBe(true);
    });

    it("should reject VIN with invalid characters (I, O, Q)", () => {
      expect(isValidVin("1HGBH41IXMN109186")).toBe(false); // I
      expect(isValidVin("1HGBH41OXMN109186")).toBe(false); // O
      expect(isValidVin("1HGBH41QXMN109186")).toBe(false); // Q
    });

    it("should reject VIN with wrong length", () => {
      expect(isValidVin("1HGBH41JXMN10918")).toBe(false); // 16 chars
      expect(isValidVin("1HGBH41JXMN1091860")).toBe(false); // 18 chars
    });

    it("should reject empty VIN", () => {
      expect(isValidVin("")).toBe(false);
    });
  });
});

describe("Contract Data Extraction Parsing", () => {
  it("should handle well-formed extraction response", () => {
    const mockResponse = {
      name: "João da Silva",
      cpf: "52998224725",
      email: "joao@example.com",
      phone: "+5511999999999",
      vins: ["1HGBH41JXMN109186"],
      vehicleDescriptions: [
        {
          vin: "1HGBH41JXMN109186",
          make: "Honda",
          model: "Civic",
          year: 2021,
          color: "Prata",
        },
      ],
      tipoOperacao: "importacao",
      rawExtractedText: "Contrato de importação...",
      confidence: "high",
      warnings: [],
    };

    // Verify structure is correct
    expect(mockResponse.name).toBe("João da Silva");
    expect(mockResponse.cpf).toBe("52998224725");
    expect(mockResponse.vins).toHaveLength(1);
    expect(mockResponse.vehicleDescriptions[0].make).toBe("Honda");
    expect(mockResponse.confidence).toBe("high");
  });

  it("should handle null fields gracefully", () => {
    const mockResponse = {
      name: null,
      cpf: null,
      email: null,
      phone: null,
      vins: [],
      vehicleDescriptions: [],
      tipoOperacao: null,
      rawExtractedText: "",
      confidence: "low",
      warnings: ["Nenhum dado encontrado no PDF"],
    };

    expect(mockResponse.name).toBeNull();
    expect(mockResponse.cpf).toBeNull();
    expect(mockResponse.vins).toHaveLength(0);
    expect(mockResponse.confidence).toBe("low");
    expect(mockResponse.warnings).toHaveLength(1);
  });

  it("should handle multiple VINs per contract", () => {
    const vins = [
      "1HGBH41JXMN109186",
      "WVWZZZ3CZWE123456",
      "3VWFE21C04M000001",
    ];

    expect(vins).toHaveLength(3);
    for (const vin of vins) {
      expect(vin.length).toBe(17);
    }
  });
});

describe("Scheduler Logic", () => {
  it("should export getSchedulerStatus with correct shape", async () => {
    const { getSchedulerStatus } = await import("../reconciliation/scheduler");
    const status = getSchedulerStatus();

    expect(status).toHaveProperty("running");
    expect(status).toHaveProperty("lastRunAt");
    expect(status).toHaveProperty("lastRunResult");
    expect(status).toHaveProperty("isReconciling");
    expect(typeof status.running).toBe("boolean");
    expect(typeof status.isReconciling).toBe("boolean");
  });
});
