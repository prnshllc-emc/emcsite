/**
 * Contract Upload Service — Manual PDF upload with CPF/VIN extraction via LLM.
 *
 * Flow:
 * 1. Admin uploads contract PDF
 * 2. PDF is stored in S3
 * 3. LLM extracts CPF, VIN(s), name, email, phone from the PDF
 * 4. Admin reviews extracted data and confirms
 * 5. System creates/links customer + vehicle records
 * 6. Marks as "contrato fechado, fase documental" and triggers reconciliation
 *
 * This is the D0 entry point — from here, the reconciliation chain begins.
 */

import { storagePut } from "../../storage";
import { invokeLLM } from "../../_core/llm";
import { getDb } from "../../db";
import { clicksignContracts } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "../../shared/audit";
import {
  findCustomerByCpf,
  createCustomer,
} from "../customers/repository";
import {
  findVehicleByVin,
  createVehicle,
} from "../vehicles/repository";
import { isValidCpf, isValidCnpj, isValidVin, encryptSensitiveData } from "../../shared/security";
import { decryptIfPresent } from "./webhook";
import crypto from "crypto";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface ExtractedContractData {
  /** Signer's full name */
  name: string | null;
  /** CPF (digits only or formatted) */
  cpf: string | null;
  /** CNPJ (digits only or formatted) — for corporate imports */
  cnpj: string | null;
  /** Document type detected */
  documentType: "cpf" | "cnpj" | null;
  /** Email address */
  email: string | null;
  /** Phone number */
  phone: string | null;
  /** VIN numbers found in the contract */
  vins: string[];
  /** Vehicle descriptions (make/model/year if found) */
  vehicleDescriptions: {
    vin: string;
    make: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
  }[];
  /** Operation type detected */
  tipoOperacao: "importacao" | "exportacao" | null;
  /** Raw text extracted (for debugging) */
  rawExtractedText: string;
  /** Confidence level */
  confidence: "high" | "medium" | "low";
  /** Any warnings or notes from extraction */
  warnings: string[];
}

export interface ContractUploadResult {
  /** S3 URL of the uploaded PDF */
  pdfUrl: string;
  /** S3 key */
  pdfKey: string;
  /** Extracted data from the PDF */
  extracted: ExtractedContractData;
  /** Clicksign contract record ID (created in DB) */
  contractId: number;
}

export interface ContractConfirmResult {
  contractId: number;
  customerId: number;
  vehicleIds: number[];
  isNewCustomer: boolean;
  newVehicles: number;
  linkedVehicles: number;
}

// ══════════════════════════════════════════════════════════════
// STEP 1: Upload PDF to S3
// ══════════════════════════════════════════════════════════════

export async function uploadContractPdf(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ pdfUrl: string; pdfKey: string }> {
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `contracts/${Date.now()}-${randomSuffix}-${sanitizedName}`;

  const { url, key } = await storagePut(fileKey, fileBuffer, "application/pdf");

  return { pdfUrl: url, pdfKey: key };
}

// ══════════════════════════════════════════════════════════════
// STEP 2: Extract data from PDF using LLM
// ══════════════════════════════════════════════════════════════

export async function extractContractData(
  pdfUrl: string
): Promise<ExtractedContractData> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um assistente especializado em extrair dados de contratos de importação/exportação de veículos.
Analise o PDF do contrato e extraia as seguintes informações:
- Nome completo do signatário/cliente (ou razão social se pessoa jurídica)
- CPF (apenas dígitos, sem pontos ou traços) — para pessoa física
- CNPJ (apenas dígitos, sem pontos, barras ou traços) — para pessoa jurídica
- Tipo de documento: "cpf" se encontrou CPF, "cnpj" se encontrou CNPJ
- Email
- Telefone
- VIN (Vehicle Identification Number) de cada veículo mencionado (17 caracteres alfanuméricos, sem I, O, Q)
- Para cada VIN: marca, modelo, ano e cor se disponíveis
- Tipo de operação: importação ou exportação

IMPORTANTE:
- CPF brasileiro tem 11 dígitos
- CNPJ brasileiro tem 14 dígitos
- Contratos de importação/exportação podem ter CPF (pessoa física) ou CNPJ (pessoa jurídica)
- VIN padrão tem 17 caracteres (pode haver VINs curtos para veículos antigos/militares)
- Se não encontrar algum campo, retorne null
- Se encontrar múltiplos VINs, liste todos
- Indique seu nível de confiança na extração (high/medium/low)
- Liste quaisquer avisos sobre dados ambíguos ou incompletos`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extraia os dados do contrato PDF anexo. Retorne em formato JSON.",
          },
          {
            type: "file_url",
            file_url: {
              url: pdfUrl,
              mime_type: "application/pdf",
            },
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "contract_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            name: {
              type: ["string", "null"],
              description: "Full name of the signer/client",
            },
            cpf: {
              type: ["string", "null"],
              description: "CPF digits only (11 digits) — for individuals",
            },
            cnpj: {
              type: ["string", "null"],
              description: "CNPJ digits only (14 digits) — for companies",
            },
            documentType: {
              type: ["string", "null"],
              enum: ["cpf", "cnpj", null],
              description: "Type of document found: cpf or cnpj",
            },
            email: {
              type: ["string", "null"],
              description: "Email address",
            },
            phone: {
              type: ["string", "null"],
              description: "Phone number",
            },
            vins: {
              type: "array",
              items: { type: "string" },
              description: "List of VIN numbers found",
            },
            vehicleDescriptions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vin: { type: "string" },
                  make: { type: ["string", "null"] },
                  model: { type: ["string", "null"] },
                  year: { type: ["integer", "null"] },
                  color: { type: ["string", "null"] },
                },
                required: ["vin", "make", "model", "year", "color"],
                additionalProperties: false,
              },
            },
            tipoOperacao: {
              type: ["string", "null"],
              enum: ["importacao", "exportacao", null],
              description: "Operation type detected",
            },
            rawExtractedText: {
              type: "string",
              description: "Summary of key text extracted from the contract",
            },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
            warnings: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "name",
            "cpf",
            "cnpj",
            "documentType",
            "email",
            "phone",
            "vins",
            "vehicleDescriptions",
            "tipoOperacao",
            "rawExtractedText",
            "confidence",
            "warnings",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return {
      name: null,
      cpf: null,
      cnpj: null,
      documentType: null,
      email: null,
      phone: null,
      vins: [],
      vehicleDescriptions: [],
      tipoOperacao: null,
      rawExtractedText: "",
      confidence: "low",
      warnings: ["Falha na extração: resposta vazia do LLM"],
    };
  }

  try {
    const parsed = JSON.parse(content) as ExtractedContractData;

    // Validate and clean extracted data
    const warnings = [...(parsed.warnings ?? [])];

    // Validate CPF
    if (parsed.cpf) {
      const cpfDigits = parsed.cpf.replace(/\D/g, "");
      if (cpfDigits.length === 11) {
        parsed.cpf = cpfDigits;
        if (!isValidCpf(cpfDigits)) {
          warnings.push("CPF extraído não passou na validação de dígitos verificadores");
        }
      } else {
        warnings.push(`CPF extraído tem ${cpfDigits.length} dígitos (esperado 11)`);
      }
    }

    // Validate CNPJ
    if (parsed.cnpj) {
      const cnpjDigits = parsed.cnpj.replace(/\D/g, "");
      if (cnpjDigits.length === 14) {
        parsed.cnpj = cnpjDigits;
        if (!isValidCnpj(cnpjDigits)) {
          warnings.push("CNPJ extraído não passou na validação de dígitos verificadores");
        }
      } else {
        warnings.push(`CNPJ extraído tem ${cnpjDigits.length} dígitos (esperado 14)`);
      }
    }

    // Auto-detect documentType if not set
    if (!parsed.documentType) {
      if (parsed.cnpj) parsed.documentType = "cnpj";
      else if (parsed.cpf) parsed.documentType = "cpf";
    }

    // Validate VINs
    const validVins: string[] = [];
    for (const vin of parsed.vins ?? []) {
      const upper = vin.toUpperCase().trim();
      if (upper.length === 17 && isValidVin(upper)) {
        validVins.push(upper);
      } else if (upper.length > 0) {
        // Accept non-standard VINs with a warning
        validVins.push(upper);
        warnings.push(`VIN "${upper}" não é padrão (${upper.length} caracteres)`);
      }
    }
    parsed.vins = validVins;

    parsed.warnings = warnings;
    return parsed;
  } catch (err) {
    return {
      name: null,
      cpf: null,
      cnpj: null,
      documentType: null,
      email: null,
      phone: null,
      vins: [],
      vehicleDescriptions: [],
      tipoOperacao: null,
      rawExtractedText: typeof content === "string" ? content : "",
      confidence: "low",
      warnings: [`Falha ao parsear resposta do LLM: ${(err as Error).message}`],
    };
  }
}

// ══════════════════════════════════════════════════════════════
// STEP 3: Create contract record in DB (pending confirmation)
// ══════════════════════════════════════════════════════════════

export async function createContractRecord(
  pdfUrl: string,
  pdfKey: string,
  extracted: ExtractedContractData
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const envelopeId = `manual-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const [result] = await db
    .insert(clicksignContracts)
    .values({
      envelopeId,
      documentKey: pdfKey,
      signerName: extracted.name ? encryptSensitiveData(extracted.name) : null,
      signerCpf: extracted.cpf ? encryptSensitiveData(extracted.cpf) : null,
      signerEmail: extracted.email ? encryptSensitiveData(extracted.email) : null,
      signerPhone: extracted.phone ? encryptSensitiveData(extracted.phone) : null,
      extractedVins: JSON.stringify(extracted.vins),
      status: "pending",
      envelopeStatus: "manual_upload",
      envelopeName: `Upload manual — ${extracted.name ?? "Sem nome"}`,
      rawPayload: encryptSensitiveData(JSON.stringify({
        pdfUrl,
        pdfKey,
        extracted,
        uploadedAt: new Date().toISOString(),
      })),
    })
    .$returningId();

  return result.id;
}

// ══════════════════════════════════════════════════════════════
// STEP 4: Confirm and process (admin reviewed and approved)
// ══════════════════════════════════════════════════════════════

export async function confirmContract(
  contractId: number,
  confirmedData: {
    name: string;
    cpf?: string | null;
    cnpj?: string | null;
    documentType?: "cpf" | "cnpj" | null;
    email?: string | null;
    phone?: string | null;
    vins: {
      vin: string;
      make: string;
      model: string;
      year?: number | null;
      color?: string | null;
    }[];
    tipoOperacao?: "importacao" | "exportacao" | null;
  },
  adminUserId: number
): Promise<ContractConfirmResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1. Find or create customer (supports CPF or CNPJ)
  let customerId: number;
  let isNewCustomer = false;

  // Try to find existing customer by CPF or CNPJ
  let existingCustomer = null;
  if (confirmedData.cpf) {
    existingCustomer = await findCustomerByCpf(confirmedData.cpf);
  }
  if (!existingCustomer && confirmedData.cnpj) {
    const { findCustomerByCnpj } = await import("../customers/repository");
    existingCustomer = await findCustomerByCnpj(confirmedData.cnpj);
  }

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const newCustomer = await createCustomer({
      fullName: confirmedData.name,
      cpf: confirmedData.cpf ?? "",
      cnpj: confirmedData.cnpj ?? null,
      documentType: confirmedData.documentType ?? (confirmedData.cnpj ? "cnpj" : "cpf"),
      email: confirmedData.email ?? null,
      phone: confirmedData.phone ?? null,
      status: "aguardando_embarque",
      tipoOperacao: confirmedData.tipoOperacao ?? null,
      dataSource: "clicksign",
    });
    customerId = newCustomer.id;
    isNewCustomer = true;
  }

  // 2. Find or create vehicles
  const vehicleIds: number[] = [];
  let newVehicles = 0;
  let linkedVehicles = 0;

  for (const v of confirmedData.vins) {
    const existingVehicle = await findVehicleByVin(v.vin);
    if (existingVehicle) {
      vehicleIds.push(existingVehicle.id);
      // Link to customer if not already linked
      if (!existingVehicle.customerId) {
        const { linkVehicleToCustomer } = await import("../vehicles/repository");
        await linkVehicleToCustomer(existingVehicle.id, customerId);
        linkedVehicles++;
      }
    } else {
      const newVehicle = await createVehicle({
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year ?? null,
        color: v.color ?? null,
        customerId,
      });
      vehicleIds.push(newVehicle.id);
      newVehicles++;
    }
  }

  // 3. Update contract record as processed
  await db
    .update(clicksignContracts)
    .set({
      status: "processed",
      customerId,
      processedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clicksignContracts.id, contractId));

  // 4. Audit log
  await logAudit({
    userId: adminUserId,
    action: "create",
    entity: "contract",
    entityId: contractId,
    changes: {
      action: { before: null, after: "contract_confirmed" },
      customerId: { before: null, after: customerId },
      vehicleIds: { before: null, after: vehicleIds },
      isNewCustomer: { before: null, after: isNewCustomer },
    },
  });

  return {
    contractId,
    customerId,
    vehicleIds,
    isNewCustomer,
    newVehicles,
    linkedVehicles,
  };
}

// ══════════════════════════════════════════════════════════════
// FULL UPLOAD + EXTRACT FLOW (Steps 1-3 combined)
// ══════════════════════════════════════════════════════════════

export async function uploadAndExtract(
  fileBuffer: Buffer,
  fileName: string
): Promise<ContractUploadResult> {
  // Step 1: Upload to S3
  const { pdfUrl, pdfKey } = await uploadContractPdf(fileBuffer, fileName);

  // Step 2: Extract data via LLM
  const extracted = await extractContractData(pdfUrl);

  // Step 3: Create DB record
  const contractId = await createContractRecord(pdfUrl, pdfKey, extracted);

  return { pdfUrl, pdfKey, extracted, contractId };
}

// ══════════════════════════════════════════════════════════════
// LIST PENDING CONTRACTS (for admin review)
// ══════════════════════════════════════════════════════════════

export async function listPendingContracts(): Promise<
  {
    id: number;
    envelopeId: string;
    signerName: string | null;
    signerCpf: string | null;
    signerEmail: string | null;
    extractedVins: string[];
    status: string;
    envelopeName: string | null;
    pdfUrl: string | null;
    createdAt: Date;
  }[]
> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(clicksignContracts)
    .where(eq(clicksignContracts.status, "pending"))
    .orderBy(clicksignContracts.createdAt);

  return rows.map((r) => {
    let pdfUrl: string | null = null;
    try {
      const decryptedPayload = decryptIfPresent(r.rawPayload);
      const payload = decryptedPayload ? JSON.parse(decryptedPayload) : null;
      pdfUrl = payload?.pdfUrl ?? null;
    } catch {}

    return {
      id: r.id,
      envelopeId: r.envelopeId,
      signerName: decryptIfPresent(r.signerName),
      signerCpf: decryptIfPresent(r.signerCpf),
      signerEmail: decryptIfPresent(r.signerEmail),
      extractedVins: r.extractedVins ? JSON.parse(r.extractedVins) : [],
      status: r.status,
      envelopeName: r.envelopeName,
      pdfUrl,
      createdAt: r.createdAt,
    };
  });
}

// ══════════════════════════════════════════════════════════════
// LIST ALL CONTRACTS (for admin overview)
// ══════════════════════════════════════════════════════════════

export async function listAllContracts(): Promise<
  {
    id: number;
    envelopeId: string;
    signerName: string | null;
    signerCpf: string | null;
    status: string;
    customerId: number | null;
    extractedVins: string[];
    createdAt: Date;
    processedAt: Date | null;
  }[]
> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(clicksignContracts)
    .orderBy(clicksignContracts.createdAt);

  return rows.map((r) => ({
    id: r.id,
    envelopeId: r.envelopeId,
    signerName: decryptIfPresent(r.signerName),
    signerCpf: decryptIfPresent(r.signerCpf),
    status: r.status,
    customerId: r.customerId,
    extractedVins: r.extractedVins ? JSON.parse(r.extractedVins) : [],
    createdAt: r.createdAt,
    processedAt: r.processedAt,
  }));
}
