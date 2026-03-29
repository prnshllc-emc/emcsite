import { eq, isNull, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, siteSettings, newsletterSubscribers, marketingLeads, marketingInteractions, type InsertSiteSetting, type InsertNewsletterSubscriber, type InsertMarketingLead, type InsertMarketingInteraction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Site Settings =====

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings).where(eq(siteSettings.category, category));
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(setting: { key: string; value: string; label?: string; category: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(siteSettings).values({
    key: setting.key,
    value: setting.value,
    label: setting.label ?? null,
    category: setting.category,
  }).onDuplicateKeyUpdate({
    set: {
      value: setting.value,
      label: setting.label ?? undefined,
    },
  });
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(siteSettings).where(eq(siteSettings.key, key));
}

// ===== Newsletter Subscribers =====

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers);
}

export async function addSubscriber(data: {
  email: string;
  name?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(newsletterSubscribers).values({
    email: data.email,
    name: data.name ?? null,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    utmTerm: data.utmTerm ?? null,
    referrer: data.referrer ?? null,
    landingPage: data.landingPage ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      active: true,
      name: data.name ?? undefined,
    },
  });
}

export async function removeSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
}

export async function toggleSubscriberActive(id: number, active: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(newsletterSubscribers)
    .set({ active, unsubscribedAt: active ? null : new Date() })
    .where(eq(newsletterSubscribers.id, id));
}

// ===== HubSpot Sync =====

export async function getUnsyncedSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.hubspotSyncedAt));
}

export async function markSubscribersAsSynced(ids: number[], hubspotContactIds: Map<number, string>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const id of ids) {
    const contactId = hubspotContactIds.get(id) ?? null;
    await db.update(newsletterSubscribers)
      .set({
        hubspotSyncedAt: new Date(),
        hubspotContactId: contactId,
      })
      .where(eq(newsletterSubscribers.id, id));
  }
}

// ===== Marketing Leads =====

export async function upsertMarketingLead(data: {
  email: string;
  name?: string;
  phone?: string;
  source: "newsletter" | "calculadora" | "whatsapp_cta" | "contact_form" | "landing_page" | "other";
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketingLeads).values({
    email: data.email,
    name: data.name ?? null,
    phone: data.phone ?? null,
    source: data.source,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    utmTerm: data.utmTerm ?? null,
    referrer: data.referrer ?? null,
    landingPage: data.landingPage ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      // Always touch updatedAt so the upsert has at least one value to set
      updatedAt: new Date(),
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      // Don't overwrite first-touch UTM — keep original attribution
    },
  });
  // Return the lead
  const result = await db.select().from(marketingLeads)
    .where(eq(marketingLeads.email, data.email)).limit(1);
  return result[0] ?? null;
}

export async function getMarketingLeadByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(marketingLeads)
    .where(eq(marketingLeads.email, email)).limit(1);
  return result[0] ?? null;
}

export async function getAllMarketingLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketingLeads).orderBy(marketingLeads.createdAt);
}

export async function updateMarketingLeadStatus(id: number, status: "new" | "engaged" | "qualified" | "converted" | "unsubscribed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (status === "unsubscribed") {
    updateData.newsletterActive = false;
    updateData.unsubscribedAt = new Date();
  }
  await db.update(marketingLeads).set(updateData).where(eq(marketingLeads.id, id));
}

export async function linkLeadToCustomer(leadId: number, customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketingLeads).set({
    status: "converted",
    operationalCustomerId: customerId,
  }).where(eq(marketingLeads.id, leadId));
}

export async function getUnsyncedMarketingLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketingLeads)
    .where(isNull(marketingLeads.hubspotSyncedAt));
}

export async function markMarketingLeadSynced(id: number, hubspotContactId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketingLeads).set({
    hubspotSyncedAt: new Date(),
    hubspotContactId: hubspotContactId,
  }).where(eq(marketingLeads.id, id));
}

// ===== Marketing Interactions =====

export async function logMarketingInteraction(data: {
  leadId?: number;
  interactionType: "newsletter_signup" | "calculator_open" | "calculator_submit" | "whatsapp_click" | "cta_click" | "page_view" | "tracking_lookup" | "knowledge_view";
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  pageUrl?: string;
  servicePage?: string;
  metadata?: Record<string, unknown>;
  sessionFingerprint?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketingInteractions).values({
    leadId: data.leadId ?? null,
    interactionType: data.interactionType,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    pageUrl: data.pageUrl ?? null,
    servicePage: data.servicePage ?? null,
    metadata: data.metadata ?? null,
    sessionFingerprint: data.sessionFingerprint ?? null,
  });
}

export async function getInteractionsByLead(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketingInteractions)
    .where(eq(marketingInteractions.leadId, leadId))
    .orderBy(marketingInteractions.createdAt);
}
