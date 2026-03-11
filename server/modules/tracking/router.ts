/**
 * Tracking Router — tRPC procedures for tracking management.
 * Admin endpoints for code/history management + public endpoints for client access.
 */
import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  TrackingCodeSchema,
  TrackingHistoryCreateSchema,
  PaginatedQuerySchema,
} from "@shared/schemas";
import * as service from "./service";

export const trackingRouter = router({
  // ══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ══════════════════════════════════════════════════════════════

  // ── Generate tracking code for a BL ─────────────────────────
  generateCode: adminProcedure
    .input(
      z.object({
        blId: z.number().int().positive(),
        customerId: z.number().int().positive(),
        expiresInDays: z.number().int().min(1).max(365).default(90),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.generateTrackingCode(
        input.blId,
        input.customerId,
        input.expiresInDays,
        ctx.user.id
      );
    }),

   // ── List tracking codes (paginated) ─────────────────────
  listCodes: adminProcedure
    .input(
      PaginatedQuerySchema.extend({
        blId: z.number().int().positive().optional(),
        customerId: z.number().int().positive().optional(),
        activeOnly: z.boolean().default(false),
        approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return service.listTrackingCodes(input);
    }),

  // ── List pending codes (approval queue) ─────────────────
  listPendingCodes: adminProcedure.query(async () => {
    return service.listPendingCodes();
  }),

  // ── Count pending codes (for badge) ──────────────────────
  countPendingCodes: adminProcedure.query(async () => {
    return service.countPendingCodes();
  }),

  // ── Approve a pending tracking code ──────────────────────
  approveCode: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      return service.approveCode(input.id, ctx.user.id);
    }),

  // ── Reject a pending tracking code ───────────────────────
  rejectCode: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.rejectCode(input.id, input.reason, ctx.user.id);
    }),

  // ── Get approval notification templates (email + WhatsApp preview) ──
  getApprovalPreview: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getApprovalPreview(input.id);
    }),

  // ── Deactivate tracking code ────────────────────────────────
  deactivateCode: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.deactivateCode(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Add tracking event to BL ────────────────────────────────
  addEvent: adminProcedure
    .input(TrackingHistoryCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return service.addTrackingEvent(
        {
          blId: input.blId,
          status: input.eventType,
          description: input.description ?? undefined,
          location: input.location ?? undefined,
          eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
        },
        ctx.user.id
      );
    }),

  // ── List tracking events for a BL ──────────────────────────
  listEvents: adminProcedure
    .input(z.object({ blId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getTrackingHistory(input.blId);
    }),

  // ── Delete tracking event ───────────────────────────────────
  deleteEvent: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.deleteTrackingEvent(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Get codes for a BL ──────────────────────────────────────
  getCodesForBl: adminProcedure
    .input(z.object({ blId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getCodesForBl(input.blId);
    }),

  // ── Count active codes ──────────────────────────────────────
  countActiveCodes: adminProcedure.query(async () => {
    return service.countActiveCodes();
  }),

  // ══════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS — For client tracking page
  // ══════════════════════════════════════════════════════════════

  // ── Lookup tracking by code ─────────────────────────────────
  // Client enters EMC-XXXX-XXXX-XXXX → gets BL status + timeline
  lookup: publicProcedure
    .input(
      z.object({
        code: TrackingCodeSchema,
      })
    )
    .query(async ({ input }) => {
      return service.lookupByCode(input.code);
    }),

  // ── Lookup tracking codes by CPF ────────────────────────────
  // Client enters CPF → gets list of active codes (masked)
  lookupByCpf: publicProcedure
    .input(
      z.object({
        cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
      })
    )
    .query(async ({ input }) => {
      return service.lookupByCpf(input.cpf);
    }),
});
