/**
 * Clicksign Webhook Handler — Receives webhook callbacks from Clicksign.
 *
 * Clicksign sends POST requests when envelope events occur:
 * - envelope.signed: All signers have signed
 * - envelope.closed: Envelope is closed
 * - signer.signed: Individual signer completed
 * - envelope.created: New envelope created
 *
 * This handler:
 * 1. Validates the webhook payload
 * 2. Creates/updates the contract record in our DB
 * 3. Extracts signer data (name, CPF, email) from the payload — encrypted at rest
 * 4. Triggers contract processing if envelope is fully signed
 *
 * SECURITY: All PII fields (name, CPF, email, phone) and the raw payload
 * are encrypted with AES-256-GCM before storage (LGPD compliance).
 */

import { Router, type Request, type Response } from "express";
import { getDb } from "../../db";
import { clicksignContracts } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "../../shared/audit";
import { notifyOwner } from "../../_core/notification";
import { encryptSensitiveData, decryptSensitiveData } from "../../shared/security";

// ══════════════════════════════════════════════════════════════
// TYPES — Clicksign Webhook Payload
// ══════════════════════════════════════════════════════════════

interface ClicksignWebhookEvent {
  event: {
    name: string; // e.g. "envelope.signed", "signer.signed"
    occurred_at: string;
  };
  envelope: {
    id: string;
    name: string;
    status: string; // "running", "closed", "signed", etc.
    created_at: string;
    updated_at: string;
  };
  signers?: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    signed_at?: string;
    status: string;
  }[];
  documents?: {
    id: string;
    filename: string;
    content_base64?: string;
  }[];
}

// ══════════════════════════════════════════════════════════════
// ENCRYPTION HELPERS — Encrypt PII before storage
// ══════════════════════════════════════════════════════════════

/** Encrypt a value if non-null, return null otherwise */
function encryptIfPresent(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return encryptSensitiveData(value);
  } catch {
    console.error("[Clicksign Webhook] Encryption failed for PII field");
    return null;
  }
}

/** Decrypt a value if non-null, return null otherwise */
export function decryptIfPresent(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return decryptSensitiveData(value);
  } catch {
    // May be legacy unencrypted data — return as-is
    return value;
  }
}

// ══════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// ══════════════════════════════════════════════════════════════

async function handleClicksignWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as ClicksignWebhookEvent;

    // Basic validation
    if (!payload?.event?.name || !payload?.envelope?.id) {
      console.warn("[Clicksign Webhook] Invalid payload received (truncated for security)");
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const eventName = payload.event.name;
    const envelopeId = payload.envelope.id;
    const envelopeName = payload.envelope.name;
    const envelopeStatus = payload.envelope.status;

    console.log(`[Clicksign Webhook] Event: ${eventName} | Envelope: ${envelopeId} | Status: ${envelopeStatus}`);

    const db = await getDb();
    if (!db) {
      console.error("[Clicksign Webhook] Database not available");
      return res.status(500).json({ error: "Database not available" });
    }

    // Extract signer data from payload (plaintext for notifications only, not stored)
    const firstSigner = payload.signers?.[0];
    const signerNamePlain = firstSigner?.name ?? null;
    const signerCpfPlain = firstSigner?.cpf ?? null;
    const signerEmailPlain = firstSigner?.email ?? null;
    const signerPhonePlain = firstSigner?.phone ?? null;

    // Encrypt PII before storage (LGPD compliance)
    const signerName = encryptIfPresent(signerNamePlain);
    const signerCpf = encryptIfPresent(signerCpfPlain);
    const signerEmail = encryptIfPresent(signerEmailPlain);
    const signerPhone = encryptIfPresent(signerPhonePlain);

    // Encrypt the full raw payload (contains PII)
    const encryptedPayload = encryptIfPresent(JSON.stringify(payload));

    // Check if we already have this envelope
    const [existing] = await db
      .select()
      .from(clicksignContracts)
      .where(eq(clicksignContracts.envelopeId, envelopeId))
      .limit(1);

    if (existing) {
      // Update existing record
      const newStatus = mapClicksignStatus(envelopeStatus, eventName);
      await db
        .update(clicksignContracts)
        .set({
          envelopeStatus,
          envelopeName,
          status: newStatus,
          signerName: signerName ?? existing.signerName,
          signerCpf: signerCpf ?? existing.signerCpf,
          signerEmail: signerEmail ?? existing.signerEmail,
          signerPhone: signerPhone ?? existing.signerPhone,
          rawPayload: encryptedPayload ?? existing.rawPayload,
          updatedAt: new Date(),
        })
        .where(eq(clicksignContracts.id, existing.id));

      await logAudit({
        userId: null,
        action: "update",
        entity: "clicksign_contract",
        entityId: existing.id,
        changes: {
          event: { before: null, after: eventName },
          envelopeStatus: { before: existing.envelopeStatus, after: envelopeStatus },
          status: { before: existing.status, after: newStatus },
        },
      });

      // Notify admin for important events (use plaintext for notification only)
      if (eventName === "envelope.signed" || eventName === "envelope.closed") {
        const maskedCpf = signerCpfPlain
          ? signerCpfPlain.replace(/^(\d{3})\.\d{3}\.\d{3}(-\d{2})$/, "$1.***.***$2")
          : "N/A";
        await notifyOwner({
          title: `Contrato ${eventName === "envelope.signed" ? "assinado" : "fechado"}: ${envelopeName}`,
          content: `Envelope: ${envelopeId}\nSignatário: ${signerNamePlain ?? "N/A"}\nCPF: ${maskedCpf}\n\nO contrato está pronto para revisão no painel admin.`,
        });
      }
    } else {
      // Create new record
      const newStatus = mapClicksignStatus(envelopeStatus, eventName);
      const [result] = await db
        .insert(clicksignContracts)
        .values({
          envelopeId,
          envelopeName,
          envelopeStatus,
          status: newStatus,
          signerName,
          signerCpf,
          signerEmail,
          signerPhone,
          rawPayload: encryptedPayload,
        })
        .$returningId();

      await logAudit({
        userId: null,
        action: "create",
        entity: "clicksign_contract",
        entityId: result.id,
        changes: {
          event: { before: null, after: eventName },
          envelopeId: { before: null, after: envelopeId },
          source: { before: null, after: "clicksign_webhook" },
        },
      });

      // Notify admin about new contract (use plaintext for notification only, mask CPF)
      const maskedCpf = signerCpfPlain
        ? signerCpfPlain.replace(/^(\d{3})\.\d{3}\.\d{3}(-\d{2})$/, "$1.***.***$2")
        : "N/A";
      await notifyOwner({
        title: `Novo contrato via Clicksign: ${envelopeName}`,
        content: `Evento: ${eventName}\nEnvelope: ${envelopeId}\nSignatário: ${signerNamePlain ?? "N/A"}\nCPF: ${maskedCpf}\n\nRevise no painel admin → Contratos.`,
      });
    }

    // Always respond 200 to acknowledge receipt
    return res.status(200).json({ received: true, event: eventName });
  } catch (err) {
    console.error("[Clicksign Webhook] Error processing webhook:", err);
    // Still return 200 to prevent Clicksign from retrying
    return res.status(200).json({ received: true, error: "Processing error logged" });
  }
}

// ══════════════════════════════════════════════════════════════
// STATUS MAPPING
// ══════════════════════════════════════════════════════════════

function mapClicksignStatus(envelopeStatus: string, eventName: string): "pending" | "signed" | "processed" | "error" | "ignored" {
  if (eventName === "envelope.signed" || envelopeStatus === "signed") {
    return "signed";
  }
  if (eventName === "envelope.closed" || envelopeStatus === "closed") {
    return "signed"; // Closed means all signers completed
  }
  return "pending";
}

// ══════════════════════════════════════════════════════════════
// EXPRESS ROUTER
// ══════════════════════════════════════════════════════════════

export function createClicksignWebhookRouter(): Router {
  const webhookRouter = Router();

  // POST /api/webhooks/clicksign
  webhookRouter.post("/clicksign", handleClicksignWebhook);

  // GET /api/webhooks/clicksign — health check for Clicksign to verify endpoint
  webhookRouter.get("/clicksign", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", service: "clicksign-webhook" });
  });

  return webhookRouter;
}
