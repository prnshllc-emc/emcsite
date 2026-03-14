/**
 * Reconciliation Router — tRPC procedures for process stage management.
 *
 * Provides:
 * - Pipeline summary (all customers grouped by stage)
 * - Individual customer diagnosis
 * - Force stage change (admin override, no validation blocking)
 * - Clear manual override (re-enable auto-reconciliation)
 * - Run full reconciliation
 * - Orphan BL detection
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { CustomerStatusEnum } from "@shared/schemas";
import {
  diagnoseCustomerProcess,
  diagnoseAllCustomers,
  diagnoseOrphanBls,
  runReconciliation,
  getPipelineSummary,
  forceCustomerStage,
  clearStatusOverride,
  STAGE_LABELS,
  STAGE_ORDER,
} from "./service";
import {
  getSchedulerStatus,
  runScheduledReconciliation,
} from "./scheduler";
import { runAutoLink } from "./autoLink";

export const reconciliationRouter = router({
  // ── Pipeline summary (grouped by stage) ────────────────────
  pipeline: adminProcedure.query(async () => {
    return getPipelineSummary();
  }),

  // ── Stage metadata (labels and order for UI) ───────────────
  stageMetadata: adminProcedure.query(() => {
    return {
      labels: STAGE_LABELS,
      order: STAGE_ORDER,
    };
  }),

  // ── Diagnose single customer ───────────────────────────────
  diagnoseCustomer: adminProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const result = await diagnoseCustomerProcess(input.customerId);
      if (!result) throw new Error("Cliente não encontrado.");
      return result;
    }),

  // ── Diagnose all customers ─────────────────────────────────
  diagnoseAll: adminProcedure.query(async () => {
    return diagnoseAllCustomers();
  }),

  // ── Orphan BLs (BLs without any customer) ─────────────────
  orphanBls: adminProcedure.query(async () => {
    return diagnoseOrphanBls();
  }),

  // ── Force customer stage (admin override — NO validation) ──
  forceStage: adminProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        newStatus: CustomerStatusEnum,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await forceCustomerStage(
        input.customerId,
        input.newStatus,
        ctx.user.id
      );
      if (!success) throw new Error("Falha ao forçar estágio. Cliente não encontrado.");
      return { success: true };
    }),

  // ── Clear manual override (re-enable auto-reconciliation) ──
  clearOverride: adminProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const success = await clearStatusOverride(input.customerId, ctx.user.id);
      if (!success) throw new Error("Falha ao limpar override. Cliente não encontrado.");
      return { success: true };
    }),

  // ── Run full reconciliation ────────────────────────────────
  runReconciliation: adminProcedure.mutation(async ({ ctx }) => {
    return runReconciliation(ctx.user.id);
  }),

  // ── Scheduler status ───────────────────────────────────
  schedulerStatus: adminProcedure.query(() => {
    return getSchedulerStatus();
  }),

  // ── Trigger scheduled reconciliation manually ───────────
  triggerScheduled: adminProcedure.mutation(async () => {
    return runScheduledReconciliation();
  }),

  // ── Auto-link existing data ─────────────────────────────
  autoLink: adminProcedure.mutation(async ({ ctx }) => {
    return runAutoLink(ctx.user.id);
  }),
});
