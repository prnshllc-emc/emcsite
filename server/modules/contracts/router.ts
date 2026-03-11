/**
 * Contracts Router — tRPC procedures for manual contract PDF upload.
 *
 * Provides:
 * - Upload PDF (receives base64, stores in S3, extracts via LLM)
 * - List pending contracts (awaiting admin confirmation)
 * - Confirm contract (creates/links customer + vehicles, triggers reconciliation)
 * - List all contracts
 */
import { adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import {
  uploadAndExtract,
  confirmContract,
  listPendingContracts,
  listAllContracts,
} from "./service";

export const contractsRouter = router({
  // ── Upload PDF and extract data ────────────────────────────
  upload: adminProcedure
    .input(
      z.object({
        /** Base64-encoded PDF content */
        fileBase64: z.string().min(1, "Arquivo PDF é obrigatório"),
        /** Original file name */
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
      })
    )
    .mutation(async ({ input }) => {
      const fileBuffer = Buffer.from(input.fileBase64, "base64");

      // Validate it's a PDF (check magic bytes)
      if (
        fileBuffer.length < 5 ||
        fileBuffer.toString("ascii", 0, 5) !== "%PDF-"
      ) {
        throw new Error("Arquivo inválido. Apenas PDFs são aceitos.");
      }

      // Max 20MB
      if (fileBuffer.length > 20 * 1024 * 1024) {
        throw new Error("Arquivo muito grande. Máximo: 20MB.");
      }

      const result = await uploadAndExtract(fileBuffer, input.fileName);
      return result;
    }),

  // ── List pending contracts (awaiting confirmation) ─────────
  listPending: adminProcedure.query(async () => {
    return listPendingContracts();
  }),

  // ── List all contracts ─────────────────────────────────────
  listAll: adminProcedure.query(async () => {
    return listAllContracts();
  }),

  // ── Confirm contract (admin reviewed and approved) ─────────
  confirm: adminProcedure
    .input(
      z.object({
        contractId: z.number().int().positive(),
        name: z.string().min(2, "Nome é obrigatório"),
        cpf: z
          .string()
          .transform((v) => v.replace(/\D/g, ""))
          .refine((v) => v.length === 11, "CPF deve ter 11 dígitos"),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        vins: z.array(
          z.object({
            vin: z.string().min(1, "VIN é obrigatório"),
            make: z.string().min(1, "Marca é obrigatória"),
            model: z.string().min(1, "Modelo é obrigatório"),
            year: z.number().int().min(1900).max(2100).optional().nullable(),
            color: z.string().optional().nullable(),
          })
        ),
        tipoOperacao: z.enum(["importacao", "exportacao"]).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await confirmContract(
        input.contractId,
        {
          name: input.name,
          cpf: input.cpf,
          email: input.email,
          phone: input.phone,
          vins: input.vins,
          tipoOperacao: input.tipoOperacao,
        },
        ctx.user.id
      );
      return result;
    }),
});
