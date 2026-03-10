/**
 * Bills of Lading Repository — Data access layer for BL management.
 * BL Number is unique key; controls full tracking lifecycle.
 */
import { getDb } from "../../db";
import { billsOfLading } from "../../../drizzle/schema";
import { eq, desc, count, isNull, and } from "drizzle-orm";
import {
  calcOffset,
  paginatedResponse,
  type PaginatedQuery,
  type PaginatedResult,
} from "../../shared/pagination";

// ── Types ────────────────────────────────────────────────────
export type BlStatus = "draft" | "final" | "in_transit" | "arrived" | "customs" | "delivered";

export interface BlRecord {
  id: number;
  blNumber: string;
  vehicleId: number | null;
  customerId: number | null;
  containerNumber: string | null;
  vehicleDescription: string | null;
  originPort: string | null;
  destinationPort: string | null;
  status: BlStatus;
  trackingActive: boolean;
  trackingStartedAt: Date | null;
  trackingEndedAt: Date | null;
  trackingEndReason: string | null;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
  estimatedArrival: Date | null;
  actualArrival: Date | null;
  blType: "draft" | "final" | null;
  blDraftReceivedAt: Date | null;
  blFinalReceivedAt: Date | null;
  sourceEmail: string | null;
  rawBlData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRecord(row: typeof billsOfLading.$inferSelect): BlRecord {
  return {
    id: row.id,
    blNumber: row.blNumber,
    vehicleId: row.vehicleId,
    customerId: row.customerId,
    containerNumber: row.containerNumber,
    vehicleDescription: row.vehicleDescription,
    originPort: row.originPort,
    destinationPort: row.destinationPort,
    status: row.status as BlStatus,
    trackingActive: row.trackingActive,
    trackingStartedAt: row.trackingStartedAt,
    trackingEndedAt: row.trackingEndedAt,
    trackingEndReason: row.trackingEndReason,
    estimatedDeparture: row.estimatedDeparture,
    actualDeparture: row.actualDeparture,
    estimatedArrival: row.estimatedArrival,
    actualArrival: row.actualArrival,
    blType: row.blType as "draft" | "final" | null,
    blDraftReceivedAt: row.blDraftReceivedAt,
    blFinalReceivedAt: row.blFinalReceivedAt,
    sourceEmail: row.sourceEmail,
    rawBlData: row.rawBlData,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Create ───────────────────────────────────────────────────
export interface BlCreateData {
  blNumber: string;
  vehicleId?: number | null;
  customerId?: number | null;
  containerNumber?: string | null;
  vehicleDescription?: string | null;
  originPort?: string | null;
  destinationPort?: string | null;
  status?: BlStatus;
  estimatedDeparture?: Date | null;
  estimatedArrival?: Date | null;
  blType?: "draft" | "final";
  sourceEmail?: string | null;
  rawBlData?: string | null;
}

export async function createBl(data: BlCreateData): Promise<BlRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const blDraftReceivedAt = data.blType === "draft" ? now : null;
  const blFinalReceivedAt = data.blType === "final" ? now : null;

  const [result] = await db.insert(billsOfLading).values({
    blNumber: data.blNumber,
    vehicleId: data.vehicleId ?? null,
    customerId: data.customerId ?? null,
    containerNumber: data.containerNumber ?? null,
    vehicleDescription: data.vehicleDescription ?? null,
    originPort: data.originPort ?? null,
    destinationPort: data.destinationPort ?? null,
    status: data.status ?? "draft",
    estimatedDeparture: data.estimatedDeparture ?? null,
    estimatedArrival: data.estimatedArrival ?? null,
    blType: data.blType ?? "draft",
    blDraftReceivedAt,
    blFinalReceivedAt,
    sourceEmail: data.sourceEmail ?? null,
    rawBlData: data.rawBlData ?? null,
  }).$returningId();

  return findBlById(result.id) as Promise<BlRecord>;
}

// ── Find by ID ───────────────────────────────────────────────
export async function findBlById(id: number): Promise<BlRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(billsOfLading)
    .where(eq(billsOfLading.id, id))
    .limit(1);

  if (!row) return null;
  return toRecord(row);
}

// ── Find by BL Number ────────────────────────────────────────
export async function findBlByNumber(blNumber: string): Promise<BlRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(billsOfLading)
    .where(eq(billsOfLading.blNumber, blNumber))
    .limit(1);

  if (!row) return null;
  return toRecord(row);
}

// ── Find by Vehicle ID ───────────────────────────────────────
export async function findBlsByVehicleId(vehicleId: number): Promise<BlRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(billsOfLading)
    .where(and(eq(billsOfLading.vehicleId, vehicleId), isNull(billsOfLading.deletedAt)))
    .orderBy(desc(billsOfLading.createdAt));

  return rows.map(toRecord);
}

// ── Find by Customer ID ──────────────────────────────────────
export async function findBlsByCustomerId(customerId: number): Promise<BlRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(billsOfLading)
    .where(and(eq(billsOfLading.customerId, customerId), isNull(billsOfLading.deletedAt)))
    .orderBy(desc(billsOfLading.createdAt));

  return rows.map(toRecord);
}

// ── List with pagination (active only) ───────────────────────
export async function listBls(
  query: PaginatedQuery & { status?: BlStatus }
): Promise<PaginatedResult<BlRecord>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);

  const conditions = [isNull(billsOfLading.deletedAt)];
  if (query.status) {
    conditions.push(eq(billsOfLading.status, query.status));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(billsOfLading)
    .where(whereClause);

  const rows = await db
    .select()
    .from(billsOfLading)
    .where(whereClause)
    .orderBy(desc(billsOfLading.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  let records = rows.map(toRecord);

  // Search by BL number, container, ports
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    records = records.filter(
      (bl) =>
        bl.blNumber.toLowerCase().includes(searchLower) ||
        (bl.containerNumber && bl.containerNumber.toLowerCase().includes(searchLower)) ||
        (bl.originPort && bl.originPort.toLowerCase().includes(searchLower)) ||
        (bl.destinationPort && bl.destinationPort.toLowerCase().includes(searchLower)) ||
        (bl.vehicleDescription && bl.vehicleDescription.toLowerCase().includes(searchLower))
    );
  }

  return paginatedResponse(records, totalResult?.count ?? 0, query);
}

// ── Update ───────────────────────────────────────────────────
export async function updateBl(
  id: number,
  data: Partial<Omit<BlRecord, "id" | "createdAt" | "updatedAt">>
): Promise<BlRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const updateValues: Record<string, unknown> = {};

  if (data.blNumber !== undefined) updateValues.blNumber = data.blNumber;
  if (data.vehicleId !== undefined) updateValues.vehicleId = data.vehicleId;
  if (data.customerId !== undefined) updateValues.customerId = data.customerId;
  if (data.containerNumber !== undefined) updateValues.containerNumber = data.containerNumber;
  if (data.vehicleDescription !== undefined) updateValues.vehicleDescription = data.vehicleDescription;
  if (data.originPort !== undefined) updateValues.originPort = data.originPort;
  if (data.destinationPort !== undefined) updateValues.destinationPort = data.destinationPort;
  if (data.status !== undefined) updateValues.status = data.status;
  if (data.trackingActive !== undefined) updateValues.trackingActive = data.trackingActive;
  if (data.trackingStartedAt !== undefined) updateValues.trackingStartedAt = data.trackingStartedAt;
  if (data.trackingEndedAt !== undefined) updateValues.trackingEndedAt = data.trackingEndedAt;
  if (data.trackingEndReason !== undefined) updateValues.trackingEndReason = data.trackingEndReason;
  if (data.estimatedDeparture !== undefined) updateValues.estimatedDeparture = data.estimatedDeparture;
  if (data.actualDeparture !== undefined) updateValues.actualDeparture = data.actualDeparture;
  if (data.estimatedArrival !== undefined) updateValues.estimatedArrival = data.estimatedArrival;
  if (data.actualArrival !== undefined) updateValues.actualArrival = data.actualArrival;
  if (data.blType !== undefined) updateValues.blType = data.blType;
  if (data.blDraftReceivedAt !== undefined) updateValues.blDraftReceivedAt = data.blDraftReceivedAt;
  if (data.blFinalReceivedAt !== undefined) updateValues.blFinalReceivedAt = data.blFinalReceivedAt;
  if (data.sourceEmail !== undefined) updateValues.sourceEmail = data.sourceEmail;
  if (data.rawBlData !== undefined) updateValues.rawBlData = data.rawBlData;

  if (Object.keys(updateValues).length > 0) {
    await db.update(billsOfLading).set(updateValues).where(eq(billsOfLading.id, id));
  }

  return findBlById(id);
}

// ── Update BL status ─────────────────────────────────────────
export async function updateBlStatus(
  id: number,
  status: BlStatus
): Promise<BlRecord | null> {
  return updateBl(id, { status });
}

// ── Activate tracking ────────────────────────────────────────
export async function activateTracking(id: number): Promise<BlRecord | null> {
  return updateBl(id, {
    trackingActive: true,
    trackingStartedAt: new Date(),
    trackingEndedAt: null,
    trackingEndReason: null,
  });
}

// ── Deactivate tracking ──────────────────────────────────────
export async function deactivateTracking(
  id: number,
  reason: string
): Promise<BlRecord | null> {
  return updateBl(id, {
    trackingActive: false,
    trackingEndedAt: new Date(),
    trackingEndReason: reason,
  });
}

// ── Soft delete ──────────────────────────────────────────────
export async function deleteBl(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(billsOfLading)
    .set({ deletedAt: new Date() })
    .where(eq(billsOfLading.id, id));
}

// ── Count by status ──────────────────────────────────────────
export async function countBlsByStatus(): Promise<Record<string, number>> {
  const db = await getDb();
  if (!db) return {};

  const rows = await db
    .select({
      status: billsOfLading.status,
      count: count(),
    })
    .from(billsOfLading)
    .where(isNull(billsOfLading.deletedAt))
    .groupBy(billsOfLading.status);

  const result: Record<string, number> = {};
  rows.forEach((row) => {
    result[row.status] = row.count;
  });
  return result;
}

// ── Count active BLs ─────────────────────────────────────────
export async function countActiveBls(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(billsOfLading)
    .where(isNull(billsOfLading.deletedAt));

  return result?.count ?? 0;
}

// ── Link BL to vehicle and customer ──────────────────────────
export async function linkBlToVehicleAndCustomer(
  blId: number,
  vehicleId: number,
  customerId: number
): Promise<BlRecord | null> {
  return updateBl(blId, { vehicleId, customerId });
}
