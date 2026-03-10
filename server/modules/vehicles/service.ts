/**
 * Vehicles Service — Business logic for vehicle management.
 */
import * as repo from "./repository";
import { logAudit } from "../../shared/audit";
import type { PaginatedQuery, PaginatedResult } from "../../shared/pagination";

// ── Create ───────────────────────────────────────────────────
export async function createVehicle(
  data: {
    vin: string;
    customerId?: number | null;
    make: string;
    model: string;
    year?: number | null;
    color?: string | null;
  },
  adminUserId?: number
): Promise<repo.VehicleRecord> {
  // Check for duplicate VIN
  const existing = await repo.findVehicleByVin(data.vin);
  if (existing) {
    throw new Error("Já existe um veículo cadastrado com este VIN.");
  }

  const vehicle = await repo.createVehicle({
    vin: data.vin,
    customerId: data.customerId,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
  });

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "vehicle",
    entityId: vehicle.id,
    changes: { created: { before: null, after: `${data.make} ${data.model} - ${data.vin}` } },
  });

  return vehicle;
}

// ── Get by ID ────────────────────────────────────────────────
export async function getVehicleById(
  id: number
): Promise<repo.VehicleRecord | null> {
  return repo.findVehicleById(id);
}

// ── Get by VIN ───────────────────────────────────────────────
export async function getVehicleByVin(
  vin: string
): Promise<repo.VehicleRecord | null> {
  return repo.findVehicleByVin(vin);
}

// ── List ─────────────────────────────────────────────────────
export async function listVehicles(
  query: PaginatedQuery
): Promise<PaginatedResult<repo.VehicleRecord>> {
  return repo.listVehicles(query);
}

// ── Get vehicles by customer ─────────────────────────────────
export async function getVehiclesByCustomerId(
  customerId: number
): Promise<repo.VehicleRecord[]> {
  return repo.findVehiclesByCustomerId(customerId);
}

// ── Update ───────────────────────────────────────────────────
export async function updateVehicle(
  id: number,
  data: {
    vin?: string;
    customerId?: number | null;
    make?: string;
    model?: string;
    year?: number | null;
    color?: string | null;
  },
  adminUserId?: number
): Promise<repo.VehicleRecord | null> {
  const before = await repo.findVehicleById(id);
  if (!before) throw new Error("Veículo não encontrado.");

  // Check VIN uniqueness if changing
  if (data.vin && data.vin.toUpperCase() !== before.vin) {
    const existing = await repo.findVehicleByVin(data.vin);
    if (existing) throw new Error("Já existe um veículo com este VIN.");
  }

  const updated = await repo.updateVehicle(id, data);

  const changes: Record<string, { before: unknown; after: unknown }> = {};
  if (data.vin && data.vin.toUpperCase() !== before.vin) {
    changes.vin = { before: before.vin, after: data.vin.toUpperCase() };
  }
  if (data.make && data.make !== before.make) {
    changes.make = { before: before.make, after: data.make };
  }
  if (data.model && data.model !== before.model) {
    changes.model = { before: before.model, after: data.model };
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId: adminUserId ?? null,
      action: "update",
      entity: "vehicle",
      entityId: id,
      changes,
    });
  }

  return updated;
}

// ── Deactivate (soft delete) ─────────────────────────────────
export async function deactivateVehicle(
  id: number,
  adminUserId?: number
): Promise<void> {
  const vehicle = await repo.findVehicleById(id);
  if (!vehicle) throw new Error("Veículo não encontrado.");

  await repo.deactivateVehicle(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "delete",
    entity: "vehicle",
    entityId: id,
    changes: { deactivated: { before: false, after: true } },
  });
}

// ── Count ────────────────────────────────────────────────────
export async function countActiveVehicles(): Promise<number> {
  return repo.countActiveVehicles();
}

// ── Link vehicle to customer ─────────────────────────────────
export async function linkVehicleToCustomer(
  vehicleId: number,
  customerId: number,
  adminUserId?: number
): Promise<void> {
  await repo.linkVehicleToCustomer(vehicleId, customerId);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "vehicle",
    entityId: vehicleId,
    changes: { customerId: { before: null, after: customerId } },
  });
}
