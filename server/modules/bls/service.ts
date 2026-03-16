/**
 * Bills of Lading Service — Business logic for BL management.
 * Handles status transitions, tracking lifecycle, and audit logging.
 */
import * as repo from "./repository";
import { logAudit } from "../../shared/audit";
import { autoGenerateTrackingCode } from "../tracking/service";
import type { PaginatedQuery, PaginatedResult } from "../../shared/pagination";

// ── Status transition rules ──────────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["final", "in_transit"],
  final: ["in_transit"],
  in_transit: ["arrived"],
  arrived: ["customs"],
  customs: ["delivered"],
  delivered: [], // terminal state
};

function validateStatusTransition(current: string, next: string): void {
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new Error(
      `Transição de status inválida: ${current} → ${next}. Permitidos: ${allowed.join(", ") || "nenhum"}`
    );
  }
}

// ── Create ───────────────────────────────────────────────────
export async function createBl(
  data: repo.BlCreateData,
  adminUserId?: number
): Promise<repo.BlRecord> {
  // Check for duplicate BL number
  const existing = await repo.findBlByNumber(data.blNumber);
  if (existing) {
    throw new Error("Já existe um BL cadastrado com este número.");
  }

  const bl = await repo.createBl(data);

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "bl",
    entityId: bl.id,
    changes: { created: { before: null, after: data.blNumber } },
  });

  return bl;
}

// ── Get by ID ────────────────────────────────────────────────
export async function getBlById(id: number): Promise<repo.BlRecord | null> {
  return repo.findBlById(id);
}

// ── Get by BL Number ─────────────────────────────────────────
export async function getBlByNumber(
  blNumber: string
): Promise<repo.BlRecord | null> {
  return repo.findBlByNumber(blNumber);
}

// ── List ─────────────────────────────────────────────────────
export async function listBls(
  query: PaginatedQuery & { status?: repo.BlStatus }
): Promise<PaginatedResult<repo.BlRecord>> {
  return repo.listBls(query);
}

// ── Get BLs by customer ──────────────────────────────────────
export async function getBlsByCustomerId(
  customerId: number
): Promise<repo.BlRecord[]> {
  return repo.findBlsByCustomerId(customerId);
}

// ── Get BLs by vehicle ───────────────────────────────────────
export async function getBlsByVehicleId(
  vehicleId: number
): Promise<repo.BlRecord[]> {
  return repo.findBlsByVehicleId(vehicleId);
}

// ── Update ───────────────────────────────────────────────────
export async function updateBl(
  id: number,
  data: Partial<Omit<repo.BlRecord, "id" | "createdAt" | "updatedAt">>,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const before = await repo.findBlById(id);
  if (!before) throw new Error("BL não encontrado.");

  // Validate status transition if status is being changed
  if (data.status && data.status !== before.status) {
    validateStatusTransition(before.status, data.status);
  }

  const updated = await repo.updateBl(id, data);

  const changes: Record<string, { before: unknown; after: unknown }> = {};
  if (data.status && data.status !== before.status) {
    changes.status = { before: before.status, after: data.status };
  }
  if (data.containerNumber && data.containerNumber !== before.containerNumber) {
    changes.containerNumber = { before: before.containerNumber, after: data.containerNumber };
  }
  if (data.originPort && data.originPort !== before.originPort) {
    changes.originPort = { before: before.originPort, after: data.originPort };
  }
  if (data.destinationPort && data.destinationPort !== before.destinationPort) {
    changes.destinationPort = { before: before.destinationPort, after: data.destinationPort };
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId: adminUserId ?? null,
      action: "update",
      entity: "bl",
      entityId: id,
      changes,
    });
  }

  // 🔑 Auto-generate tracking code when customer is newly linked to this BL
  if (updated && data.customerId && data.customerId !== before.customerId) {
    triggerAutoTrackingCode(id, data.customerId).catch((err) =>
      console.error("[BL Service] Auto-tracking code generation error:", err)
    );
  }

  return updated;
}

// ── Update status with validation ────────────────────────────
export async function updateBlStatus(
  id: number,
  newStatus: repo.BlStatus,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const bl = await repo.findBlById(id);
  if (!bl) throw new Error("BL não encontrado.");

  validateStatusTransition(bl.status, newStatus);

  const updated = await repo.updateBlStatus(id, newStatus);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: id,
    changes: { status: { before: bl.status, after: newStatus } },
  });

  return updated;
}

// ── Activate tracking ────────────────────────────────────────
export async function activateTracking(
  id: number,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const bl = await repo.findBlById(id);
  if (!bl) throw new Error("BL não encontrado.");

  if (bl.trackingActive) {
    throw new Error("Tracking já está ativo para este BL.");
  }

  const updated = await repo.activateTracking(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: id,
    changes: { trackingActive: { before: false, after: true } },
  });

  return updated;
}

// ── Deactivate tracking ──────────────────────────────────────
export async function deactivateTracking(
  id: number,
  reason: string,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const bl = await repo.findBlById(id);
  if (!bl) throw new Error("BL não encontrado.");

  if (!bl.trackingActive) {
    throw new Error("Tracking já está inativo para este BL.");
  }

  const updated = await repo.deactivateTracking(id, reason);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: id,
    changes: {
      trackingActive: { before: true, after: false },
      trackingEndReason: { before: null, after: reason },
    },
  });

  return updated;
}

// ── Link BL to vehicle and customer ──────────────────────────────
export async function linkBlToVehicleAndCustomer(
  blId: number,
  vehicleId: number,
  customerId: number,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const before = await repo.findBlById(blId);
  const updated = await repo.linkBlToVehicleAndCustomer(blId, vehicleId, customerId);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: blId,
    changes: {
      vehicleId: { before: before?.vehicleId ?? null, after: vehicleId },
      customerId: { before: before?.customerId ?? null, after: customerId },
    },
  });

  // 🔑 Auto-generate tracking code when customer is linked
  if (customerId && (!before || before.customerId !== customerId)) {
    triggerAutoTrackingCode(blId, customerId).catch((err) =>
      console.error("[BL Service] Auto-tracking code generation error:", err)
    );
  }

  return updated;
}

// ── Force update status (admin override — skip transition validation) ────
const STATUS_ORDER: repo.BlStatus[] = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];

export function getStatusOrder(): repo.BlStatus[] {
  return [...STATUS_ORDER];
}

export async function forceUpdateBlStatus(
  id: number,
  newStatus: repo.BlStatus,
  reason?: string,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const bl = await repo.findBlById(id);
  if (!bl) throw new Error("BL não encontrado.");

  if (bl.status === newStatus) return bl;

  // ⚠️ Warn if setting arrived/customs/delivered but ETA is in the future
  if (
    ["arrived", "customs", "delivered"].includes(newStatus) &&
    bl.estimatedArrival &&
    new Date(bl.estimatedArrival) > new Date()
  ) {
    console.warn(
      `[BL Service] ⚠️ Force-setting BL ${bl.blNumber} to "${newStatus}" but ETA is ${bl.estimatedArrival} (future). Reason: ${reason ?? "not provided"}`
    );
  }

  const updated = await repo.updateBlStatus(id, newStatus);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: id,
    changes: {
      status: { before: bl.status, after: newStatus },
      forced: { before: false, after: true },
      reason: { before: null, after: reason ?? "Admin override (sem motivo)" },
    },
  });

  return updated;
}

// ── Add vehicle to BL (N:N junction) ────────────────────────
export async function addVehicleToBl(
  blId: number,
  vehicleId: number,
  customerId?: number | null,
  position?: number | null,
  notes?: string | null,
  adminUserId?: number
): Promise<repo.BlVehicleRecord> {
  const bl = await repo.findBlById(blId);
  if (!bl) throw new Error("BL não encontrado.");

  const record = await repo.addVehicleToBl({ blId, vehicleId, customerId, position, notes });

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "bl_vehicle",
    entityId: record.id,
    changes: { blId: { before: null, after: blId }, vehicleId: { before: null, after: vehicleId } },
  });

  return record;
}

// ── Get vehicles for a BL ───────────────────────────────────
export async function getVehiclesForBl(blId: number): Promise<repo.BlVehicleRecord[]> {
  return repo.getVehiclesForBl(blId);
}

// ── Get BLs for a vehicle ───────────────────────────────────
export async function getBlsForVehicle(vehicleId: number): Promise<repo.BlVehicleRecord[]> {
  return repo.getBlsForVehicle(vehicleId);
}

// ── Get BL-vehicles for a customer ──────────────────────────
export async function getBlVehiclesForCustomer(customerId: number): Promise<repo.BlVehicleRecord[]> {
  return repo.getBlVehiclesForCustomer(customerId);
}

// ── Remove vehicle from BL ──────────────────────────────────
export async function removeVehicleFromBl(
  blId: number,
  vehicleId: number,
  adminUserId?: number
): Promise<void> {
  await repo.removeVehicleFromBl(blId, vehicleId);

  await logAudit({
    userId: adminUserId ?? null,
    action: "delete",
    entity: "bl_vehicle",
    entityId: blId,
    changes: { vehicleId: { before: vehicleId, after: null } },
  });
}

// ── Soft delete ──────────────────────────────────────────────
export async function deleteBl(
  id: number,
  adminUserId?: number
): Promise<void> {
  const bl = await repo.findBlById(id);
  if (!bl) throw new Error("BL não encontrado.");

  await repo.deleteBl(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "delete",
    entity: "bl",
    entityId: id,
    changes: { deleted: { before: false, after: true } },
  });
}

// ── Count by status ──────────────────────────────────────────
export async function countBlsByStatus(): Promise<Record<string, number>> {
  return repo.countBlsByStatus();
}

// ── Count active ─────────────────────────────────────────────────
export async function countActiveBls(): Promise<number> {
  return repo.countActiveBls();
}

// ══════════════════════════════════════════════════════════════
// AUTO-GENERATE TRACKING CODE (internal helper)
// ══════════════════════════════════════════════════════════════

/**
 * Trigger auto-generation of a tracking code for a BL+Customer pair.
 * Called when a customer is linked to a BL (via update or linkBlToVehicleAndCustomer).
 * The code is created with status "pending" and the admin must approve before it's active.
 */
async function triggerAutoTrackingCode(blId: number, customerId: number): Promise<void> {
  try {
    const code = await autoGenerateTrackingCode(blId, customerId);
    if (code) {
      console.log(
        `[BL Service] Auto-generated tracking code ${code.code} (${code.approvalStatus}) for BL ${blId} / Customer ${customerId}`
      );
    }
  } catch (err) {
    // Don't fail the BL update if tracking code generation fails
    console.error("[BL Service] Failed to auto-generate tracking code:", err);
  }
}