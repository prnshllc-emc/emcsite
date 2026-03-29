import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllSettings,
  getSettingsByCategory,
  upsertSetting,
  deleteSetting,
  getAllSubscribers,
  addSubscriber,
  removeSubscriber,
  toggleSubscriberActive,
  markSubscribersAsSynced,
  upsertMarketingLead,
  logMarketingInteraction,
  getAllMarketingLeads,
  updateMarketingLeadStatus,
  getInteractionsByLead,
  markMarketingLeadSynced,
} from "./db";
import { syncLeadToHubSpot } from "./hubspotSync";
import { secureLogger } from "./shared/security";

// ── Domain module routers ───────────────────────────────────
import { customersRouter } from "./modules/customers/router";
import { vehiclesRouter } from "./modules/vehicles/router";
import { blsRouter } from "./modules/bls/router";
import { trackingRouter } from "./modules/tracking/router";
import { cmsRouter } from "./modules/cms/router";
import { reconciliationRouter } from "./modules/reconciliation/router";
import { contractsRouter } from "./modules/contracts/router";
import { notificationsRouter } from "./modules/notifications/router";
import { emailTemplatesRouter } from "./modules/emailTemplates/router";
import { whatsappRouter } from "./modules/whatsapp/router";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== Domain Modules =====
  customers: customersRouter,
  vehicles: vehiclesRouter,
  bls: blsRouter,
  tracking: trackingRouter,
  cms: cmsRouter,
  reconciliation: reconciliationRouter,
  contracts: contractsRouter,
  notifications: notificationsRouter,
  emailTemplates: emailTemplatesRouter,
  whatsapp: whatsappRouter,

  // ===== Admin Dashboard Stats =====
  dashboard: router({
    stats: adminProcedure.query(async () => {
      const [blsByStatus, activeBls, activeCodes, activeCustomers, activeVehicles, recentEvents] = await Promise.all([
        import("./modules/bls/service").then(m => m.countBlsByStatus()),
        import("./modules/bls/service").then(m => m.countActiveBls()),
        import("./modules/tracking/service").then(m => m.countActiveCodes()),
        import("./modules/customers/service").then(m => m.countActiveCustomers()),
        import("./modules/vehicles/service").then(m => m.countActiveVehicles()),
        import("./modules/tracking/repository").then(async m => {
          // Get recent events across all BLs (last 10)
          const { getDb } = await import("./db");
          const db = await getDb();
          if (!db) return [];
          const { trackingHistory } = await import("../drizzle/schema");
          const { desc } = await import("drizzle-orm");
          const rows = await db.select().from(trackingHistory).orderBy(desc(trackingHistory.eventDate)).limit(10);
          return rows;
        }),
      ]);

      return {
        blsByStatus,
        activeBls,
        activeCodes,
        activeCustomers,
        activeVehicles,
        recentEvents,
      };
    }),
  }),

  // ===== Admin: Site Settings =====
  settings: router({
    list: adminProcedure.query(async () => {
      return getAllSettings();
    }),

    listByCategory: adminProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getSettingsByCategory(input.category);
      }),

    upsert: adminProcedure
      .input(
        z.object({
          key: z.string().min(1),
          value: z.string(),
          label: z.string().optional(),
          category: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await upsertSetting(input);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        await deleteSetting(input.key);
        return { success: true };
      }),
  }),

  // ===== Marketing: Newsletter Subscribers (Lead repository) =====
  newsletter: router({
    list: adminProcedure.query(async () => {
      return getAllSubscribers();
    }),

    remove: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await removeSubscriber(input.id);
        return { success: true };
      }),

    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleSubscriberActive(input.id, input.active);
        return { success: true };
      }),

    // Public endpoint: anyone can subscribe
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().optional(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
          utmContent: z.string().optional(),
          utmTerm: z.string().optional(),
          referrer: z.string().optional(),
          landingPage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Save to legacy newsletter table (backward compatibility)
        await addSubscriber(input);

        // 2. Save to marketing_leads (new segregated marketing domain)
        const lead = await upsertMarketingLead({
          email: input.email,
          name: input.name,
          source: "newsletter",
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmContent: input.utmContent,
          utmTerm: input.utmTerm,
          referrer: input.referrer,
          landingPage: input.landingPage,
        });

        // 3. Log the interaction
        await logMarketingInteraction({
          leadId: lead?.id,
          interactionType: "newsletter_signup",
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmContent: input.utmContent,
          pageUrl: input.landingPage,
        });

        // 4. Sync to HubSpot in real-time (fire-and-forget, don't block the user)
        syncLeadToHubSpot(input)
          .then(async (hubspotContactId) => {
            if (hubspotContactId) {
              // Mark as synced in both tables
              const { getDb } = await import("./db");
              const db = await getDb();
              if (db) {
                const { eq } = await import("drizzle-orm");
                const { newsletterSubscribers } = await import("../drizzle/schema");
                await db.update(newsletterSubscribers)
                  .set({
                    hubspotSyncedAt: new Date(),
                    hubspotContactId: hubspotContactId,
                  })
                  .where(eq(newsletterSubscribers.email, input.email));
              }
              // Also mark marketing lead as synced
              if (lead?.id) {
                await markMarketingLeadSynced(lead.id, hubspotContactId);
              }
              secureLogger.info(`[HubSpot] Lead ${input.email} synced successfully (ID: ${hubspotContactId})`);
            } else {
              secureLogger.warn(`[HubSpot] Lead ${input.email} sync returned no ID — will retry in nightly job`);
            }
          })
          .catch((err) => {
            secureLogger.error(`[HubSpot] Real-time sync failed for ${input.email}:`, err);
            // Will be retried by the nightly 23:50 job
          });

        return { success: true };
      }),
  }),

  // ===== Public: Get site settings for frontend =====
  publicSettings: router({
    get: publicProcedure.query(async () => {
      const settings = await getAllSettings();
      const map: Record<string, string> = {};
      for (const s of settings) {
        map[s.key] = s.value;
      }
      return map;
    }),
  }),

  // ===== Marketing Domain (segregated from operational) =====
  marketing: router({
    // Admin: list all marketing leads
    leads: adminProcedure.query(async () => {
      return getAllMarketingLeads();
    }),

    // Admin: update lead status
    updateLeadStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "engaged", "qualified", "converted", "unsubscribed"]),
      }))
      .mutation(async ({ input }) => {
        await updateMarketingLeadStatus(input.id, input.status);
        return { success: true };
      }),

    // Admin: get interactions for a specific lead
    interactions: adminProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        return getInteractionsByLead(input.leadId);
      }),

    // Public: log an anonymous interaction (CTA clicks, page views)
    logInteraction: publicProcedure
      .input(z.object({
        interactionType: z.enum([
          "calculator_open", "calculator_submit", "whatsapp_click",
          "cta_click", "page_view", "tracking_lookup", "knowledge_view",
        ]),
        email: z.string().email().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmContent: z.string().optional(),
        pageUrl: z.string().optional(),
        servicePage: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        sessionFingerprint: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        let leadId: number | undefined;

        // If email provided, find or create the lead
        if (input.email) {
          const lead = await upsertMarketingLead({
            email: input.email,
            source: "other",
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            utmContent: input.utmContent,
          });
          leadId = lead?.id;

          // Auto-upgrade status to "engaged" if they interact again
          if (lead && lead.status === "new") {
            await updateMarketingLeadStatus(lead.id, "engaged");
          }
        }

        await logMarketingInteraction({
          leadId,
          interactionType: input.interactionType,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmContent: input.utmContent,
          pageUrl: input.pageUrl,
          servicePage: input.servicePage,
          metadata: input.metadata,
          sessionFingerprint: input.sessionFingerprint,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
