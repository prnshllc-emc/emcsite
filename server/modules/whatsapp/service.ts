/**
 * WhatsApp Cloud API Service — Meta Official Integration
 *
 * Handles sending template messages and text messages via the
 * WhatsApp Business Cloud API (graph.facebook.com/v21.0).
 *
 * Requires:
 * - WHATSAPP_TOKEN: Permanent access token from Meta Business
 * - WHATSAPP_PHONE_NUMBER_ID: The phone number ID from Meta dashboard
 *
 * Pricing (Brazil):
 * - Utility templates: ~$0.0068/msg
 * - Marketing templates: ~$0.062/msg
 * - Text messages within service window: FREE
 */

import { getDb } from "../../db";
import { whatsappMessages } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "../../shared/audit";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface WhatsAppConfig {
  token: string;
  phoneNumberId: string;
  apiVersion: string;
}

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: Array<{
    type: "text" | "image" | "document";
    text?: string;
    image?: { link: string };
  }>;
}

export interface SendTemplateOptions {
  to: string; // E.164 format: +5511999999999
  templateName: string;
  languageCode?: string; // default: pt_BR
  components?: TemplateComponent[];
  customerId?: number;
  blId?: number;
  triggerEvent?: string;
}

export interface SendTextOptions {
  to: string;
  body: string;
  customerId?: number;
  blId?: number;
  triggerEvent?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string; // wamid.xxx
  error?: string;
  errorCode?: string;
  logId?: number; // DB log entry ID
}

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const API_VERSION = "v21.0";
const BASE_URL = "https://graph.facebook.com";

function getConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return null;
  }

  return { token, phoneNumberId, apiVersion: API_VERSION };
}

export function isWhatsAppConfigured(): boolean {
  return getConfig() !== null;
}

// ══════════════════════════════════════════════════════════════
// NORMALIZE PHONE NUMBER
// ══════════════════════════════════════════════════════════════

/**
 * Normalize phone number to E.164 format for WhatsApp.
 * Removes spaces, dashes, parentheses.
 * If no country code, assumes Brazil (+55).
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +, keep as is
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If starts with 55 and has 12-13 digits, it's already Brazilian with country code
  if (cleaned.startsWith("55") && cleaned.length >= 12) {
    return "+" + cleaned;
  }

  // Otherwise assume Brazilian number, add +55
  return "+55" + cleaned;
}

// ══════════════════════════════════════════════════════════════
// SEND TEMPLATE MESSAGE
// ══════════════════════════════════════════════════════════════

export async function sendTemplateMessage(
  options: SendTemplateOptions
): Promise<SendResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      error: "WhatsApp não configurado. Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID.",
      errorCode: "NOT_CONFIGURED",
    };
  }

  const db = await getDb();
  const normalizedPhone = normalizePhoneNumber(options.to);
  const languageCode = options.languageCode ?? "pt_BR";

  // Build the request payload
  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to: normalizedPhone.replace("+", ""), // Meta API expects without +
    type: "template",
    template: {
      name: options.templateName,
      language: { code: languageCode },
      ...(options.components ? { components: options.components } : {}),
    },
  };

  // Log the message as pending
  let logId: number | undefined;
  if (db) {
    try {
      const [result] = await db.insert(whatsappMessages).values({
        direction: "outbound",
        messageType: "template",
        phoneNumber: normalizedPhone,
        templateName: options.templateName,
        templateLanguage: languageCode,
        body: options.components
          ? JSON.stringify(options.components)
          : `[Template: ${options.templateName}]`,
        status: "pending",
        customerId: options.customerId ?? null,
        blId: options.blId ?? null,
        triggerEvent: options.triggerEvent ?? null,
      });
      logId = result.insertId;
    } catch (err) {
      console.error("[WhatsApp] Failed to log message:", err);
    }
  }

  try {
    const url = `${BASE_URL}/${config.apiVersion}/${config.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const error = data.error as Record<string, unknown> | undefined;
      const errorMsg =
        (error?.message as string) ?? `HTTP ${response.status}`;
      const errorCode =
        String(error?.code ?? response.status);

      // Update log with failure
      if (db && logId) {
        await db
          .update(whatsappMessages)
          .set({ status: "failed", errorCode, errorMessage: errorMsg })
          .where(eq(whatsappMessages.id, logId));
      }

      return { success: false, error: errorMsg, errorCode, logId };
    }

    // Extract message ID from response
    const messages = data.messages as Array<{ id: string }> | undefined;
    const waMessageId = messages?.[0]?.id;

    // Update log with success
    if (db && logId) {
      await db
        .update(whatsappMessages)
        .set({ status: "sent", waMessageId: waMessageId ?? null })
        .where(eq(whatsappMessages.id, logId));
    }

    return { success: true, messageId: waMessageId, logId };
  } catch (err) {
    const errorMsg = (err as Error).message;

    if (db && logId) {
      await db
        .update(whatsappMessages)
        .set({
          status: "failed",
          errorCode: "NETWORK_ERROR",
          errorMessage: errorMsg,
        })
        .where(eq(whatsappMessages.id, logId));
    }

    return {
      success: false,
      error: errorMsg,
      errorCode: "NETWORK_ERROR",
      logId,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// SEND TEXT MESSAGE (within customer service window)
// ══════════════════════════════════════════════════════════════

export async function sendTextMessage(
  options: SendTextOptions
): Promise<SendResult> {
  const config = getConfig();
  if (!config) {
    return {
      success: false,
      error: "WhatsApp não configurado.",
      errorCode: "NOT_CONFIGURED",
    };
  }

  const db = await getDb();
  const normalizedPhone = normalizePhoneNumber(options.to);

  const payload = {
    messaging_product: "whatsapp",
    to: normalizedPhone.replace("+", ""),
    type: "text",
    text: { body: options.body },
  };

  // Log as pending
  let logId: number | undefined;
  if (db) {
    try {
      const [result] = await db.insert(whatsappMessages).values({
        direction: "outbound",
        messageType: "text",
        phoneNumber: normalizedPhone,
        body: options.body,
        status: "pending",
        customerId: options.customerId ?? null,
        blId: options.blId ?? null,
        triggerEvent: options.triggerEvent ?? null,
      });
      logId = result.insertId;
    } catch (err) {
      console.error("[WhatsApp] Failed to log text message:", err);
    }
  }

  try {
    const url = `${BASE_URL}/${config.apiVersion}/${config.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const error = data.error as Record<string, unknown> | undefined;
      const errorMsg =
        (error?.message as string) ?? `HTTP ${response.status}`;
      const errorCode = String(error?.code ?? response.status);

      if (db && logId) {
        await db
          .update(whatsappMessages)
          .set({ status: "failed", errorCode, errorMessage: errorMsg })
          .where(eq(whatsappMessages.id, logId));
      }

      return { success: false, error: errorMsg, errorCode, logId };
    }

    const messages = data.messages as Array<{ id: string }> | undefined;
    const waMessageId = messages?.[0]?.id;

    if (db && logId) {
      await db
        .update(whatsappMessages)
        .set({ status: "sent", waMessageId: waMessageId ?? null })
        .where(eq(whatsappMessages.id, logId));
    }

    return { success: true, messageId: waMessageId, logId };
  } catch (err) {
    const errorMsg = (err as Error).message;

    if (db && logId) {
      await db
        .update(whatsappMessages)
        .set({
          status: "failed",
          errorCode: "NETWORK_ERROR",
          errorMessage: errorMsg,
        })
        .where(eq(whatsappMessages.id, logId));
    }

    return {
      success: false,
      error: errorMsg,
      errorCode: "NETWORK_ERROR",
      logId,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// PROCESS WEBHOOK STATUS UPDATE
// ══════════════════════════════════════════════════════════════

export async function processStatusUpdate(
  waMessageId: string,
  status: "sent" | "delivered" | "read" | "failed",
  errorCode?: string,
  errorMessage?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updates: Record<string, unknown> = { status };

    if (status === "delivered") {
      updates.deliveredAt = new Date();
    } else if (status === "read") {
      updates.deliveredAt = new Date(); // ensure delivered is set
      updates.readAt = new Date();
    } else if (status === "failed") {
      updates.errorCode = errorCode ?? "UNKNOWN";
      updates.errorMessage = errorMessage ?? "Unknown error";
    }

    await db
      .update(whatsappMessages)
      .set(updates)
      .where(eq(whatsappMessages.waMessageId, waMessageId));

    return true;
  } catch (err) {
    console.error("[WhatsApp] Failed to process status update:", err);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// PROCESS INCOMING MESSAGE
// ══════════════════════════════════════════════════════════════

export async function processIncomingMessage(
  from: string,
  body: string,
  waMessageId: string,
  messageType: "text" | "image" | "document" = "text"
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [result] = await db.insert(whatsappMessages).values({
      direction: "inbound",
      messageType,
      waMessageId,
      phoneNumber: normalizePhoneNumber(from),
      body,
      status: "delivered",
      deliveredAt: new Date(),
    });

    // Notify admin about incoming message
    const { notifyOwner } = await import("../../_core/notification");
    await notifyOwner({
      title: `📱 WhatsApp recebido de ${from}`,
      content: `Mensagem: ${body}\n\nResponda pelo painel admin ou diretamente no WhatsApp Business.`,
    });

    return result.insertId;
  } catch (err) {
    console.error("[WhatsApp] Failed to log incoming message:", err);
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
// GET CONNECTION STATUS
// ══════════════════════════════════════════════════════════════

export async function getConnectionStatus(): Promise<{
  configured: boolean;
  phoneNumberId?: string;
  verified?: boolean;
  phoneNumber?: string;
  qualityRating?: string;
  error?: string;
}> {
  const config = getConfig();
  if (!config) {
    return { configured: false };
  }

  try {
    const url = `${BASE_URL}/${config.apiVersion}/${config.phoneNumberId}?fields=verified_name,quality_rating,display_phone_number`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!response.ok) {
      return {
        configured: true,
        phoneNumberId: config.phoneNumberId,
        verified: false,
        error: `API returned ${response.status}`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;

    return {
      configured: true,
      phoneNumberId: config.phoneNumberId,
      verified: true,
      phoneNumber: data.display_phone_number as string | undefined,
      qualityRating: data.quality_rating as string | undefined,
    };
  } catch (err) {
    return {
      configured: true,
      phoneNumberId: config.phoneNumberId,
      verified: false,
      error: (err as Error).message,
    };
  }
}
