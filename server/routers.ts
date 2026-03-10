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
} from "./db";

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
        await addSubscriber(input);
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
