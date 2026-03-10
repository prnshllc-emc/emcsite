/**
 * Agent Ingestion API — REST endpoints for the Manus AI agent.
 *
 * These endpoints are authenticated via a shared API key (AGENT_API_KEY env var).
 * The AI agent reads emails, extracts BL data, and calls these endpoints to
 * create/update BLs, customers, vehicles, tracking events, and generate tracking codes.
 *
 * All endpoints are mounted under /api/agent/* in Express (not tRPC).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import * as blService from "../bls/service";
import * as blRepo from "../bls/repository";
import * as customerService from "../customers/service";
import * as vehicleService from "../vehicles/service";
import * as trackingService from "../tracking/service";
import * as trackingRepo from "../tracking/repository";
import { logAudit } from "../../shared/audit";
import { notifyOwner } from "../../_core/notification";

// ── API Key Authentication Middleware ────────────────────────
function requireAgentApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-agent-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  const expectedKey = process.env.AGENT_API_KEY;

  if (!expectedKey) {
    res.status(503).json({ error: "Agent API key not configured on server." });
    return;
  }

  if (!apiKey || apiKey !== expectedKey) {
    res.status(401).json({ error: "Invalid or missing API key." });
    return;
  }

  next();
}

// ── Zod Schemas for Agent Payloads ──────────────────────────

const AgentBlCreateSchema = z.object({
  blNumber: z.string().min(1).max(50),
  containerNumber: z.string().max(20).optional().nullable(),
  vehicleDescription: z.string().max(255).optional().nullable(),
  originPort: z.string().max(100).optional().nullable(),
  destinationPort: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered"]).default("draft"),
  estimatedDeparture: z.string().optional().nullable(), // ISO date
  actualDeparture: z.string().optional().nullable(),
  estimatedArrival: z.string().optional().nullable(),
  actualArrival: z.string().optional().nullable(),
  blType: z.enum(["draft", "final"]).default("draft"),
  sourceEmail: z.string().max(320).optional().nullable(),
  rawBlData: z.string().optional().nullable(), // raw email JSON
  // Optional: link to customer/vehicle by reference
  customerCpf: z.string().optional().nullable(), // will look up or create
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  vehicleVin: z.string().optional().nullable(),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleYear: z.number().int().optional().nullable(),
  vehicleColor: z.string().optional().nullable(),
  // Shipper/Consignee info (stored in rawBlData)
  shipper: z.string().optional().nullable(),
  consignee: z.string().optional().nullable(),
  vessel: z.string().optional().nullable(),
  voyage: z.string().optional().nullable(),
});

const AgentBlUpdateSchema = z.object({
  blNumber: z.string().min(1).max(50), // used as lookup key
  containerNumber: z.string().max(20).optional().nullable(),
  vehicleDescription: z.string().max(255).optional().nullable(),
  originPort: z.string().max(100).optional().nullable(),
  destinationPort: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered"]).optional(),
  estimatedDeparture: z.string().optional().nullable(),
  actualDeparture: z.string().optional().nullable(),
  estimatedArrival: z.string().optional().nullable(),
  actualArrival: z.string().optional().nullable(),
  blType: z.enum(["draft", "final"]).optional(),
  sourceEmail: z.string().max(320).optional().nullable(),
  rawBlData: z.string().optional().nullable(),
});

const AgentTrackingEventSchema = z.object({
  blNumber: z.string().min(1), // lookup by BL number (not ID)
  eventType: z.enum(["draft", "final", "in_transit", "arrived", "customs", "delivered", "info", "alert", "delay"]),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  eventDate: z.string().optional(), // ISO date, defaults to now
  rawData: z.string().optional().nullable(),
});

const AgentGenerateCodeSchema = z.object({
  blNumber: z.string().min(1), // lookup by BL number
  customerCpf: z.string().min(11).max(14), // lookup by CPF
  expiresInDays: z.number().int().min(1).max(3650).default(365),
});

const AgentBulkIngestSchema = z.object({
  emailMessageId: z.string().optional().nullable(),
  emailSubject: z.string().optional().nullable(),
  emailSender: z.string().optional().nullable(),
  emailReceivedAt: z.string().optional().nullable(),
  bl: AgentBlCreateSchema,
  trackingEvents: z.array(AgentTrackingEventSchema).optional().default([]),
  generateTrackingCode: z.boolean().default(false),
});

// ── Router ──────────────────────────────────────────────────

export function createAgentRouter(): Router {
  const agentRouter = Router();

  // Apply API key auth to all routes
  agentRouter.use(requireAgentApiKey);

  // ── Health Check ──────────────────────────────────────────
  agentRouter.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── POST /api/agent/bl — Create or update a BL ───────────
  agentRouter.post("/bl", async (req: Request, res: Response) => {
    try {
      const input = AgentBlCreateSchema.parse(req.body);

      // 1. Check if BL already exists
      const existingBl = await blService.getBlByNumber(input.blNumber);

      let customerId: number | undefined;
      let vehicleId: number | undefined;

      // 2. Resolve or create customer if CPF provided
      if (input.customerCpf) {
        const cpfDigits = input.customerCpf.replace(/\D/g, "");
        if (cpfDigits.length === 11) {
          let customer = await customerService.getCustomerByCpf(cpfDigits);
          if (!customer && input.customerName) {
            customer = await customerService.createCustomer({
              cpf: cpfDigits,
              fullName: input.customerName,
              email: input.customerEmail ?? undefined,
              phone: input.customerPhone ?? undefined,
            });
          }
          if (customer) customerId = customer.id;
        }
      }

      // 3. Resolve or create vehicle if VIN provided
      if (input.vehicleVin) {
        const vin = input.vehicleVin.toUpperCase();
        let vehicle = await vehicleService.getVehicleByVin(vin);
        if (!vehicle && input.vehicleMake && input.vehicleModel) {
          vehicle = await vehicleService.createVehicle({
            vin,
            make: input.vehicleMake,
            model: input.vehicleModel,
            year: input.vehicleYear ?? undefined,
            color: input.vehicleColor ?? undefined,
            customerId: customerId ?? undefined,
          });
        }
        if (vehicle) vehicleId = vehicle.id;
      }

      // 4. Build raw BL data JSON with extra fields
      const rawBlData = JSON.stringify({
        shipper: input.shipper,
        consignee: input.consignee,
        vessel: input.vessel,
        voyage: input.voyage,
        sourceEmail: input.sourceEmail,
        rawBlData: input.rawBlData,
        importedAt: new Date().toISOString(),
        importedBy: "ai-agent",
      });

      if (existingBl) {
        // Update existing BL
        const updateData: Record<string, unknown> = {};
        if (input.containerNumber !== undefined) updateData.containerNumber = input.containerNumber;
        if (input.vehicleDescription !== undefined) updateData.vehicleDescription = input.vehicleDescription;
        if (input.originPort !== undefined) updateData.originPort = input.originPort;
        if (input.destinationPort !== undefined) updateData.destinationPort = input.destinationPort;
        if (input.status) updateData.status = input.status;
        if (input.estimatedDeparture) updateData.estimatedDeparture = new Date(input.estimatedDeparture);
        if (input.actualDeparture) updateData.actualDeparture = new Date(input.actualDeparture);
        if (input.estimatedArrival) updateData.estimatedArrival = new Date(input.estimatedArrival);
        if (input.actualArrival) updateData.actualArrival = new Date(input.actualArrival);
        if (input.blType) updateData.blType = input.blType;
        if (input.sourceEmail) updateData.sourceEmail = input.sourceEmail;
        updateData.rawBlData = rawBlData;
        if (customerId) updateData.customerId = customerId;
        if (vehicleId) updateData.vehicleId = vehicleId;

        const updated = await blService.updateBl(existingBl.id, updateData);

        res.json({
          action: "updated",
          bl: updated,
          customerId,
          vehicleId,
        });
      } else {
        // Create new BL
        const createData: blRepo.BlCreateData = {
          blNumber: input.blNumber,
          containerNumber: input.containerNumber ?? undefined,
          vehicleDescription: input.vehicleDescription ?? undefined,
          originPort: input.originPort ?? undefined,
          destinationPort: input.destinationPort ?? undefined,
          status: input.status ?? "draft",
          estimatedDeparture: input.estimatedDeparture ? new Date(input.estimatedDeparture) : undefined,
          estimatedArrival: input.estimatedArrival ? new Date(input.estimatedArrival) : undefined,
          blType: input.blType ?? "draft",
          sourceEmail: input.sourceEmail ?? undefined,
          rawBlData,
          customerId: customerId ?? undefined,
          vehicleId: vehicleId ?? undefined,
        };

        const bl = await blService.createBl(createData);

        // Auto-activate tracking for new BLs
        await blService.activateTracking(bl.id);

        res.status(201).json({
          action: "created",
          bl,
          customerId,
          vehicleId,
        });
      }
    } catch (error: any) {
      console.error("[Agent API] Error creating/updating BL:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // ── PUT /api/agent/bl — Update an existing BL by number ───
  agentRouter.put("/bl", async (req: Request, res: Response) => {
    try {
      const input = AgentBlUpdateSchema.parse(req.body);

      const bl = await blService.getBlByNumber(input.blNumber);
      if (!bl) {
        res.status(404).json({ error: `BL ${input.blNumber} não encontrado.` });
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (input.containerNumber !== undefined) updateData.containerNumber = input.containerNumber;
      if (input.vehicleDescription !== undefined) updateData.vehicleDescription = input.vehicleDescription;
      if (input.originPort !== undefined) updateData.originPort = input.originPort;
      if (input.destinationPort !== undefined) updateData.destinationPort = input.destinationPort;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.estimatedDeparture !== undefined) updateData.estimatedDeparture = input.estimatedDeparture ? new Date(input.estimatedDeparture) : null;
      if (input.actualDeparture !== undefined) updateData.actualDeparture = input.actualDeparture ? new Date(input.actualDeparture) : null;
      if (input.estimatedArrival !== undefined) updateData.estimatedArrival = input.estimatedArrival ? new Date(input.estimatedArrival) : null;
      if (input.actualArrival !== undefined) updateData.actualArrival = input.actualArrival ? new Date(input.actualArrival) : null;
      if (input.blType !== undefined) updateData.blType = input.blType;
      if (input.sourceEmail !== undefined) updateData.sourceEmail = input.sourceEmail;
      if (input.rawBlData !== undefined) updateData.rawBlData = input.rawBlData;

      const updated = await blService.updateBl(bl.id, updateData);

      res.json({ action: "updated", bl: updated });
    } catch (error: any) {
      console.error("[Agent API] Error updating BL:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // ── POST /api/agent/tracking-event — Add tracking event ───
  agentRouter.post("/tracking-event", async (req: Request, res: Response) => {
    try {
      const input = AgentTrackingEventSchema.parse(req.body);

      // Lookup BL by number
      const bl = await blService.getBlByNumber(input.blNumber);
      if (!bl) {
        res.status(404).json({ error: `BL ${input.blNumber} não encontrado.` });
        return;
      }

      const event = await trackingService.addTrackingEvent({
        blId: bl.id,
        status: input.eventType,
        description: input.description ? `${input.title}: ${input.description}` : input.title,
        location: input.location ?? undefined,
        eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
        rawData: input.rawData ?? undefined,
      });

      // Notify owner about important events
      const importantEvents = ["in_transit", "arrived", "customs", "delivered", "alert", "delay"];
      if (importantEvents.includes(input.eventType)) {
        notifyOwner({
          title: `🚢 Tracking: ${input.eventType.toUpperCase()} — BL ${input.blNumber}`,
          content: `Evento: ${input.title}\nBL: ${input.blNumber}\nLocal: ${input.location || "N/A"}\nData: ${input.eventDate || new Date().toISOString()}\n\n${input.description || ""}`,
        }).catch((err) => console.error("[Agent API] Notification error:", err));
      }

      res.status(201).json({ action: "created", event });
    } catch (error: any) {
      console.error("[Agent API] Error adding tracking event:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // ── POST /api/agent/generate-code — Generate tracking code ─
  agentRouter.post("/generate-code", async (req: Request, res: Response) => {
    try {
      const input = AgentGenerateCodeSchema.parse(req.body);

      // Lookup BL by number
      const bl = await blService.getBlByNumber(input.blNumber);
      if (!bl) {
        res.status(404).json({ error: `BL ${input.blNumber} não encontrado.` });
        return;
      }

      // Lookup customer by CPF
      const cpfDigits = input.customerCpf.replace(/\D/g, "");
      const customer = await customerService.getCustomerByCpf(cpfDigits);
      if (!customer) {
        res.status(404).json({ error: `Cliente com CPF ${cpfDigits.substring(0, 3)}***${cpfDigits.substring(9)} não encontrado.` });
        return;
      }

      // Check if there's already an active code for this BL+customer
      const existingCodes = await trackingRepo.findActiveCodesByBlId(bl.id);
      const existingForCustomer = existingCodes.find((c) => c.customerId === customer.id);
      if (existingForCustomer) {
        res.json({
          action: "existing",
          code: existingForCustomer,
          message: "Já existe um código ativo para este BL e cliente.",
        });
        return;
      }

      const code = await trackingService.generateTrackingCode(
        bl.id,
        customer.id,
        input.expiresInDays
      );

      res.status(201).json({ action: "created", code });
    } catch (error: any) {
      console.error("[Agent API] Error generating tracking code:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // ── POST /api/agent/ingest — Bulk ingest from email ───────
  // This is the main endpoint the AI agent calls after parsing an email.
  // It creates/updates BL, adds tracking events, and optionally generates a code.
  agentRouter.post("/ingest", async (req: Request, res: Response) => {
    try {
      const input = AgentBulkIngestSchema.parse(req.body);
      const results: Record<string, unknown> = {};

      // 1. Create or update BL (with customer/vehicle resolution)
      let customerId: number | undefined;
      let vehicleId: number | undefined;

      // Resolve customer
      if (input.bl.customerCpf) {
        const cpfDigits = input.bl.customerCpf.replace(/\D/g, "");
        if (cpfDigits.length === 11) {
          let customer = await customerService.getCustomerByCpf(cpfDigits);
          if (!customer && input.bl.customerName) {
            customer = await customerService.createCustomer({
              cpf: cpfDigits,
              fullName: input.bl.customerName,
              email: input.bl.customerEmail ?? undefined,
              phone: input.bl.customerPhone ?? undefined,
            });
            results.customerAction = "created";
          } else {
            results.customerAction = "existing";
          }
          if (customer) customerId = customer.id;
        }
      }

      // Resolve vehicle
      if (input.bl.vehicleVin) {
        const vin = input.bl.vehicleVin.toUpperCase();
        let vehicle = await vehicleService.getVehicleByVin(vin);
        if (!vehicle && input.bl.vehicleMake && input.bl.vehicleModel) {
          vehicle = await vehicleService.createVehicle({
            vin,
            make: input.bl.vehicleMake,
            model: input.bl.vehicleModel,
            year: input.bl.vehicleYear ?? undefined,
            color: input.bl.vehicleColor ?? undefined,
            customerId: customerId ?? undefined,
          });
          results.vehicleAction = "created";
        } else {
          results.vehicleAction = "existing";
        }
        if (vehicle) vehicleId = vehicle.id;
      }

      // Create or update BL
      const existingBl = await blService.getBlByNumber(input.bl.blNumber);
      const rawBlData = JSON.stringify({
        shipper: input.bl.shipper,
        consignee: input.bl.consignee,
        vessel: input.bl.vessel,
        voyage: input.bl.voyage,
        sourceEmail: input.bl.sourceEmail,
        emailMessageId: input.emailMessageId,
        emailSubject: input.emailSubject,
        emailSender: input.emailSender,
        emailReceivedAt: input.emailReceivedAt,
        rawBlData: input.bl.rawBlData,
        importedAt: new Date().toISOString(),
        importedBy: "ai-agent",
      });

      let bl: blRepo.BlRecord;

      if (existingBl) {
        const updateData: Record<string, unknown> = { rawBlData };
        if (input.bl.containerNumber) updateData.containerNumber = input.bl.containerNumber;
        if (input.bl.vehicleDescription) updateData.vehicleDescription = input.bl.vehicleDescription;
        if (input.bl.originPort) updateData.originPort = input.bl.originPort;
        if (input.bl.destinationPort) updateData.destinationPort = input.bl.destinationPort;
        if (input.bl.status && input.bl.status !== existingBl.status) {
          // Only update status if it's a forward transition
          try {
            updateData.status = input.bl.status;
          } catch {
            // Invalid transition — skip
          }
        }
        if (input.bl.estimatedDeparture) updateData.estimatedDeparture = new Date(input.bl.estimatedDeparture);
        if (input.bl.actualDeparture) updateData.actualDeparture = new Date(input.bl.actualDeparture);
        if (input.bl.estimatedArrival) updateData.estimatedArrival = new Date(input.bl.estimatedArrival);
        if (input.bl.actualArrival) updateData.actualArrival = new Date(input.bl.actualArrival);
        if (input.bl.blType) updateData.blType = input.bl.blType;
        if (input.bl.sourceEmail) updateData.sourceEmail = input.bl.sourceEmail;
        if (customerId) updateData.customerId = customerId;
        if (vehicleId) updateData.vehicleId = vehicleId;

        bl = (await blService.updateBl(existingBl.id, updateData))!;
        results.blAction = "updated";
      } else {
        const createData: blRepo.BlCreateData = {
          blNumber: input.bl.blNumber,
          containerNumber: input.bl.containerNumber ?? undefined,
          vehicleDescription: input.bl.vehicleDescription ?? undefined,
          originPort: input.bl.originPort ?? undefined,
          destinationPort: input.bl.destinationPort ?? undefined,
          status: input.bl.status ?? "draft",
          estimatedDeparture: input.bl.estimatedDeparture ? new Date(input.bl.estimatedDeparture) : undefined,
          estimatedArrival: input.bl.estimatedArrival ? new Date(input.bl.estimatedArrival) : undefined,
          blType: input.bl.blType ?? "draft",
          sourceEmail: input.bl.sourceEmail ?? undefined,
          rawBlData,
          customerId: customerId ?? undefined,
          vehicleId: vehicleId ?? undefined,
        };

        bl = await blService.createBl(createData);
        await blService.activateTracking(bl.id);
        results.blAction = "created";
      }

      results.blId = bl.id;
      results.blNumber = bl.blNumber;

      // 2. Add tracking events
      const eventResults: unknown[] = [];
      for (const eventInput of input.trackingEvents) {
        try {
          const event = await trackingService.addTrackingEvent({
            blId: bl.id,
            status: eventInput.eventType,
            description: eventInput.description
              ? `${eventInput.title}: ${eventInput.description}`
              : eventInput.title,
            location: eventInput.location ?? undefined,
            eventDate: eventInput.eventDate ? new Date(eventInput.eventDate) : undefined,
            rawData: eventInput.rawData ?? undefined,
          });
          eventResults.push({ action: "created", eventId: event.id });
        } catch (err: any) {
          eventResults.push({ action: "error", error: err.message });
        }
      }
      results.trackingEvents = eventResults;

      // 3. Generate tracking code if requested
      if (input.generateTrackingCode && customerId) {
        try {
          const existingCodes = await trackingRepo.findActiveCodesByBlId(bl.id);
          const existingForCustomer = existingCodes.find((c) => c.customerId === customerId);
          if (existingForCustomer) {
            results.trackingCode = {
              action: "existing",
              code: existingForCustomer.code,
            };
          } else {
            const code = await trackingService.generateTrackingCode(bl.id, customerId!, 365);
            results.trackingCode = {
              action: "created",
              code: code.code,
            };
          }
        } catch (err: any) {
          results.trackingCode = { action: "error", error: err.message };
        }
      }

      // 4. Notify owner about the ingestion
      notifyOwner({
        title: `📧 Agente IA: ${results.blAction === "created" ? "Novo" : "Atualização"} BL ${input.bl.blNumber}`,
        content: [
          `BL: ${input.bl.blNumber}`,
          `Ação: ${results.blAction}`,
          input.emailSubject ? `Email: ${input.emailSubject}` : null,
          input.emailSender ? `De: ${input.emailSender}` : null,
          input.bl.originPort ? `Origem: ${input.bl.originPort}` : null,
          input.bl.destinationPort ? `Destino: ${input.bl.destinationPort}` : null,
          input.bl.vehicleDescription ? `Veículo: ${input.bl.vehicleDescription}` : null,
          input.trackingEvents.length > 0 ? `Eventos: ${input.trackingEvents.length} adicionados` : null,
          results.trackingCode ? `Código de rastreio: ${(results.trackingCode as any).code || "erro"}` : null,
        ].filter(Boolean).join("\n"),
      }).catch((err) => console.error("[Agent API] Notification error:", err));

      await logAudit({
        userId: null, // system action
        action: "create",
        entity: "agent_ingestion",
        entityId: bl.id,
        changes: {
          source: { before: null, after: "ai-agent" },
          blNumber: { before: null, after: input.bl.blNumber },
          emailMessageId: { before: null, after: input.emailMessageId || null },
        },
      });

      res.status(existingBl ? 200 : 201).json({
        success: true,
        results,
      });
    } catch (error: any) {
      console.error("[Agent API] Error in bulk ingest:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  });

  // ── GET /api/agent/bl/:blNumber — Get BL details ──────────
  agentRouter.get("/bl/:blNumber", async (req: Request, res: Response) => {
    try {
      const bl = await blService.getBlByNumber(req.params.blNumber);
      if (!bl) {
        res.status(404).json({ error: `BL ${req.params.blNumber} não encontrado.` });
        return;
      }

      // Get tracking events
      const events = await trackingService.getTrackingHistory(bl.id);

      // Get tracking codes
      const codes = await trackingService.getCodesForBl(bl.id);

      res.json({ bl, events, codes });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // ── GET /api/agent/stats — Dashboard stats for the agent ──
  agentRouter.get("/stats", async (_req: Request, res: Response) => {
    try {
      const [blsByStatus, activeBls, activeCodes, activeCustomers, activeVehicles] = await Promise.all([
        blService.countBlsByStatus(),
        blService.countActiveBls(),
        trackingService.countActiveCodes(),
        customerService.countActiveCustomers(),
        vehicleService.countActiveVehicles(),
      ]);

      res.json({
        blsByStatus,
        activeBls,
        activeCodes,
        activeCustomers,
        activeVehicles,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  return agentRouter;
}
