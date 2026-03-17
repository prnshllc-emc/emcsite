/**
 * Migration Script: Encrypt legacy Clicksign PII data
 *
 * This script finds all clicksign_contracts records where PII fields
 * (signer_name, signer_cpf, signer_email, signer_phone, raw_payload)
 * are stored in plaintext and encrypts them using AES-256-GCM.
 *
 * Detection heuristic:
 * - Encrypted data follows the format: salt(32hex):iv(24hex):tag(32hex):ciphertext(hex)
 * - If a field does NOT contain 3 colons separating hex segments, it's plaintext
 * - raw_payload: if it starts with '{', it's plaintext JSON
 *
 * Usage: node server/migrations/encrypt-clicksign-pii.mjs
 * Requires: DATA_ENCRYPTION_KEY environment variable
 */
import "dotenv/config";
import crypto from "crypto";
import mysql from "mysql2/promise";

// ── Configuration ──────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
const DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY;

if (!DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set");
  process.exit(1);
}
if (!DATA_ENCRYPTION_KEY) {
  console.error("FATAL: DATA_ENCRYPTION_KEY is not set");
  process.exit(1);
}

// ── Encryption (mirrors server/shared/security.ts) ─────────────
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

function deriveKey(salt) {
  return crypto.pbkdf2Sync(DATA_ENCRYPTION_KEY, salt, 100_000, KEY_LENGTH, "sha256");
}

function encryptSensitiveData(plaintext) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

function isAlreadyEncrypted(value) {
  if (!value || typeof value !== "string") return false;
  const parts = value.split(":");
  // Encrypted format: salt(32hex):iv(24hex):tag(32hex):ciphertext(hex)
  if (parts.length !== 4) return false;
  // Check if all parts are hex
  return parts.every((p) => /^[0-9a-f]+$/i.test(p));
}

function isPlaintextJson(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

// ── Main migration ─────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Clicksign PII Encryption Migration                 ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log();

  // Parse DATABASE_URL for mysql2
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  console.log("[1/4] Connected to database");

  // Fetch all records
  const [rows] = await connection.execute(
    "SELECT id, signer_name, signer_cpf, signer_email, signer_phone, raw_payload FROM clicksign_contracts"
  );

  console.log(`[2/4] Found ${rows.length} total records`);

  if (rows.length === 0) {
    console.log("\n✅ No records to migrate. Table is empty.");
    await connection.end();
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const updates = {};
    let needsUpdate = false;

    // Check each PII field
    const piiFields = ["signer_name", "signer_cpf", "signer_email", "signer_phone"];
    for (const field of piiFields) {
      const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      const value = row[camelField] || row[field];
      if (value && !isAlreadyEncrypted(value)) {
        updates[field] = encryptSensitiveData(value);
        needsUpdate = true;
      }
    }

    // Check raw_payload
    const rawPayload = row.rawPayload || row.raw_payload;
    if (rawPayload && isPlaintextJson(rawPayload)) {
      updates["raw_payload"] = encryptSensitiveData(rawPayload);
      needsUpdate = true;
    }

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    try {
      const setClauses = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
      const values = [...Object.values(updates), row.id];
      await connection.execute(
        `UPDATE clicksign_contracts SET ${setClauses} WHERE id = ?`,
        values
      );
      migrated++;
    } catch (err) {
      console.error(`  ❌ Error migrating record #${row.id}:`, err.message);
      errors++;
    }
  }

  console.log(`[3/4] Migration complete`);
  console.log();
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log(`║  Results:                                            ║`);
  console.log(`║  Total records:  ${String(rows.length).padStart(5)}                              ║`);
  console.log(`║  Migrated:       ${String(migrated).padStart(5)}                              ║`);
  console.log(`║  Already encrypted: ${String(skipped).padStart(5)}                           ║`);
  console.log(`║  Errors:         ${String(errors).padStart(5)}                              ║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  await connection.end();
  console.log("[4/4] Connection closed");

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
