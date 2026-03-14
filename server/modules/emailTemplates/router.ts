/**
 * Email Templates Router — Admin CRUD for email templates.
 */

import { z } from "zod";
import { protectedProcedure } from "../../_core/trpc";
import { router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  listEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  seedDefaultTemplates,
  renderTemplate,
} from "./service";
import { logAudit } from "../../shared/audit";

// ══════════════════════════════════════════════════════════════
// ADMIN-ONLY GUARD
// ══════════════════════════════════════════════════════════════

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem gerenciar templates." });
  }
  return next({ ctx });
});

// ══════════════════════════════════════════════════════════════
// SCHEMAS
// ══════════════════════════════════════════════════════════════

const categoryEnum = z.enum(["stage_change", "tracking", "onboarding", "system", "marketing"]);

const createSchema = z.object({
  slug: z.string().min(1).max(128).regex(/^[a-z0-9_]+$/, "Slug deve conter apenas letras minúsculas, números e underscores"),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(500),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional().nullable(),
  whatsappMessage: z.string().optional().nullable(),
  category: categoryEnum,
  availableVariables: z.string().optional().nullable(),
});

const updateSchema = z.object({
  id: z.number(),
  slug: z.string().min(1).max(128).regex(/^[a-z0-9_]+$/).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(500).optional(),
  bodyHtml: z.string().min(1).optional(),
  bodyText: z.string().optional().nullable(),
  whatsappMessage: z.string().optional().nullable(),
  category: categoryEnum.optional(),
  availableVariables: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const previewSchema = z.object({
  bodyHtml: z.string(),
  variables: z.record(z.string(), z.string()),
});

// ══════════════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════════════

export const emailTemplatesRouter = router({
  /** List all email templates (seeds defaults on first call) */
  list: adminProcedure.query(async () => {
    await seedDefaultTemplates();
    return listEmailTemplates();
  }),

  /** Get single template by ID */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = await getEmailTemplateById(input.id);
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template não encontrado." });
      return template;
    }),

  /** Create a new email template */
  create: adminProcedure
    .input(createSchema)
    .mutation(async ({ input, ctx }) => {
      const created = await createEmailTemplate({
        ...input,
        updatedBy: ctx.user.id,
      });

      await logAudit({
        userId: ctx.user.id,
        action: "create",
        entity: "email_template",
        entityId: created.id,
        changes: { slug: { before: null, after: input.slug as unknown } },
      });

      return created;
    }),

  /** Update an existing email template */
  update: adminProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const updated = await updateEmailTemplate(id, {
        ...data,
        updatedBy: ctx.user.id,
      });

      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Template não encontrado." });

      await logAudit({
        userId: ctx.user.id,
        action: "update",
        entity: "email_template",
        entityId: id,
        changes: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, { before: null, after: v }])
        ),
      });

      return updated;
    }),

  /** Delete a non-default email template */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await deleteEmailTemplate(input.id);
        if (!success) throw new TRPCError({ code: "NOT_FOUND", message: "Template não encontrado." });

        await logAudit({
          userId: ctx.user.id,
          action: "delete",
          entity: "email_template",
          entityId: input.id,
          changes: {},
        });

        return { success: true };
      } catch (err) {
        if ((err as Error).message.includes("padrão")) {
          throw new TRPCError({ code: "FORBIDDEN", message: (err as Error).message });
        }
        throw err;
      }
    }),

  /** Preview rendered template with sample variables */
  preview: adminProcedure
    .input(previewSchema)
    .mutation(async ({ input }) => {
      const vars: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(input.variables)) {
        vars[k] = typeof v === "string" ? v : undefined;
      }
      const rendered = renderTemplate(input.bodyHtml, vars);
      return { html: rendered };
    }),
});
