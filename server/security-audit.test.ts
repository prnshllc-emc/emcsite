/**
 * Security Audit Tests — Validates all fixes from the comprehensive security audit.
 *
 * V-001: Timing-safe API key comparison
 * V-002: No hardcoded fallback tokens
 * V-003: PII encryption in Clicksign contracts
 * V-005: secureLogger sanitizes PII in logs
 * V-007: DOMPurify import exists for XSS protection
 * V-008: Soft-delete filters on findById functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── V-001: Timing-safe API key comparison ──────────────────
describe("V-001: Timing-safe API key comparison", () => {
  it("Agent ingestion uses crypto.timingSafeEqual", async () => {
    // Read the source file and verify it uses timingSafeEqual
    const fs = await import("fs");
    const agentSource = fs.readFileSync(
      "server/modules/agent/ingestion.ts",
      "utf-8"
    );
    expect(agentSource).toContain("timingSafeEqual");
    expect(agentSource).toContain("crypto.timingSafeEqual");
    // Should NOT have direct string comparison for API key
    expect(agentSource).not.toMatch(/apiKey\s*!==\s*expectedKey/);
    expect(agentSource).not.toMatch(/apiKey\s*===\s*expectedKey/);
  });

  it("CMS API uses crypto.timingSafeEqual", async () => {
    const fs = await import("fs");
    const cmsSource = fs.readFileSync("server/modules/cms/api.ts", "utf-8");
    expect(cmsSource).toContain("timingSafeEqual");
    expect(cmsSource).toContain("crypto.timingSafeEqual");
    expect(cmsSource).not.toMatch(/apiKey\s*!==\s*expectedKey/);
    expect(cmsSource).not.toMatch(/apiKey\s*===\s*expectedKey/);
  });
});

// ── V-002: No hardcoded fallback tokens ────────────────────
describe("V-002: No hardcoded fallback tokens", () => {
  it("WhatsApp webhook does not have hardcoded verify token", async () => {
    const fs = await import("fs");
    const webhookSource = fs.readFileSync(
      "server/modules/whatsapp/webhook.ts",
      "utf-8"
    );
    // Should NOT contain the old hardcoded token
    expect(webhookSource).not.toContain("emc_whatsapp_verify_2024");
    // Should check if token is configured
    expect(webhookSource).toContain("!verifyToken");
    expect(webhookSource).toContain("503");
  });
});

// ── V-003: PII encryption in Clicksign contracts ──────────
describe("V-003: PII encryption in Clicksign contracts", () => {
  it("Clicksign webhook encrypts PII before storage", async () => {
    const fs = await import("fs");
    const webhookSource = fs.readFileSync(
      "server/modules/contracts/webhook.ts",
      "utf-8"
    );
    expect(webhookSource).toContain("encryptSensitiveData");
    expect(webhookSource).toContain("encryptIfPresent");
    // Should encrypt signer data
    expect(webhookSource).toContain("encryptIfPresent(signerNamePlain)");
    expect(webhookSource).toContain("encryptIfPresent(signerCpfPlain)");
    expect(webhookSource).toContain("encryptIfPresent(signerEmailPlain)");
  });

  it("Contract service encrypts PII on manual upload", async () => {
    const fs = await import("fs");
    const serviceSource = fs.readFileSync(
      "server/modules/contracts/service.ts",
      "utf-8"
    );
    expect(serviceSource).toContain("encryptSensitiveData(extracted.name)");
    expect(serviceSource).toContain("encryptSensitiveData(extracted.cpf)");
    expect(serviceSource).toContain("encryptSensitiveData(extracted.email)");
  });

  it("Contract service decrypts PII when reading", async () => {
    const fs = await import("fs");
    const serviceSource = fs.readFileSync(
      "server/modules/contracts/service.ts",
      "utf-8"
    );
    expect(serviceSource).toContain("decryptIfPresent(r.signerName)");
    expect(serviceSource).toContain("decryptIfPresent(r.signerCpf)");
  });
});

// ── V-005: secureLogger sanitizes PII ──────────────────────
describe("V-005: secureLogger sanitizes PII in logs", () => {
  it("sanitizeForLog masks CPF patterns", async () => {
    const { sanitizeForLog } = await import("./shared/security");
    const result = sanitizeForLog("User CPF: 123.456.789-00");
    expect(result).not.toContain("123.456.789-00");
    expect(result).toContain("***.***.***-**");
  });

  it("sanitizeForLog masks email patterns", async () => {
    const { sanitizeForLog } = await import("./shared/security");
    const result = sanitizeForLog("Email: john@example.com");
    expect(result).not.toContain("john@example.com");
    expect(result).toContain("***@***.***");
  });

  it("sanitizeForLog masks tracking codes", async () => {
    const { sanitizeForLog } = await import("./shared/security");
    const result = sanitizeForLog("Code: EMC-AB3D-EF7G-HJ9K");
    expect(result).not.toContain("EMC-AB3D-EF7G-HJ9K");
    expect(result).toContain("EMC-****-****-****");
  });

  it("routers.ts uses secureLogger instead of console.log for HubSpot", async () => {
    const fs = await import("fs");
    const routersSource = fs.readFileSync("server/routers.ts", "utf-8");
    expect(routersSource).toContain("secureLogger.info");
    expect(routersSource).toContain("secureLogger.warn");
    expect(routersSource).toContain("secureLogger.error");
    // Should not have raw console.log with email in HubSpot section
    expect(routersSource).not.toMatch(
      /console\.log\(`\[HubSpot\].*\$\{input\.email\}/
    );
  });

  it("hubspotSync.ts uses secureLogger for email logging", async () => {
    const fs = await import("fs");
    const hubspotSource = fs.readFileSync("server/hubspotSync.ts", "utf-8");
    expect(hubspotSource).toContain("secureLogger");
    // Should not have raw console.log with lead.email
    expect(hubspotSource).not.toMatch(
      /console\.log\(`\[HubSpot\].*\$\{lead\.email\}/
    );
  });
});

// ── V-007: XSS protection with DOMPurify ──────────────────
describe("V-007: XSS protection with DOMPurify", () => {
  it("KnowledgeCenter uses DOMPurify.sanitize", async () => {
    const fs = await import("fs");
    const kcSource = fs.readFileSync(
      "client/src/pages/KnowledgeCenter.tsx",
      "utf-8"
    );
    expect(kcSource).toContain("import DOMPurify from");
    expect(kcSource).toContain("DOMPurify.sanitize");
    expect(kcSource).toContain("ALLOWED_TAGS");
    expect(kcSource).toContain("ALLOWED_ATTR");
  });
});

// ── V-008: Soft-delete filters on findById ─────────────────
describe("V-008: Soft-delete filters on findById functions", () => {
  it("findBlById filters by deletedAt IS NULL", async () => {
    const fs = await import("fs");
    const blRepoSource = fs.readFileSync(
      "server/modules/bls/repository.ts",
      "utf-8"
    );
    // Extract the findBlById function block
    const fnMatch = blRepoSource.match(
      /export async function findBlById[\s\S]*?return toRecord\(row\);\n}/
    );
    expect(fnMatch).toBeTruthy();
    expect(fnMatch![0]).toContain("isNull");
    expect(fnMatch![0]).toContain("deletedAt");
  });

  it("findCustomerById filters by deletedAt IS NULL", async () => {
    const fs = await import("fs");
    const custRepoSource = fs.readFileSync(
      "server/modules/customers/repository.ts",
      "utf-8"
    );
    const fnMatch = custRepoSource.match(
      /export async function findCustomerById[\s\S]*?return decryptCustomer\(row\);\n}/
    );
    expect(fnMatch).toBeTruthy();
    expect(fnMatch![0]).toContain("isNull");
    expect(fnMatch![0]).toContain("deletedAt");
  });

  it("findVehicleById filters by deletedAt IS NULL", async () => {
    const fs = await import("fs");
    const vehRepoSource = fs.readFileSync(
      "server/modules/vehicles/repository.ts",
      "utf-8"
    );
    const fnMatch = vehRepoSource.match(
      /export async function findVehicleById[\s\S]*?return toRecord\(row\);\n}/
    );
    expect(fnMatch).toBeTruthy();
    expect(fnMatch![0]).toContain("isNull");
    expect(fnMatch![0]).toContain("deletedAt");
  });

  it("findCustomerByCpf filters by deletedAt IS NULL", async () => {
    const fs = await import("fs");
    const custRepoSource = fs.readFileSync(
      "server/modules/customers/repository.ts",
      "utf-8"
    );
    const fnMatch = custRepoSource.match(
      /export async function findCustomerByCpf[\s\S]*?return decryptCustomer\(row\);\n}/
    );
    expect(fnMatch).toBeTruthy();
    expect(fnMatch![0]).toContain("isNull");
    expect(fnMatch![0]).toContain("deletedAt");
  });
});

// ── General: No hardcoded secrets in codebase ──────────────
describe("General: No hardcoded secrets", () => {
  it("No .env files committed", async () => {
    const fs = await import("fs");
    const gitignore = fs.readFileSync(".gitignore", "utf-8");
    expect(gitignore).toContain(".env");
  });

  it("No hardcoded API keys in server code", async () => {
    const fs = await import("fs");

    // Check key files for hardcoded secrets
    const criticalFiles = [
      "server/routers.ts",
      "server/hubspotSync.ts",
      "server/modules/agent/ingestion.ts",
      "server/modules/cms/api.ts",
    ];

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf-8");
        // Should not contain hardcoded bearer tokens or API keys
        expect(content).not.toMatch(
          /["']Bearer\s+[a-zA-Z0-9]{20,}["']/
        );
      }
    }
  });
});
