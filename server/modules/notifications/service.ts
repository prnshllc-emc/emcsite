/**
 * Stage Notification Service — Sends notifications when process stage changes.
 *
 * NOTIFICATION RULES:
 * - Has email → send email
 * - Has phone → send WhatsApp/SMS
 * - Has both → send both
 * - Has neither → flag for admin to correct (NOT a blocking error)
 *
 * Never "only if both exist". Any available channel is used.
 */

import { getDb } from "../../db";
import { customers } from "../../../drizzle/schema";
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { decryptSensitiveData } from "../../shared/security";
import { notifyOwner } from "../../_core/notification";
import { logAudit } from "../../shared/audit";
import type { ProcessStage } from "../reconciliation/service";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export type NotificationChannel = "email" | "whatsapp" | "admin_flag";

export interface StageNotificationTemplate {
  stage: ProcessStage;
  subject: string;
  emailBody: string;
  whatsappMessage: string;
}

export interface NotificationResult {
  customerId: number;
  customerName: string;
  channels: NotificationChannel[];
  sent: { channel: NotificationChannel; success: boolean; error?: string }[];
  flaggedForAdmin: boolean;
  flagReason?: string;
}

// ══════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATES PER STAGE
// ══════════════════════════════════════════════════════════════

const STAGE_TEMPLATES: Record<string, StageNotificationTemplate> = {
  aguardando_embarque: {
    stage: "aguardando_embarque",
    subject: "🚢 Seu veículo está aguardando embarque — Enviando Meu Carro",
    emailBody: `Olá {{name}},

Temos uma atualização sobre o transporte do seu veículo!

📋 Status atual: Aguardando Embarque
O seu veículo já está na fase de preparação para embarque. Em breve ele será carregado no container e seguirá viagem.

Acompanhe o status em tempo real pelo nosso sistema de rastreamento.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! 🚢

Atualização do seu veículo:
📋 *Status: Aguardando Embarque*

Seu veículo está em preparação para embarque. Em breve seguirá viagem!

Acompanhe pelo nosso rastreamento.
Equipe Enviando Meu Carro`,
  },

  fase_documental: {
    stage: "fase_documental",
    subject: "📄 Fase documental em andamento — Enviando Meu Carro",
    emailBody: `Olá {{name}},

Temos uma atualização sobre o transporte do seu veículo!

📋 Status atual: Fase Documental (Licença de Importação)
Estamos processando a documentação necessária para a importação do seu veículo. Esta fase inclui a obtenção da Licença de Importação (LI) e demais trâmites legais.

Assim que a documentação for concluída, seu veículo seguirá para a próxima etapa.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! 📄

Atualização do seu veículo:
📋 *Status: Fase Documental (LI)*

Estamos processando a documentação de importação. Em breve seguiremos para a próxima etapa!

Equipe Enviando Meu Carro`,
  },

  em_transito: {
    stage: "em_transito",
    subject: "🚢 Seu veículo está em trânsito! — Enviando Meu Carro",
    emailBody: `Olá {{name}},

Ótima notícia! Seu veículo está a caminho! 🎉

📋 Status atual: Em Trânsito
O container com seu veículo já embarcou e está navegando rumo ao destino. Você pode acompanhar o progresso em tempo real pelo nosso sistema de rastreamento.

Assim que o navio chegar ao porto de destino, você será notificado sobre as próximas etapas.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! 🚢🎉

Ótima notícia!
📋 *Status: Em Trânsito*

Seu veículo já embarcou e está a caminho! Acompanhe pelo nosso rastreamento.

Equipe Enviando Meu Carro`,
  },

  em_desembaraco: {
    stage: "em_desembaraco",
    subject: "🏗️ Seu veículo chegou ao porto! — Enviando Meu Carro",
    emailBody: `Olá {{name}},

Seu veículo chegou ao porto de destino! 🎉

📋 Status atual: Desembaraço Aduaneiro
O container já foi descarregado e estamos realizando o processo de desembaraço aduaneiro. Esta fase inclui a liberação alfandegária e inspeções necessárias.

Assim que o veículo for liberado, entraremos em contato para agendar a entrega.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! 🏗️🎉

Seu veículo chegou ao porto!
📋 *Status: Desembaraço Aduaneiro*

Estamos realizando a liberação alfandegária. Em breve agendaremos a entrega!

Equipe Enviando Meu Carro`,
  },

  concluido: {
    stage: "concluido",
    subject: "✅ Veículo entregue com sucesso! — Enviando Meu Carro",
    emailBody: `Olá {{name}},

Parabéns! Seu veículo foi entregue com sucesso! 🎉🚗

📋 Status atual: Concluído
O processo de transporte do seu veículo foi finalizado. Esperamos que tudo tenha atendido suas expectativas.

Se precisar de qualquer suporte adicional ou quiser importar/exportar outro veículo, conte conosco!

Obrigado por confiar na Enviando Meu Carro.

Atenciosamente,
Equipe Enviando Meu Carro
📞 WhatsApp: +55 11 99244-8920`,
    whatsappMessage: `Olá {{name}}! ✅🎉🚗

*Parabéns! Seu veículo foi entregue!*

Obrigado por confiar na Enviando Meu Carro. Precisando, conte conosco!

Equipe Enviando Meu Carro`,
  },
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
// SEND NOTIFICATION FOR A STAGE CHANGE
// ══════════════════════════════════════════════════════════════

export async function notifyCustomerStageChange(
  customerId: number,
  newStage: ProcessStage,
  adminUserId?: number
): Promise<NotificationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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

  const template = STAGE_TEMPLATES[newStage];
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

  // Send to each available channel
  for (const channel of channels) {
    try {
      if (channel === "email" && template) {
        const emailBody = template.emailBody.replace(/\{\{name\}\}/g, customerName);
        const subject = template.subject;

        // Use the built-in notification service to send email
        // In production, this would integrate with an email service (SendGrid, SES, etc.)
        // For now, we notify the owner with the email content for manual forwarding
        const success = await notifyOwner({
          title: `📧 Email para ${customerName}: ${subject}`,
          content: `Destinatário: ${email}\n\n${emailBody}`,
        });

        sent.push({ channel: "email", success });
      } else if (channel === "whatsapp" && template) {
        const whatsappMsg = template.whatsappMessage.replace(/\{\{name\}\}/g, customerName);

        // In production, this would integrate with WhatsApp Business API
        // For now, we notify the owner with the WhatsApp message for manual sending
        const success = await notifyOwner({
          title: `📱 WhatsApp para ${customerName} (${phone})`,
          content: whatsappMsg,
        });

        sent.push({ channel: "whatsapp", success });
      } else if (!template) {
        // No template for this stage — just log it
        sent.push({
          channel,
          success: false,
          error: `Sem template de notificação para o estágio "${newStage}"`,
        });
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
// CHECK CUSTOMERS MISSING CONTACT INFO (for admin dashboard)
// ══════════════════════════════════════════════════════════════

export async function findCustomersMissingContact(): Promise<
  { id: number; name: string; hasEmail: boolean; hasPhone: boolean }[]
> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(customers)
    .where(
      and(
        isNull(customers.deletedAt),
        // At least one contact field is null
      )
    );

  const results: { id: number; name: string; hasEmail: boolean; hasPhone: boolean }[] = [];

  for (const row of rows) {
    const hasEmail = row.email !== null && row.email.trim().length > 0;
    const hasPhone = row.phone !== null && row.phone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      results.push({
        id: row.id,
        name: row.name,
        hasEmail,
        hasPhone,
      });
    }
  }

  return results;
}

// ══════════════════════════════════════════════════════════════
// GET AVAILABLE TEMPLATES (for admin UI)
// ══════════════════════════════════════════════════════════════

export function getNotificationTemplates(): StageNotificationTemplate[] {
  return Object.values(STAGE_TEMPLATES);
}
