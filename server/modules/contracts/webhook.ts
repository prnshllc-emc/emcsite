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
 * 3. Extracts signer data (name, CPF, email) from the payload
 * 4. Triggers contract processing if envelope is fully signed
 */

import { Router, type Request, type Response } from "express";
import { getDb } from "../../db";
import { clicksignContracts } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "../../shared/audit";
import { notifyOwner } from "../../_core/notification";

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
// WEBHOOK HANDLER
// ══════════════════════════════════════════════════════════════

async function handleClicksignWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as ClicksignWebhookEvent;

    // Basic validation
    if (!payload?.event?.name || !payload?.envelope?.id) {
      console.warn("[Clicksign Webhook] Invalid payload received:", JSON.stringify(req.body).slice(0, 500));
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

    // Extract signer data from payload
    const firstSigner = payload.signers?.[0];
    const signerName = firstSigner?.name ?? null;
    const signerCpf = firstSigner?.cpf ?? null;
    const signerEmail = firstSigner?.email ?? null;
    const signerPhone = firstSigner?.phone ?? null;

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
          rawPayload: JSON.stringify(payload),
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

      // Notify admin for important events
      if (eventName === "envelope.signed" || eventName === "envelope.closed") {
        await notifyOwner({
          title: `📝 Contrato ${eventName === "envelope.signed" ? "assinado" : "fechado"}: ${envelopeName}`,
          content: `Envelope: ${envelopeId}\nSignatário: ${signerName ?? "N/A"}\nCPF: ${signerCpf ?? "N/A"}\nEmail: ${signerEmail ?? "N/A"}\n\nO contrato está pronto para revisão no painel admin.`,
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
          rawPayload: JSON.stringify(payload),
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

      // Notify admin about new contract
      await notifyOwner({
        title: `📄 Novo contrato via Clicksign: ${envelopeName}`,
        content: `Evento: ${eventName}\nEnvelope: ${envelopeId}\nSignatário: ${signerName ?? "N/A"}\nCPF: ${signerCpf ?? "N/A"}\nEmail: ${signerEmail ?? "N/A"}\n\nRevise no painel admin → Contratos.`,
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
