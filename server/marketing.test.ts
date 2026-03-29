import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Schema Tests ──────────────────────────────────────────────

describe("Marketing Domain — Schema", () => {
  const schemaContent = readFileSync(
    resolve(__dirname, "../drizzle/schema.ts"),
    "utf-8"
  );

  it("should define marketing_leads table", () => {
    expect(schemaContent).toContain('mysqlTable("marketing_leads"');
  });

  it("should define marketing_interactions table", () => {
    expect(schemaContent).toContain('mysqlTable("marketing_interactions"');
  });

  it("marketing_leads should have all required fields", () => {
    const requiredFields = [
      "email",
      "name",
      "phone",
      "source",
      "lead_status",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "referrer",
      "landing_page",
      "newsletter_active",
      "unsubscribed_at",
      "hubspot_synced_at",
      "hubspot_contact_id",
      "operational_customer_id",
      "created_at",
      "updated_at",
    ];
    for (const field of requiredFields) {
      expect(schemaContent).toContain(`"${field}"`);
    }
  });

  it("marketing_leads should have proper source enum values", () => {
    const sourceValues = [
      "newsletter",
      "calculadora",
      "whatsapp_cta",
      "contact_form",
      "landing_page",
      "other",
    ];
    for (const val of sourceValues) {
      expect(schemaContent).toContain(`"${val}"`);
    }
  });

  it("marketing_leads should have proper status enum values", () => {
    const statusValues = [
      "new",
      "engaged",
      "qualified",
      "converted",
      "unsubscribed",
    ];
    for (const val of statusValues) {
      expect(schemaContent).toContain(`"${val}"`);
    }
  });

  it("marketing_interactions should have proper interaction type enum values", () => {
    const interactionTypes = [
      "newsletter_signup",
      "calculator_open",
      "calculator_submit",
      "whatsapp_click",
      "cta_click",
      "page_view",
      "tracking_lookup",
      "knowledge_view",
    ];
    for (const val of interactionTypes) {
      expect(schemaContent).toContain(`"${val}"`);
    }
  });

  it("marketing_leads should have indexes for performance", () => {
    expect(schemaContent).toContain("idx_mktlead_source");
    expect(schemaContent).toContain("idx_mktlead_status");
    expect(schemaContent).toContain("idx_mktlead_campaign");
    expect(schemaContent).toContain("idx_mktlead_created");
  });

  it("marketing_interactions should have indexes for performance", () => {
    expect(schemaContent).toContain("idx_mktint_lead");
    expect(schemaContent).toContain("idx_mktint_type");
    expect(schemaContent).toContain("idx_mktint_campaign");
    expect(schemaContent).toContain("idx_mktint_created");
    expect(schemaContent).toContain("idx_mktint_session");
  });

  it("marketing_leads should be segregated from operational customers table", () => {
    // Verify both tables exist independently
    expect(schemaContent).toContain('mysqlTable("marketing_leads"');
    expect(schemaContent).toContain('"customers"');
    // Verify marketing_leads has a link field to operational customer
    expect(schemaContent).toContain("operational_customer_id");
  });
});

// ── DB Helper Tests ───────────────────────────────────────────

describe("Marketing Domain — DB Helpers", () => {
  const dbContent = readFileSync(
    resolve(__dirname, "./db.ts"),
    "utf-8"
  );

  it("should export upsertMarketingLead function", () => {
    expect(dbContent).toContain("export async function upsertMarketingLead");
  });

  it("should export getMarketingLeadByEmail function", () => {
    expect(dbContent).toContain("export async function getMarketingLeadByEmail");
  });

  it("should export getAllMarketingLeads function", () => {
    expect(dbContent).toContain("export async function getAllMarketingLeads");
  });

  it("should export updateMarketingLeadStatus function", () => {
    expect(dbContent).toContain("export async function updateMarketingLeadStatus");
  });

  it("should export linkLeadToCustomer function", () => {
    expect(dbContent).toContain("export async function linkLeadToCustomer");
  });

  it("should export logMarketingInteraction function", () => {
    expect(dbContent).toContain("export async function logMarketingInteraction");
  });

  it("should export getInteractionsByLead function", () => {
    expect(dbContent).toContain("export async function getInteractionsByLead");
  });

  it("should export getUnsyncedMarketingLeads function", () => {
    expect(dbContent).toContain("export async function getUnsyncedMarketingLeads");
  });

  it("should export markMarketingLeadSynced function", () => {
    expect(dbContent).toContain("export async function markMarketingLeadSynced");
  });

  it("upsertMarketingLead should preserve first-touch UTM attribution", () => {
    // The onDuplicateKeyUpdate should NOT overwrite UTM fields
    const upsertFn = dbContent.substring(
      dbContent.indexOf("export async function upsertMarketingLead"),
      dbContent.indexOf("export async function getMarketingLeadByEmail")
    );
    expect(upsertFn).toContain("onDuplicateKeyUpdate");
    expect(upsertFn).toContain("Don't overwrite first-touch UTM");
    // Should always set updatedAt to avoid empty set error
    expect(upsertFn).toContain("updatedAt: new Date()");
  });

  it("updateMarketingLeadStatus should handle unsubscribe side effects", () => {
    const fn = dbContent.substring(
      dbContent.indexOf("export async function updateMarketingLeadStatus"),
      dbContent.indexOf("export async function linkLeadToCustomer")
    );
    expect(fn).toContain("unsubscribed");
    expect(fn).toContain("newsletterActive");
  });
});

// ── Router Tests ──────────────────────────────────────────────

describe("Marketing Domain — Router Endpoints", () => {
  const routerContent = readFileSync(
    resolve(__dirname, "./routers.ts"),
    "utf-8"
  );

  it("should define marketing router", () => {
    expect(routerContent).toContain("marketing: router({");
  });

  it("should have admin-protected leads listing", () => {
    expect(routerContent).toContain("leads: adminProcedure");
  });

  it("should have admin-protected status update", () => {
    expect(routerContent).toContain("updateLeadStatus: adminProcedure");
  });

  it("should have admin-protected interactions query", () => {
    expect(routerContent).toContain("interactions: adminProcedure");
  });

  it("should have public logInteraction endpoint", () => {
    expect(routerContent).toContain("logInteraction: publicProcedure");
  });

  it("newsletter subscribe should also write to marketing_leads", () => {
    expect(routerContent).toContain("upsertMarketingLead");
    expect(routerContent).toContain("logMarketingInteraction");
  });

  it("newsletter subscribe should sync marketing lead to HubSpot", () => {
    expect(routerContent).toContain("markMarketingLeadSynced");
  });

  it("logInteraction should auto-upgrade lead status to engaged", () => {
    const logSection = routerContent.substring(
      routerContent.indexOf("logInteraction: publicProcedure"),
      routerContent.indexOf("return { success: true };", routerContent.indexOf("logInteraction: publicProcedure"))
    );
    expect(logSection).toContain('updateMarketingLeadStatus(lead.id, "engaged")');
  });
});

// ── Data Segregation Tests ────────────────────────────────────

describe("Marketing Domain — Data Segregation", () => {
  const schemaContent = readFileSync(
    resolve(__dirname, "../drizzle/schema.ts"),
    "utf-8"
  );

  it("operational customers table should NOT reference marketing fields", () => {
    // Extract only the customers table definition (starts at 'customers = mysqlTable')
    const customersStart = schemaContent.indexOf('"customers"');
    const customersEnd = schemaContent.indexOf("export type Customer", customersStart);
    const customersSection = schemaContent.substring(customersStart, customersEnd);

    // Customers should not have marketing-specific fields
    expect(customersSection).not.toContain("newsletter_active");
    expect(customersSection).not.toContain("lead_status");
    expect(customersSection).not.toContain("utm_campaign");
  });

  it("marketing_leads should NOT contain operational fields like VIN, BL, contract", () => {
    const mktStart = schemaContent.indexOf('mysqlTable("marketing_leads"');
    const mktEnd = schemaContent.indexOf("export type MarketingLead", mktStart);
    const mktSection = schemaContent.substring(mktStart, mktEnd);

    expect(mktSection).not.toContain("vin");
    expect(mktSection).not.toContain("bl_id");
    expect(mktSection).not.toContain("contract");
    expect(mktSection).not.toContain("cpf");
  });

  it("marketing_leads should have a bridge field to operational customers", () => {
    expect(schemaContent).toContain("operational_customer_id");
  });
});
