/**
 * Customers Repository — Data access layer with PII encryption.
 * CPF is stored encrypted (AES-256-GCM) + hashed (HMAC-SHA256) for search.
 * Name is stored plaintext; email/phone encrypted.
 * Supports status, tipoOperacao, dataSource, and manualOverrides fields.
 */
import { getDb } from "../../db";
import { customers } from "../../../drizzle/schema";
import { eq, desc, count, isNull, and, sql } from "drizzle-orm";
import {
  encryptSensitiveData,
  decryptSensitiveData,
  hashCpfForSearch,
} from "../../shared/security";
import {
  calcOffset,
  paginatedResponse,
  type PaginatedQuery,
  type PaginatedResult,
} from "../../shared/pagination";
import type { CustomerCreate, CustomerUpdate, CustomerStatus, TipoOperacao, DataSource } from "../../../shared/schemas";

// ── Types ────────────────────────────────────────────────────
export interface CustomerRecord {
  id: number;
  fullName: string;
  cpf: string;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  tipoOperacao: TipoOperacao | null;
  dataSource: DataSource;
  manualOverrides: string[];
  clicksignEnvelopeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── Decrypt a raw DB row into a CustomerRecord ───────────────
function decryptCustomer(row: typeof customers.$inferSelect): CustomerRecord {
  let cpfDecrypted = "";
  try {
    cpfDecrypted = row.cpf ? decryptSensitiveData(row.cpf) : "";
  } catch {
    cpfDecrypted = "[encrypted]";
  }

  let emailDecrypted: string | null = null;
  try {
    emailDecrypted = row.email ? decryptSensitiveData(row.email) : null;
  } catch {
    emailDecrypted = null;
  }

  let phoneDecrypted: string | null = null;
  try {
    phoneDecrypted = row.phone ? decryptSensitiveData(row.phone) : null;
  } catch {
    phoneDecrypted = null;
  }

  return {
    id: row.id,
    fullName: row.name,
    cpf: cpfDecrypted,
    email: emailDecrypted,
    phone: phoneDecrypted,
    status: (row.status as CustomerStatus) ?? "aguardando_embarque",
    tipoOperacao: (row.tipoOperacao as TipoOperacao | null) ?? null,
    dataSource: (row.dataSource as DataSource) ?? "manual",
    manualOverrides: (row.manualOverrides as string[]) ?? [],
    clicksignEnvelopeId: row.clicksignEnvelopeId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

// ── Create ───────────────────────────────────────────────────
export async function createCustomer(
  data: {
    fullName: string;
    cpf: string;
    email?: string | null;
    phone?: string | null;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
    dataSource?: DataSource;
  }
): Promise<CustomerRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cpfDigits = data.cpf.replace(/\D/g, "");

  const [result] = await db.insert(customers).values({
    name: data.fullName,
    cpf: encryptSensitiveData(cpfDigits),
    cpfHash: hashCpfForSearch(cpfDigits),
    email: data.email ? encryptSensitiveData(data.email) : null,
    phone: data.phone ? encryptSensitiveData(data.phone) : null,
    status: data.status ?? "aguardando_embarque",
    tipoOperacao: data.tipoOperacao ?? null,
    dataSource: data.dataSource ?? "manual",
    manualOverrides: [],
  }).$returningId();

  return {
    id: result.id,
    fullName: data.fullName,
    cpf: cpfDigits,
    email: data.email ?? null,
    phone: data.phone ?? null,
    status: data.status ?? "aguardando_embarque",
    tipoOperacao: data.tipoOperacao ?? null,
    dataSource: data.dataSource ?? "manual",
    manualOverrides: [],
    clicksignEnvelopeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

// ── Find by ID ───────────────────────────────────────────────
export async function findCustomerById(
  id: number
): Promise<CustomerRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!row) return null;
  return decryptCustomer(row);
}

// ── Find by CPF Hash ─────────────────────────────────────────
export async function findCustomerByCpf(
  cpf: string
): Promise<CustomerRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const cpfDigits = cpf.replace(/\D/g, "");
  const hash = hashCpfForSearch(cpfDigits);
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.cpfHash, hash))
    .limit(1);

  if (!row) return null;
  return decryptCustomer(row);
}

// ── List with pagination (active only) ───────────────────────
export async function listCustomers(
  query: PaginatedQuery & { statusFilter?: CustomerStatus }
): Promise<PaginatedResult<CustomerRecord>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);

  const conditions = [isNull(customers.deletedAt)];
  if (query.statusFilter) {
    conditions.push(eq(customers.status, query.statusFilter));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  // Count total
  const [totalResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(whereClause);

  // Fetch page
  const rows = await db
    .select()
    .from(customers)
    .where(whereClause)
    .orderBy(desc(customers.createdAt))
    .limit(query.limit)
    .offset(calcOffset(query));

  const decrypted = rows.map(decryptCustomer);

  // If search is provided, filter decrypted results
  let filtered = decrypted;
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filtered = decrypted.filter(
      (c) =>
        c.fullName.toLowerCase().includes(searchLower) ||
        c.cpf.includes(searchLower) ||
        (c.email && c.email.toLowerCase().includes(searchLower)) ||
        (c.phone && c.phone.includes(searchLower))
    );
  }

  return paginatedResponse(filtered, totalResult?.count ?? 0, query);
}

// ── List all active (no pagination) ──────────────────────────
export async function listAllActiveCustomers(): Promise<CustomerRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(customers)
    .where(isNull(customers.deletedAt))
    .orderBy(desc(customers.createdAt));

  return rows.map(decryptCustomer);
}

// ── Update ───────────────────────────────────────────────────
export async function updateCustomer(
  id: number,
  data: {
    fullName?: string;
    cpf?: string;
    email?: string | null;
    phone?: string | null;
    status?: CustomerStatus;
    tipoOperacao?: TipoOperacao | null;
    manualOverrides?: string[];
  }
): Promise<CustomerRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const updateValues: Record<string, unknown> = { updatedAt: new Date() };

  if (data.fullName !== undefined) {
    updateValues.name = data.fullName;
  }
  if (data.cpf !== undefined) {
    const cpfDigits = data.cpf.replace(/\D/g, "");
    updateValues.cpf = encryptSensitiveData(cpfDigits);
    updateValues.cpfHash = hashCpfForSearch(cpfDigits);
  }
  if (data.email !== undefined) {
    updateValues.email = data.email
      ? encryptSensitiveData(data.email)
      : null;
  }
  if (data.phone !== undefined) {
    updateValues.phone = data.phone
      ? encryptSensitiveData(data.phone)
      : null;
  }
  if (data.status !== undefined) {
    updateValues.status = data.status;
  }
  if (data.tipoOperacao !== undefined) {
    updateValues.tipoOperacao = data.tipoOperacao;
  }
  if (data.manualOverrides !== undefined) {
    updateValues.manualOverrides = data.manualOverrides;
  }

  await db.update(customers).set(updateValues).where(eq(customers.id, id));

  return findCustomerById(id);
}

// ── Update status only ───────────────────────────────────────
export async function updateCustomerStatus(
  id: number,
  status: CustomerStatus
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(customers)
    .set({ status, updatedAt: new Date() })
    .where(eq(customers.id, id));
}

// ── Soft delete (set deletedAt) ──────────────────────────────
export async function deactivateCustomer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(customers)
    .set({ deletedAt: new Date() })
    .where(eq(customers.id, id));
}

// ── Reactivate (clear deletedAt) ─────────────────────────────
export async function reactivateCustomer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(customers)
    .set({ deletedAt: null })
    .where(eq(customers.id, id));
}

// ── Count active customers ───────────────────────────────────
export async function countActiveCustomers(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(customers)
    .where(isNull(customers.deletedAt));

  return result?.count ?? 0;
}

// ── Count by status ──────────────────────────────────────────
export async function countByStatus(): Promise<Record<string, number>> {
  const db = await getDb();
  if (!db) return {};

  const rows = await db
    .select({
      status: customers.status,
      count: count(),
    })
    .from(customers)
    .where(isNull(customers.deletedAt))
    .groupBy(customers.status);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}
