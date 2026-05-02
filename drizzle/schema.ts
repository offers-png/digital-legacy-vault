import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "executor", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Dead Man's Switch: Track user check-ins
export const checkIns = mysqlTable("checkIns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

// Executor Designations: Link users to their executors
export const executorDesignations = mysqlTable("executorDesignations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Asset owner
  executorId: int("executorId").notNull(), // Executor
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "revoked"]).default("pending").notNull(),
  invitationToken: varchar("invitationToken", { length: 128 }),
  invitationExpiresAt: timestamp("invitationExpiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExecutorDesignation = typeof executorDesignations.$inferSelect;
export type InsertExecutorDesignation = typeof executorDesignations.$inferInsert;

// Death Verification: Track death certificate uploads and verification
export const deathVerifications = mysqlTable("deathVerifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Asset owner who died
  executorId: int("executorId").notNull(), // Executor who uploaded
  certificateUrl: text("certificateUrl").notNull(), // S3 URL to death certificate
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"), // Admin who verified
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeathVerification = typeof deathVerifications.$inferSelect;
export type InsertDeathVerification = typeof deathVerifications.$inferInsert;

// Digital Assets: Store encrypted asset information
export const digitalAssets = mysqlTable("digitalAssets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["crypto", "social_media", "domain", "password", "business_login", "personal_message"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  encryptedData: longtext("encryptedData").notNull(), // Encrypted JSON containing sensitive data
  encryptionIv: varchar("encryptionIv", { length: 32 }).notNull(), // IV for encryption
  executorEncryptedKey: longtext("executorEncryptedKey"), // Executor's copy of decryption key (encrypted)
  isAccessible: boolean("isAccessible").default(false).notNull(), // Whether executor can access after death
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigitalAsset = typeof digitalAssets.$inferSelect;
export type InsertDigitalAsset = typeof digitalAssets.$inferInsert;

// Encryption Keys: Store user's master encryption key (encrypted with password)
export const encryptionKeys = mysqlTable("encryptionKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  encryptedMasterKey: longtext("encryptedMasterKey").notNull(), // Master key encrypted with password
  keyDerivationSalt: varchar("keyDerivationSalt", { length: 64 }).notNull(), // Salt for PBKDF2
  keyDerivationIterations: int("keyDerivationIterations").default(100000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type InsertEncryptionKey = typeof encryptionKeys.$inferInsert;

// Executor Notifications: Track notifications sent to executors
export const executorNotifications = mysqlTable("executorNotifications", {
  id: int("id").autoincrement().primaryKey(),
  executorId: int("executorId").notNull(),
  userId: int("userId").notNull(), // Asset owner
  type: mysqlEnum("type", ["missed_checkin", "death_verified", "asset_available"]).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type ExecutorNotification = typeof executorNotifications.$inferSelect;
export type InsertExecutorNotification = typeof executorNotifications.$inferInsert;

// Audit Log: Track all sensitive operations
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 255 }),
  resourceId: int("resourceId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;