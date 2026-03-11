/**
 * Notifications Router — tRPC procedures for stage-based notifications.
 *
 * Provides:
 * - Send notification for a stage change
 * - List customers missing contact info
 * - Get notification templates
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  notifyCustomerStageChange,
  findCustomersMissingContact,
  getNotificationTemplates,
} from "./service";
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

  // ── List customers missing contact info ────────────────────
  missingContact: adminProcedure.query(async () => {
    return findCustomersMissingContact();
  }),

  // ── Get notification templates ─────────────────────────────
  templates: adminProcedure.query(() => {
    return getNotificationTemplates();
  }),
});
