import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

/**
 * Health check router for diagnostics
 */
export const healthRouter = router({
  // Basic health check
  ping: publicProcedure.query(async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // Database connectivity check
  dbHealth: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          status: "error",
          message: "Database connection not available. Check DATABASE_URL environment variable.",
          timestamp: new Date().toISOString(),
        };
      }

      // Try a simple query
      const result = await db.execute("SELECT 1 as test");
      return {
        status: "ok",
        message: "Database connected and responding",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        message: `Database error: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }),

  // Check if migrations are applied
  migrationsStatus: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          status: "error",
          message: "Database not connected",
          tables: [],
          timestamp: new Date().toISOString(),
        };
      }

      // Check for required tables
      const requiredTables = [
        "users",
        "checkIns",
        "executorDesignations",
        "deathVerifications",
        "digitalAssets",
        "encryptionKeys",
        "executorNotifications",
        "auditLogs",
      ];

      const existingTables: string[] = [];
      const missingTables: string[] = [];

      for (const table of requiredTables) {
        try {
          await db.execute(`SELECT 1 FROM \`${table}\` LIMIT 1`);
          existingTables.push(table);
        } catch {
          missingTables.push(table);
        }
      }

      return {
        status: missingTables.length === 0 ? "ok" : "incomplete",
        message:
          missingTables.length === 0
            ? "All migrations applied successfully"
            : `Missing tables: ${missingTables.join(", ")}. Run migrations to fix.`,
        existingTables,
        missingTables,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        message: `Error checking migrations: ${errorMessage}`,
        tables: [],
        timestamp: new Date().toISOString(),
      };
    }
  }),
});
