/**
 * Customers Repository — Data access layer with PII encryption.
 * CPF is stored encrypted (AES-256-GCM) + hashed (HMAC-SHA256) for search.
 * Name is stored plaintext; email/phone encrypted.
 */
import { getDb } from "../../db";
import { customers } from "../../../drizzle/schema";
import { eq, desc, count, isNull, and } from "drizzle-orm";
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
import type { CustomerCreate, CustomerUpdate } from "../../../shared/schemas";

// ── Types ────────────────────────────────────────────────────
export interface CustomerRecord {
  id: number;
  fullName: string;
  cpf: string;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
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
    status: row.deletedAt ? "inactive" : "active",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Create ───────────────────────────────────────────────────
export async function createCustomer(
  data: CustomerCreate
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
  }).$returningId();

  return {
    id: result.id,
    fullName: data.fullName,
    cpf: cpfDigits,
    email: data.email ?? null,
    phone: data.phone ?? null,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const hash = hashCpfForSearch(cpf);
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
  query: PaginatedQuery
): Promise<PaginatedResult<CustomerRecord>> {
  const db = await getDb();
  if (!db) return paginatedResponse([], 0, query);

  const activeCondition = isNull(customers.deletedAt);

  // Count total active
  const [totalResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(activeCondition);

  // Fetch page
  const rows = await db
    .select()
    .from(customers)
    .where(activeCondition)
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

// ── Update ───────────────────────────────────────────────────
export async function updateCustomer(
  id: number,
  data: CustomerUpdate
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

  await db.update(customers).set(updateValues).where(eq(customers.id, id));

  return findCustomerById(id);
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
