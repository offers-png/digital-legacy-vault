import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import {
  checkIns,
  executorDesignations,
  deathVerifications,
  digitalAssets,
  encryptionKeys,
  executorNotifications,
  auditLogs,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Check-in queries for Dead Man's Switch
 */
export async function recordCheckIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(checkIns).values({
    userId,
    checkedInAt: new Date(),
  });
}

export async function getLastCheckIn(userId: number): Promise<Date | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ checkedInAt: checkIns.checkedInAt })
    .from(checkIns)
    .where(eq(checkIns.userId, userId))
    .orderBy(desc(checkIns.checkedInAt))
    .limit(1);

  return result.length > 0 ? result[0].checkedInAt : null;
}

export async function getCheckInHistory(userId: number, limit: number = 10): Promise<Date[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ checkedInAt: checkIns.checkedInAt })
    .from(checkIns)
    .where(eq(checkIns.userId, userId))
    .orderBy(desc(checkIns.checkedInAt))
    .limit(limit);

  return result.map((r) => r.checkedInAt);
}

/**
 * Executor designation queries
 */
export async function designateExecutor(
  userId: number,
  executorId: number,
  invitationToken: string,
  expiresAt: Date
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(executorDesignations).values({
    userId,
    executorId,
    status: "pending",
    invitationToken,
    invitationExpiresAt: expiresAt,
  });
}

export async function getExecutorDesignation(
  userId: number,
  executorId: number
): Promise<typeof executorDesignations.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(executorDesignations)
    .where(
      and(
        eq(executorDesignations.userId, userId),
        eq(executorDesignations.executorId, executorId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getExecutorsForUser(userId: number): Promise<typeof executorDesignations.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(executorDesignations)
    .where(eq(executorDesignations.userId, userId));
}

export async function acceptExecutorDesignation(
  userId: number,
  executorId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(executorDesignations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(
      and(
        eq(executorDesignations.userId, userId),
        eq(executorDesignations.executorId, executorId)
      )
    );
}

/**
 * Death verification queries
 */
export async function uploadDeathCertificate(
  userId: number,
  executorId: number,
  certificateUrl: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(deathVerifications).values({
    userId,
    executorId,
    certificateUrl,
    status: "pending",
  });
}

export async function getDeathVerification(
  userId: number
): Promise<typeof deathVerifications.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(deathVerifications)
    .where(eq(deathVerifications.userId, userId))
    .orderBy(desc(deathVerifications.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function verifyDeath(
  userId: number,
  verifiedBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(deathVerifications)
    .set({ status: "verified", verifiedAt: new Date(), verifiedBy })
    .where(eq(deathVerifications.userId, userId));

  // Mark all assets as accessible to executors
  await db
    .update(digitalAssets)
    .set({ isAccessible: true })
    .where(eq(digitalAssets.userId, userId));
}

/**
 * Digital asset queries
 */
export async function createAsset(
  userId: number,
  category: string,
  name: string,
  description: string | null,
  encryptedData: string,
  encryptionIv: string,
  executorEncryptedKey: string | null
): Promise<typeof digitalAssets.$inferSelect> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(digitalAssets).values({
    userId,
    category: category as any,
    name,
    description,
    encryptedData,
    encryptionIv,
    executorEncryptedKey,
  });

  const assets = await db
    .select()
    .from(digitalAssets)
    .where(eq(digitalAssets.userId, userId))
    .orderBy(desc(digitalAssets.createdAt))
    .limit(1);

  return assets[0];
}

export async function getAssets(userId: number): Promise<typeof digitalAssets.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(digitalAssets)
    .where(eq(digitalAssets.userId, userId))
    .orderBy(desc(digitalAssets.createdAt));
}

export async function getAssetsByCategory(
  userId: number,
  category: string
): Promise<typeof digitalAssets.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(digitalAssets)
    .where(
      and(
        eq(digitalAssets.userId, userId),
        eq(digitalAssets.category, category as any)
      )
    )
    .orderBy(desc(digitalAssets.createdAt));
}

export async function getAsset(
  assetId: number,
  userId: number
): Promise<typeof digitalAssets.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(digitalAssets)
    .where(
      and(
        eq(digitalAssets.id, assetId),
        eq(digitalAssets.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateAsset(
  assetId: number,
  userId: number,
  updates: {
    name?: string;
    description?: string | null;
    encryptedData?: string;
    encryptionIv?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(digitalAssets)
    .set(updates)
    .where(
      and(
        eq(digitalAssets.id, assetId),
        eq(digitalAssets.userId, userId)
      )
    );
}

export async function deleteAsset(assetId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(digitalAssets)
    .where(
      and(
        eq(digitalAssets.id, assetId),
        eq(digitalAssets.userId, userId)
      )
    );
}

/**
 * Encryption key queries
 */
export async function saveEncryptionKey(
  userId: number,
  encryptedMasterKey: string,
  keyDerivationSalt: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(encryptionKeys).values({
    userId,
    encryptedMasterKey,
    keyDerivationSalt,
    keyDerivationIterations: 100000,
  });
}

export async function getEncryptionKey(
  userId: number
): Promise<typeof encryptionKeys.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(encryptionKeys)
    .where(eq(encryptionKeys.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Executor notification queries
 */
export async function createNotification(
  executorId: number,
  userId: number,
  type: string,
  message: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(executorNotifications).values({
    executorId,
    userId,
    type: type as any,
    message,
  });
}

export async function getNotifications(executorId: number): Promise<typeof executorNotifications.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(executorNotifications)
    .where(eq(executorNotifications.executorId, executorId))
    .orderBy(desc(executorNotifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(executorNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(executorNotifications.id, notificationId));
}

/**
 * Audit log queries
 */
export async function logAuditEvent(
  userId: number | null,
  action: string,
  resourceType: string | null,
  resourceId: number | null,
  details: any,
  ipAddress: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(auditLogs).values({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
  });
}

export async function getAuditLogs(
  userId: number | null,
  limit: number = 100
): Promise<typeof auditLogs.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (userId) {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Check for missed check-ins (Dead Man's Switch trigger)
 * Returns users who have missed 2 consecutive 30-day check-ins
 */
export async function getUsersWithMissedCheckIns(): Promise<number[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all users and their last check-in
  const result = await db
    .select({
      userId: checkIns.userId,
      lastCheckIn: sql`MAX(${checkIns.checkedInAt})`,
    })
    .from(checkIns)
    .groupBy(checkIns.userId);

  // Filter users whose last check-in was more than 30 days ago
  return result
    .filter((r) => {
      if (!r.lastCheckIn) return false;
      const lastCheckInDate = r.lastCheckIn instanceof Date ? r.lastCheckIn : new Date(r.lastCheckIn as string);
      return lastCheckInDate < thirtyDaysAgo;
    })
    .map((r) => r.userId);
}
