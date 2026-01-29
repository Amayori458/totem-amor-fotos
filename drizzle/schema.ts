import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sessions table - stores upload sessions for the totem
 * Each session has a unique ID used in the QR code
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "completed", "expired"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Photos table - stores uploaded photos for each session
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 256 }).notNull(),
  mimeType: varchar("mimeType", { length: 64 }).notNull(),
  fileSize: int("fileSize").notNull(),
  selected: int("selected").default(0).notNull(), // 0 = not selected, 1 = selected
  format: mysqlEnum("format", ["10x15", "15x21"]),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * Orders table - stores finalized print orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull().unique(),
  photoCount: int("photoCount").notNull(),
  metadata: json("metadata").$type<{
    photos: Array<{
      fileKey: string;
      fileName: string;
      format: string;
    }>;
    timestamp: number;
  }>().notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Settings table - stores totem configuration values
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["number", "string", "boolean", "json"]).default("string").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Sales history table - tracks all completed orders for reporting
 */
export const salesHistory = mysqlTable("salesHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull(),
  photoCount: int("photoCount").notNull(),
  format10x15: int("format10x15").default(0).notNull(),
  format15x21: int("format15x21").default(0).notNull(),
  price10x15: int("price10x15").default(590).notNull(),
  price15x21: int("price15x21").default(890).notNull(),
  totalPrice: int("totalPrice").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "printed", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  completedAt: timestamp("completedAt"),
});

export type SalesHistory = typeof salesHistory.$inferSelect;
export type InsertSalesHistory = typeof salesHistory.$inferInsert;
