/**
 * Stage Notification Service — Sends notifications when process stage changes.
 *
 * NOTIFICATION RULES:
 * - Has email → send email
 * - Has phone → send WhatsApp (via Meta Cloud API)
 * - Has both → send both
 * - Has neither → flag for admin to correct (NOT a blocking error)
 *
 * Uses DB-based email templates from the emailTemplates module.
 * Falls back to hardcoded templates if DB template is not found.
 *
 * WhatsApp: Uses real Meta Cloud API when configured (WHATSAPP_TOKEN set).
 * Falls back to notifyOwner for manual sending when not configured.
 */

import { getDb } from "../../db";
import { customers } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { decryptSensitiveData } from "../../shared/security";
import { notifyOwner } from "../../_core/notification";
import { logAudit } from "../../shared/audit";
import {
  getActiveTemplateBySlug,
  renderTemplate,
  seedDefaultTemplates,
} from "../emailTemplates/service";
import {
  isWhatsAppConfigured,
  sendTemplateMessage,
  sendTextMessage,
} from "../whatsapp/service";
import type { ProcessStage } from "../reconciliation/service";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export type NotificationChannel = "email" | "whatsapp" | "admin_flag";

export interface NotificationResult {
  customerId: number;
  customerName: string;
  channels: NotificationChannel[];
  sent: { channel: NotificationChannel; success: boolean; error?: string }[];
  flaggedForAdmin: boolean;
  flagReason?: string;
}

// ══════════════════════════════════════════════════════════════
// STAGE → TEMPLATE SLUG MAPPING
// ══════════════════════════════════════════════════════════════

const STAGE_TO_SLUG: Record<string, string> = {
  aguardando_embarque: "stage_aguardando_embarque",
  em_transito: "stage_em_transito",
  fase_documental: "stage_fase_documental",
  em_desembaraco: "stage_em_desembaraco",
  concluido: "stage_concluido",
};

// Stage → Meta-approved WhatsApp template name mapping
// These must match the template names approved in Meta Business Manager
const STAGE_TO_WA_TEMPLATE: Record<string, string> = {
  aguardando_embarque: "emc_stage_aguardando_embarque",
  em_transito: "emc_stage_em_transito",
  fase_documental: "emc_stage_fase_documental",
  em_desembaraco: "emc_stage_em_desembaraco",
  concluido: "emc_stage_concluido",
};

// ══════════════════════════════════════════════════════════════
// DETERMINE NOTIFICATION CHANNELS
// ══════════════════════════════════════════════════════════════

export function determineChannels(
  email: string | null,
  phone: string | null
): { channels: NotificationChannel[]; flagForAdmin: boolean; flagReason?: string } {
  const channels: NotificationChannel[] = [];

  if (email && email.trim().length > 0) {
    channels.push("email");
  }

  if (phone && phone.trim().length > 0) {
    channels.push("whatsapp");
  }

  if (channels.length === 0) {
    return {
      channels: ["admin_flag"],
      flagForAdmin: true,
      flagReason: "Cliente sem email e sem telefone cadastrado. Impossível notificar.",
    };
  }

  return { channels, flagForAdmin: false };
}

// ══════════════════════════════════════════════════════════════
// SEND WHATSAPP — Real API or fallback to notifyOwner
// ══════════════════════════════════════════════════════════════

async function sendWhatsApp(opts: {
  phone: string;
  customerName: string;
  message: string;
  metaTemplateName?: string;
  customerId?: number;
  blId?: number;
  triggerEvent?: string;
}): Promise<boolean> {
  if (isWhatsAppConfigured() && opts.metaTemplateName) {
    // Use real Meta Cloud API with template message
    const result = await sendTemplateMessage({
      to: opts.phone,
      templateName: opts.metaTemplateName,
      languageCode: "pt_BR",
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: opts.customerName }],
        },
      ],
      customerId: opts.customerId,
      blId: opts.blId,
      triggerEvent: opts.triggerEvent,
    });
    return result.success;
  } else if (isWhatsAppConfigured()) {
    // Use real Meta Cloud API with text message (within service window)
    const result = await sendTextMessage({
      to: opts.phone,
      body: opts.message,
      customerId: opts.customerId,
      blId: opts.blId,
      triggerEvent: opts.triggerEvent,
    });
    return result.success;
  } else {
    // Fallback: notify owner for manual sending
    return notifyOwner({
      title: `📱 WhatsApp para ${opts.customerName} (${opts.phone})`,
      content: opts.message,
    });
  }
}

// ══════════════════════════════════════════════════════════════
// SEND NOTIFICATION FOR A STAGE CHANGE
// ══════════════════════════════════════════════════════════════

export async function notifyCustomerStageChange(
  customerId: number,
  newStage: ProcessStage,
  adminUserId?: number,
  extraVars?: Record<string, string>
): Promise<NotificationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Ensure default templates exist
  await seedDefaultTemplates();

  // Get customer data
  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) throw new Error("Cliente não encontrado");

  // Decrypt PII
  let email: string | null = null;
  let phone: string | null = null;
  try {
    email = customerRow.email ? decryptSensitiveData(customerRow.email) : null;
  } catch {}
  try {
    phone = customerRow.phone ? decryptSensitiveData(customerRow.phone) : null;
  } catch {}

  const customerName = customerRow.name;

  // Determine channels
  const { channels, flagForAdmin, flagReason } = determineChannels(email, phone);

  const sent: { channel: NotificationChannel; success: boolean; error?: string }[] = [];

  if (flagForAdmin) {
    // Notify admin about the missing contact info
    await notifyOwner({
      title: `⚠️ Cliente sem contato: ${customerName}`,
      content: `O cliente ${customerName} (ID: ${customerId}) mudou para o estágio "${newStage}" mas não possui email nem telefone cadastrado. Não foi possível enviar notificação automática. Por favor, corrija os dados de contato no painel admin.`,
    });

    sent.push({ channel: "admin_flag", success: true });

    await logAudit({
      userId: adminUserId ?? null,
      action: "create",
      entity: "notification",
      entityId: customerId,
      changes: {
        stage: { before: null, after: newStage },
        flagForAdmin: { before: null, after: flagReason },
      },
    });

    return {
      customerId,
      customerName,
      channels,
      sent,
      flaggedForAdmin: true,
      flagReason,
    };
  }

  // Get the DB template for this stage
  const slug = STAGE_TO_SLUG[newStage];
  const dbTemplate = slug ? await getActiveTemplateBySlug(slug) : null;

  // Build template variables
  const variables: Record<string, string | undefined> = {
    name: customerName,
    ...(extraVars ?? {}),
  };

  // Send to each available channel
  for (const channel of channels) {
    try {
      if (channel === "email") {
        let subject: string;
        let emailBody: string;

        if (dbTemplate) {
          subject = renderTemplate(dbTemplate.subject, variables);
          emailBody = renderTemplate(dbTemplate.bodyHtml, variables);
        } else {
          subject = `Atualização do seu veículo — Estágio: ${newStage}`;
          emailBody = `Olá ${customerName},\n\nSeu processo mudou para o estágio: ${newStage}.\n\nAtenciosamente,\nEquipe Enviando Meu Carro`;
        }

        // Use the built-in notification service to send email
        const success = await notifyOwner({
          title: `📧 Email para ${customerName}: ${subject}`,
          content: `Destinatário: ${email}\n\nAssunto: ${subject}\n\n${dbTemplate ? "[Template DB: " + dbTemplate.slug + "]\n\n" : ""}${emailBody}`,
        });

        sent.push({ channel: "email", success });
      } else if (channel === "whatsapp") {
        let whatsappMsg: string;

        if (dbTemplate?.whatsappMessage) {
          whatsappMsg = renderTemplate(dbTemplate.whatsappMessage, variables);
        } else {
          whatsappMsg = `Olá ${customerName}! Seu processo mudou para: ${newStage}. Equipe Enviando Meu Carro`;
        }

        const success = await sendWhatsApp({
          phone: phone!,
          customerName,
          message: whatsappMsg,
          metaTemplateName: STAGE_TO_WA_TEMPLATE[newStage],
          customerId,
          triggerEvent: `stage_change_${newStage}`,
        });

        sent.push({ channel: "whatsapp", success });
      }
    } catch (err) {
      sent.push({
        channel,
        success: false,
        error: (err as Error).message,
      });
    }
  }

  // Audit log
  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "notification",
    entityId: customerId,
    changes: {
      stage: { before: null, after: newStage },
      channels: { before: null, after: channels },
      templateSlug: { before: null, after: slug ?? "fallback" },
      results: { before: null, after: sent },
    },
  });

  return {
    customerId,
    customerName,
    channels,
    sent,
    flaggedForAdmin: false,
  };
}

// ══════════════════════════════════════════════════════════════
// SEND NOTIFICATION FOR TRACKING CODE APPROVAL
// ══════════════════════════════════════════════════════════════

export async function notifyTrackingCodeApproved(
  customerId: number,
  trackingCode: string,
  adminUserId?: number
): Promise<NotificationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await seedDefaultTemplates();

  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) throw new Error("Cliente não encontrado");

  let email: string | null = null;
  let phone: string | null = null;
  try {
    email = customerRow.email ? decryptSensitiveData(customerRow.email) : null;
  } catch {}
  try {
    phone = customerRow.phone ? decryptSensitiveData(customerRow.phone) : null;
  } catch {}

  const customerName = customerRow.name;
  const { channels, flagForAdmin, flagReason } = determineChannels(email, phone);
  const sent: { channel: NotificationChannel; success: boolean; error?: string }[] = [];

  if (flagForAdmin) {
    await notifyOwner({
      title: `⚠️ Tracking code aprovado mas sem contato: ${customerName}`,
      content: `O código ${trackingCode} foi aprovado para ${customerName} (ID: ${customerId}) mas não foi possível notificar — sem email/telefone.`,
    });
    sent.push({ channel: "admin_flag", success: true });
    return { customerId, customerName, channels, sent, flaggedForAdmin: true, flagReason };
  }

  const dbTemplate = await getActiveTemplateBySlug("tracking_code_approved");
  const variables: Record<string, string | undefined> = {
    name: customerName,
    trackingCode,
  };

  for (const channel of channels) {
    try {
      if (channel === "email") {
        let subject: string;
        let emailBody: string;

        if (dbTemplate) {
          subject = renderTemplate(dbTemplate.subject, variables);
          emailBody = renderTemplate(dbTemplate.bodyHtml, variables);
        } else {
          subject = `🔑 Seu código de rastreamento: ${trackingCode}`;
          emailBody = `Olá ${customerName},\n\nSeu código de rastreamento foi aprovado: ${trackingCode}\n\nUse-o para acompanhar seu veículo.\n\nEquipe Enviando Meu Carro`;
        }

        const success = await notifyOwner({
          title: `📧 Tracking Code para ${customerName}: ${subject}`,
          content: `Destinatário: ${email}\n\n${emailBody}`,
        });
        sent.push({ channel: "email", success });
      } else if (channel === "whatsapp") {
        let whatsappMsg: string;
        if (dbTemplate?.whatsappMessage) {
          whatsappMsg = renderTemplate(dbTemplate.whatsappMessage, variables);
        } else {
          whatsappMsg = `Olá ${customerName}! 🔑 Seu código de rastreamento: ${trackingCode}. Use para acompanhar seu veículo.`;
        }

        const success = await sendWhatsApp({
          phone: phone!,
          customerName,
          message: whatsappMsg,
          metaTemplateName: "emc_tracking_code_approved",
          customerId,
          triggerEvent: "tracking_code_approved",
        });

        sent.push({ channel: "whatsapp", success });
      }
    } catch (err) {
      sent.push({ channel, success: false, error: (err as Error).message });
    }
  }

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "notification",
    entityId: customerId,
    changes: {
      event: { before: null, after: "tracking_code_approved" },
      trackingCode: { before: null, after: trackingCode },
      channels: { before: null, after: channels },
    },
  });

  return { customerId, customerName, channels, sent, flaggedForAdmin: false };
}

// ══════════════════════════════════════════════════════════════
// SEND GENERIC NOTIFICATION USING A TEMPLATE SLUG
// ══════════════════════════════════════════════════════════════

export async function sendTemplateNotification(
  customerId: number,
  templateSlug: string,
  variables: Record<string, string | undefined>,
  adminUserId?: number
): Promise<NotificationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await seedDefaultTemplates();

  const [customerRow] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customerRow) throw new Error("Cliente não encontrado");

  let email: string | null = null;
  let phone: string | null = null;
  try {
    email = customerRow.email ? decryptSensitiveData(customerRow.email) : null;
  } catch {}
  try {
    phone = customerRow.phone ? decryptSensitiveData(customerRow.phone) : null;
  } catch {}

  const customerName = customerRow.name;
  const vars = { name: customerName, ...variables };
  const { channels, flagForAdmin, flagReason } = determineChannels(email, phone);
  const sent: { channel: NotificationChannel; success: boolean; error?: string }[] = [];

  if (flagForAdmin) {
    await notifyOwner({
      title: `⚠️ Notificação não enviada: ${customerName}`,
      content: `Template "${templateSlug}" para ${customerName} (ID: ${customerId}) — sem contato.`,
    });
    sent.push({ channel: "admin_flag", success: true });
    return { customerId, customerName, channels, sent, flaggedForAdmin: true, flagReason };
  }

  const dbTemplate = await getActiveTemplateBySlug(templateSlug);
  if (!dbTemplate) {
    throw new Error(`Template "${templateSlug}" não encontrado ou inativo.`);
  }

  for (const channel of channels) {
    try {
      if (channel === "email") {
        const subject = renderTemplate(dbTemplate.subject, vars);
        const emailBody = renderTemplate(dbTemplate.bodyHtml, vars);
        const success = await notifyOwner({
          title: `📧 ${subject}`,
          content: `Destinatário: ${email}\n\n${emailBody}`,
        });
        sent.push({ channel: "email", success });
      } else if (channel === "whatsapp") {
        let whatsappMsg: string;
        if (dbTemplate.whatsappMessage) {
          whatsappMsg = renderTemplate(dbTemplate.whatsappMessage, vars);
        } else {
          whatsappMsg = `Notificação: ${renderTemplate(dbTemplate.subject, vars)}`;
        }

        const success = await sendWhatsApp({
          phone: phone!,
          customerName,
          message: whatsappMsg,
          // For generic templates, use text message (no Meta template mapping)
          customerId,
          triggerEvent: `template_${templateSlug}`,
        });

        sent.push({ channel: "whatsapp", success });
      }
    } catch (err) {
      sent.push({ channel, success: false, error: (err as Error).message });
    }
  }

  await logAudit({
    userId: adminUserId ?? null,
    action: "create",
    entity: "notification",
    entityId: customerId,
    changes: {
      templateSlug: { before: null, after: templateSlug },
      channels: { before: null, after: channels },
    },
  });

  return { customerId, customerName, channels, sent, flaggedForAdmin: false };
}

// ══════════════════════════════════════════════════════════════
// CHECK CUSTOMERS MISSING CONTACT INFO (for admin dashboard)
// ══════════════════════════════════════════════════════════════

export async function findCustomersMissingContact(): Promise<
  { id: number; name: string; hasEmail: boolean; hasPhone: boolean }[]
> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
    })
    .from(customers)
    .where(eq(customers.deletedAt, null as unknown as Date));

  return rows
    .filter((r) => !r.email || !r.phone)
    .map((r) => ({
      id: r.id,
      name: r.name,
      hasEmail: !!r.email,
      hasPhone: !!r.phone,
    }));
}
