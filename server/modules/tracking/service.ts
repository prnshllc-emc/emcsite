/**
 * Tracking Service — Business logic for tracking codes and history.
 * Handles code generation, validation, public lookup, and event management.
 */
import * as repo from "./repository";
import * as blRepo from "../bls/repository";
import * as customerRepo from "../customers/repository";
import { logAudit } from "../../shared/audit";
import { hashCpfForSearch } from "../../shared/security";
import { InMemoryCache } from "../../shared/cache";
import { dispatchEventNotifications, notifyNewTrackingCode } from "./notifications";
import type { PaginatedQuery, PaginatedResult } from "../../shared/pagination";

// ── Cache for public tracking lookups (5 min TTL) ────────────
const trackingCache = new InMemoryCache<PublicTrackingResult>({ ttl: 300 });

// ── Public result types ──────────────────────────────────────
export interface PublicTrackingResult {
  code: string;
  blNumber: string;
  containerNumber: string | null;
  originPort: string | null;
  destinationPort: string | null;
  vehicleDescription: string | null;
  status: string;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
  estimatedArrival: Date | null;
  actualArrival: Date | null;
  timeline: Array<{
    status: string;
    location: string | null;
    description: string | null;
    eventDate: Date;
  }>;
  lastUpdate: Date | null;
}

export interface CpfLookupResult {
  codes: Array<{
    codeMasked: string;
    blNumber: string;
    status: string;
    vehicleDescription: string | null;
  }>;
  customerNameMasked: string;
}

// ══════════════════════════════════════════════════════════════
// TRACKING CODES
// ══════════════════════════════════════════════════════════════

// ── Generate a tracking code for a BL ────────────────────────
export async function generateTrackingCode(
  blId: number,
  customerId: number,
  expiresInDays: number = 365,
  adminUserId?: number
): Promise<repo.TrackingCodeRecord> {
  // Validate BL exists
  const bl = await blRepo.findBlById(blId);
  if (!bl) throw new Error("BL não encontrado.");

  // Validate customer exists
  const customer = await customerRepo.findCustomerById(customerId);
  if (!customer) throw new Error("Cliente não encontrado.");

  const code = await repo.createTrackingCode(blId, customerId, expiresInDays);

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "tracking_code",
    entityId: code.id,
    changes: {
      created: { before: null, after: code.code },
      blId: { before: null, after: blId },
      customerId: { before: null, after: customerId },
    },
  });

  // Notify about new tracking code (fire-and-forget)
  notifyNewTrackingCode({
    blNumber: bl.blNumber,
    trackingCode: code.code,
    customerName: customer.fullName,
    customerId: customer.id,
    vehicleDescription: bl.vehicleDescription,
  }).catch((err) => console.error("[Tracking Service] Code notification error:", err));

  return code;
}

// ── Deactivate a tracking code ───────────────────────────────
export async function deactivateCode(
  id: number,
  adminUserId?: number
): Promise<void> {
  const code = await repo.findTrackingCodeById(id);
  if (!code) throw new Error("Código de tracking não encontrado.");

  await repo.deactivateTrackingCode(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "tracking_code",
    entityId: id,
    changes: { isActive: { before: true, after: false } },
  });
}

// ── Reactivate a tracking code ───────────────────────────────
export async function reactivateCode(
  id: number,
  adminUserId?: number
): Promise<void> {
  await repo.reactivateTrackingCode(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "update",
    entity: "tracking_code",
    entityId: id,
    changes: { isActive: { before: false, after: true } },
  });
}

// ── List tracking codes ──────────────────────────────────────
export async function listTrackingCodes(
  query: PaginatedQuery
): Promise<PaginatedResult<repo.TrackingCodeRecord>> {
  return repo.listTrackingCodes(query);
}

// ── Get codes for a BL ───────────────────────────────────────
export async function getCodesForBl(
  blId: number
): Promise<repo.TrackingCodeRecord[]> {
  return repo.findActiveCodesByBlId(blId);
}

// ── Count active codes ───────────────────────────────────────
export async function countActiveCodes(): Promise<number> {
  return repo.countActiveCodes();
}

// ══════════════════════════════════════════════════════════════
// PUBLIC TRACKING LOOKUP
// ══════════════════════════════════════════════════════════════

// ── Lookup by tracking code (public endpoint) ────────────────
export async function lookupByCode(
  code: string
): Promise<PublicTrackingResult | null> {
  // Check cache first
  const cached = trackingCache.get(code.toUpperCase());
  if (cached) return cached;

  // Find the tracking code
  const trackingCode = await repo.findTrackingCodeByCode(code);
  if (!trackingCode) return null;

  // Check if active and not expired
  if (!trackingCode.isActive) return null;
  if (trackingCode.expiresAt < new Date()) return null;

  // Increment usage counter (fire-and-forget)
  repo.incrementUsage(trackingCode.id).catch(() => {});

  // Get BL details
  const bl = await blRepo.findBlById(trackingCode.blId);
  if (!bl) return null;

  // Get tracking history
  const history = await repo.getTrackingHistory(trackingCode.blId);

  const result: PublicTrackingResult = {
    code: trackingCode.code,
    blNumber: bl.blNumber,
    containerNumber: bl.containerNumber,
    originPort: bl.originPort,
    destinationPort: bl.destinationPort,
    vehicleDescription: bl.vehicleDescription,
    status: bl.status,
    estimatedDeparture: bl.estimatedDeparture,
    actualDeparture: bl.actualDeparture,
    estimatedArrival: bl.estimatedArrival,
    actualArrival: bl.actualArrival,
    timeline: history.map((h) => ({
      status: h.status,
      location: h.location,
      description: h.description,
      eventDate: h.eventDate,
    })),
    lastUpdate: history.length > 0 ? history[0].eventDate : null,
  };

  // Cache for 5 minutes
  trackingCache.set(code.toUpperCase(), result);

  return result;
}

// ── Lookup by CPF (public endpoint) ──────────────────────────
export async function lookupByCpf(cpf: string): Promise<CpfLookupResult | null> {
  // Find customer by CPF hash
  const customer = await customerRepo.findCustomerByCpf(cpf);
  if (!customer) return null;

  // Get active tracking codes for this customer
  const codes = await repo.findActiveCodesByCustomerId(customer.id);
  if (codes.length === 0) return null;

  // Get BL details for each code
  const codeResults = await Promise.all(
    codes.map(async (tc) => {
      const bl = await blRepo.findBlById(tc.blId);
      return {
        codeMasked: maskCode(tc.code),
        blNumber: bl?.blNumber ?? "N/A",
        status: bl?.status ?? "unknown",
        vehicleDescription: bl?.vehicleDescription ?? null,
      };
    })
  );

  return {
    codes: codeResults,
    customerNameMasked: maskName(customer.fullName),
  };
}

// ══════════════════════════════════════════════════════════════
// TRACKING HISTORY
// ══════════════════════════════════════════════════════════════

// ── Add a tracking event ─────────────────────────────────────
export async function addTrackingEvent(
  data: {
    blId: number;
    status: string;
    location?: string;
    description?: string;
    eventDate?: Date;
    rawData?: string;
  },
  adminUserId?: number
): Promise<repo.TrackingHistoryRecord> {
  // Validate BL exists
  const bl = await blRepo.findBlById(data.blId);
  if (!bl) throw new Error("BL não encontrado.");

  const event = await repo.addTrackingEvent(data);

  // Invalidate cache for all codes linked to this BL
  const codes = await repo.findActiveCodesByBlId(data.blId);
  codes.forEach((c) => trackingCache.delete(c.code));

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "tracking_event",
    entityId: event.id,
    changes: {
      created: { before: null, after: data.status },
      blId: { before: null, after: data.blId },
    },
  });

  // Dispatch notifications (fire-and-forget)
  dispatchEventNotifications({
    blId: data.blId,
    blNumber: bl.blNumber,
    eventType: data.status,
    title: data.description ?? data.status,
    description: data.description,
    location: data.location,
    eventDate: data.eventDate ?? new Date(),
    vehicleDescription: bl.vehicleDescription,
    customerId: bl.customerId ?? undefined,
  }).catch((err) => console.error("[Tracking Service] Notification dispatch error:", err));

  return event;
}

// ── Get tracking history for a BL ────────────────────────────
export async function getTrackingHistory(
  blId: number
): Promise<repo.TrackingHistoryRecord[]> {
  return repo.getTrackingHistory(blId);
}

// ── Delete a tracking event ──────────────────────────────────
export async function deleteTrackingEvent(
  id: number,
  adminUserId?: number
): Promise<void> {
  await repo.deleteTrackingEvent(id);

  await logAudit({
    userId: adminUserId ?? null,
    action: "delete",
    entity: "tracking_event",
    entityId: id,
    changes: { deleted: { before: false, after: true } },
  });
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

/** Mask a tracking code: EMC-AB3D-****-**** */
function maskCode(code: string): string {
  const parts = code.split("-");
  if (parts.length !== 4) return code;
  return `${parts[0]}-${parts[1]}-****-****`;
}

/** Mask a name: "João Silva" → "João S***" */
function maskName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length <= 1) return name.charAt(0) + "***";
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${first} ${lastInitial}***`;
}
