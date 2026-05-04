import { count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  auditLogs,
  checkIns,
  deathVerifications,
  digitalAssets,
  encryptionKeys,
  executorDesignations,
  executorNotifications,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { sendAccountDeletionConfirmation } from "./email";
import { protectedProcedure, router } from "./_core/trpc";

export const accountRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { user: ctx.user, stats: null };

    const userId = ctx.user.id;

    const [assetCount, checkInCount, executorCount] = await Promise.all([
      db.select({ value: count() }).from(digitalAssets).where(eq(digitalAssets.userId, userId)),
      db.select({ value: count() }).from(checkIns).where(eq(checkIns.userId, userId)),
      db.select({ value: count() }).from(executorDesignations).where(eq(executorDesignations.userId, userId)),
    ]);

    return {
      user: ctx.user,
      stats: {
        assetCount: assetCount[0]?.value ?? 0,
        checkInCount: checkInCount[0]?.value ?? 0,
        executorCount: executorCount[0]?.value ?? 0,
      },
    };
  }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userId = ctx.user.id;

    const [userAssets, userCheckIns, userExecutors, userNotifications, userAuditLogs] =
      await Promise.all([
        db.select().from(digitalAssets).where(eq(digitalAssets.userId, userId)),
        db.select().from(checkIns).where(eq(checkIns.userId, userId)),
        db.select().from(executorDesignations).where(eq(executorDesignations.userId, userId)),
        db.select().from(executorNotifications).where(eq(executorNotifications.executorId, userId)),
        db.select().from(auditLogs).where(eq(auditLogs.userId, userId)),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        createdAt: ctx.user.createdAt,
        lastSignedIn: ctx.user.lastSignedIn,
      },
      assets: userAssets.map(a => ({
        id: a.id,
        category: a.category,
        name: a.name,
        description: a.description,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      checkIns: userCheckIns,
      executorDesignations: userExecutors,
      notifications: userNotifications,
      auditLogs: userAuditLogs,
    };
  }),

  deleteAccount: protectedProcedure
    .input(z.object({ confirmEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      if (input.confirmEmail !== ctx.user.email) {
        throw new Error("Email does not match your account email");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      await db.delete(auditLogs).where(eq(auditLogs.userId, userId));
      await db.delete(executorNotifications).where(eq(executorNotifications.executorId, userId));
      await db.delete(executorNotifications).where(eq(executorNotifications.userId, userId));
      await db.delete(encryptionKeys).where(eq(encryptionKeys.userId, userId));
      await db.delete(digitalAssets).where(eq(digitalAssets.userId, userId));
      await db.delete(deathVerifications).where(eq(deathVerifications.userId, userId));
      await db.delete(executorDesignations).where(eq(executorDesignations.userId, userId));
      await db.delete(executorDesignations).where(eq(executorDesignations.executorId, userId));
      await db.delete(checkIns).where(eq(checkIns.userId, userId));
      await db.delete(users).where(eq(users.id, userId));

      if (ctx.user.email && ctx.user.name) {
        try {
          await sendAccountDeletionConfirmation(ctx.user.email, ctx.user.name);
        } catch (e) {
          console.warn("[Account] Could not send deletion confirmation email:", e);
        }
      }

      return { success: true };
    }),
});
