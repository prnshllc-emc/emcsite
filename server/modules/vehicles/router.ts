/**
 * Vehicles Router — tRPC procedures for vehicle management.
 * All endpoints require admin role.
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  VehicleCreateSchema,
  VehicleUpdateSchema,
  PaginatedQuerySchema,
} from "@shared/schemas";
import * as service from "./service";

export const vehiclesRouter = router({
  // ── List vehicles (paginated) ───────────────────────────────
  list: adminProcedure
    .input(PaginatedQuerySchema)
    .query(async ({ input }) => {
      return service.listVehicles(input);
    }),

  // ── List all active (no pagination, for dropdowns) ──────────
  listAll: adminProcedure.query(async () => {
    return service.listAllActiveVehicles();
  }),

  // ── Get vehicle by ID ───────────────────────────────────────
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const vehicle = await service.getVehicleById(input.id);
      if (!vehicle) throw new Error("Veículo não encontrado.");
      return vehicle;
    }),

  // ── Search by VIN ───────────────────────────────────────────
  getByVin: adminProcedure
    .input(z.object({ vin: z.string() }))
    .query(async ({ input }) => {
      return service.getVehicleByVin(input.vin);
    }),

  // ── Get vehicles by customer ────────────────────────────────
  getByCustomer: adminProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return service.getVehiclesByCustomerId(input.customerId);
    }),

  // ── Create vehicle ──────────────────────────────────────────
  create: adminProcedure
    .input(VehicleCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return service.createVehicle(
        {
          vin: input.vin,
          make: input.make,
          model: input.model,
          year: input.year,
          color: input.color,
          customerId: input.customerId,
        },
        ctx.user.id
      );
    }),

  // ── Update vehicle ──────────────────────────────────────────
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: VehicleUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.updateVehicle(
        input.id,
        {
          vin: input.data.vin ?? undefined,
          make: input.data.make ?? undefined,
          model: input.data.model ?? undefined,
          year: input.data.year,
          color: input.data.color,
          customerId: input.data.customerId,
        },
        ctx.user.id
      );
    }),

  // ── Deactivate vehicle ──────────────────────────────────────
  deactivate: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.deactivateVehicle(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Link vehicle to customer ────────────────────────────────
  linkToCustomer: adminProcedure
    .input(
      z.object({
        vehicleId: z.number().int().positive(),
        customerId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await service.linkVehicleToCustomer(
        input.vehicleId,
        input.customerId,
        ctx.user.id
      );
      return { success: true };
    }),

  // ── Count active ────────────────────────────────────────────
  count: adminProcedure.query(async () => {
    return service.countActiveVehicles();
  }),
});
