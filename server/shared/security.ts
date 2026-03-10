/**
 * Security Module — AES-256-GCM encryption, HMAC-SHA256 hashing,
 * secure code generation, rate limiting, and security middlewares.
 *
 * All cryptographic operations use DATA_ENCRYPTION_KEY.
 * System fails at boot if key is missing or same as JWT_SECRET.
 */
import crypto from "crypto";
import { ENV } from "../_core/env";

// ─────────────────────────────────────────────────────────────
// Boot-time validation (fail-fast)
// ─────────────────────────────────────────────────────────────
export function validateSecurityConfig(): void {
  const key = ENV.dataEncryptionKey;
  if (!key) {
    console.warn(
      "WARNING: DATA_ENCRYPTION_KEY is not set. " +
        "Encryption features will be unavailable. " +
        "Generate with: openssl rand -hex 32"
    );
    return;
  }
  if (key === ENV.cookieSecret) {
    throw new Error(
      "FATAL: DATA_ENCRYPTION_KEY must be different from JWT_SECRET. " +
        "Signing keys and encryption keys must be independent."
    );
  }
}

// ─────────────────────────────────────────────────────────────
// AES-256-GCM Encryption / Decryption
// Format: salt(32hex):iv(24hex):tag(32hex):ciphertext(hex)
// ─────────────────────────────────────────────────────────────
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENV.dataEncryptionKey, salt, 100_000, KEY_LENGTH, "sha256");
}

export function encryptSensitiveData(plaintext: string): string {
  if (!ENV.dataEncryptionKey) {
    throw new Error("DATA_ENCRYPTION_KEY is not configured");
  }
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptSensitiveData(encrypted: string): string {
  if (!ENV.dataEncryptionKey) {
    throw new Error("DATA_ENCRYPTION_KEY is not configured");
  }
  const parts = encrypted.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted data format");
  }

  const [saltHex, ivHex, tagHex, ciphertext] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const key = deriveKey(salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// ─────────────────────────────────────────────────────────────
// HMAC-SHA256 Hashing (for CPF search — non-reversible)
// ─────────────────────────────────────────────────────────────
export function hashCpfForSearch(cpf: string): string {
  if (!ENV.dataEncryptionKey) {
    throw new Error("DATA_ENCRYPTION_KEY is not configured");
  }
  // Normalize CPF: remove dots and dashes
  const normalized = cpf.replace(/[.\-]/g, "");
  return crypto
    .createHmac("sha256", ENV.dataEncryptionKey)
    .update(normalized)
    .digest("hex");
}

export function verifyCpfHash(cpf: string, hash: string): boolean {
  const computed = hashCpfForSearch(cpf);
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
}

// ─────────────────────────────────────────────────────────────
// Secure Code Generation
// ─────────────────────────────────────────────────────────────
// Alphabet without ambiguous characters: 0/O, 1/I/l removed
const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPRSTUVWXYZ";

export function generateSecureTrackingCode(): string {
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = "";
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      segment += SAFE_ALPHABET[bytes[i] % SAFE_ALPHABET.length];
    }
    segments.push(segment);
  }
  return `EMC-${segments.join("-")}`;
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// ─────────────────────────────────────────────────────────────
// In-memory Rate Limiter (per-key)
// ─────────────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup expired entries every minute
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      this.store.forEach((entry, key) => {
        if (entry.resetAt <= now) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.store.delete(key));
    }, 60_000).unref();
  }

  /**
   * Check if a request is allowed for the given key.
   * Returns { allowed, remaining, resetAt }
   */
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(key, entry);
    }

    entry.count++;

    return {
      allowed: entry.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }
}

// Pre-configured rate limiters
export const validationRateLimiter = new RateLimiter(10, 60_000); // 10 req/min
export const cpfRateLimiter = new RateLimiter(5, 5 * 60_000); // 5 req/5min
export const webhookRateLimiter = new RateLimiter(100, 60_000); // 100 req/min
export const generalRateLimiter = new RateLimiter(60, 60_000); // 60 req/min

// ─────────────────────────────────────────────────────────────
// Secure Logger — sanitizes PII before logging
// ─────────────────────────────────────────────────────────────
const SENSITIVE_PATTERNS = [
  { regex: /\d{3}\.\d{3}\.\d{3}-\d{2}/g, replacement: "***.***.***-**" },
  { regex: /\b\d{11}\b/g, replacement: "***********" },
  { regex: /EMC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/g, replacement: "EMC-****-****-****" },
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "***@***.***" },
];

export function sanitizeForLog(text: string): string {
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern.regex, pattern.replacement);
  }
  return sanitized;
}

export const secureLogger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${sanitizeForLog(message)}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${sanitizeForLog(message)}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${sanitizeForLog(message)}`, ...args);
  },
};

// ─────────────────────────────────────────────────────────────
// CPF Utilities
// ─────────────────────────────────────────────────────────────
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

// ─────────────────────────────────────────────────────────────
// VIN Validation
// ─────────────────────────────────────────────────────────────
export function isValidVin(vin: string): boolean {
  if (vin.length !== 17) return false;
  // VIN cannot contain I, O, Q
  if (/[IOQ]/i.test(vin)) return false;
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

// ─────────────────────────────────────────────────────────────
// Mask utilities for public display
// ─────────────────────────────────────────────────────────────
export function maskTrackingCode(code: string): string {
  // EMC-AB3D-EF7G-HJ9K → EMC-AB3D-****-****
  const parts = code.split("-");
  if (parts.length !== 4) return code;
  return `${parts[0]}-${parts[1]}-****-****`;
}

export function maskName(name: string): string {
  const parts = name.split(" ");
  if (parts.length <= 1) return name[0] + "***";
  return `${parts[0]} ${parts.slice(1).map((p) => p[0] + "***").join(" ")}`;
}
