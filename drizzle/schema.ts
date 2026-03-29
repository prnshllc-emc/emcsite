import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────────────────────
// 1. USERS — OAuth authentication (existing, extended with role)
// ─────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 2. SITE SETTINGS — key/value store (existing)
// ─────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  label: varchar("label", { length: 256 }),
  category: varchar("category", { length: 64 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 3. NEWSLETTER SUBSCRIBERS (existing, with UTM + HubSpot sync)
// ─────────────────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 256 }),
  active: boolean("active").default(true).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  // UTM tracking fields
  utmSource: varchar("utm_source", { length: 256 }),
  utmMedium: varchar("utm_medium", { length: 256 }),
  utmCampaign: varchar("utm_campaign", { length: 256 }),
  utmContent: varchar("utm_content", { length: 256 }),
  utmTerm: varchar("utm_term", { length: 256 }),
  referrer: varchar("referrer", { length: 512 }),
  landingPage: varchar("landing_page", { length: 512 }),
  // HubSpot sync tracking
  hubspotSyncedAt: timestamp("hubspot_synced_at"),
  hubspotContactId: varchar("hubspot_contact_id", { length: 64 }),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 4. CUSTOMERS — PII encrypted with AES-256-GCM
// CPF/email/phone stored encrypted; cpfHash for search via HMAC-SHA256
// ─────────────────────────────────────────────────────────────
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    cpf: varchar("cpf", { length: 255 }).notNull(), // AES-256-GCM encrypted → salt:iv:tag:ciphertext
    cpfHash: varchar("cpf_hash", { length: 64 }).notNull().unique(), // HMAC-SHA256 for search
    cnpj: varchar("cnpj", { length: 255 }), // AES-256-GCM encrypted (nullable — only for PJ)
    cnpjHash: varchar("cnpj_hash", { length: 64 }).unique(), // HMAC-SHA256 for search
    documentType: mysqlEnum("document_type", ["cpf", "cnpj"]).default("cpf").notNull(), // cpf = pessoa física, cnpj = pessoa jurídica
    name: varchar("name", { length: 255 }).notNull(), // plaintext
    email: varchar("email", { length: 500 }), // AES-256-GCM encrypted
    phone: varchar("phone", { length: 255 }), // AES-256-GCM encrypted
    // ── Clicksign integration ──
    status: mysqlEnum("status", [
      "aguardando_embarque", // Contract signed, awaiting shipping start
      "aguardando_li",       // Import to Brazil, awaiting Import License
      "em_processo",         // VIN found in existing BL (automatic)
      "concluido",           // Vehicle delivered
      "cancelado",           // Contract canceled
    ]).default("aguardando_embarque").notNull(),
    tipoOperacao: mysqlEnum("tipo_operacao", [
      "importacao",
      "exportacao",
    ]),
    clicksignEnvelopeId: varchar("clicksign_envelope_id", { length: 100 }),
    clicksignSignerId: varchar("clicksign_signer_id", { length: 100 }),
    // ── Data source & manual override tracking ──
    dataSource: mysqlEnum("data_source", [
      "manual",     // Created/edited by admin in the panel
      "clicksign",  // Imported from Clicksign contract
      "agent",      // Created by AI agent via API
    ]).default("manual").notNull(),
    manualOverrides: json("manual_overrides").$type<string[]>(), // Array of field names manually edited, e.g. ["name", "email"]
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"), // soft delete — NULL = active
  },
  (table) => [
    index("idx_customer_deleted").on(table.deletedAt),
    index("idx_customer_status").on(table.status),
    index("idx_customer_tipo_op").on(table.tipoOperacao),
    index("idx_customer_clicksign").on(table.clicksignEnvelopeId),
  ]
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 5. VEHICLES — VIN (17 chars) as unique key, links to customer
// ─────────────────────────────────────────────────────────────
export const vehicles = mysqlTable(
  "vehicles",
  {
    id: int("id").autoincrement().primaryKey(),
    vin: varchar("vin", { length: 30 }).notNull().unique(), // Vehicle Identification Number (17 standard, up to 30 for legacy/BR chassis)
    customerId: int("customer_id"), // FK → customers (nullable until reconciled)
    make: varchar("make", { length: 50 }), // e.g. Ford
    model: varchar("model", { length: 100 }), // e.g. Mustang GT
    year: int("year"),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    lastReconciliationAttempt: timestamp("last_reconciliation_attempt"), // incremental reconciliation
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => [
    index("idx_vehicle_customer").on(table.customerId),
    index("idx_vehicle_deleted").on(table.deletedAt),
    index("idx_vehicle_reconciliation").on(table.lastReconciliationAttempt),
  ]
);

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 6. BILLS OF LADING — Maritime shipping document lifecycle
// BL Number is unique key; controls full tracking lifecycle
// ─────────────────────────────────────────────────────────────
export const billsOfLading = mysqlTable(
  "bills_of_lading",
  {
    id: int("id").autoincrement().primaryKey(),
    blNumber: varchar("bl_number", { length: 50 }).notNull().unique(),
    vehicleId: int("vehicle_id"), // FK → vehicles (nullable until reconciled)
    customerId: int("customer_id"), // FK → customers (nullable)
    containerNumber: varchar("container_number", { length: 20 }),
    vehicleDescription: varchar("vehicle_description", { length: 255 }),
    originPort: varchar("origin_port", { length: 100 }),
    destinationPort: varchar("destination_port", { length: 100 }),
    status: mysqlEnum("status", [
      "draft",
      "final",
      "in_transit",
      "arrived",
      "customs",
      "delivered",
    ]).default("draft").notNull(),
    trackingActive: boolean("tracking_active").default(false).notNull(),
    trackingStartedAt: timestamp("tracking_started_at"),
    trackingEndedAt: timestamp("tracking_ended_at"),
    trackingEndReason: varchar("tracking_end_reason", { length: 50 }), // arrived | delivered | manual | error
    estimatedDeparture: timestamp("estimated_departure"),
    actualDeparture: timestamp("actual_departure"),
    estimatedArrival: timestamp("estimated_arrival"),
    actualArrival: timestamp("actual_arrival"),
    blType: mysqlEnum("bl_type", ["draft", "final"]).default("draft"),
    blDraftReceivedAt: timestamp("bl_draft_received_at"),
    blFinalReceivedAt: timestamp("bl_final_received_at"),
    sourceEmail: varchar("source_email", { length: 320 }),
    rawBlData: text("raw_bl_data"), // JSON validated with Zod before saving
    lastReconciliationAttempt: timestamp("last_reconciliation_attempt"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => [
    index("idx_bl_customer").on(table.customerId),
    index("idx_bl_status").on(table.status),
    index("idx_bl_tracking").on(table.trackingActive),
    index("idx_bl_vehicle").on(table.vehicleId),
    index("idx_bl_deleted").on(table.deletedAt),
    index("idx_bl_reconciliation").on(table.lastReconciliationAttempt),
  ]
);

export type BillOfLading = typeof billsOfLading.$inferSelect;
export type InsertBillOfLading = typeof billsOfLading.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 6b. BL_VEHICLES — Many-to-many junction between BLs and Vehicles
// A single BL/container can carry multiple vehicles from different owners.
// Each row links one vehicle to one BL, with its specific customer (owner).
// ─────────────────────────────────────────────────────────────
export const blVehicles = mysqlTable(
  "bl_vehicles",
  {
    id: int("id").autoincrement().primaryKey(),
    blId: int("bl_id").notNull(), // FK → bills_of_lading
    vehicleId: int("vehicle_id").notNull(), // FK → vehicles
    customerId: int("customer_id"), // FK → customers (owner of THIS vehicle in this BL)
    position: int("position"), // Position in container (1, 2, 3...)
    notes: varchar("notes", { length: 500 }), // e.g. "DU-E 26BR0003342440"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_blv_bl").on(table.blId),
    index("idx_blv_vehicle").on(table.vehicleId),
    index("idx_blv_customer").on(table.customerId),
    uniqueIndex("idx_blv_bl_vehicle").on(table.blId, table.vehicleId),
  ]
);

export type BlVehicle = typeof blVehicles.$inferSelect;
export type InsertBlVehicle = typeof blVehicles.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 7. TRACKING CODES — Access codes for clients to track shipments
// Format: EMC-XXXX-XXXX-XXXX (~62 bits entropy, no ambiguous chars)
// ─────────────────────────────────────────────────────────────
export const trackingCodes = mysqlTable(
  "tracking_codes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 20 }).notNull().unique(), // EMC-AB3D-EF7G-HJ9K
    blId: int("bl_id").notNull(), // FK → bills_of_lading
    customerId: int("customer_id").notNull(), // FK → customers
    isActive: boolean("is_active").default(false).notNull(), // starts inactive until approved
    approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    approvedAt: timestamp("approved_at"),
    approvedBy: int("approved_by"), // FK → users (admin who approved)
    rejectedAt: timestamp("rejected_at"),
    rejectionReason: varchar("rejection_reason", { length: 500 }),
    autoGenerated: boolean("auto_generated").default(false).notNull(), // true = auto-created on customer link
    expiresAt: timestamp("expires_at").notNull(),
    usedCount: int("used_count").default(0).notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => [
    index("idx_tc_bl").on(table.blId),
    index("idx_tc_customer").on(table.customerId),
    index("idx_tc_active").on(table.isActive),
    index("idx_tc_approval").on(table.approvalStatus),
  ]
);

export type TrackingCode = typeof trackingCodes.$inferSelect;
export type InsertTrackingCode = typeof trackingCodes.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 8. TRACKING HISTORY — Location/status events per BL
// ─────────────────────────────────────────────────────────────
export const trackingHistory = mysqlTable(
  "tracking_history",
  {
    id: int("id").autoincrement().primaryKey(),
    blId: int("bl_id").notNull(), // FK → bills_of_lading
    status: varchar("status", { length: 100 }).notNull(),
    location: varchar("location", { length: 255 }),
    description: text("description"),
    eventDate: timestamp("event_date").notNull(),
    rawData: text("raw_data"), // JSON from external API
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_th_bl").on(table.blId),
    index("idx_th_bl_date").on(table.blId, table.eventDate),
  ]
);

export type TrackingHistoryEntry = typeof trackingHistory.$inferSelect;
export type InsertTrackingHistoryEntry = typeof trackingHistory.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 9. CLICKSIGN CONTRACTS — Signed contract references
// ─────────────────────────────────────────────────────────────
export const clicksignContracts = mysqlTable(
  "clicksign_contracts",
  {
    id: int("id").autoincrement().primaryKey(),
    // Clicksign identifiers
    envelopeId: varchar("envelope_id", { length: 100 }).notNull(), // Clicksign envelope UUID
    documentKey: varchar("document_key", { length: 100 }), // Clicksign document UUID (nullable)
    // Signer data extracted from Clicksign
    signerName: varchar("signer_name", { length: 255 }),
    signerCpf: varchar("signer_cpf", { length: 20 }), // raw CPF from Clicksign (123.456.789-00)
    signerEmail: varchar("signer_email", { length: 320 }),
    signerPhone: varchar("signer_phone", { length: 50 }),
    // VINs extracted from document content (parsed)
    extractedVins: text("extracted_vins"), // JSON array of VIN strings ["VIN1", "VIN2"]
    // Reconciliation links
    customerId: int("customer_id"), // FK → customers (filled after processing)
    // Processing state
    status: mysqlEnum("status", [
      "pending",    // fetched from Clicksign, not yet processed
      "signed",     // contract is signed in Clicksign
      "processed",  // customer+vehicles reconciled in our system
      "error",      // processing failed
      "ignored",    // manually marked as irrelevant
    ]).default("pending").notNull(),
    envelopeStatus: varchar("envelope_status", { length: 50 }), // Clicksign envelope status
    envelopeName: varchar("envelope_name", { length: 500 }), // Clicksign envelope name
    rawPayload: text("raw_payload"), // Full API response JSON
    processedAt: timestamp("processed_at"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_cs_status").on(table.status),
    index("idx_cs_created").on(table.createdAt),
    index("idx_cs_envelope").on(table.envelopeId),
    index("idx_cs_cpf").on(table.signerCpf),
    index("idx_cs_customer").on(table.customerId),
  ]
);

export type ClicksignContract = typeof clicksignContracts.$inferSelect;
export type InsertClicksignContract = typeof clicksignContracts.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 10. PROCESSED EMAILS — Outbox pattern for email processing
// Emails persisted as 'pending' before any processing
// ─────────────────────────────────────────────────────────────
export const processedEmails = mysqlTable(
  "processed_emails",
  {
    id: int("id").autoincrement().primaryKey(),
    messageId: varchar("message_id", { length: 255 }).notNull().unique(),
    subject: varchar("subject", { length: 500 }),
    sender: varchar("sender", { length: 320 }),
    receivedAt: timestamp("received_at"),
    blExtracted: boolean("bl_extracted").default(false).notNull(),
    blId: int("bl_id"), // FK → bills_of_lading (filled after extraction)
    processingStatus: mysqlEnum("processing_status", [
      "pending",
      "processing",
      "processed",
      "error",
      "ignored",
    ]).default("pending").notNull(),
    retryCount: int("retry_count").default(0).notNull(),
    lastRetryAt: timestamp("last_retry_at"),
    rawPayload: text("raw_payload"), // Full webhook payload for reprocessing
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_pe_status").on(table.processingStatus),
    index("idx_pe_retry").on(table.processingStatus, table.retryCount),
  ]
);

export type ProcessedEmail = typeof processedEmails.$inferSelect;
export type InsertProcessedEmail = typeof processedEmails.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 11. CLIENT INVITES — Multi-step onboarding with partial save
// ─────────────────────────────────────────────────────────────
export const clientInvites = mysqlTable(
  "client_invites",
  {
    id: int("id").autoincrement().primaryKey(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    status: mysqlEnum("status", [
      "pending",
      "in_progress",
      "completed",
      "contract_sent",
      "contract_signed",
      "expired",
    ]).default("pending").notNull(),
    progress: int("progress").default(0).notNull(), // 0-100
    clientData: text("client_data"), // JSON validated with ClientDataSchema
    vehicleData: text("vehicle_data"), // JSON validated with VehicleDataSchema
    customerId: int("customer_id"), // FK → customers (after completion)
    vehicleId: int("vehicle_id"), // FK → vehicles (after completion)
    clicksignDocumentKey: varchar("clicksign_document_key", { length: 100 }),
    lastAccessedAt: timestamp("last_accessed_at"),
    expiresAt: timestamp("expires_at").notNull(),
    invitedBy: int("invited_by").notNull(), // FK → users (admin)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_invite_status").on(table.status),
    index("idx_invite_email").on(table.email),
  ]
);

export type ClientInvite = typeof clientInvites.$inferSelect;
export type InsertClientInvite = typeof clientInvites.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 12. CLIENT DOCUMENTS — Files uploaded during onboarding (S3)
// ─────────────────────────────────────────────────────────────
export const clientDocuments = mysqlTable(
  "client_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    inviteId: int("invite_id").notNull(), // FK → client_invites
    documentType: mysqlEnum("document_type", [
      // Personal documents
      "identity_document",
      "proof_of_address",
      // Vehicle documents
      "vehicle_title",
      "vehicle_registration",
      // Exterior photos
      "photo_front",
      "photo_front_diagonal_driver",
      "photo_side_driver",
      "photo_rear_diagonal_driver",
      "photo_rear",
      "photo_rear_diagonal_passenger",
      "photo_side_passenger",
      "photo_front_diagonal_passenger",
      // Engine and chassis
      "photo_engine",
      "photo_engine_number",
      "photo_chassis_number",
      // Interior
      "photo_interior_front",
      "photo_dashboard",
      "photo_interior_rear",
      "photo_trunk",
    ]).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 1000 }).notNull(), // S3 URL
    fileSize: int("file_size").notNull(), // bytes
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    isValid: boolean("is_valid").default(true).notNull(),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_doc_invite").on(table.inviteId),
  ]
);

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = typeof clientDocuments.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 13. AUDIT LOG — Administrative action tracking
// ─────────────────────────────────────────────────────────────
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id"), // FK → users (NULL = system action)
    action: varchar("action", { length: 50 }).notNull(), // create | update | delete | restore
    entity: varchar("entity", { length: 50 }).notNull(), // customer | bl | vehicle | tracking_code | invite
    entityId: int("entity_id").notNull(),
    changes: text("changes"), // JSON diff: { field: { before, after } }
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_entity").on(table.entity, table.entityId),
    index("idx_audit_user").on(table.userId),
    index("idx_audit_date").on(table.createdAt),
  ]
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type InsertAuditLogEntry = typeof auditLog.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 14. SYSTEM CONFIG — Dynamic key-value configuration
// ─────────────────────────────────────────────────────────────
export const systemConfig = mysqlTable("system_config", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updated_by"), // FK → users (admin who changed)
});

export type SystemConfigEntry = typeof systemConfig.$inferSelect;
export type InsertSystemConfigEntry = typeof systemConfig.$inferInsert;


// ─────────────────────────────────────────────────────────────
// 15. CMS CATEGORIES — Content categories for Knowledge Center
// ─────────────────────────────────────────────────────────────
export const cmsCategories = mysqlTable(
  "cms_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    label: varchar("label", { length: 255 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }), // lucide icon name e.g. "Ship", "Globe"
    color: varchar("color", { length: 50 }), // tailwind class e.g. "text-blue-400"
    sortOrder: int("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_cms_cat_active").on(table.isActive),
    index("idx_cms_cat_sort").on(table.sortOrder),
  ]
);

export type CmsCategory = typeof cmsCategories.$inferSelect;
export type InsertCmsCategory = typeof cmsCategories.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 16. CMS ARTICLES — Blog posts / Knowledge Center articles
// ─────────────────────────────────────────────────────────────
export const cmsArticles = mysqlTable(
  "cms_articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"), // meta description / excerpt
    content: text("content"), // full Markdown body
    categoryId: int("category_id"), // FK → cms_categories
    // SEO fields
    metaTitle: varchar("meta_title", { length: 120 }), // override for <title>
    metaDescription: varchar("meta_description", { length: 320 }), // override for <meta description>
    metaKeywords: varchar("meta_keywords", { length: 500 }), // comma-separated
    canonicalUrl: varchar("canonical_url", { length: 500 }),
    ogImage: varchar("og_image", { length: 1000 }), // Open Graph image URL
    // Content metadata
    author: varchar("author", { length: 255 }).default("Enviando Meu Carro"),
    readTime: varchar("read_time", { length: 20 }), // e.g. "12 min"
    tags: text("tags"), // JSON array of tag strings
    featuredImage: varchar("featured_image", { length: 1000 }), // hero image URL
    // Publishing
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    // Schema.org structured data
    schemaType: varchar("schema_type", { length: 50 }).default("Article"), // Article, HowTo, FAQPage, etc.
    schemaData: text("schema_data"), // JSON-LD override (optional)
    // Tracking
    viewCount: int("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => [
    index("idx_cms_art_category").on(table.categoryId),
    index("idx_cms_art_status").on(table.status),
    index("idx_cms_art_published").on(table.publishedAt),
    index("idx_cms_art_deleted").on(table.deletedAt),
  ]
);

export type CmsArticle = typeof cmsArticles.$inferSelect;
export type InsertCmsArticle = typeof cmsArticles.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 17. CMS MEDIA — Uploaded images, videos, documents
// ─────────────────────────────────────────────────────────────
export const cmsMedia = mysqlTable(
  "cms_media",
  {
    id: int("id").autoincrement().primaryKey(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 1000 }).notNull(), // S3 CDN URL
    fileKey: varchar("file_key", { length: 500 }).notNull(), // S3 key
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: int("file_size").notNull(), // bytes
    altText: varchar("alt_text", { length: 500 }), // SEO alt text
    caption: varchar("caption", { length: 500 }),
    width: int("width"),
    height: int("height"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cms_media_mime").on(table.mimeType),
  ]
);

export type CmsMedia = typeof cmsMedia.$inferSelect;
export type InsertCmsMedia = typeof cmsMedia.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 18. CMS NAVIGATION — Menu items for header/footer
// ─────────────────────────────────────────────────────────────
export const cmsNavigation = mysqlTable(
  "cms_navigation",
  {
    id: int("id").autoincrement().primaryKey(),
    location: mysqlEnum("location", ["header", "footer_services", "footer_routes", "footer_quick"]).notNull(),
    label: varchar("label", { length: 128 }).notNull(),
    href: varchar("href", { length: 500 }).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    parentId: int("parent_id"), // FK → self (for dropdowns)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_cms_nav_location").on(table.location),
    index("idx_cms_nav_sort").on(table.sortOrder),
  ]
);

export type CmsNavItem = typeof cmsNavigation.$inferSelect;
export type InsertCmsNavItem = typeof cmsNavigation.$inferInsert;

// ─────────────────────────────────────────────────────────────
// 19. EMAIL TEMPLATES — Customizable notification templates
// Admin can create/edit templates for each stage/event.
// Templates use {{variable}} placeholders replaced at send time.
// ─────────────────────────────────────────────────────────────
export const emailTemplates = mysqlTable(
  "email_templates",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull().unique(), // e.g. "stage_em_transito", "tracking_code_approved"
    name: varchar("name", { length: 255 }).notNull(), // Human-readable name
    description: varchar("description", { length: 500 }), // Admin description of when this template is used
    // Email fields
    subject: varchar("subject", { length: 500 }).notNull(),
    bodyHtml: text("body_html").notNull(), // HTML body with {{placeholders}}
    designJson: text("design_json"), // Unlayer editor design JSON (for visual editor re-editing)
    bodyText: text("body_text"), // Plain text fallback
    // WhatsApp fields
    whatsappMessage: text("whatsapp_message"), // WhatsApp message with {{placeholders}}
    // Metadata
    category: mysqlEnum("category", [
      "stage_change",      // Process stage notifications
      "tracking",          // Tracking code notifications
      "onboarding",        // Client invite/onboarding
      "system",            // System notifications
      "marketing",         // Marketing/promotional
    ]).default("stage_change").notNull(),
    availableVariables: text("available_variables"), // JSON array of variable names e.g. ["name", "blNumber", "trackingCode"]
    isActive: boolean("is_active").default(true).notNull(),
    isDefault: boolean("is_default").default(false).notNull(), // System-provided defaults (cannot delete)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    updatedBy: int("updated_by"), // FK → users (admin who last edited)
  },
  (table) => [
    index("idx_et_category").on(table.category),
    index("idx_et_active").on(table.isActive),
  ]
);

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// ─────────────────────────────────────────────────────────────
// WHATSAPP MESSAGES — Log of all WhatsApp messages sent/received
// ─────────────────────────────────────────────────────────────
export const whatsappMessages = mysqlTable(
  "whatsapp_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    // Direction: outbound (we sent) or inbound (customer replied)
    direction: mysqlEnum("direction", ["outbound", "inbound"])
      .notNull()
      .default("outbound"),
    // Message type: template (pre-approved) or text (free-form within service window)
    messageType: mysqlEnum("message_type", ["template", "text", "image", "document"])
      .notNull()
      .default("template"),
    // Meta WhatsApp message ID (wamid.xxx)
    waMessageId: varchar("wa_message_id", { length: 255 }),
    // Recipient/sender phone number (E.164 format, e.g. +5511999999999)
    phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
    // Template name (for outbound template messages, matches Meta-approved template)
    templateName: varchar("template_name", { length: 255 }),
    // Template language (e.g. "pt_BR")
    templateLanguage: varchar("template_language", { length: 10 }),
    // Message body (for text messages or template body preview)
    body: text("body"),
    // Delivery status from Meta webhook
    status: mysqlEnum("status", [
      "pending",    // Queued for sending
      "sent",       // Sent to Meta API
      "delivered",  // Delivered to device
      "read",       // Read by recipient
      "failed",     // Failed to send
    ])
      .notNull()
      .default("pending"),
    // Error details if failed
    errorCode: varchar("error_code", { length: 32 }),
    errorMessage: text("error_message"),
    // Link to customer (nullable for unknown inbound)
    customerId: int("customer_id"),
    // Link to BL (optional context)
    blId: int("bl_id"),
    // Event that triggered this message (e.g. "stage_change", "tracking_approved")
    triggerEvent: varchar("trigger_event", { length: 128 }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    deliveredAt: timestamp("delivered_at"),
    readAt: timestamp("read_at"),
  },
  (table) => [
    index("idx_wamsg_phone").on(table.phoneNumber),
    index("idx_wamsg_customer").on(table.customerId),
    index("idx_wamsg_status").on(table.status),
    index("idx_wamsg_wa_id").on(table.waMessageId),
  ]
);

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;

// ─────────────────────────────────────────────────────────────
// MARKETING DOMAIN — Segregated from operational data
// Captures leads from site CTAs, newsletter, calculadora, WhatsApp
// ─────────────────────────────────────────────────────────────

// marketing_leads: Central lead repository for all site-generated contacts
export const marketingLeads = mysqlTable("marketing_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 256 }),
  phone: varchar("phone", { length: 32 }),
  // Lead source: which entry point generated this lead
  source: mysqlEnum("source", [
    "newsletter",       // Footer newsletter signup
    "calculadora",      // Calculator form submission
    "whatsapp_cta",     // WhatsApp button click (tracked via message)
    "contact_form",     // Future: contact form
    "landing_page",     // Future: dedicated landing pages
    "other",
  ]).notNull().default("newsletter"),
  // Lead status
  status: mysqlEnum("lead_status", [
    "new",              // Just captured
    "engaged",          // Interacted again (e.g. opened calculator)
    "qualified",        // Meets criteria for sales follow-up
    "converted",        // Became an operational customer
    "unsubscribed",     // Opted out
  ]).notNull().default("new"),
  // First-touch UTM attribution
  utmSource: varchar("utm_source", { length: 256 }),
  utmMedium: varchar("utm_medium", { length: 256 }),
  utmCampaign: varchar("utm_campaign", { length: 256 }),
  utmContent: varchar("utm_content", { length: 256 }),
  utmTerm: varchar("utm_term", { length: 256 }),
  referrer: varchar("referrer", { length: 512 }),
  landingPage: varchar("landing_page", { length: 512 }),
  // Newsletter subscription
  newsletterActive: boolean("newsletter_active").default(true).notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  // HubSpot sync
  hubspotSyncedAt: timestamp("hubspot_synced_at"),
  hubspotContactId: varchar("hubspot_contact_id", { length: 64 }),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  // Link to operational customer (when converted)
  operationalCustomerId: int("operational_customer_id"),
}, (table) => [
  index("idx_mktlead_source").on(table.source),
  index("idx_mktlead_status").on(table.status),
  index("idx_mktlead_campaign").on(table.utmCampaign),
  index("idx_mktlead_created").on(table.createdAt),
]);

export type MarketingLead = typeof marketingLeads.$inferSelect;
export type InsertMarketingLead = typeof marketingLeads.$inferInsert;

// marketing_interactions: Event log for lead activity tracking
export const marketingInteractions = mysqlTable("marketing_interactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("lead_id"),  // nullable: some interactions happen before lead is identified
  // Interaction type
  interactionType: mysqlEnum("interaction_type", [
    "newsletter_signup",    // Subscribed to newsletter
    "calculator_open",      // Opened the calculator
    "calculator_submit",    // Submitted a calculation
    "whatsapp_click",       // Clicked WhatsApp CTA
    "cta_click",            // Clicked any other CTA
    "page_view",            // Visited a service page
    "tracking_lookup",      // Used public tracking lookup
    "knowledge_view",       // Viewed a knowledge center article
  ]).notNull(),
  // Session UTM (may differ from first-touch on lead)
  utmSource: varchar("utm_source", { length: 256 }),
  utmMedium: varchar("utm_medium", { length: 256 }),
  utmCampaign: varchar("utm_campaign", { length: 256 }),
  utmContent: varchar("utm_content", { length: 256 }),
  // Context
  pageUrl: varchar("page_url", { length: 512 }),
  servicePage: varchar("service_page", { length: 128 }),  // e.g. "importacao-de-veiculos"
  // Additional metadata (JSON)
  metadata: json("metadata"),  // e.g. { buttonText: "Simule seus Custos", calculatorResult: {...} }
  // IP-based fingerprint for anonymous tracking (hashed)
  sessionFingerprint: varchar("session_fingerprint", { length: 64 }),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_mktint_lead").on(table.leadId),
  index("idx_mktint_type").on(table.interactionType),
  index("idx_mktint_campaign").on(table.utmCampaign),
  index("idx_mktint_created").on(table.createdAt),
  index("idx_mktint_session").on(table.sessionFingerprint),
]);

export type MarketingInteraction = typeof marketingInteractions.$inferSelect;
export type InsertMarketingInteraction = typeof marketingInteractions.$inferInsert;
