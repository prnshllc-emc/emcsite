/**
 * Customers Router — tRPC procedures for customer management.
 * All endpoints require admin role.
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
  CustomerStatusEnum,
  PaginatedQuerySchema,
} from "@shared/schemas";
import * as service from "./service";

export const customersRouter = router({
  // ── List customers (paginated, with optional status filter) ──
  list: adminProcedure
    .input(
      PaginatedQuerySchema.extend({
        statusFilter: CustomerStatusEnum.optional(),
      })
    )
    .query(async ({ input }) => {
      return service.listCustomers(input);
    }),

  // ── List all active (no pagination, for dropdowns) ──────────
  listAll: adminProcedure.query(async () => {
    return service.listAllActiveCustomers();
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
          status: input.status,
          tipoOperacao: input.tipoOperacao ?? undefined,
          dataSource: input.dataSource,
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
          status: input.data.status ?? undefined,
          tipoOperacao: input.data.tipoOperacao ?? undefined,
        },
        ctx.user.id
      );
    }),

  // ── Update status only ──────────────────────────────────────
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: CustomerStatusEnum,
      })
    )
    .mutation(async ({ input, ctx }) => {
      await service.updateCustomerStatus(input.id, input.status, ctx.user.id);
      return { success: true };
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

  // ── Count by status ─────────────────────────────────────────
  countByStatus: adminProcedure.query(async () => {
    return service.countByStatus();
  }),
});
