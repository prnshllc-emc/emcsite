/**
 * Shared Zod Schemas — Validation schemas used by both client and server.
 */
import { z } from "zod";

// ── CPF Validation ───────────────────────────────────────────
export const CpfSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 11, "CPF deve ter 11 dígitos")
  .refine((v) => !/^(\d)\1{10}$/.test(v), "CPF inválido");

// ── VIN Validation ───────────────────────────────────────────
// Standard 17-char VIN (post-1981)
export const VinSchema = z
  .string()
  .min(17, "VIN deve ter 17 caracteres")
  .max(17, "VIN deve ter 17 caracteres")
  .refine((v) => /^[A-HJ-NPR-Z0-9]{17}$/i.test(v), "VIN inválido");

// Flexible VIN/ID: supports legacy, military, and short IDs (e.g. Humvee 210716)
export const VinOrIdSchema = z
  .string()
  .min(1, "VIN/ID é obrigatório")
  .max(30, "VIN/ID muito longo")
  .transform((v) => v.toUpperCase().trim());

// ── Tracking Code Validation ─────────────────────────────────
export const TrackingCodeSchema = z
  .string()
  .regex(
    /^EMC-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}$/,
    "Código de rastreio inválido. Formato: EMC-XXXX-XXXX-XXXX"
  );

// ── BL Number ────────────────────────────────────────────────
export const BlNumberSchema = z
  .string()
  .min(1, "Número do BL é obrigatório")
  .max(50, "Número do BL muito longo");

/// ── Customer Status ──────────────────────────────────────
export const CustomerStatusEnum = z.enum([
  "aguardando_embarque",
  "aguardando_li",
  "em_processo",
  "concluido",
  "cancelado",
]);

export const TipoOperacaoEnum = z.enum(["importacao", "exportacao"]);

export const DataSourceEnum = z.enum(["manual", "clicksign", "agent"]);

// ── Customer Data ────────────────────────────────────────
export const CustomerCreateSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(200),
  cpf: CpfSchema,
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  status: CustomerStatusEnum.default("aguardando_embarque"),
  tipoOperacao: TipoOperacaoEnum.optional().nullable(),
  dataSource: DataSourceEnum.default("manual"),
});

export const CustomerUpdateSchema = z.object({
  fullName: z.string().min(2).max(200).optional(),
  cpf: CpfSchema.optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: CustomerStatusEnum.optional(),
  tipoOperacao: TipoOperacaoEnum.optional().nullable(),
});

// ── Vehicle Data ─────────────────────────────────────────────
export const VehicleCreateSchema = z.object({
  vin: VinSchema,
  make: z.string().min(1, "Marca é obrigatória").max(100),
  model: z.string().min(1, "Modelo é obrigatório").max(100),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  customerId: z.number().int().positive().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

// ── Bill of Lading Data ──────────────────────────────────────
export const BlStatusEnum = z.enum([
  "draft",
  "final",
  "in_transit",
  "arrived",
  "customs",
  "delivered",
]);

export const BlCreateSchema = z.object({
  blNumber: BlNumberSchema,
  vehicleId: z.number().int().positive().optional().nullable(),
  customerId: z.number().int().positive().optional().nullable(),
  status: BlStatusEnum.default("draft"),
  shipper: z.string().max(200).optional().nullable(),
  consignee: z.string().max(200).optional().nullable(),
  vessel: z.string().max(200).optional().nullable(),
  voyage: z.string().max(100).optional().nullable(),
  portOfLoading: z.string().max(200).optional().nullable(),
  portOfDischarge: z.string().max(200).optional().nullable(),
  etd: z.string().optional().nullable(), // ISO date string
  eta: z.string().optional().nullable(), // ISO date string
  containerNumber: z.string().max(50).optional().nullable(),
  sealNumber: z.string().max(50).optional().nullable(),
  cargoDescription: z.string().max(2000).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  volume: z.string().max(50).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  rawEmailData: z.string().optional().nullable(),
});

export const BlUpdateSchema = BlCreateSchema.partial();

// ── Tracking History Event ───────────────────────────────────
export const TrackingEventTypeEnum = z.enum([
  "draft",
  "final",
  "in_transit",
  "arrived",
  "customs",
  "delivered",
  "info",
  "alert",
  "delay",
]);

export const TrackingHistoryCreateSchema = z.object({
  blId: z.number().int().positive(),
  eventType: TrackingEventTypeEnum,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  eventDate: z.string().optional(), // ISO date string, defaults to now
});

// ── Tracking Code Generation ─────────────────────────────────
export const TrackingCodeGenerateSchema = z.object({
  blId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  expiresInDays: z.number().int().min(1).max(3650).default(365),
});

// ── Public Tracking Lookup ───────────────────────────────────
export const TrackingLookupSchema = z.object({
  code: TrackingCodeSchema,
});

export const CpfLookupSchema = z.object({
  cpf: CpfSchema,
});

// ── Pagination ───────────────────────────────────────────────
export const PaginatedQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

// ── Type exports ─────────────────────────────────────────────
export type CustomerCreate = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;
export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;
export type BlStatus = z.infer<typeof BlStatusEnum>;
export type BlCreate = z.infer<typeof BlCreateSchema>;
export type BlUpdate = z.infer<typeof BlUpdateSchema>;
export type TrackingEventType = z.infer<typeof TrackingEventTypeEnum>;
export type TrackingHistoryCreate = z.infer<typeof TrackingHistoryCreateSchema>;
export type TrackingCodeGenerate = z.infer<typeof TrackingCodeGenerateSchema>;
export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;
export type TipoOperacao = z.infer<typeof TipoOperacaoEnum>;
export type DataSource = z.infer<typeof DataSourceEnum>;
