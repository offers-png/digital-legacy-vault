import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  checkInRouter,
  executorRouter,
  assetRouter,
  deathRouter,
  aiExecutorRouter,
  notificationRouter,
} from "./features";
import { healthRouter } from "./health";
import { googleOAuthRouter } from "./google-oauth-handler";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Digital Legacy Vault routers
  checkIn: checkInRouter,
  executor: executorRouter,
  asset: assetRouter,
  death: deathRouter,
  aiExecutor: aiExecutorRouter,
  notification: notificationRouter,
  health: healthRouter,
  googleAuth: googleOAuthRouter,
});

export type AppRouter = typeof appRouter;
