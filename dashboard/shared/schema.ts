import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(true),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const featureToggles = pgTable("feature_toggles", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  neonColor: text("neon_color").default("#00ff00"),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  memberCount: integer("member_count").default(0),
  status: text("status").default("active"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const botFiles = pgTable("bot_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  size: text("size").notNull(),
  lastModified: timestamp("last_modified").defaultNow(),
  content: text("content"),
});

export const apis = pgTable("apis", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  key: text("key"),
  type: text("type").notNull(), // 'video', 'image', 'ai', 'download', 'custom'
  isEnabled: boolean("is_enabled").default(true),
  neonColor: text("neon_color").default("#00ffff"),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  type: text("type").notNull(), // 'video', 'image', 'file', 'log'
  url: text("url").notNull(),
  size: text("size").notNull(),
  status: text("status").default("completed"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users);
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });
export const insertFeatureToggleSchema = createInsertSchema(featureToggles).omit({ id: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, joinedAt: true });
export const insertBotFileSchema = createInsertSchema(botFiles).omit({ id: true, lastModified: true });
export const insertApiSchema = createInsertSchema(apis).omit({ id: true });
export const insertDownloadSchema = createInsertSchema(downloads).omit({ id: true, timestamp: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type FeatureToggle = typeof featureToggles.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type BotFile = typeof botFiles.$inferSelect;
export type ApiEntry = typeof apis.$inferSelect;
export type DownloadEntry = typeof downloads.$inferSelect;

export type LoginRequest = Pick<z.infer<typeof insertUserSchema>, "username" | "password">;

export interface BotStats {
  status: "online" | "offline" | "maintenance" | "restarting";
  uptime: string;
  activeThreads: number;
  totalMessages: number;
  cpuUsage: number;
  memoryUsage: number;
}
