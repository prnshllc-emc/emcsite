import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import {
  cpfRateLimiter,
  generalRateLimiter,
} from "../shared/security";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// ── Rate-limited public procedures ──────────────────────────
function getClientIp(req: TrpcContext["req"]): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket?.remoteAddress ?? "unknown";
}

const rateLimitGeneral = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIp(ctx.req);
  const result = generalRateLimiter.check(ip);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Muitas requisições. Tente novamente em ${Math.ceil((result.resetAt - Date.now()) / 1000)}s.`,
    });
  }
  return next({ ctx });
});

const rateLimitCpf = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIp(ctx.req);
  const result = cpfRateLimiter.check(ip);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Muitas consultas por CPF. Tente novamente em ${Math.ceil((result.resetAt - Date.now()) / 1000)}s.`,
    });
  }
  return next({ ctx });
});

export const rateLimitedPublicProcedure = t.procedure.use(rateLimitGeneral);
export const cpfRateLimitedPublicProcedure = t.procedure.use(rateLimitCpf);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
