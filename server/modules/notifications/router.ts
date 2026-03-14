/**
 * Notifications Router — tRPC procedures for stage-based notifications.
 *
 * Provides:
 * - Send notification for a stage change
 * - Send notification for tracking code approval
 * - Send generic template notification
 * - List customers missing contact info
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  notifyCustomerStageChange,
  notifyTrackingCodeApproved,
  sendTemplateNotification,
  findCustomersMissingContact,
} from "./service";
import { listEmailTemplates, seedDefaultTemplates } from "../emailTemplates/service";
import type { ProcessStage } from "../reconciliation/service";

export const notificationsRouter = router({
  // ── Send notification for stage change ─────────────────────
  sendStageNotification: adminProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        stage: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return notifyCustomerStageChange(
        input.customerId,
        input.stage as ProcessStage,
        ctx.user.id
      );
    }),

  // ── Send tracking code approved notification ──────────────
  sendTrackingApproved: adminProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        trackingCode: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return notifyTrackingCodeApproved(
        input.customerId,
        input.trackingCode,
        ctx.user.id
      );
    }),

  // ── Send generic template notification ────────────────────
  sendTemplate: adminProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        templateSlug: z.string().min(1),
        variables: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return sendTemplateNotification(
        input.customerId,
        input.templateSlug,
        input.variables ?? {},
        ctx.user.id
      );
    }),

  // ── List customers missing contact info ────────────────────
  missingContact: adminProcedure.query(async () => {
    return findCustomersMissingContact();
  }),

  // ── Get notification templates (from DB) ───────────────────
  templates: adminProcedure.query(async () => {
    await seedDefaultTemplates();
    return listEmailTemplates();
  }),
});
