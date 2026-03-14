/**
 * Customers Service — Business logic for customer management.
 * Handles validation, deduplication, audit logging, and manual override protection.
 * Supports both CPF (pessoa física) and CNPJ (pessoa jurídica).
 *
 * Manual Override Logic:
 * - When an admin edits a field in the UI, that field name is added to `manualOverrides[]`
 * - When auto-sync (Clicksign/Agent) tries to update, fields in `manualOverrides` are SKIPPED
 * - This ensures manual admin edits are never overwritten by automated processes
 */
import * as repo from "./repository";
import { logAudit } from "../../shared/audit";
import type { PaginatedQuery, PaginatedResult } from "../../shared/pagination";
import type { CustomerStatus, TipoOperacao, DataSource, DocumentType } from "../../../shared/schemas";

// ── Create ───────────────────────────────────────────────────
export async function createCustomer(
  data: {
    cpf: string;
    cnpj?: string | null;
    documentType?: DocumentType;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
    dataSource?: DataSource;
  },
  adminUserId?: number
): Promise<repo.CustomerRecord> {
  // Check for duplicate CPF
  const existing = await repo.findCustomerByCpf(data.cpf);
  if (existing) {
    throw new Error("Já existe um cliente cadastrado com este CPF.");
  }

  // Check for duplicate CNPJ if provided
  if (data.cnpj) {
    const existingCnpj = await repo.findCustomerByCnpj(data.cnpj);
    if (existingCnpj) {
      throw new Error("Já existe um cliente cadastrado com este CNPJ.");
    }
  }

  const customer = await repo.createCustomer({
    cpf: data.cpf,
    cnpj: data.cnpj ?? undefined,
    documentType: data.documentType ?? "cpf",
    fullName: data.fullName,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    status: data.status,
    tipoOperacao: data.tipoOperacao,
    dataSource: data.dataSource ?? "manual",
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

// ── Get by CNPJ ──────────────────────────────────────────────
export async function getCustomerByCnpj(
  cnpj: string
): Promise<repo.CustomerRecord | null> {
  return repo.findCustomerByCnpj(cnpj);
}

// ── List ─────────────────────────────────────────────────────
export async function listCustomers(
  query: PaginatedQuery & { statusFilter?: CustomerStatus }
): Promise<PaginatedResult<repo.CustomerRecord>> {
  return repo.listCustomers(query);
}

// ── List all active ──────────────────────────────────────────
export async function listAllActiveCustomers(): Promise<repo.CustomerRecord[]> {
  return repo.listAllActiveCustomers();
}

// ── Manual Update (admin UI) ─────────────────────────────────
// When admin edits fields, those fields are added to manualOverrides
export async function updateCustomer(
  id: number,
  data: {
    fullName?: string;
    email?: string | null;
    phone?: string | null;
    cpf?: string;
    cnpj?: string | null;
    documentType?: DocumentType;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
  },
  adminUserId?: number
): Promise<repo.CustomerRecord | null> {
  const before = await repo.findCustomerById(id);
  if (!before) throw new Error("Cliente não encontrado.");

  // Track which fields are being manually edited
  const newOverrides = new Set(before.manualOverrides || []);
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  if (data.fullName !== undefined && data.fullName !== before.fullName) {
    newOverrides.add("fullName");
    changes.fullName = { before: before.fullName, after: data.fullName };
  }
  if (data.email !== undefined && data.email !== before.email) {
    newOverrides.add("email");
    changes.email = { before: before.email, after: data.email };
  }
  if (data.phone !== undefined && data.phone !== before.phone) {
    newOverrides.add("phone");
    changes.phone = { before: "[encrypted]", after: "[encrypted]" };
  }
  if (data.cnpj !== undefined && data.cnpj !== before.cnpj) {
    newOverrides.add("cnpj");
    changes.cnpj = { before: "[encrypted]", after: "[encrypted]" };
  }
  if (data.documentType !== undefined && data.documentType !== before.documentType) {
    changes.documentType = { before: before.documentType, after: data.documentType };
  }
  if (data.status !== undefined && data.status !== before.status) {
    changes.status = { before: before.status, after: data.status };
  }
  if (data.tipoOperacao !== undefined && data.tipoOperacao !== before.tipoOperacao) {
    changes.tipoOperacao = { before: before.tipoOperacao, after: data.tipoOperacao };
  }

  const updated = await repo.updateCustomer(id, {
    ...data,
    manualOverrides: Array.from(newOverrides),
  });

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

// ── Auto-Sync Update (Clicksign/Agent) ───────────────────────
// Respects manualOverrides: fields that were manually edited are NOT overwritten
export async function mergeCustomerData(
  id: number,
  data: {
    fullName?: string;
    email?: string | null;
    phone?: string | null;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
  },
  source: DataSource
): Promise<repo.CustomerRecord | null> {
  const existing = await repo.findCustomerById(id);
  if (!existing) throw new Error("Cliente não encontrado.");

  const overrides = new Set(existing.manualOverrides || []);
  const safeData: Record<string, unknown> = {};

  // Only update fields that are NOT in manualOverrides
  if (data.fullName !== undefined && !overrides.has("fullName")) {
    safeData.fullName = data.fullName;
  }
  if (data.email !== undefined && !overrides.has("email")) {
    safeData.email = data.email;
  }
  if (data.phone !== undefined && !overrides.has("phone")) {
    safeData.phone = data.phone;
  }
  if (data.status !== undefined && !overrides.has("status")) {
    safeData.status = data.status;
  }
  if (data.tipoOperacao !== undefined && !overrides.has("tipoOperacao")) {
    safeData.tipoOperacao = data.tipoOperacao;
  }

  if (Object.keys(safeData).length === 0) {
    return existing; // Nothing to update (all fields are manually overridden)
  }

  const updated = await repo.updateCustomer(id, safeData as any);

  await logAudit({
    userId: null,
    action: "update",
    entity: "customer",
    entityId: id,
    changes: {
      autoSync: {
        before: source,
        after: `Updated ${Object.keys(safeData).join(", ")} (skipped: ${Array.from(overrides).join(", ") || "none"})`,
      },
    },
  });

  return updated;
}

// ── Create or Merge by CPF ───────────────────────────────────
// Used by auto-sync: if customer exists, merge; if not, create
export async function upsertCustomerByCpf(
  data: {
    cpf: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
  },
  source: DataSource
): Promise<repo.CustomerRecord> {
  const existing = await repo.findCustomerByCpf(data.cpf);

  if (existing) {
    const merged = await mergeCustomerData(existing.id, data, source);
    return merged!;
  }

  // Create new customer
  return createCustomer({
    ...data,
    dataSource: source,
  });
}

// ── Update Status ────────────────────────────────────────────
export async function updateCustomerStatus(
  id: number,
  status: CustomerStatus,
  adminUserId?: number
): Promise<void> {
  const before = await repo.findCustomerById(id);
  if (!before) throw new Error("Cliente não encontrado.");

  await repo.updateCustomerStatus(id, status);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "customer",
    entityId: id,
    changes: { status: { before: before.status, after: status } },
  });
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

// ── Count by status ──────────────────────────────────────────
export async function countByStatus(): Promise<Record<string, number>> {
  return repo.countByStatus();
}
