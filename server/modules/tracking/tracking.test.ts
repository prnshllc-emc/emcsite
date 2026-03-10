/**
 * Tracking System Tests — Unit tests for security utilities, code generation,
 * schema validation, and service helper functions.
 *
 * These tests validate pure functions and schemas without requiring a database
 * connection, following the same pattern as auth.logout.test.ts.
 */
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// ── Test the Zod schemas ────────────────────────────────────
import {
  TrackingCodeSchema,
  TrackingHistoryCreateSchema,
  BlStatusEnum,
  TrackingEventTypeEnum,
  BlCreateSchema,
  PaginatedQuerySchema,
} from "@shared/schemas";

// ── Test the security utilities ─────────────────────────────
import {
  generateSecureTrackingCode,
  isValidCpf,
  isValidVin,
  maskTrackingCode,
  maskName,
  formatCpf,
  sanitizeForLog,
  RateLimiter,
} from "../../shared/security";

// ── Test the cache module ───────────────────────────────────
import { InMemoryCache } from "../../shared/cache";

// ══════════════════════════════════════════════════════════════
// TRACKING CODE SCHEMA VALIDATION
// ══════════════════════════════════════════════════════════════

describe("TrackingCodeSchema", () => {
  it("accepts a valid EMC tracking code", () => {
    const result = TrackingCodeSchema.safeParse("EMC-AB3D-EF7G-HJ9K");
    expect(result.success).toBe(true);
  });

  it("accepts codes with allowed characters only", () => {
    const result = TrackingCodeSchema.safeParse("EMC-2345-6789-ABCD");
    expect(result.success).toBe(true);
  });

  it("rejects codes without EMC prefix", () => {
    const result = TrackingCodeSchema.safeParse("XYZ-AB3D-EF7G-HJ9K");
    expect(result.success).toBe(false);
  });

  it("rejects codes with wrong segment count", () => {
    const result = TrackingCodeSchema.safeParse("EMC-AB3D-EF7G");
    expect(result.success).toBe(false);
  });

  it("rejects codes with wrong segment length", () => {
    const result = TrackingCodeSchema.safeParse("EMC-AB3-EF7G-HJ9K");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = TrackingCodeSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects codes with ambiguous characters (0, O, 1, I)", () => {
    // The regex uses [A-HJ-NPR-Z2-9] which excludes I, O, 0, 1
    const result1 = TrackingCodeSchema.safeParse("EMC-0000-0000-0000");
    expect(result1.success).toBe(false);

    const result2 = TrackingCodeSchema.safeParse("EMC-OOOO-OOOO-OOOO");
    expect(result2.success).toBe(false);

    const result3 = TrackingCodeSchema.safeParse("EMC-1111-1111-1111");
    expect(result3.success).toBe(false);

    const result4 = TrackingCodeSchema.safeParse("EMC-IIII-IIII-IIII");
    expect(result4.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// TRACKING HISTORY CREATE SCHEMA
// ══════════════════════════════════════════════════════════════

describe("TrackingHistoryCreateSchema", () => {
  it("accepts valid event data", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      blId: 1,
      eventType: "in_transit",
      title: "Veículo embarcado",
      description: "Container carregado no porto de Miami",
      location: "Miami, FL",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal event data", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      blId: 1,
      eventType: "info",
      title: "Atualização",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      blId: 1,
      eventType: "invalid_type",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing blId", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      eventType: "info",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      blId: 1,
      eventType: "info",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative blId", () => {
    const result = TrackingHistoryCreateSchema.safeParse({
      blId: -1,
      eventType: "info",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// BL STATUS ENUM
// ══════════════════════════════════════════════════════════════

describe("BlStatusEnum", () => {
  const validStatuses = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];

  it.each(validStatuses)("accepts '%s' as valid status", (status) => {
    const result = BlStatusEnum.safeParse(status);
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = BlStatusEnum.safeParse("cancelled");
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// TRACKING EVENT TYPE ENUM
// ══════════════════════════════════════════════════════════════

describe("TrackingEventTypeEnum", () => {
  const validTypes = ["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"];

  it.each(validTypes)("accepts '%s' as valid event type", (type) => {
    const result = TrackingEventTypeEnum.safeParse(type);
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = TrackingEventTypeEnum.safeParse("unknown");
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// PAGINATED QUERY SCHEMA
// ══════════════════════════════════════════════════════════════

describe("PaginatedQuerySchema", () => {
  it("accepts valid pagination params", () => {
    const result = PaginatedQuerySchema.safeParse({
      page: 1,
      limit: 20,
      sortOrder: "desc",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for missing fields", () => {
    const result = PaginatedQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("rejects page < 1", () => {
    const result = PaginatedQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = PaginatedQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// SECURE TRACKING CODE GENERATION
// ══════════════════════════════════════════════════════════════

describe("generateSecureTrackingCode", () => {
  it("generates code in EMC-XXXX-XXXX-XXXX format", () => {
    const code = generateSecureTrackingCode();
    expect(code).toMatch(/^EMC-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateSecureTrackingCode());
    }
    expect(codes.size).toBe(100);
  });

  it("does not contain ambiguous characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSecureTrackingCode();
      const segments = code.replace("EMC-", "");
      expect(segments).not.toMatch(/[0OI1]/);
    }
  });

  it("always starts with EMC-", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateSecureTrackingCode().startsWith("EMC-")).toBe(true);
    }
  });

  it("has exactly 18 characters", () => {
    const code = generateSecureTrackingCode();
    expect(code.length).toBe(18);
  });

  it("generated codes pass the TrackingCodeSchema validation", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSecureTrackingCode();
      const result = TrackingCodeSchema.safeParse(code);
      expect(result.success).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// CPF VALIDATION
// ══════════════════════════════════════════════════════════════

describe("isValidCpf", () => {
  it("accepts valid CPFs", () => {
    // Known valid CPF: 529.982.247-25
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("accepts formatted CPFs", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejects all-same-digit CPFs", () => {
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
    expect(isValidCpf("99999999999")).toBe(false);
  });

  it("rejects CPFs with wrong length", () => {
    expect(isValidCpf("123456789")).toBe(false);
    expect(isValidCpf("123456789012")).toBe(false);
  });

  it("rejects CPFs with invalid check digits", () => {
    expect(isValidCpf("52998224726")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// VIN VALIDATION
// ══════════════════════════════════════════════════════════════

describe("isValidVin", () => {
  it("accepts valid VINs", () => {
    expect(isValidVin("WBAJB0C51JB084264")).toBe(true);
  });

  it("rejects VINs with I, O, Q", () => {
    expect(isValidVin("WBAJB0C51IB084264")).toBe(false);
    expect(isValidVin("WBAJB0C51OB084264")).toBe(false);
    expect(isValidVin("WBAJB0C51QB084264")).toBe(false);
  });

  it("rejects VINs with wrong length", () => {
    expect(isValidVin("WBAJB0C51JB08426")).toBe(false);
    expect(isValidVin("WBAJB0C51JB0842644")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidVin("")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// MASKING UTILITIES
// ══════════════════════════════════════════════════════════════

describe("maskTrackingCode", () => {
  it("masks the last two segments", () => {
    expect(maskTrackingCode("EMC-AB3D-EF7G-HJ9K")).toBe("EMC-AB3D-****-****");
  });

  it("returns original if format is wrong", () => {
    expect(maskTrackingCode("INVALID")).toBe("INVALID");
  });
});

describe("maskName", () => {
  it("masks last name parts", () => {
    const result = maskName("João Silva");
    expect(result).toContain("João");
    expect(result).toContain("S***");
  });

  it("handles single name", () => {
    const result = maskName("João");
    expect(result).toBe("J***");
  });
});

describe("formatCpf", () => {
  it("formats 11-digit CPF", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("returns original if wrong length", () => {
    expect(formatCpf("123")).toBe("123");
  });
});

// ══════════════════════════════════════════════════════════════
// SANITIZE FOR LOG
// ══════════════════════════════════════════════════════════════

describe("sanitizeForLog", () => {
  it("masks CPF in formatted form", () => {
    const result = sanitizeForLog("CPF: 529.982.247-25");
    expect(result).not.toContain("529.982.247-25");
    expect(result).toContain("***.***.***-**");
  });

  it("masks tracking codes", () => {
    const result = sanitizeForLog("Code: EMC-AB3D-EF7G-HJ9K");
    expect(result).not.toContain("EMC-AB3D-EF7G-HJ9K");
    expect(result).toContain("EMC-****-****-****");
  });

  it("masks email addresses", () => {
    const result = sanitizeForLog("Email: user@example.com");
    expect(result).not.toContain("user@example.com");
    expect(result).toContain("***@***.***");
  });
});

// ══════════════════════════════════════════════════════════════
// RATE LIMITER
// ══════════════════════════════════════════════════════════════

describe("RateLimiter", () => {
  it("allows requests within limit", () => {
    const limiter = new RateLimiter(5, 60_000);
    for (let i = 0; i < 5; i++) {
      const result = limiter.check("test-key");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over limit", () => {
    const limiter = new RateLimiter(3, 60_000);
    limiter.check("test-key");
    limiter.check("test-key");
    limiter.check("test-key");
    const result = limiter.check("test-key");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different keys independently", () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.check("key-a");
    limiter.check("key-a");
    const resultA = limiter.check("key-a");
    const resultB = limiter.check("key-b");
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it("returns remaining count", () => {
    const limiter = new RateLimiter(5, 60_000);
    const r1 = limiter.check("test");
    expect(r1.remaining).toBe(4);
    const r2 = limiter.check("test");
    expect(r2.remaining).toBe(3);
  });
});

// ══════════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ══════════════════════════════════════════════════════════════

describe("InMemoryCache", () => {
  it("stores and retrieves values", () => {
    const cache = new InMemoryCache<string>({ ttl: 60 });
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing keys", () => {
    const cache = new InMemoryCache<string>({ ttl: 60 });
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("deletes values", () => {
    const cache = new InMemoryCache<string>({ ttl: 60 });
    cache.set("key1", "value1");
    cache.delete("key1");
    expect(cache.get("key1")).toBeUndefined();
  });

  it("clears all values", () => {
    const cache = new InMemoryCache<string>({ ttl: 60 });
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.get("key2")).toBeUndefined();
  });

  it("returns correct size via stats()", () => {
    const cache = new InMemoryCache<string>({ ttl: 60 });
    expect(cache.stats().size).toBe(0);
    cache.set("key1", "value1");
    expect(cache.stats().size).toBe(1);
    cache.set("key2", "value2");
    expect(cache.stats().size).toBe(2);
  });
});

// ══════════════════════════════════════════════════════════════
// BL CREATE SCHEMA
// ══════════════════════════════════════════════════════════════

describe("BlCreateSchema", () => {
  it("accepts valid BL data", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
      portOfLoading: "Miami, FL",
      portOfDischarge: "Itajaí, SC",
      containerNumber: "MSKU1234567",
    });
    expect(result.success).toBe(true);
  });

  it("applies default status of draft", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "MEDU1234567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("rejects empty blNumber", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects blNumber over 50 chars", () => {
    const result = BlCreateSchema.safeParse({
      blNumber: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });
});
