/**
 * Tracking Repository — Data access for tracking codes and history events.
 */
import { getDb } from "../../db";
import { trackingCodes, trackingHistory } from "../../../drizzle/schema";
import { eq, desc, count, and, isNull, gt } from "drizzle-orm";
import { generateSecureTrackingCode } from "../../shared/security";
import {
  calcOffset,
  paginatedResponse,
  type PaginatedQuery,
  type PaginatedResult,
} from "../../shared/pagination";

// ── Types ────────────────────────────────────────────────────
export interface TrackingCodeRecord {
  id: number;
  code: string;
  blId: number;
  customerId: number;
  isActive: boolean;
  expiresAt: Date;
  usedCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingHistoryRecord {
  id: number;
  blId: number;
  status: string;
  location: string | null;
  description: string | null;
  eventDate: Date;
  rawData: string | null;
  createdAt: Date;
}

function toCodeRecord(row: typeof trackingCodes.$inferSelect): TrackingCodeRecord {
  return {
    id: row.id,
    code: row.code,
    blId: row.blId,
    customerId: row.customerId,
    isActive: row.isActive,
    expiresAt: row.expiresAt,
    usedCount: row.usedCount,
    lastUsedAt: row.lastUsedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toHistoryRecord(row: typeof trackingHistory.$inferSelect): TrackingHistoryRecord {
  return {
    id: row.id,
    blId: row.blId,
    status: row.status,
    location: row.location,
    description: row.description,
    eventDate: row.eventDate,
    rawData: row.rawData,
    createdAt: row.createdAt,
  };
}

// ══════════════════════════════════════════════════════════════
// TRACKING CODES
// ══════════════════════════════════════════════════════════════

// ── Generate and create a new tracking code ──────────────────
export async function createTrackingCode(
  blId: number,
  customerId: number,
  expiresInDays: number = 365
): Promise<TrackingCodeRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = generateSecureTrackingCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const [result] = await db.insert(trackingCodes).values({
    code,
    blId,
    customerId,
    isActive: true,
    expiresAt,
  }).$returningId();

  return {
    id: result.id,
    code,
    blId,
    customerId,
    isActive: true,
    expiresAt,
    usedCount: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Find by code string ──────────────────────────────────────
export async function findTrackingCodeByCode(
  code: string
): Promise<TrackingCodeRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(trackingCodes)
    .where(eq(trackingCodes.code, code.toUpperCase()))
    .limit(1);

  if (!row) return null;
  return toCodeRecord(row);
}

// ── Find by ID ───────────────────────────────────────────────
export async function findTrackingCodeById(
  id: number
): Promise<TrackingCodeRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(trackingCodes)
    .where(eq(trackingCodes.id, id))
    .limit(1);

  if (!row) return null;
  return toCodeRecord(row);
}

// ── Find active codes by BL ─────────────────────────────────
export async function findActiveCodesByBlId(
  blId: number
): Promise<TrackingCodeRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const rows = await db
    .select()
    .from(trackingCodes)
    .where(
      and(
        eq(trackingCodes.blId, blId),
        eq(trackingCodes.isActive, true),
        gt(trackingCodes.expiresAt, now),
        isNull(trackingCodes.deletedAt)
      )
    )
    .orderBy(desc(trackingCodes.createdAt));

  return rows.map(toCodeRecord);
}

// ── Find active codes by customer ID ─────────────────────────
export async function findActiveCodesByCustomerId(
  customerId: number
): Promise<TrackingCodeRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const rows = await db
    .select()
    .from(trackingCodes)
    .where(
      and(
        eq(trackingCodes.customerId, customerId),
        eq(trackingCodes.isActive, true),
        gt(trackingCodes.expiresAt, now),
        isNull(trackingCodes.deletedAt)
      )
    )
    .orderBy(desc(trackingCodes.createdAt));

  return rows.map(toCodeRecord);
}

// ── List with pagination ─────────────────────────────────────
export async function listTrackingCodes(
  query: PaginatedQuery
): Promise<PaginatedResult<TrackingCodeRecord>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);

  const [totalResult] = await db
    .select({ count: count() })
    .from(trackingCodes)
    .where(isNull(trackingCodes.deletedAt));

  const rows = await db
    .select()
    .from(trackingCodes)
    .where(isNull(trackingCodes.deletedAt))
    .orderBy(desc(trackingCodes.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  let records = rows.map(toCodeRecord);

  if (query.search) {
    const searchUpper = query.search.toUpperCase();
    records = records.filter((tc) => tc.code.includes(searchUpper));
  }

  return paginatedResponse(records, totalResult?.count ?? 0, query);
}

// ── Increment usage counter ──────────────────────────────────
export async function incrementUsage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [current] = await db
    .select({ usedCount: trackingCodes.usedCount })
    .from(trackingCodes)
    .where(eq(trackingCodes.id, id))
    .limit(1);

  await db
    .update(trackingCodes)
    .set({
      usedCount: (current?.usedCount ?? 0) + 1,
      lastUsedAt: new Date(),
    })
    .where(eq(trackingCodes.id, id));
}

// ── Deactivate a code ────────────────────────────────────────
export async function deactivateTrackingCode(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(trackingCodes)
    .set({ isActive: false })
    .where(eq(trackingCodes.id, id));
}

// ── Reactivate a code ────────────────────────────────────────
export async function reactivateTrackingCode(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(trackingCodes)
    .set({ isActive: true })
    .where(eq(trackingCodes.id, id));
}

// ── Count active codes ───────────────────────────────────────
export async function countActiveCodes(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const [result] = await db
    .select({ count: count() })
    .from(trackingCodes)
    .where(
      and(
        eq(trackingCodes.isActive, true),
        gt(trackingCodes.expiresAt, now),
        isNull(trackingCodes.deletedAt)
      )
    );

  return result?.count ?? 0;
}

// ══════════════════════════════════════════════════════════════
// TRACKING HISTORY
// ══════════════════════════════════════════════════════════════

// ── Add a history event ──────────────────────────────────────
export async function addTrackingEvent(data: {
  blId: number;
  status: string;
  location?: string | null;
  description?: string | null;
  eventDate?: Date;
  rawData?: string | null;
}): Promise<TrackingHistoryRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(trackingHistory).values({
    blId: data.blId,
    status: data.status,
    location: data.location ?? null,
    description: data.description ?? null,
    eventDate: data.eventDate ?? new Date(),
    rawData: data.rawData ?? null,
  }).$returningId();

  return {
    id: result.id,
    blId: data.blId,
    status: data.status,
    location: data.location ?? null,
    description: data.description ?? null,
    eventDate: data.eventDate ?? new Date(),
    rawData: data.rawData ?? null,
    createdAt: new Date(),
  };
}

// ── Get history for a BL (ordered by event date) ─────────────
export async function getTrackingHistory(
  blId: number
): Promise<TrackingHistoryRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(trackingHistory)
    .where(eq(trackingHistory.blId, blId))
    .orderBy(desc(trackingHistory.eventDate));

  return rows.map(toHistoryRecord);
}

// ── Get latest event for a BL ────────────────────────────────
export async function getLatestEvent(
  blId: number
): Promise<TrackingHistoryRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(trackingHistory)
    .where(eq(trackingHistory.blId, blId))
    .orderBy(desc(trackingHistory.eventDate))
    .limit(1);

  if (!row) return null;
  return toHistoryRecord(row);
}

// ── Delete a history event ───────────────────────────────────
export async function deleteTrackingEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(trackingHistory).where(eq(trackingHistory.id, id));
}

// ── Count events for a BL ────────────────────────────────────
export async function countEventsForBl(blId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(trackingHistory)
    .where(eq(trackingHistory.blId, blId));

  return result?.count ?? 0;
}
