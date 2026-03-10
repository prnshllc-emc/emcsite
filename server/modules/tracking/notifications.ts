/**
 * Tracking Notifications — Centralized notification logic for tracking events.
 *
 * Sends notifications to the project owner when important tracking events occur.
 * Also prepares WhatsApp message templates for manual or automated sending.
 *
 * Notification channels:
 * 1. Manus Owner Notification (built-in) — immediate push to project owner
 * 2. WhatsApp message templates — formatted messages ready to send via WhatsApp API
 */
import { notifyOwner } from "../../_core/notification";
import * as blRepo from "../bls/repository";
import * as customerRepo from "../customers/repository";

// ── Event importance levels ─────────────────────────────────
const EVENT_IMPORTANCE: Record<string, "critical" | "high" | "normal" | "low"> = {
  delivered: "critical",
  alert: "critical",
  delay: "critical",
  arrived: "high",
  customs: "high",
  in_transit: "high",
  final: "normal",
  draft: "low",
  info: "low",
};

// ── Status labels in Portuguese ─────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "BL Draft Recebido",
  final: "BL Final Recebido",
  in_transit: "Em Trânsito Marítimo",
  arrived: "Chegada ao Porto de Destino",
  customs: "Desembaraço Aduaneiro",
  delivered: "Veículo Entregue",
  info: "Informação",
  alert: "Alerta",
  delay: "Atraso Detectado",
};

// ── Emoji per status ────────────────────────────────────────
const STATUS_EMOJI: Record<string, string> = {
  draft: "📄",
  final: "📋",
  in_transit: "🚢",
  arrived: "⚓",
  customs: "🏛️",
  delivered: "✅",
  info: "ℹ️",
  alert: "⚠️",
  delay: "⏰",
};

// ══════════════════════════════════════════════════════════════
// OWNER NOTIFICATIONS (Manus built-in)
// ══════════════════════════════════════════════════════════════

export interface TrackingEventNotification {
  blId: number;
  blNumber: string;
  eventType: string;
  title: string;
  description?: string | null;
  location?: string | null;
  eventDate: Date;
  vehicleDescription?: string | null;
  customerName?: string | null;
}

/**
 * Notify the project owner about a tracking event.
 * Only sends for events with importance >= "normal".
 * Fire-and-forget — errors are logged but don't propagate.
 */
export async function notifyOwnerAboutEvent(
  event: TrackingEventNotification
): Promise<void> {
  const importance = EVENT_IMPORTANCE[event.eventType] ?? "low";

  // Skip low-importance events for owner notifications
  if (importance === "low") return;

  const emoji = STATUS_EMOJI[event.eventType] ?? "📦";
  const statusLabel = STATUS_LABELS[event.eventType] ?? event.eventType;

  const title = `${emoji} ${statusLabel} — BL ${event.blNumber}`;

  const contentLines = [
    `BL: ${event.blNumber}`,
    `Evento: ${event.title}`,
  ];

  if (event.vehicleDescription) {
    contentLines.push(`Veículo: ${event.vehicleDescription}`);
  }
  if (event.customerName) {
    contentLines.push(`Cliente: ${event.customerName}`);
  }
  if (event.location) {
    contentLines.push(`Local: ${event.location}`);
  }
  contentLines.push(`Data: ${event.eventDate.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);

  if (event.description) {
    contentLines.push("", event.description);
  }

  if (importance === "critical") {
    contentLines.push("", "⚡ AÇÃO PODE SER NECESSÁRIA");
  }

  try {
    await notifyOwner({
      title,
      content: contentLines.join("\n"),
    });
  } catch (err) {
    console.error("[Tracking Notifications] Failed to notify owner:", err);
  }
}

// ══════════════════════════════════════════════════════════════
// WHATSAPP MESSAGE TEMPLATES
// ══════════════════════════════════════════════════════════════

export interface WhatsAppMessage {
  to: string; // phone number
  text: string;
}

/**
 * Generate a WhatsApp message for a tracking event.
 * Returns null if the customer doesn't have a phone number.
 */
export async function generateWhatsAppMessage(
  event: TrackingEventNotification & { customerId?: number }
): Promise<WhatsAppMessage | null> {
  // Only send WhatsApp for important events
  const importance = EVENT_IMPORTANCE[event.eventType] ?? "low";
  if (importance === "low") return null;

  // Get customer phone
  if (!event.customerId) return null;
  const customer = await customerRepo.findCustomerById(event.customerId);
  if (!customer?.phone) return null;

  const emoji = STATUS_EMOJI[event.eventType] ?? "📦";
  const statusLabel = STATUS_LABELS[event.eventType] ?? event.eventType;

  const lines = [
    `${emoji} *EMC — Atualização de Envio*`,
    "",
    `*Status:* ${statusLabel}`,
    `*BL:* ${event.blNumber}`,
  ];

  if (event.vehicleDescription) {
    lines.push(`*Veículo:* ${event.vehicleDescription}`);
  }
  if (event.location) {
    lines.push(`*Local:* ${event.location}`);
  }

  lines.push(`*Data:* ${event.eventDate.toLocaleDateString("pt-BR")}`);

  if (event.description) {
    lines.push("", event.description);
  }

  lines.push(
    "",
    "Acompanhe seu envio em tempo real:",
    "🔗 https://enviandomeucarro.com/rastrear",
    "",
    "_EMC — Enviando Meu Carro_",
    "_O Jeito Mais Rápido, Seguro e Simples_"
  );

  return {
    to: customer.phone,
    text: lines.join("\n"),
  };
}

// ══════════════════════════════════════════════════════════════
// COMBINED NOTIFICATION DISPATCHER
// ══════════════════════════════════════════════════════════════

/**
 * Dispatch all notifications for a tracking event.
 * Sends to owner (Manus notification) and prepares WhatsApp message.
 * Returns the WhatsApp message if generated (for future API integration).
 */
export async function dispatchEventNotifications(
  event: TrackingEventNotification & { customerId?: number }
): Promise<{ ownerNotified: boolean; whatsAppMessage: WhatsAppMessage | null }> {
  const results = {
    ownerNotified: false,
    whatsAppMessage: null as WhatsAppMessage | null,
  };

  // 1. Notify owner (fire-and-forget)
  try {
    await notifyOwnerAboutEvent(event);
    results.ownerNotified = true;
  } catch {
    results.ownerNotified = false;
  }

  // 2. Generate WhatsApp message (for future integration)
  try {
    results.whatsAppMessage = await generateWhatsAppMessage(event);
  } catch (err) {
    console.error("[Tracking Notifications] WhatsApp message generation error:", err);
  }

  // TODO: When WhatsApp Business API is integrated, send the message here:
  // if (results.whatsAppMessage) {
  //   await sendWhatsAppMessage(results.whatsAppMessage);
  // }

  return results;
}

// ══════════════════════════════════════════════════════════════
// NOTIFICATION FOR NEW TRACKING CODE
// ══════════════════════════════════════════════════════════════

/**
 * Notify about a new tracking code being generated.
 * Sends to owner and generates WhatsApp message with the code.
 */
export async function notifyNewTrackingCode(params: {
  blNumber: string;
  trackingCode: string;
  customerName: string;
  customerId: number;
  vehicleDescription?: string | null;
}): Promise<WhatsAppMessage | null> {
  // Notify owner
  try {
    await notifyOwner({
      title: `🔑 Novo Código de Rastreamento — BL ${params.blNumber}`,
      content: [
        `BL: ${params.blNumber}`,
        `Código: ${params.trackingCode}`,
        `Cliente: ${params.customerName}`,
        params.vehicleDescription ? `Veículo: ${params.vehicleDescription}` : null,
        "",
        "O cliente pode usar este código em https://enviandomeucarro.com/rastrear",
      ].filter(Boolean).join("\n"),
    });
  } catch (err) {
    console.error("[Tracking Notifications] Failed to notify about new code:", err);
  }

  // Generate WhatsApp message for the customer
  const customer = await customerRepo.findCustomerById(params.customerId);
  if (!customer?.phone) return null;

  const message: WhatsAppMessage = {
    to: customer.phone,
    text: [
      "🔑 *EMC — Seu Código de Rastreamento*",
      "",
      `Olá, ${params.customerName.split(" ")[0]}!`,
      "",
      "Seu código de rastreamento está pronto:",
      `*${params.trackingCode}*`,
      "",
      params.vehicleDescription ? `Veículo: ${params.vehicleDescription}` : null,
      `BL: ${params.blNumber}`,
      "",
      "Acompanhe seu envio em tempo real:",
      "🔗 https://enviandomeucarro.com/rastrear",
      "",
      "Basta inserir o código acima no campo de busca.",
      "",
      "_EMC — Enviando Meu Carro_",
      "_O Jeito Mais Rápido, Seguro e Simples_",
    ].filter(Boolean).join("\n"),
  };

  // TODO: Send via WhatsApp Business API when integrated
  // await sendWhatsAppMessage(message);

  return message;
}
