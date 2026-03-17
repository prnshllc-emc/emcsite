/**
 * WhatsApp Cloud API Webhook Handler
 *
 * Handles:
 * 1. GET /api/webhooks/whatsapp — Webhook verification (Meta challenge)
 * 2. POST /api/webhooks/whatsapp — Status updates + incoming messages
 *
 * Security:
 * - GET: Validates hub.verify_token against WHATSAPP_WEBHOOK_VERIFY_TOKEN
 * - POST: Validates X-Hub-Signature-256 HMAC-SHA256 against WHATSAPP_APP_SECRET
 *
 * Meta sends webhook events for:
 * - Message status changes (sent, delivered, read, failed)
 * - Incoming messages from customers
 */

import crypto from "crypto";
import { Router, type Request, type Response } from "express";
import {
  processStatusUpdate,
  processIncomingMessage,
} from "./service";

const whatsappWebhookRouter = Router();

// ══════════════════════════════════════════════════════════════
// HMAC SIGNATURE VALIDATION
// Meta signs every POST with X-Hub-Signature-256 using the App Secret
// ══════════════════════════════════════════════════════════════

/**
 * Validates the X-Hub-Signature-256 header from Meta.
 * Uses timing-safe comparison to prevent timing attacks.
 */
function validateSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader) return false;

  // Header format: "sha256=<hex_digest>"
  const expectedPrefix = "sha256=";
  if (!signatureHeader.startsWith(expectedPrefix)) return false;

  const receivedSig = signatureHeader.slice(expectedPrefix.length);
  const computedSig = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig, "hex"),
      Buffer.from(computedSig, "hex")
    );
  } catch {
    // If lengths differ, timingSafeEqual throws
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// RAW BODY CAPTURE MIDDLEWARE
// We need the raw body bytes for HMAC validation before JSON parsing
// ══════════════════════════════════════════════════════════════

import express from "express";

whatsappWebhookRouter.use(
  express.json({
    limit: "5mb",
    verify: (req: any, _res, buf) => {
      // Store raw body buffer on the request for HMAC validation
      req.rawBody = buf;
    },
  })
);

// ══════════════════════════════════════════════════════════════
// WEBHOOK VERIFICATION (GET)
// Meta sends a GET request with a challenge to verify the webhook URL
// ══════════════════════════════════════════════════════════════

whatsappWebhookRouter.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string | undefined;
  const token = req.query["hub.verify_token"] as string | undefined;
  const challenge = req.query["hub.challenge"] as string | undefined;

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("[WhatsApp Webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured");
    res.status(503).send("Webhook verify token not configured");
    return;
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful");
    res.status(200).send(challenge);
  } else {
    console.warn("[WhatsApp Webhook] Verification failed — invalid token");
    res.status(403).send("Forbidden");
  }
});

// ══════════════════════════════════════════════════════════════
// WEBHOOK EVENTS (POST)
// ══════════════════════════════════════════════════════════════

whatsappWebhookRouter.post("/", async (req: Request, res: Response) => {
  // ── HMAC Signature Validation ──────────────────────────────
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (appSecret) {
    const signatureHeader = req.headers["x-hub-signature-256"] as string | undefined;
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!rawBody || !validateSignature(rawBody, signatureHeader, appSecret)) {
      console.warn("[WhatsApp Webhook] HMAC signature validation failed");
      res.status(401).send("Invalid signature");
      return;
    }
  } else {
    // Log warning but don't block — allows gradual rollout
    console.warn(
      "[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured — " +
      "signature validation skipped. Set this secret to enable HMAC verification."
    );
  }

  // Always respond 200 quickly to avoid Meta retries
  res.status(200).send("OK");

  try {
    const body = req.body as WebhookPayload;

    if (body.object !== "whatsapp_business_account") {
      return;
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") continue;

        const value = change.value;

        // Process status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            const mappedStatus = mapMetaStatus(status.status);
            if (mappedStatus) {
              const errorCode = status.errors?.[0]?.code
                ? String(status.errors[0].code)
                : undefined;
              const errorMessage = status.errors?.[0]?.title;

              await processStatusUpdate(
                status.id,
                mappedStatus,
                errorCode,
                errorMessage
              );
            }
          }
        }

        // Process incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            const from = message.from; // Phone number
            let messageBody = "";
            let messageType: "text" | "image" | "document" = "text";

            if (message.type === "text" && message.text?.body) {
              messageBody = message.text.body;
              messageType = "text";
            } else if (message.type === "image") {
              messageBody = message.image?.caption ?? "[Imagem recebida]";
              messageType = "image";
            } else if (message.type === "document") {
              messageBody =
                message.document?.caption ?? "[Documento recebido]";
              messageType = "document";
            } else {
              messageBody = `[${message.type ?? "unknown"} message]`;
            }

            await processIncomingMessage(
              from,
              messageBody,
              message.id,
              messageType
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("[WhatsApp Webhook] Error processing:", err);
  }
});

// ══════════════════════════════════════════════════════════════
// STATUS MAPPING
// ══════════════════════════════════════════════════════════════

function mapMetaStatus(
  metaStatus: string
): "sent" | "delivered" | "read" | "failed" | null {
  switch (metaStatus) {
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
      return "failed";
    default:
      return null;
  }
}

// ══════════════════════════════════════════════════════════════
// WEBHOOK PAYLOAD TYPES
// ══════════════════════════════════════════════════════════════

interface WebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
          errors?: Array<{ code: number; title: string }>;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          image?: { id: string; caption?: string };
          document?: { id: string; caption?: string; filename?: string };
        }>;
      };
    }>;
  }>;
}

// Export validateSignature for testing
export { validateSignature };
export default whatsappWebhookRouter;
