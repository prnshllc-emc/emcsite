/**
 * Seed script: Insert the 7 active customers into the database.
 * Uses the repository layer directly (with encryption).
 * Run: node scripts/seed-customers.mjs
 *
 * NOTE: This uses raw SQL via mysql2 because the seed runs outside the app context.
 * CPF is encrypted with AES-256-GCM and hashed with HMAC-SHA256 for search.
 */
import crypto from "crypto";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
if (!ENCRYPTION_KEY) {
  console.error("DATA_ENCRYPTION_KEY not set");
  process.exit(1);
}

// ── Encryption helpers (must match server/shared/security.ts) ──
function encryptSensitiveData(plaintext) {
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function hashCpfForSearch(cpfDigits) {
  return crypto.createHmac("sha256", ENCRYPTION_KEY).update(cpfDigits).digest("hex");
}

// ── Customer data ──
const customers = [
  {
    name: "Andre Luiz Miranda Simas",
    cpf: "28991617840",
    email: null, // not available from PDF
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "manual",
    clicksignEnvelopeId: null,
  },
  {
    name: "Paulo Sergio Carvalho dos Santos Junior",
    cpf: "03940170135",
    email: "paulo.mns@hotmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "e5bc9207-58ba-4e95-a5c6-5501e18d893c",
  },
  {
    name: "Huber Mastelari",
    cpf: null, // not available from Clicksign
    email: "hubermastelari@gmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "f7bc0a55-d667-4095-a1d7-8b5791977c55",
  },
  {
    name: "Sandoval Gonçalves Pereira",
    cpf: null,
    email: "samboston14@gmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "ef95494b-f1fb-4441-83af-fdb98ed08f0a",
  },
  {
    name: "André Francisco Junqueira Merino Teles",
    cpf: null,
    email: "Afteles@hotmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "4b296c9a-97c0-4bb9-8eb2-529d691732c9",
  },
  {
    name: "Roberto Nunes Fortaleza Neto",
    cpf: null,
    email: "fortaleza.neto@gmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "c2cc2ba1-95a6-4e26-b54f-39e347967859",
  },
  {
    name: "Fabricio Oliveira Menezes",
    cpf: null,
    email: "fabricio.o.menezes@gmail.com",
    phone: null,
    status: "aguardando_embarque",
    tipoOperacao: "importacao",
    dataSource: "clicksign",
    clicksignEnvelopeId: "01e7c2e2-6809-442b-bccb-2dec20ff14ee",
  },
];

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log("Connected to database.");

  let inserted = 0;
  let skipped = 0;

  for (const c of customers) {
    // For customers without CPF, use a placeholder hash based on name+email
    let cpfEncrypted, cpfHash;
    if (c.cpf) {
      cpfEncrypted = encryptSensitiveData(c.cpf);
      cpfHash = hashCpfForSearch(c.cpf);
    } else {
      // Generate a deterministic placeholder from name (will be updated when CPF is provided)
      const placeholder = `PENDING_${c.name.replace(/\s/g, "_").toUpperCase()}`;
      cpfEncrypted = encryptSensitiveData(placeholder);
      cpfHash = hashCpfForSearch(placeholder);
    }

    // Check if already exists by cpf_hash
    const [existing] = await connection.execute(
      "SELECT id FROM customers WHERE cpf_hash = ?",
      [cpfHash]
    );

    if (existing.length > 0) {
      console.log(`  SKIP: ${c.name} (already exists, id=${existing[0].id})`);
      skipped++;
      continue;
    }

    const emailEncrypted = c.email ? encryptSensitiveData(c.email) : null;
    const phoneEncrypted = c.phone ? encryptSensitiveData(c.phone) : null;

    await connection.execute(
      `INSERT INTO customers (name, cpf, cpf_hash, email, phone, status, tipo_operacao, data_source, clicksign_envelope_id, manual_overrides, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', NOW(), NOW())`,
      [
        c.name,
        cpfEncrypted,
        cpfHash,
        emailEncrypted,
        phoneEncrypted,
        c.status,
        c.tipoOperacao,
        c.dataSource,
        c.clicksignEnvelopeId,
      ]
    );
    console.log(`  INSERT: ${c.name} (${c.dataSource})`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);

  // Also insert Simas vehicles if not exist
  const simasVehicles = [
    { vin: "210716", make: "AM General", model: "GM M1123 Humvee H1", year: 1990, color: "Verde" },
    { vin: "1FTEX15H6MKA92716", make: "Ford", model: "F150 Pickup Cabine Estendida", year: 1991, color: "Branca" },
  ];

  // Get Simas customer ID
  const [simasRows] = await connection.execute(
    "SELECT id FROM customers WHERE name = ?",
    ["Andre Luiz Miranda Simas"]
  );
  const simasId = simasRows.length > 0 ? simasRows[0].id : null;

  for (const v of simasVehicles) {
    const [existingV] = await connection.execute(
      "SELECT id FROM vehicles WHERE vin = ?",
      [v.vin]
    );
    if (existingV.length > 0) {
      console.log(`  SKIP vehicle: ${v.vin} (already exists)`);
      // Update customer_id if not set
      if (simasId) {
        await connection.execute(
          "UPDATE vehicles SET customer_id = ? WHERE vin = ? AND customer_id IS NULL",
          [simasId, v.vin]
        );
      }
      continue;
    }
    await connection.execute(
      `INSERT INTO vehicles (vin, customer_id, make, model, year, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [v.vin, simasId, v.make, v.model, v.year, v.color]
    );
    console.log(`  INSERT vehicle: ${v.vin} → ${v.make} ${v.model} (customer_id=${simasId})`);
  }

  await connection.end();
  console.log("\nSeed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
