/**
 * WhatsApp tRPC Router — Admin endpoints for WhatsApp management
 */

import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
import { whatsappMessages } from "../../../drizzle/schema";
import { desc, eq, and, like, sql, count } from "drizzle-orm";
import {
  isWhatsAppConfigured,
  getConnectionStatus,
  sendTextMessage,
  sendTemplateMessage,
} from "./service";

export const whatsappRouter = router({
  // ── Connection status ──────────────────────────────────────
  status: protectedProcedure.query(async () => {
    return getConnectionStatus();
  }),

  // ── Message log with pagination ────────────────────────────
  messages: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        direction: z.enum(["outbound", "inbound", "all"]).default("all"),
        status: z
          .enum(["pending", "sent", "delivered", "read", "failed", "all"])
          .default("all"),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [];

      if (input.direction !== "all") {
        conditions.push(eq(whatsappMessages.direction, input.direction));
      }
      if (input.status !== "all") {
        conditions.push(eq(whatsappMessages.status, input.status));
      }
      if (input.search) {
        conditions.push(like(whatsappMessages.phoneNumber, `%${input.search}%`));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(whatsappMessages)
          .where(where)
          .orderBy(desc(whatsappMessages.createdAt))
          .limit(input.pageSize)
          .offset((input.page - 1) * input.pageSize),
        db
          .select({ total: count() })
          .from(whatsappMessages)
          .where(where),
      ]);

      const total = totalResult[0]?.total ?? 0;

      return {
        messages: rows,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  // ── Message stats ──────────────────────────────────────────
  stats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [totalResult] = await db
      .select({ total: count() })
      .from(whatsappMessages);

    const [sentResult] = await db
      .select({ total: count() })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.status, "sent"));

    const [deliveredResult] = await db
      .select({ total: count() })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.status, "delivered"));

    const [readResult] = await db
      .select({ total: count() })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.status, "read"));

    const [failedResult] = await db
      .select({ total: count() })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.status, "failed"));

    const [inboundResult] = await db
      .select({ total: count() })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.direction, "inbound"));

    return {
      total: totalResult?.total ?? 0,
      sent: sentResult?.total ?? 0,
      delivered: deliveredResult?.total ?? 0,
      read: readResult?.total ?? 0,
      failed: failedResult?.total ?? 0,
      inbound: inboundResult?.total ?? 0,
    };
  }),

  // ── Send a text message (admin manual send) ────────────────
  sendText: protectedProcedure
    .input(
      z.object({
        to: z.string().min(10),
        body: z.string().min(1).max(4096),
        customerId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isWhatsAppConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "WhatsApp não configurado. Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID nas configurações.",
        });
      }

      return sendTextMessage({
        to: input.to,
        body: input.body,
        customerId: input.customerId,
        triggerEvent: "admin_manual",
      });
    }),

  // ── Send a template message (admin manual send) ────────────
  sendTemplate: protectedProcedure
    .input(
      z.object({
        to: z.string().min(10),
        templateName: z.string().min(1),
        languageCode: z.string().default("pt_BR"),
        components: z
          .array(
            z.object({
              type: z.enum(["header", "body", "button"]),
              parameters: z.array(
                z.object({
                  type: z.enum(["text", "image", "document"]),
                  text: z.string().optional(),
                })
              ),
            })
          )
          .optional(),
        customerId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isWhatsAppConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "WhatsApp não configurado.",
        });
      }

      return sendTemplateMessage({
        to: input.to,
        templateName: input.templateName,
        languageCode: input.languageCode,
        components: input.components,
        customerId: input.customerId,
        triggerEvent: "admin_manual_template",
      });
    }),
});
