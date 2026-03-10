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
} from "./db";
import { syncLeadToHubSpot } from "./hubspotSync";

// ── Domain module routers ───────────────────────────────────
import { customersRouter } from "./modules/customers/router";
import { vehiclesRouter } from "./modules/vehicles/router";
import { blsRouter } from "./modules/bls/router";
import { trackingRouter } from "./modules/tracking/router";

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

  // ===== Admin: Newsletter Subscribers =====
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
        // 1. Save to database
        await addSubscriber(input);

        // 2. Sync to HubSpot in real-time (fire-and-forget, don't block the user)
        syncLeadToHubSpot(input)
          .then(async (hubspotContactId) => {
            if (hubspotContactId) {
              // Mark as synced in DB
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
              console.log(`[HubSpot] Lead ${input.email} synced successfully (ID: ${hubspotContactId})`);
            } else {
              console.warn(`[HubSpot] Lead ${input.email} sync returned no ID — will retry in nightly job`);
            }
          })
          .catch((err) => {
            console.error(`[HubSpot] Real-time sync failed for ${input.email}:`, err);
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
});

export type AppRouter = typeof appRouter;
