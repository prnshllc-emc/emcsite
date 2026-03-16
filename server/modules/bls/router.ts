/**
 * Bills of Lading Router — tRPC procedures for BL management.
 * All endpoints require admin role.
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  BlCreateSchema,
  BlUpdateSchema,
  BlStatusEnum,
  PaginatedQuerySchema,
} from "@shared/schemas";
import * as service from "./service";
import type { BlCreateData } from "./repository";

export const blsRouter = router({
  // ── List BLs (paginated, optional status filter) ────────────
  list: adminProcedure
    .input(
      PaginatedQuerySchema.extend({
        status: BlStatusEnum.optional(),
      })
    )
    .query(async ({ input }) => {
      return service.listBls(input);
    }),

  // ── Get BL by ID ────────────────────────────────────────────
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const bl = await service.getBlById(input.id);
      if (!bl) throw new Error("BL não encontrado.");
      return bl;
    }),

  // ── Search by BL number ─────────────────────────────────────
  getByNumber: adminProcedure
    .input(z.object({ blNumber: z.string() }))
    .query(async ({ input }) => {
      return service.getBlByNumber(input.blNumber);
    }),

  // ── Get BLs by customer ─────────────────────────────────────
  getByCustomer: adminProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getBlsByCustomerId(input.customerId);
    }),

  // ── Get BLs by vehicle ──────────────────────────────────────
  getByVehicle: adminProcedure
    .input(z.object({ vehicleId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getBlsByVehicleId(input.vehicleId);
    }),

  // ── Create BL ───────────────────────────────────────────────
  create: adminProcedure
    .input(BlCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const createData: BlCreateData = {
        blNumber: input.blNumber,
        vehicleId: input.vehicleId ?? undefined,
        customerId: input.customerId ?? undefined,
        containerNumber: input.containerNumber ?? undefined,
        vehicleDescription: input.cargoDescription ?? undefined,
        originPort: input.portOfLoading ?? undefined,
        destinationPort: input.portOfDischarge ?? undefined,
        status: input.status ?? undefined,
        estimatedDeparture: input.etd ? new Date(input.etd) : undefined,
        estimatedArrival: input.eta ? new Date(input.eta) : undefined,
      };
      return service.createBl(createData, ctx.user.id);
    }),

  // ── Update BL ───────────────────────────────────────────────
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: BlUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, unknown> = {};
      if (input.data.blNumber !== undefined) updateData.blNumber = input.data.blNumber;
      if (input.data.vehicleId !== undefined) updateData.vehicleId = input.data.vehicleId;
      if (input.data.customerId !== undefined) updateData.customerId = input.data.customerId;
      // Status changes MUST go through updateStatus or forceUpdateStatus — not through generic update
      // if (input.data.status !== undefined) updateData.status = input.data.status;
      if (input.data.portOfLoading !== undefined) updateData.originPort = input.data.portOfLoading;
      if (input.data.portOfDischarge !== undefined) updateData.destinationPort = input.data.portOfDischarge;
      if (input.data.etd !== undefined) updateData.estimatedDeparture = input.data.etd ? new Date(input.data.etd) : null;
      if (input.data.eta !== undefined) updateData.estimatedArrival = input.data.eta ? new Date(input.data.eta) : null;
      if (input.data.containerNumber !== undefined) updateData.containerNumber = input.data.containerNumber;
      if (input.data.cargoDescription !== undefined) updateData.vehicleDescription = input.data.cargoDescription;
      if (input.data.notes !== undefined) updateData.notes = input.data.notes;

      return service.updateBl(input.id, updateData, ctx.user.id);
    }),

  // ── Update BL status ────────────────────────────────────────
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: BlStatusEnum,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.updateBlStatus(input.id, input.status, ctx.user.id);
    }),

  // ── Activate tracking for BL ────────────────────────────────
  activateTracking: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      return service.activateTracking(input.id, ctx.user.id);
    }),

  // ── Deactivate tracking for BL ──────────────────────────────
  deactivateTracking: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.deactivateTracking(input.id, input.reason, ctx.user.id);
    }),

  // ── Link BL to vehicle and customer ─────────────────────────
  linkToVehicleAndCustomer: adminProcedure
    .input(
      z.object({
        blId: z.number().int().positive(),
        vehicleId: z.number().int().positive(),
        customerId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.linkBlToVehicleAndCustomer(
        input.blId,
        input.vehicleId,
        input.customerId,
        ctx.user.id
      );
    }),

  // ── Force update status (admin override, skip transition validation) ──
  forceUpdateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: BlStatusEnum,
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.forceUpdateBlStatus(input.id, input.status, input.reason, ctx.user.id);
    }),

  // ── Get status order (for UI dropdown) ──────────────────────
  getStatusOrder: adminProcedure.query(async () => {
    return service.getStatusOrder();
  }),

  // ── Add vehicle to BL (N:N junction) ───────────────────────
  addVehicle: adminProcedure
    .input(
      z.object({
        blId: z.number().int().positive(),
        vehicleId: z.number().int().positive(),
        customerId: z.number().int().positive().optional(),
        position: z.number().int().positive().optional(),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.addVehicleToBl(
        input.blId,
        input.vehicleId,
        input.customerId ?? null,
        input.position ?? null,
        input.notes ?? null,
        ctx.user.id
      );
    }),

  // ── Get vehicles for a BL ───────────────────────────────────
  getVehicles: adminProcedure
    .input(z.object({ blId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getVehiclesForBl(input.blId);
    }),

  // ── Remove vehicle from BL ──────────────────────────────────
  removeVehicle: adminProcedure
    .input(
      z.object({
        blId: z.number().int().positive(),
        vehicleId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await service.removeVehicleFromBl(input.blId, input.vehicleId, ctx.user.id);
      return { success: true };
    }),

  // ── Delete BL (soft) ────────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.deleteBl(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Count by status ─────────────────────────────────────────
  countByStatus: adminProcedure.query(async () => {
    return service.countBlsByStatus();
  }),

  // ── Count active ────────────────────────────────────────────
  count: adminProcedure.query(async () => {
    return service.countActiveBls();
  }),
});
