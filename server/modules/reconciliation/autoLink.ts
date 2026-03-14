/**
 * Auto-Link Service — Automatically cross-references existing data
 * to populate bl_vehicles junction table and link customers.
 *
 * Strategies:
 * 1. VIN Matching: Match vehicles.vin with BL vehicle descriptions
 * 2. Customer-Vehicle: Link vehicles to BLs via shared customer
 * 3. BL-Vehicle Direct: Match BL.vehicleId with vehicles table
 *
 * This is a one-time or periodic reconciliation job, not a real-time hook.
 */

import { getDb } from "../../db";
import {
  billsOfLading,
  vehicles,
  blVehicles,
  customers,
} from "../../../drizzle/schema";
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { logAudit } from "../../shared/audit";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface AutoLinkResult {
  blVehicleLinksCreated: number;
  blCustomerLinksUpdated: number;
  vehicleCustomerLinksUpdated: number;
  errors: string[];
  details: string[];
}

// ══════════════════════════════════════════════════════════════
// STRATEGY 1: Link BL.vehicleId → bl_vehicles junction
// If a BL has vehicleId set but no entry in bl_vehicles, create one.
// ══════════════════════════════════════════════════════════════

async function linkDirectBlVehicles(db: NonNullable<Awaited<ReturnType<typeof getDb>>>): Promise<{
  created: number;
  details: string[];
  errors: string[];
}> {
  const details: string[] = [];
  const errors: string[] = [];
  let created = 0;

  // Find BLs with vehicleId set
  const blsWithVehicle = await db
    .select()
    .from(billsOfLading)
    .where(
      and(
        isNotNull(billsOfLading.vehicleId),
        isNull(billsOfLading.deletedAt)
      )
    );

  for (const bl of blsWithVehicle) {
    if (!bl.vehicleId) continue;

    // Check if junction already exists
    const [existing] = await db
      .select()
      .from(blVehicles)
      .where(
        and(
          eq(blVehicles.blId, bl.id),
          eq(blVehicles.vehicleId, bl.vehicleId)
        )
      )
      .limit(1);

    if (!existing) {
      try {
        await db.insert(blVehicles).values({
          blId: bl.id,
          vehicleId: bl.vehicleId,
          customerId: bl.customerId,
        });
        created++;
        details.push(`BL ${bl.blNumber} → Vehicle #${bl.vehicleId} (junction created)`);
      } catch (err) {
        errors.push(`Failed to link BL ${bl.blNumber} → Vehicle #${bl.vehicleId}: ${(err as Error).message}`);
      }
    }
  }

  return { created, details, errors };
}

// ══════════════════════════════════════════════════════════════
// STRATEGY 2: Link vehicles to BLs via shared customer
// If a vehicle has customerId and a BL has the same customerId,
// ensure they're linked in bl_vehicles.
// ══════════════════════════════════════════════════════════════

async function linkViaSharedCustomer(db: NonNullable<Awaited<ReturnType<typeof getDb>>>): Promise<{
  created: number;
  details: string[];
  errors: string[];
}> {
  const details: string[] = [];
  const errors: string[] = [];
  let created = 0;

  // Find all vehicles with customerId
  const vehiclesWithCustomer = await db
    .select()
    .from(vehicles)
    .where(
      and(
        isNotNull(vehicles.customerId),
        isNull(vehicles.deletedAt)
      )
    );

  for (const vehicle of vehiclesWithCustomer) {
    if (!vehicle.customerId) continue;

    // Find BLs for this customer
    const customerBls = await db
      .select()
      .from(billsOfLading)
      .where(
        and(
          eq(billsOfLading.customerId, vehicle.customerId),
          isNull(billsOfLading.deletedAt)
        )
      );

    for (const bl of customerBls) {
      // Check if junction already exists
      const [existing] = await db
        .select()
        .from(blVehicles)
        .where(
          and(
            eq(blVehicles.blId, bl.id),
            eq(blVehicles.vehicleId, vehicle.id)
          )
        )
        .limit(1);

      if (!existing) {
        try {
          await db.insert(blVehicles).values({
            blId: bl.id,
            vehicleId: vehicle.id,
            customerId: vehicle.customerId,
          });
          created++;
          details.push(`Customer #${vehicle.customerId}: Vehicle ${vehicle.vin} → BL ${bl.blNumber}`);
        } catch (err) {
          errors.push(`Failed to link Vehicle ${vehicle.vin} → BL ${bl.blNumber}: ${(err as Error).message}`);
        }
      }
    }
  }

  return { created, details, errors };
}

// ══════════════════════════════════════════════════════════════
// STRATEGY 3: Propagate customerId from BL to bl_vehicles entries
// If bl_vehicles has no customerId but the BL does, fill it in.
// ══════════════════════════════════════════════════════════════

async function propagateCustomerIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>): Promise<{
  updated: number;
  details: string[];
}> {
  const details: string[] = [];
  let updated = 0;

  // Find bl_vehicles without customerId
  const orphanLinks = await db
    .select()
    .from(blVehicles)
    .where(isNull(blVehicles.customerId));

  for (const link of orphanLinks) {
    // Get the BL's customerId
    const [bl] = await db
      .select()
      .from(billsOfLading)
      .where(eq(billsOfLading.id, link.blId))
      .limit(1);

    if (bl?.customerId) {
      await db
        .update(blVehicles)
        .set({ customerId: bl.customerId })
        .where(eq(blVehicles.id, link.id));
      updated++;
      details.push(`bl_vehicles #${link.id}: set customerId=${bl.customerId} from BL ${bl.blNumber}`);
    }
  }

  return { updated, details };
}

// ══════════════════════════════════════════════════════════════
// MAIN: Run all auto-link strategies
// ══════════════════════════════════════════════════════════════

export async function runAutoLink(adminUserId?: number): Promise<AutoLinkResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: AutoLinkResult = {
    blVehicleLinksCreated: 0,
    blCustomerLinksUpdated: 0,
    vehicleCustomerLinksUpdated: 0,
    errors: [],
    details: [],
  };

  // Strategy 1: Direct BL.vehicleId → bl_vehicles
  const s1 = await linkDirectBlVehicles(db);
  result.blVehicleLinksCreated += s1.created;
  result.details.push(...s1.details);
  result.errors.push(...s1.errors);

  // Strategy 2: Shared customer links
  const s2 = await linkViaSharedCustomer(db);
  result.blVehicleLinksCreated += s2.created;
  result.details.push(...s2.details);
  result.errors.push(...s2.errors);

  // Strategy 3: Propagate customerId
  const s3 = await propagateCustomerIds(db);
  result.blCustomerLinksUpdated += s3.updated;
  result.details.push(...s3.details);

  // Audit
  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "auto_link",
    entityId: 0,
    changes: {
      blVehicleLinksCreated: { before: 0, after: result.blVehicleLinksCreated },
      blCustomerLinksUpdated: { before: 0, after: result.blCustomerLinksUpdated },
      errors: { before: null, after: result.errors.length },
    },
  });

  return result;
}
