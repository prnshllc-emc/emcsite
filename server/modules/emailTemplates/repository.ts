/**
 * Email Templates Repository — CRUD operations for email_templates table.
 */

import { getDb } from "../../db";
import { emailTemplates } from "../../../drizzle/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import type { EmailTemplate, InsertEmailTemplate } from "../../../drizzle/schema";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export type EmailTemplateRecord = EmailTemplate;

export type CreateEmailTemplateInput = {
  slug: string;
  name: string;
  description?: string | null;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  whatsappMessage?: string | null;
  category: "stage_change" | "tracking" | "onboarding" | "system" | "marketing";
  availableVariables?: string | null; // JSON array string
  isActive?: boolean;
  isDefault?: boolean;
  updatedBy?: number | null;
};

export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

// ══════════════════════════════════════════════════════════════
// LIST ALL
// ══════════════════════════════════════════════════════════════

export async function listEmailTemplates(): Promise<EmailTemplateRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt));
}

// ══════════════════════════════════════════════════════════════
// GET BY ID
// ══════════════════════════════════════════════════════════════

export async function getEmailTemplateById(id: number): Promise<EmailTemplateRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return row ?? null;
}

// ══════════════════════════════════════════════════════════════
// GET BY SLUG
// ══════════════════════════════════════════════════════════════

export async function getEmailTemplateBySlug(slug: string): Promise<EmailTemplateRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(emailTemplates).where(eq(emailTemplates.slug, slug)).limit(1);
  return row ?? null;
}

// ══════════════════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════════════════

export async function createEmailTemplate(input: CreateEmailTemplateInput): Promise<EmailTemplateRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(emailTemplates).values({
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    subject: input.subject,
    bodyHtml: input.bodyHtml,
    bodyText: input.bodyText ?? null,
    whatsappMessage: input.whatsappMessage ?? null,
    category: input.category,
    availableVariables: input.availableVariables ?? null,
    isActive: input.isActive ?? true,
    isDefault: input.isDefault ?? false,
    updatedBy: input.updatedBy ?? null,
  });

  const insertId = result.insertId;
  const created = await getEmailTemplateById(insertId);
  if (!created) throw new Error("Failed to create email template");
  return created;
}

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════

export async function updateEmailTemplate(
  id: number,
  input: UpdateEmailTemplateInput
): Promise<EmailTemplateRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {};
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.subject !== undefined) updateData.subject = input.subject;
  if (input.bodyHtml !== undefined) updateData.bodyHtml = input.bodyHtml;
  if (input.bodyText !== undefined) updateData.bodyText = input.bodyText;
  if (input.whatsappMessage !== undefined) updateData.whatsappMessage = input.whatsappMessage;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.availableVariables !== undefined) updateData.availableVariables = input.availableVariables;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy;

  if (Object.keys(updateData).length === 0) return getEmailTemplateById(id);

  await db.update(emailTemplates).set(updateData).where(eq(emailTemplates.id, id));
  return getEmailTemplateById(id);
}

// ══════════════════════════════════════════════════════════════
// DELETE (only non-default templates)
// ══════════════════════════════════════════════════════════════

export async function deleteEmailTemplate(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Check if it's a default template
  const template = await getEmailTemplateById(id);
  if (!template) return false;
  if (template.isDefault) {
    throw new Error("Não é possível excluir templates padrão do sistema.");
  }

  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  return true;
}

// ══════════════════════════════════════════════════════════════
// GET ACTIVE TEMPLATE BY SLUG (for sending)
// ══════════════════════════════════════════════════════════════

export async function getActiveTemplateBySlug(slug: string): Promise<EmailTemplateRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(emailTemplates)
    .where(and(eq(emailTemplates.slug, slug), eq(emailTemplates.isActive, true)))
    .limit(1);
  return row ?? null;
}
