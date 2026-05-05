import { boolean, integer, json, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "executor", "admin"]);
export const executorStatusEnum = pgEnum("executor_status", ["pending", "accepted", "rejected", "revoked"]);
export const deathStatusEnum = pgEnum("death_status", ["pending", "verified", "rejected"]);
export const assetCategoryEnum = pgEnum("asset_category", ["crypto", "social_media", "domain", "password", "business_login", "personal_message"]);
export const notificationTypeEnum = pgEnum("notification_type", ["missed_checkin", "death_verified", "asset_available"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
  subscriptionPlan: varchar("subscriptionPlan", { length: 50 }),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const checkIns = pgTable("checkIns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

export const executorDesignations = pgTable("executorDesignations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  executorId: integer("executorId").notNull(),
  status: executorStatusEnum("status").default("pending").notNull(),
  invitationToken: varchar("invitationToken", { length: 128 }),
  invitationExpiresAt: timestamp("invitationExpiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ExecutorDesignation = typeof executorDesignations.$inferSelect;
export type InsertExecutorDesignation = typeof executorDesignations.$inferInsert;

export const deathVerifications = pgTable("deathVerifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  executorId: integer("executorId").notNull(),
  certificateUrl: text("certificateUrl").notNull(),
  status: deathStatusEnum("status").default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: integer("verifiedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DeathVerification = typeof deathVerifications.$inferSelect;
export type InsertDeathVerification = typeof deathVerifications.$inferInsert;

export const digitalAssets = pgTable("digitalAssets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  category: assetCategoryEnum("category").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  encryptedData: text("encryptedData").notNull(),
  encryptionIv: varchar("encryptionIv", { length: 32 }).notNull(),
  executorEncryptedKey: text("executorEncryptedKey"),
  isAccessible: boolean("isAccessible").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DigitalAsset = typeof digitalAssets.$inferSelect;
export type InsertDigitalAsset = typeof digitalAssets.$inferInsert;

export const encryptionKeys = pgTable("encryptionKeys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  encryptedMasterKey: text("encryptedMasterKey").notNull(),
  keyDerivationSalt: varchar("keyDerivationSalt", { length: 64 }).notNull(),
  keyDerivationIterations: integer("keyDerivationIterations").default(100000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type InsertEncryptionKey = typeof encryptionKeys.$inferInsert;

export const executorNotifications = pgTable("executorNotifications", {
  id: serial("id").primaryKey(),
  executorId: integer("executorId").notNull(),
  userId: integer("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type ExecutorNotification = typeof executorNotifications.$inferSelect;
export type InsertExecutorNotification = typeof executorNotifications.$inferInsert;

export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 255 }),
  resourceId: integer("resourceId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
