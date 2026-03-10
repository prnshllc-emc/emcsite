/**
 * Vehicles Repository — Data access layer for vehicle management.
 * VIN is the unique key; vehicles link to customers via customerId.
 */
import { getDb } from "../../db";
import { vehicles } from "../../../drizzle/schema";
import { eq, desc, count, isNull, and } from "drizzle-orm";
import {
  calcOffset,
  paginatedResponse,
  type PaginatedQuery,
  type PaginatedResult,
} from "../../shared/pagination";
import type { VehicleCreate, VehicleUpdate } from "../../../shared/schemas";

// ── Types ────────────────────────────────────────────────────
export interface VehicleRecord {
  id: number;
  vin: string;
  customerId: number | null;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRecord(row: typeof vehicles.$inferSelect): VehicleRecord {
  return {
    id: row.id,
    vin: row.vin,
    customerId: row.customerId,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Create ───────────────────────────────────────────────────
export async function createVehicle(data: VehicleCreate): Promise<VehicleRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(vehicles).values({
    vin: data.vin.toUpperCase(),
    customerId: data.customerId ?? null,
    make: data.make,
    model: data.model,
    year: data.year ?? null,
    color: data.color ?? null,
  }).$returningId();

  return {
    id: result.id,
    vin: data.vin.toUpperCase(),
    customerId: data.customerId ?? null,
    make: data.make,
    model: data.model,
    year: data.year ?? null,
    color: data.color ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Find by ID ───────────────────────────────────────────────
export async function findVehicleById(id: number): Promise<VehicleRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  if (!row) return null;
  return toRecord(row);
}

// ── Find by VIN ──────────────────────────────────────────────
export async function findVehicleByVin(vin: string): Promise<VehicleRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.vin, vin.toUpperCase()))
    .limit(1);

  if (!row) return null;
  return toRecord(row);
}

// ── Find by Customer ID ──────────────────────────────────────
export async function findVehiclesByCustomerId(
  customerId: number
): Promise<VehicleRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.customerId, customerId), isNull(vehicles.deletedAt)))
    .orderBy(desc(vehicles.createdAt));

  return rows.map(toRecord);
}

// ── List with pagination (active only) ───────────────────────
export async function listVehicles(
  query: PaginatedQuery
): Promise<PaginatedResult<VehicleRecord>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);

  const activeCondition = isNull(vehicles.deletedAt);

  const [totalResult] = await db
    .select({ count: count() })
    .from(vehicles)
    .where(activeCondition);

  const rows = await db
    .select()
    .from(vehicles)
    .where(activeCondition)
    .orderBy(desc(vehicles.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  let records = rows.map(toRecord);

  // Filter by search (VIN, make, model)
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    records = records.filter(
      (v) =>
        v.vin.toLowerCase().includes(searchLower) ||
        (v.make && v.make.toLowerCase().includes(searchLower)) ||
        (v.model && v.model.toLowerCase().includes(searchLower))
    );
  }

  return paginatedResponse(records, totalResult?.count ?? 0, query);
}

// ── Update ───────────────────────────────────────────────────
export async function updateVehicle(
  id: number,
  data: VehicleUpdate
): Promise<VehicleRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const updateValues: Record<string, unknown> = {};

  if (data.vin !== undefined) updateValues.vin = data.vin.toUpperCase();
  if (data.customerId !== undefined) updateValues.customerId = data.customerId;
  if (data.make !== undefined) updateValues.make = data.make;
  if (data.model !== undefined) updateValues.model = data.model;
  if (data.year !== undefined) updateValues.year = data.year;
  if (data.color !== undefined) updateValues.color = data.color;

  if (Object.keys(updateValues).length > 0) {
    await db.update(vehicles).set(updateValues).where(eq(vehicles.id, id));
  }

  return findVehicleById(id);
}

// ── Soft delete ──────────────────────────────────────────────
export async function deactivateVehicle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vehicles)
    .set({ deletedAt: new Date() })
    .where(eq(vehicles.id, id));
}

// ── Reactivate ───────────────────────────────────────────────
export async function reactivateVehicle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vehicles)
    .set({ deletedAt: null })
    .where(eq(vehicles.id, id));
}

// ── Count active ─────────────────────────────────────────────
export async function countActiveVehicles(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(vehicles)
    .where(isNull(vehicles.deletedAt));

  return result?.count ?? 0;
}

// ── Link vehicle to customer (reconciliation) ────────────────
export async function linkVehicleToCustomer(
  vehicleId: number,
  customerId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vehicles)
    .set({
      customerId,
      lastReconciliationAttempt: new Date(),
    })
    .where(eq(vehicles.id, vehicleId));
}
