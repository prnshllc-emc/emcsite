/**
 * Customers Router — tRPC procedures for customer management.
 * All endpoints require admin role.
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
  PaginatedQuerySchema,
} from "@shared/schemas";
import * as service from "./service";

export const customersRouter = router({
  // ── List customers (paginated) ──────────────────────────────
  list: adminProcedure
    .input(PaginatedQuerySchema)
    .query(async ({ input }) => {
      return service.listCustomers(input);
    }),

  // ── Get customer by ID ──────────────────────────────────────
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const customer = await service.getCustomerById(input.id);
      if (!customer) throw new Error("Cliente não encontrado.");
      return customer;
    }),

  // ── Search by CPF ───────────────────────────────────────────
  getByCpf: adminProcedure
    .input(z.object({ cpf: z.string() }))
    .query(async ({ input }) => {
      return service.getCustomerByCpf(input.cpf);
    }),

  // ── Create customer ─────────────────────────────────────────
  create: adminProcedure
    .input(CustomerCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return service.createCustomer(
        {
          cpf: input.cpf,
          fullName: input.fullName,
          email: input.email ?? undefined,
          phone: input.phone ?? undefined,
        },
        ctx.user.id
      );
    }),

  // ── Update customer ─────────────────────────────────────────
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: CustomerUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return service.updateCustomer(
        input.id,
        {
          fullName: input.data.fullName ?? undefined,
          email: input.data.email ?? undefined,
          phone: input.data.phone ?? undefined,
          cpf: input.data.cpf ?? undefined,
        },
        ctx.user.id
      );
    }),

  // ── Deactivate customer ─────────────────────────────────────
  deactivate: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.deactivateCustomer(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Reactivate customer ─────────────────────────────────────
  reactivate: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await service.reactivateCustomer(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Count active ────────────────────────────────────────────
  count: adminProcedure.query(async () => {
    return service.countActiveCustomers();
  }),
});
