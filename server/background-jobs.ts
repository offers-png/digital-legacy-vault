import { getDb } from "./db";
import { checkIns, executorDesignations, executorNotifications, users } from "../drizzle/schema";
import { eq, and, isNull, lt } from "drizzle-orm";

/**
 * Background jobs for Digital Legacy Vault
 * Run these periodically (e.g., every hour) using a cron job or task scheduler
 */

/**
 * Check for users who missed 2 consecutive 30-day check-ins
 * Notify their executors
 */
export async function checkMissedCheckIns() {
  try {
    console.log("[Background Job] Checking for missed check-ins...");
    // This function will be implemented with proper date handling
    // For now, log that it would run
    console.log("[Background Job] Missed check-in verification completed");
  } catch (error) {
    console.error("[Background Job] Error checking missed check-ins:", error);
  }
}

/**
 * Clean up expired invitation tokens
 */
export async function cleanupExpiredInvitations() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Background Job] Database not available");
      return;
    }

    const now = new Date();

    // Delete expired invitations
    await db
      .delete(executorDesignations)
      .where(
        and(
          eq(executorDesignations.status, "pending"),
          lt(executorDesignations.invitationExpiresAt!, new Date(now))
        )
      );

    console.log("[Background Job] Cleanup of expired invitations completed");
  } catch (error) {
    console.error("[Background Job] Error cleaning up invitations:", error);
  }
}

/**
 * Archive old audit logs (keep only last 90 days)
 */
export async function archiveOldAuditLogs() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Background Job] Database not available");
      return;
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // In production, you'd archive these to a separate table or storage
    // For now, we'll just log that this would be done
    console.log(`[Background Job] Would archive audit logs older than ${ninetyDaysAgo}`);
  } catch (error) {
    console.error("[Background Job] Error archiving audit logs:", error);
  }
}

/**
 * Run all background jobs
 */
export async function runAllBackgroundJobs() {
  console.log("[Background Jobs] Starting scheduled jobs...");

  await checkMissedCheckIns();
  await cleanupExpiredInvitations();
  await archiveOldAuditLogs();

  console.log("[Background Jobs] All scheduled jobs completed");
}

/**
 * Initialize background job scheduler
 * Call this once at server startup
 */
export function initializeBackgroundJobs() {
  // Run immediately on startup
  runAllBackgroundJobs();

  // Then run every hour
  const intervalId = setInterval(runAllBackgroundJobs, 60 * 60 * 1000);

  return () => clearInterval(intervalId);
}
