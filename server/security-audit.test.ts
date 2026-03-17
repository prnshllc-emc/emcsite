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

// ── V-009: Rate limiters on public tracking endpoints ──────
describe("V-009: Rate limiters on public tracking endpoints", () => {
  it("tracking router uses rateLimitedPublicProcedure for lookup", async () => {
    const fs = await import("fs");
    const routerSource = fs.readFileSync(
      "server/modules/tracking/router.ts",
      "utf-8"
    );
    expect(routerSource).toContain("rateLimitedPublicProcedure");
    expect(routerSource).toContain("cpfRateLimitedPublicProcedure");
    // Should NOT use plain publicProcedure for public endpoints
    expect(routerSource).not.toMatch(/lookup:\s*publicProcedure/);
    expect(routerSource).not.toMatch(/lookupByCpf:\s*publicProcedure/);
  });

  it("trpc.ts exports rate-limited procedures", async () => {
    const fs = await import("fs");
    const trpcSource = fs.readFileSync("server/_core/trpc.ts", "utf-8");
    expect(trpcSource).toContain("export const rateLimitedPublicProcedure");
    expect(trpcSource).toContain("export const cpfRateLimitedPublicProcedure");
    expect(trpcSource).toContain("cpfRateLimiter");
    expect(trpcSource).toContain("generalRateLimiter");
    expect(trpcSource).toContain("TOO_MANY_REQUESTS");
  });

  it("rate limiter blocks after exceeding limit", async () => {
    const { RateLimiter } = await import("./shared/security");
    const limiter = new RateLimiter(3, 60_000);
    const ip = "test-ip-" + Date.now();

    // First 3 requests should be allowed
    expect(limiter.check(ip).allowed).toBe(true);
    expect(limiter.check(ip).allowed).toBe(true);
    expect(limiter.check(ip).allowed).toBe(true);

    // 4th request should be blocked
    const result = limiter.check(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

// ── V-010: Clicksign PII migration script exists ──────────
describe("V-010: Clicksign PII migration script", () => {
  it("migration script exists and has proper structure", async () => {
    const fs = await import("fs");
    const scriptPath = "server/migrations/encrypt-clicksign-pii.mjs";
    expect(fs.existsSync(scriptPath)).toBe(true);

    const content = fs.readFileSync(scriptPath, "utf-8");
    // Should check for DATA_ENCRYPTION_KEY
    expect(content).toContain("DATA_ENCRYPTION_KEY");
    expect(content).toContain("DATABASE_URL");
    // Should have encryption logic
    expect(content).toContain("encryptSensitiveData");
    expect(content).toContain("aes-256-gcm");
    // Should detect already-encrypted data
    expect(content).toContain("isAlreadyEncrypted");
    // Should update the correct table
    expect(content).toContain("clicksign_contracts");
    // Should handle all PII fields
    expect(content).toContain("signer_name");
    expect(content).toContain("signer_cpf");
    expect(content).toContain("signer_email");
    expect(content).toContain("signer_phone");
    expect(content).toContain("raw_payload");
  });
});

// ── V-011: Axios updated to fix DoS vulnerability ─────────
describe("V-011: Axios version updated", () => {
  it("axios is at version >=1.13.5", async () => {
    const fs = await import("fs");
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    const axiosVersion = packageJson.dependencies?.axios || "";
    // Should be 1.13.5 or higher
    expect(axiosVersion).toMatch(/^[\^~]?1\.1[3-9]\.[5-9]|^[\^~]?1\.1[3-9]\.\d{2,}|^[\^~]?1\.[2-9]\d/);
  });
});

// ── V-012: Helmet security headers ──────────────────────────
describe("V-012: Helmet security headers", () => {
  it("server/_core/index.ts imports and uses helmet", async () => {
    const fs = await import("fs");
    const serverSource = fs.readFileSync("server/_core/index.ts", "utf-8");
    expect(serverSource).toContain('import helmet from "helmet"');
    expect(serverSource).toContain("helmet({");
    // Should have CSP and other security directives
    expect(serverSource).toContain("contentSecurityPolicy");
    expect(serverSource).toContain("crossOriginEmbedderPolicy");
  });

  it("helmet is installed as a dependency", async () => {
    const fs = await import("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    expect(pkg.dependencies?.helmet || pkg.devDependencies?.helmet).toBeTruthy();
  });
});

// ── V-013: WhatsApp webhook HMAC X-Hub-Signature-256 ────────
describe("V-013: WhatsApp webhook HMAC validation", () => {
  it("WhatsApp webhook validates X-Hub-Signature-256 header", async () => {
    const fs = await import("fs");
    const webhookSource = fs.readFileSync(
      "server/modules/whatsapp/webhook.ts",
      "utf-8"
    );
    expect(webhookSource).toContain("x-hub-signature-256");
    expect(webhookSource).toContain("WHATSAPP_APP_SECRET");
    expect(webhookSource).toContain("createHmac");
    expect(webhookSource).toContain("timingSafeEqual");
    expect(webhookSource).toContain("validateSignature");
  });

  it("validateSignature correctly validates HMAC-SHA256", async () => {
    const crypto = await import("crypto");
    const { validateSignature } = await import(
      "./modules/whatsapp/webhook"
    );

    const secret = "test_app_secret_12345";
    const body = Buffer.from(JSON.stringify({ test: "payload" }));
    const validSig =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(body).digest("hex");

    // Valid signature should pass
    expect(validateSignature(body, validSig, secret)).toBe(true);

    // Invalid signature should fail
    expect(validateSignature(body, "sha256=invalid", secret)).toBe(false);

    // Missing signature should fail
    expect(validateSignature(body, undefined, secret)).toBe(false);

    // Wrong prefix should fail
    expect(validateSignature(body, "md5=abc123", secret)).toBe(false);
  });
});

// ── V-014: Clicksign webhook token-based authentication ─────
describe("V-014: Clicksign webhook token validation", () => {
  it("Clicksign webhook validates token from query param", async () => {
    const fs = await import("fs");
    const webhookSource = fs.readFileSync(
      "server/modules/contracts/webhook.ts",
      "utf-8"
    );
    expect(webhookSource).toContain("CLICKSIGN_WEBHOOK_SECRET");
    expect(webhookSource).toContain("validateWebhookToken");
    expect(webhookSource).toContain("timingSafeEqual");
    expect(webhookSource).toContain("req.query.token");
    expect(webhookSource).toContain("x-webhook-token");
    // Should return 401 on invalid token
    expect(webhookSource).toContain('res.status(401)');
  });

  it("Clicksign webhook logs auth failures to audit", async () => {
    const fs = await import("fs");
    const webhookSource = fs.readFileSync(
      "server/modules/contracts/webhook.ts",
      "utf-8"
    );
    expect(webhookSource).toContain("clicksign_webhook_auth_failure");
    expect(webhookSource).toContain("logAudit");
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
