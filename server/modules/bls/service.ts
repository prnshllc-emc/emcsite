/**
 * Bills of Lading Service — Business logic for BL management.
 * Handles status transitions, tracking lifecycle, and audit logging.
 */
import * as repo from "./repository";
import { logAudit } from "../../shared/audit";
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

// ── Link BL to vehicle and customer ──────────────────────────
export async function linkBlToVehicleAndCustomer(
  blId: number,
  vehicleId: number,
  customerId: number,
  adminUserId?: number
): Promise<repo.BlRecord | null> {
  const updated = await repo.linkBlToVehicleAndCustomer(blId, vehicleId, customerId);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "bl",
    entityId: blId,
    changes: {
      vehicleId: { before: null, after: vehicleId },
      customerId: { before: null, after: customerId },
    },
  });

  return updated;
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

// ── Count active ─────────────────────────────────────────────
export async function countActiveBls(): Promise<number> {
  return repo.countActiveBls();
}
