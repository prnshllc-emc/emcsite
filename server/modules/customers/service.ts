/**
 * Customers Service — Business logic for customer management.
 * Handles validation, deduplication, and audit logging.
 */
import * as repo from "./repository";
import { logAudit, computeDiff } from "../../shared/audit";
import type { PaginatedQuery, PaginatedResult } from "../../shared/pagination";

// ── Create ───────────────────────────────────────────────────
export async function createCustomer(
  data: {
    cpf: string;
    fullName: string;
    email?: string;
    phone?: string;
  },
  adminUserId?: number
): Promise<repo.CustomerRecord> {
  // Check for duplicate CPF
  const existing = await repo.findCustomerByCpf(data.cpf);
  if (existing) {
    throw new Error("Já existe um cliente cadastrado com este CPF.");
  }

  const customer = await repo.createCustomer({
    cpf: data.cpf,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
  });

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "customer",
    entityId: customer.id,
    changes: { created: { before: null, after: data.fullName } },
  });

  return customer;
}

// ── Get by ID ────────────────────────────────────────────────
export async function getCustomerById(
  id: number
): Promise<repo.CustomerRecord | null> {
  return repo.findCustomerById(id);
}

// ── Get by CPF ───────────────────────────────────────────────
export async function getCustomerByCpf(
  cpf: string
): Promise<repo.CustomerRecord | null> {
  return repo.findCustomerByCpf(cpf);
}

// ── List ─────────────────────────────────────────────────────
export async function listCustomers(
  query: PaginatedQuery
): Promise<PaginatedResult<repo.CustomerRecord>> {
  return repo.listCustomers(query);
}

// ── Update ───────────────────────────────────────────────────
export async function updateCustomer(
  id: number,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  },
  adminUserId?: number
): Promise<repo.CustomerRecord | null> {
  const before = await repo.findCustomerById(id);
  if (!before) throw new Error("Cliente não encontrado.");

  const updated = await repo.updateCustomer(id, data);

  // Build changes diff
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  if (data.fullName && data.fullName !== before.fullName) {
    changes.fullName = { before: before.fullName, after: data.fullName };
  }
  if (data.email !== undefined && data.email !== before.email) {
    changes.email = { before: before.email, after: data.email };
  }
  if (data.phone !== undefined && data.phone !== before.phone) {
    changes.phone = { before: "[encrypted]", after: "[encrypted]" };
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      userId: adminUserId ?? null,
      action: "update",
      entity: "customer",
      entityId: id,
      changes,
    });
  }

  return updated;
}

// ── Deactivate (soft delete) ─────────────────────────────────
export async function deactivateCustomer(
  id: number,
  adminUserId?: number
): Promise<void> {
  const customer = await repo.findCustomerById(id);
  if (!customer) throw new Error("Cliente não encontrado.");

  await repo.deactivateCustomer(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "delete",
    entity: "customer",
    entityId: id,
    changes: { deactivated: { before: false, after: true } },
  });
}

// ── Reactivate ───────────────────────────────────────────────
export async function reactivateCustomer(
  id: number,
  adminUserId?: number
): Promise<void> {
  await repo.reactivateCustomer(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "restore",
    entity: "customer",
    entityId: id,
    changes: { reactivated: { before: false, after: true } },
  });
}

// ── Count ────────────────────────────────────────────────────
export async function countActiveCustomers(): Promise<number> {
  return repo.countActiveCustomers();
}
