/**
 * Seed default site settings for EMC.
 * Run with: node server/seed-settings.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const defaultSettings = [
  // Contact
  { key: "phone_primary", value: "+55 11 99244-8920", label: "Telefone Principal", category: "contact" },
  { key: "phone_secondary", value: "+1 (786) 600-0430", label: "Telefone Secundário", category: "contact" },
  { key: "email_primary", value: "info@enviandomeucarro.com", label: "E-mail Principal", category: "contact" },
  { key: "email_secondary", value: "contato@enviandomeucarro.com", label: "E-mail Secundário", category: "contact" },
  { key: "whatsapp_url", value: "https://wa.me/5511992448920", label: "WhatsApp URL", category: "contact" },
  { key: "whatsapp_number", value: "+55 11 99244-8920", label: "WhatsApp Número", category: "contact" },

  // Addresses
  { key: "address_miami", value: "1150 NW 72nd Ave, Tower 1, Ste 455, Miami, FL 33126", label: "Escritório Miami", category: "address" },
  { key: "address_sp", value: "Vila Olímpia, São Paulo, SP", label: "Escritório São Paulo", category: "address" },
  { key: "address_itajai", value: "Próximo ao Porto de Itajaí, SC", label: "Escritório Itajaí", category: "address" },

  // Social
  { key: "instagram_url", value: "https://www.instagram.com/enviandomeucarro", label: "Instagram", category: "social" },
  { key: "facebook_url", value: "https://www.facebook.com/enviandomeucarro", label: "Facebook", category: "social" },
  { key: "youtube_url", value: "https://www.youtube.com/@enviandomeucarro", label: "YouTube", category: "social" },
  { key: "tiktok_url", value: "", label: "TikTok", category: "social" },

  // Links
  { key: "calculator_url", value: "https://calculadora.enviandomeucarro.com", label: "Calculadora de Importação", category: "links" },
  { key: "tracking_url", value: "https://rastreamento.enviandomeucarro.com", label: "Rastreamento de Veículos", category: "links" },
  { key: "google_reviews_url", value: "https://g.page/r/CfOy3RBqPbMVEBM/review", label: "Google Reviews", category: "links" },
];

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log("Seeding default settings...");

  for (const setting of defaultSettings) {
    try {
      await connection.execute(
        `INSERT INTO site_settings (\`key\`, value, label, category)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         value = IF(value = '' OR value IS NULL, VALUES(value), value),
         label = VALUES(label)`,
        [setting.key, setting.value, setting.label, setting.category]
      );
      console.log(`  ✓ ${setting.key}`);
    } catch (err) {
      console.error(`  ✗ ${setting.key}:`, err.message);
    }
  }

  await connection.end();
  console.log("Done! Seeded", defaultSettings.length, "settings.");
  process.exit(0);
}

seed();
