/**
 * System Config Module — Runtime configuration stored in database.
 * Allows changing system behavior without redeployment.
 */
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { systemConfigCache } from "./cache";

// ── Default configuration values ─────────────────────────────
const DEFAULTS: Record<string, string> = {
  tracking_code_expiry_days: "365",
  tracking_code_max_uses: "0", // 0 = unlimited
  rate_limit_tracking: "10", // req/min
  rate_limit_cpf: "5", // req/5min
  maintenance_mode: "false",
  bl_auto_reconcile: "true",
  invite_expiry_hours: "72",
  email_notifications_enabled: "true",
};

/**
 * Get a config value by key. Uses cache with 10min TTL.
 */
export async function getConfig(key: string): Promise<string> {
  // Check cache first
  const cached = systemConfigCache.get(key);
  if (cached !== undefined) return cached;

  // Query database
  const db = await getDb();
  if (!db) return DEFAULTS[key] ?? "";

  const [row] = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);

  const value = row?.value ?? DEFAULTS[key] ?? "";
  systemConfigCache.set(key, value);
  return value;
}

/**
 * Set a config value. Upserts and invalidates cache.
 */
export async function setConfig(
  key: string,
  value: string,
  updatedBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [existing] = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);

  if (existing) {
    await db
      .update(systemConfig)
      .set({ value, updatedBy, updatedAt: new Date() })
      .where(eq(systemConfig.key, key));
  } else {
    await db.insert(systemConfig).values({
      key,
      value,
      updatedBy,
    });
  }

  // Invalidate cache
  systemConfigCache.delete(key);
}

/**
 * Get all config entries.
 */
export async function getAllConfig(): Promise<
  Array<{ key: string; value: string; updatedAt: Date | null }>
> {
  const db = await getDb();
  if (!db) {
    return Object.entries(DEFAULTS).map(([key, value]) => ({
      key,
      value,
      updatedAt: null,
    }));
  }

  const rows = await db.select().from(systemConfig);

  // Merge with defaults
  const configMap = new Map(rows.map((r) => [r.key, r]));
  const result: Array<{ key: string; value: string; updatedAt: Date | null }> = [];

  Object.entries(DEFAULTS).forEach(([key, defaultValue]) => {
    const row = configMap.get(key);
    result.push({
      key,
      value: row?.value ?? defaultValue,
      updatedAt: row?.updatedAt ?? null,
    });
  });

  // Add any custom keys not in defaults
  rows.forEach((row) => {
    if (!DEFAULTS[row.key]) {
      result.push({
        key: row.key,
        value: row.value,
        updatedAt: row.updatedAt,
      });
    }
  });

  return result;
}

/**
 * Get a config value as number.
 */
export async function getConfigNumber(key: string): Promise<number> {
  const value = await getConfig(key);
  return parseInt(value, 10) || 0;
}

/**
 * Get a config value as boolean.
 */
export async function getConfigBoolean(key: string): Promise<boolean> {
  const value = await getConfig(key);
  return value === "true" || value === "1";
}
