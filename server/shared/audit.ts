/**
 * Audit Module — Records all administrative actions for traceability.
 * Every mutation (create, update, delete) generates an entry with diff of changes.
 */
import { getDb } from "../db";
import { auditLog } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { calcOffset, paginatedResponse, type PaginatedQuery, type PaginatedResult } from "./pagination";

export interface AuditEntry {
  userId: number | null;
  action: "create" | "update" | "delete" | "restore";
  entity: string;
  entityId: number;
  changes: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit entry. Fire-and-forget — errors are logged but don't block the caller.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(auditLog).values({
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      changes: JSON.stringify(entry.changes),
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (error) {
    console.error("[Audit] Failed to log audit entry:", error);
  }
}

/**
 * Get audit history for a specific entity.
 */
export async function getAuditHistory(
  entity: string,
  entityId: number
): Promise<typeof auditLog.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, entityId)))
    .orderBy(desc(auditLog.createdAt));
}

/**
 * Get audit entries by user with pagination.
 */
export async function getAuditByUser(
  userId: number,
  query: PaginatedQuery
): Promise<PaginatedResult<typeof auditLog.$inferSelect>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);
  const [totalResult] = await db
    .select({ count: count() })
    .from(auditLog)
    .where(eq(auditLog.userId, userId));

  const data = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.userId, userId))
    .orderBy(desc(auditLog.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  return paginatedResponse(data, totalResult?.count ?? 0, query);
}

/**
 * Get all audit entries with pagination (admin view).
 */
export async function getAuditLog(
  query: PaginatedQuery & { entity?: string }
): Promise<PaginatedResult<typeof auditLog.$inferSelect>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);
  const conditions = query.entity ? eq(auditLog.entity, query.entity) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(auditLog)
    .where(conditions);

  const data = await db
    .select()
    .from(auditLog)
    .where(conditions)
    .orderBy(desc(auditLog.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  return paginatedResponse(data, totalResult?.count ?? 0, query);
}

/**
 * Utility to compute diff between two objects for audit logging.
 */
export function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  allKeys.forEach((key) => {
    // Skip internal fields
    if (["createdAt", "updatedAt", "deletedAt"].includes(key)) return;

    const beforeVal = before[key];
    const afterVal = after[key];

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      diff[key] = { before: beforeVal, after: afterVal };
    }
  });

  return diff;
}
