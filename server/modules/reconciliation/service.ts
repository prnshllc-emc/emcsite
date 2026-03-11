/**
 * Reconciliation Service — Non-Blocking State Machine for Process Stage Detection
 *
 * CORE PRINCIPLE: Stage detection is INFORMATIVE, never BLOCKING.
 * The absence of any phase does NOT prevent the next from occurring.
 *
 * Each customer/process is evaluated through a chain of checks:
 *   Clicksign Contract → VIN Extracted → Vehicle in System → BL Found → Tracking Active
 *
 * Each check returns true/false as a diagnostic flag. The system:
 *   1. Detects the MOST LIKELY current stage based on what data exists
 *   2. Flags items that need admin attention
 *   3. NEVER blocks progression — admin can advance/retrocede freely
 *
 * Valid scenarios that are NOT errors:
 *   - BL without client (recurring export operations)
 *   - Client without Clicksign contract (manual entry)
 *   - Active tracking without all phases complete (beta)
 *   - Multiple VINs per client in same BL
 *   - Multiple clients per BL (consolidated container)
 *   - Missing tracking codes (sandbox/beta phase)
 *
 * Process Stages (informative, not sequential gates):
 *   sem_contrato         — No Clicksign contract (manual client)
 *   aguardando_assinatura — Contract exists but not signed
 *   contrato_ativo       — Contract signed, VIN not yet extracted
 *   fase_documental      — Documentation phase (LI for imports)
 *   aguardando_embarque  — BL exists, not yet shipped
 *   em_transito          — BL in transit
 *   em_desembaraco       — BL arrived / customs
 *   concluido            — Delivered
 *   cancelado            — Cancelled
 */

import { getDb } from "../../db";
import {
  clicksignContracts,
  vehicles,
  billsOfLading,
  blVehicles,
  trackingCodes,
  customers,
} from "../../../drizzle/schema";
import { eq, isNull, and, inArray } from "drizzle-orm";
import { logAudit } from "../../shared/audit";
import type { CustomerStatus } from "../../../shared/schemas";
import { notifyCustomerStageChange } from "../notifications/service";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export type ProcessStage =
  | "sem_contrato"
  | "aguardando_assinatura"
  | "contrato_ativo"
  | "fase_documental"
  | "aguardando_embarque"
  | "em_transito"
  | "em_desembaraco"
  | "concluido"
  | "cancelado";

export interface StageCheckResult {
  passed: boolean;
  detail: string;
  data?: Record<string, unknown>;
}

export interface ProcessDiagnosis {
  customerId: number;
  customerName: string;
  /** The most likely current stage based on available data */
  currentStage: ProcessStage;
  /** Suggested DB customer status (informative — admin can override) */
  suggestedStatus: CustomerStatus;
  /** Individual check results — each is informative, not blocking */
  checks: {
    hasClicksignContract: StageCheckResult;
    contractSigned: StageCheckResult;
    vinExtracted: StageCheckResult;
    vehicleInSystem: StageCheckResult;
    blFound: StageCheckResult;
    blStatus: StageCheckResult;
    trackingCodeExists: StageCheckResult;
  };
  /** Human-readable description of current situation */
  summary: string;
  /** Whether admin should review this process */
  requiresAdminReview: boolean;
  /** Specific flags for admin attention */
  flags: string[];
}

// ══════════════════════════════════════════════════════════════
// STAGE LABELS & ORDER (for UI)
// ══════════════════════════════════════════════════════════════

export const STAGE_LABELS: Record<ProcessStage, string> = {
  sem_contrato: "Sem Contrato",
  aguardando_assinatura: "Aguardando Assinatura",
  contrato_ativo: "Contrato Ativo",
  fase_documental: "Fase Documental (LI)",
  aguardando_embarque: "Aguardando Embarque",
  em_transito: "Em Trânsito",
  em_desembaraco: "Desembaraço Aduaneiro",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STAGE_ORDER: ProcessStage[] = [
  "sem_contrato",
  "aguardando_assinatura",
  "contrato_ativo",
  "fase_documental",
  "aguardando_embarque",
  "em_transito",
  "em_desembaraco",
  "concluido",
  "cancelado",
];

// ══════════════════════════════════════════════════════════════
// STAGE → CUSTOMER STATUS MAPPING (suggestion only)
// ══════════════════════════════════════════════════════════════

function stageToCustomerStatus(stage: ProcessStage): CustomerStatus {
  switch (stage) {
    case "sem_contrato":
    case "aguardando_assinatura":
    case "contrato_ativo":
    case "aguardando_embarque":
      return "aguardando_embarque";
    case "fase_documental":
      return "aguardando_li";
    case "em_transito":
    case "em_desembaraco":
      return "em_processo";
    case "concluido":
      return "concluido";
    case "cancelado":
      return "cancelado";
    default:
      return "aguardando_embarque";
  }
}

// ══════════════════════════════════════════════════════════════
// DIAGNOSE A SINGLE CUSTOMER (informative, non-blocking)
// ══════════════════════════════════════════════════════════════

export async function diagnoseCustomerProcess(
  customerId: number
): Promise<ProcessDiagnosis | null> {
  const db = await getDb();
  if (!db) return null;

  // 1. Get customer
  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) return null;

  // If cancelled, short-circuit
  if (customerRow.status === "cancelado") {
    return buildCancelledDiagnosis(customerId, customerRow.name);
  }

  const flags: string[] = [];

  // ── Run all checks independently (non-blocking) ──────────

  const checkContract = await checkClicksignContract(db, customerId, customerRow);
  const checkSigned = await checkContractSigned(db, checkContract);
  const checkVin = checkVinExtracted(checkContract);
  const checkVehicle = await checkVehicleInSystem(db, customerId);
  const checkBl = await checkBlFound(db, customerId);
  const checkBlSt = checkBlStatusResult(checkBl);
  const checkTracking = await checkTrackingCode(db, customerId);

  // ── Build flags for admin attention ──────────────────────

  // Flag: BL active but no client linked (valid but noteworthy)
  if (checkBl.passed && !checkContract.passed && customerRow.dataSource === "manual") {
    flags.push("Cliente manual sem contrato Clicksign");
  }

  // Flag: BL in transit but no tracking code (not fatal in beta)
  if (checkBl.passed && checkBlSt.data?.status === "in_transit" && !checkTracking.passed) {
    flags.push("BL em trânsito sem código de rastreio (beta)");
  }

  // Flag: Contract exists but VIN not extracted
  if (checkContract.passed && checkSigned.passed && !checkVin.passed) {
    flags.push("Contrato assinado, VIN não extraído — verificar PDF");
  }

  // Flag: Vehicle exists but no BL
  if (checkVehicle.passed && !checkBl.passed) {
    flags.push("Veículo cadastrado sem BL — fase documental ou aguardando embarque");
  }

  // ── Determine most likely stage ──────────────────────────
  // Strategy: find the MOST ADVANCED stage that has data
  // This is non-blocking — we look at what EXISTS, not what's missing

  let currentStage: ProcessStage;

  if (checkBl.passed) {
    // BL exists — stage is determined by BL status (most advanced indicator)
    const blStatus = (checkBlSt.data?.status as string) ?? "draft";
    switch (blStatus) {
      case "delivered":
        currentStage = "concluido";
        break;
      case "arrived":
      case "customs":
        currentStage = "em_desembaraco";
        break;
      case "in_transit":
        currentStage = "em_transito";
        break;
      case "final":
      case "draft":
      default:
        currentStage = "aguardando_embarque";
        break;
    }
  } else if (checkVehicle.passed) {
    // Vehicle exists but no BL — documentation phase
    currentStage = "fase_documental";
  } else if (checkContract.passed && checkSigned.passed) {
    // Contract signed but no vehicle/BL yet
    currentStage = "contrato_ativo";
  } else if (checkContract.passed && !checkSigned.passed) {
    currentStage = "aguardando_assinatura";
  } else {
    currentStage = "sem_contrato";
  }

  const suggestedStatus = stageToCustomerStatus(currentStage);
  const requiresAdminReview = flags.length > 0;

  const summary = buildSummary(currentStage, flags, checkBl, checkTracking);

  return {
    customerId,
    customerName: customerRow.name,
    currentStage,
    suggestedStatus,
    checks: {
      hasClicksignContract: checkContract,
      contractSigned: checkSigned,
      vinExtracted: checkVin,
      vehicleInSystem: checkVehicle,
      blFound: checkBl,
      blStatus: checkBlSt,
      trackingCodeExists: checkTracking,
    },
    summary,
    requiresAdminReview,
    flags,
  };
}

// ══════════════════════════════════════════════════════════════
// INDIVIDUAL CHECK FUNCTIONS (each independent, non-blocking)
// ══════════════════════════════════════════════════════════════

async function checkClicksignContract(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  customerId: number,
  customerRow: { clicksignEnvelopeId: string | null }
): Promise<StageCheckResult> {
  // Check clicksign_contracts table
  const contractRows = await db
    .select()
    .from(clicksignContracts)
    .where(eq(clicksignContracts.customerId, customerId));

  // Also check via envelope_id on customer record
  let contractsFromEnvelope: typeof contractRows = [];
  if (customerRow.clicksignEnvelopeId) {
    contractsFromEnvelope = await db
      .select()
      .from(clicksignContracts)
      .where(eq(clicksignContracts.envelopeId, customerRow.clicksignEnvelopeId));
  }

  const allContracts = [...contractRows, ...contractsFromEnvelope];
  const uniqueContracts = allContracts.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );

  if (uniqueContracts.length > 0) {
    return {
      passed: true,
      detail: `${uniqueContracts.length} contrato(s) encontrado(s)`,
      data: {
        contracts: uniqueContracts.map((c) => ({
          id: c.id,
          envelopeId: c.envelopeId,
          status: c.status,
          signerName: c.signerName,
        })),
      },
    };
  }

  if (customerRow.clicksignEnvelopeId) {
    return {
      passed: true,
      detail: `Envelope ${customerRow.clicksignEnvelopeId} registrado (não sincronizado localmente)`,
      data: { envelopeId: customerRow.clicksignEnvelopeId },
    };
  }

  return {
    passed: false,
    detail: "Nenhum contrato Clicksign. Cliente pode ser manual ou operação recorrente.",
  };
}

async function checkContractSigned(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  contractCheck: StageCheckResult
): Promise<StageCheckResult> {
  if (!contractCheck.passed) {
    return { passed: false, detail: "Sem contrato para verificar" };
  }

  const contracts = (contractCheck.data?.contracts as Array<{ status: string }>) ?? [];
  if (contracts.length === 0) {
    // Envelope registered but not synced — assume active
    return { passed: true, detail: "Envelope registrado (presumido ativo)" };
  }

  const signed = contracts.find(
    (c) => c.status === "signed" || c.status === "processed"
  );
  if (signed) {
    return {
      passed: true,
      detail: `Contrato assinado (status: ${signed.status})`,
      data: { status: signed.status },
    };
  }

  return {
    passed: false,
    detail: `Contrato encontrado, status: ${contracts[0]?.status ?? "unknown"}`,
    data: { status: contracts[0]?.status },
  };
}

function checkVinExtracted(contractCheck: StageCheckResult): StageCheckResult {
  if (!contractCheck.passed) {
    return { passed: false, detail: "Sem contrato para extrair VIN" };
  }

  const contracts = (contractCheck.data?.contracts as Array<{ id: number }>) ?? [];
  // For now, VIN extraction from contract PDFs is a separate process
  // This check verifies if extractedVins field is populated
  // In the non-blocking model, this is informative only
  return {
    passed: false,
    detail: "Extração de VIN dos contratos pendente (funcionalidade em desenvolvimento)",
  };
}

async function checkVehicleInSystem(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  customerId: number
): Promise<StageCheckResult> {
  // Check vehicles linked directly to customer
  const customerVehicles = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.customerId, customerId), isNull(vehicles.deletedAt)));

  // Check bl_vehicles junction
  const blVehicleLinks = await db
    .select()
    .from(blVehicles)
    .where(eq(blVehicles.customerId, customerId));

  const allVehicleIdSet = new Set<number>();
  customerVehicles.forEach((v) => allVehicleIdSet.add(v.id));
  blVehicleLinks.forEach((bv) => allVehicleIdSet.add(bv.vehicleId));
  const allVehicleIds = Array.from(allVehicleIdSet);

  if (allVehicleIds.length > 0) {
    const vehicleRows = await db
      .select()
      .from(vehicles)
      .where(inArray(vehicles.id, allVehicleIds));

    return {
      passed: true,
      detail: `${vehicleRows.length} veículo(s): ${vehicleRows.map((v) => `${v.make ?? ""} ${v.model ?? ""} (${v.vin})`).join(", ")}`,
      data: {
        vehicleIds: allVehicleIds,
        vehicles: vehicleRows.map((v) => ({
          id: v.id,
          vin: v.vin,
          make: v.make,
          model: v.model,
          year: v.year,
        })),
      },
    };
  }

  return {
    passed: false,
    detail: "Nenhum veículo vinculado a este cliente",
  };
}

async function checkBlFound(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  customerId: number
): Promise<StageCheckResult> {
  // Check BLs via bl_vehicles junction
  const blVehicleLinks = await db
    .select()
    .from(blVehicles)
    .where(eq(blVehicles.customerId, customerId));

  const blIdsFromJunctionSet = new Set<number>();
  blVehicleLinks.forEach((bv) => blIdsFromJunctionSet.add(bv.blId));

  // Check BLs via direct customerId
  const blsFromCustomerId = await db
    .select()
    .from(billsOfLading)
    .where(and(eq(billsOfLading.customerId, customerId), isNull(billsOfLading.deletedAt)));

  const allBlIdSet = new Set<number>();
  blIdsFromJunctionSet.forEach((id) => allBlIdSet.add(id));
  blsFromCustomerId.forEach((bl) => allBlIdSet.add(bl.id));
  const allBlIds = Array.from(allBlIdSet);

  if (allBlIds.length > 0) {
    const blRows = await db
      .select()
      .from(billsOfLading)
      .where(inArray(billsOfLading.id, allBlIds));

    // Find most advanced BL
    const statusPriority: Record<string, number> = {
      delivered: 6, customs: 5, arrived: 4, in_transit: 3, final: 2, draft: 1,
    };
    const mostAdvanced = blRows.reduce((best, bl) =>
      (statusPriority[bl.status] ?? 0) > (statusPriority[best.status] ?? 0) ? bl : best
    );

    return {
      passed: true,
      detail: `${blRows.length} BL(s): ${blRows.map((bl) => `${bl.blNumber} (${bl.status})`).join(", ")}`,
      data: {
        blIds: allBlIds,
        bls: blRows.map((bl) => ({
          id: bl.id,
          blNumber: bl.blNumber,
          status: bl.status,
          containerNumber: bl.containerNumber,
        })),
        status: mostAdvanced.status,
        mostAdvancedBl: mostAdvanced.blNumber,
      },
    };
  }

  return {
    passed: false,
    detail: "Nenhum BL vinculado a este cliente",
  };
}

function checkBlStatusResult(blCheck: StageCheckResult): StageCheckResult {
  if (!blCheck.passed) {
    return { passed: false, detail: "Sem BL para verificar status" };
  }

  return {
    passed: true,
    detail: `BL mais avançado: ${blCheck.data?.mostAdvancedBl} — status: ${blCheck.data?.status}`,
    data: { status: blCheck.data?.status, blNumber: blCheck.data?.mostAdvancedBl },
  };
}

async function checkTrackingCode(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  customerId: number
): Promise<StageCheckResult> {
  const trackingCodeRows = await db
    .select()
    .from(trackingCodes)
    .where(eq(trackingCodes.customerId, customerId));

  if (trackingCodeRows.length > 0) {
    const activeCode = trackingCodeRows.find((tc) => tc.isActive);
    return {
      passed: true,
      detail: activeCode
        ? `Código ativo: ${activeCode.code}`
        : `${trackingCodeRows.length} código(s) (nenhum ativo)`,
      data: {
        codes: trackingCodeRows.map((tc) => ({
          code: tc.code,
          active: tc.isActive,
          approval: tc.approvalStatus,
        })),
      },
    };
  }

  return {
    passed: false,
    detail: "Nenhum código de rastreio (normal em fase beta)",
  };
}

// ══════════════════════════════════════════════════════════════
// DIAGNOSE ALL ACTIVE CUSTOMERS
// ══════════════════════════════════════════════════════════════

export async function diagnoseAllCustomers(): Promise<ProcessDiagnosis[]> {
  const db = await getDb();
  if (!db) return [];

  const allCustomers = await db
    .select({ id: customers.id })
    .from(customers)
    .where(isNull(customers.deletedAt));

  const results: ProcessDiagnosis[] = [];
  for (const c of allCustomers) {
    const diagnosis = await diagnoseCustomerProcess(c.id);
    if (diagnosis) results.push(diagnosis);
  }

  return results;
}

// ══════════════════════════════════════════════════════════════
// DIAGNOSE ORPHAN BLs (BLs without any customer linked)
// ══════════════════════════════════════════════════════════════

export interface OrphanBlDiagnosis {
  blId: number;
  blNumber: string;
  containerNumber: string | null;
  status: string;
  vehicleCount: number;
  vehicles: { id: number; vin: string; make: string | null; model: string | null }[];
  hasCustomerOnBl: boolean;
  hasCustomerOnJunction: boolean;
  summary: string;
}

export async function diagnoseOrphanBls(): Promise<OrphanBlDiagnosis[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all active BLs
  const allBls = await db
    .select()
    .from(billsOfLading)
    .where(isNull(billsOfLading.deletedAt));

  const orphans: OrphanBlDiagnosis[] = [];

  for (const bl of allBls) {
    // Check junction table for this BL
    const junctionRows = await db
      .select()
      .from(blVehicles)
      .where(eq(blVehicles.blId, bl.id));

    const hasCustomerOnBl = bl.customerId !== null;
    const hasCustomerOnJunction = junctionRows.some((j) => j.customerId !== null);

    // Get vehicles
    const vehicleIds = junctionRows.map((j) => j.vehicleId);
    let vehicleRows: { id: number; vin: string; make: string | null; model: string | null }[] = [];
    if (vehicleIds.length > 0) {
      vehicleRows = await db
        .select({ id: vehicles.id, vin: vehicles.vin, make: vehicles.make, model: vehicles.model })
        .from(vehicles)
        .where(inArray(vehicles.id, vehicleIds));
    }

    // A BL is "orphan" if it has no customer at all (neither on BL nor junction)
    // But this is NOT an error — it's valid for recurring operations
    if (!hasCustomerOnBl && !hasCustomerOnJunction) {
      orphans.push({
        blId: bl.id,
        blNumber: bl.blNumber,
        containerNumber: bl.containerNumber,
        status: bl.status,
        vehicleCount: vehicleRows.length,
        vehicles: vehicleRows,
        hasCustomerOnBl,
        hasCustomerOnJunction,
        summary: `BL ${bl.blNumber} sem cliente vinculado. ${vehicleRows.length} veículo(s). Pode ser operação recorrente.`,
      });
    }
  }

  return orphans;
}

// ══════════════════════════════════════════════════════════════
// AUTO-RECONCILE (informative — respects manual overrides)
// ══════════════════════════════════════════════════════════════

export async function runReconciliation(
  adminUserId?: number
): Promise<{
  total: number;
  updated: number;
  unchanged: number;
  skippedManualOverride: number;
  orphanBls: number;
  results: ProcessDiagnosis[];
  orphans: OrphanBlDiagnosis[];
}> {
  const diagnoses = await diagnoseAllCustomers();
  const orphans = await diagnoseOrphanBls();
  let updated = 0;
  let unchanged = 0;
  let skippedManualOverride = 0;

  const db = await getDb();
  if (!db) {
    return {
      total: 0, updated: 0, unchanged: 0,
      skippedManualOverride: 0, orphanBls: 0,
      results: [], orphans: [],
    };
  }

  for (const d of diagnoses) {
    try {
      const [customerRow] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, d.customerId))
        .limit(1);

      if (!customerRow) continue;

      // Respect manual overrides — if admin manually set status, don't touch it
      const overrides: string[] = (customerRow.manualOverrides as string[]) ?? [];
      if (overrides.includes("status")) {
        skippedManualOverride++;
        continue;
      }

      // Only update if status actually differs
      if (customerRow.status !== d.suggestedStatus) {
        await db
          .update(customers)
          .set({ status: d.suggestedStatus, updatedAt: new Date() })
          .where(eq(customers.id, d.customerId));

        await logAudit({
          userId: adminUserId ?? null,
          action: "update",
          entity: "customer",
          entityId: d.customerId,
          changes: {
            status: { before: customerRow.status, after: d.suggestedStatus },
            reconciliation: {
              before: null,
              after: `Auto-reconciliação: ${d.currentStage} | ${d.summary}`,
            },
          },
        });

        // Send notification for stage change (fire-and-forget)
        notifyCustomerStageChange(d.customerId, d.currentStage, adminUserId)
          .catch((err) =>
            console.error(`[Reconciliation] Notification failed for customer ${d.customerId}:`, err)
          );

        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      console.error(`[Reconciliation] Error processing customer ${d.customerId}:`, err);
    }
  }

  return {
    total: diagnoses.length,
    updated,
    unchanged,
    skippedManualOverride,
    orphanBls: orphans.length,
    results: diagnoses,
    orphans,
  };
}

// ══════════════════════════════════════════════════════════════
// PIPELINE SUMMARY (for admin dashboard)
// ══════════════════════════════════════════════════════════════

export interface PipelineSummary {
  stages: {
    stage: ProcessStage;
    label: string;
    count: number;
    customers: {
      id: number;
      name: string;
      summary: string;
      flags: string[];
      requiresReview: boolean;
    }[];
  }[];
  totalCustomers: number;
  requiresAttention: number;
  orphanBls: OrphanBlDiagnosis[];
}

export async function getPipelineSummary(): Promise<PipelineSummary> {
  const diagnoses = await diagnoseAllCustomers();
  const orphans = await diagnoseOrphanBls();

  const stageMap = new Map<ProcessStage, ProcessDiagnosis[]>();
  for (const stage of STAGE_ORDER) {
    stageMap.set(stage, []);
  }

  let requiresAttention = 0;

  for (const d of diagnoses) {
    const list = stageMap.get(d.currentStage) ?? [];
    list.push(d);
    stageMap.set(d.currentStage, list);
    if (d.requiresAdminReview) requiresAttention++;
  }

  const stages = STAGE_ORDER.map((stage) => {
    const items = stageMap.get(stage) ?? [];
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: items.length,
      customers: items.map((d) => ({
        id: d.customerId,
        name: d.customerName,
        summary: d.summary,
        flags: d.flags,
        requiresReview: d.requiresAdminReview,
      })),
    };
  });

  return {
    stages,
    totalCustomers: diagnoses.length,
    requiresAttention,
    orphanBls: orphans,
  };
}

// ══════════════════════════════════════════════════════════════
// FORCE STAGE (admin override — no validation)
// ══════════════════════════════════════════════════════════════

export async function forceCustomerStage(
  customerId: number,
  newStatus: CustomerStatus,
  adminUserId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) return false;

  const oldStatus = customerRow.status;

  // Update status and add "status" to manual overrides
  const overrideSet = new Set<string>((customerRow.manualOverrides as string[]) ?? []);
  overrideSet.add("status");

  await db
    .update(customers)
    .set({
      status: newStatus,
      manualOverrides: Array.from(overrideSet),
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));

  await logAudit({
    userId: adminUserId,
    action: "update",
    entity: "customer",
    entityId: customerId,
    changes: {
      status: { before: oldStatus, after: newStatus },
      forcedByAdmin: { before: false, after: true },
    },
  });

  return true;
}

// ══════════════════════════════════════════════════════════════
// CLEAR MANUAL OVERRIDE (allow auto-reconciliation again)
// ══════════════════════════════════════════════════════════════

export async function clearStatusOverride(
  customerId: number,
  adminUserId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) return false;

  const overrideSet2 = new Set<string>((customerRow.manualOverrides as string[]) ?? []);
  overrideSet2.delete("status");

  await db
    .update(customers)
    .set({
      manualOverrides: Array.from(overrideSet2),
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));

  await logAudit({
    userId: adminUserId,
    action: "update",
    entity: "customer",
    entityId: customerId,
    changes: {
      manualOverrides: { before: "status locked", after: "status unlocked for auto-reconciliation" },
    },
  });

  return true;
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function buildCancelledDiagnosis(
  customerId: number,
  customerName: string
): ProcessDiagnosis {
  const skipped: StageCheckResult = { passed: false, detail: "Processo cancelado" };
  return {
    customerId,
    customerName,
    currentStage: "cancelado",
    suggestedStatus: "cancelado",
    checks: {
      hasClicksignContract: skipped,
      contractSigned: skipped,
      vinExtracted: skipped,
      vehicleInSystem: skipped,
      blFound: skipped,
      blStatus: skipped,
      trackingCodeExists: skipped,
    },
    summary: "Processo cancelado. Nenhuma ação necessária.",
    requiresAdminReview: false,
    flags: [],
  };
}

function buildSummary(
  stage: ProcessStage,
  flags: string[],
  blCheck: StageCheckResult,
  trackingCheck: StageCheckResult
): string {
  const parts: string[] = [];

  parts.push(`Estágio: ${STAGE_LABELS[stage]}`);

  if (blCheck.passed) {
    parts.push(`BL: ${blCheck.data?.mostAdvancedBl ?? "?"} (${blCheck.data?.status ?? "?"})`);
  }

  if (trackingCheck.passed) {
    parts.push(`Tracking: ${trackingCheck.detail}`);
  }

  if (flags.length > 0) {
    parts.push(`Atenção: ${flags.join("; ")}`);
  }

  return parts.join(" | ");
}
