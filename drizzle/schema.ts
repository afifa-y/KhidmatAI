import { pgTable, serial, text, varchar, integer, real, boolean, timestamp, pgEnum, json } from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────
export const serviceCategory = pgEnum("service_category", [
  "electrician", "plumber", "ac_technician", "tutor",
  "beautician", "carpenter", "painter", "cleaner", "other"
]);
export const availabilityStatus = pgEnum("availability_status", ["available", "busy", "offline"]);
export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]);
export const notificationType = pgEnum("notification_type", ["CONFIRMATION", "REMINDER", "COMPLETION"]);
export const notificationStatus = pgEnum("notification_status_type", ["PENDING", "SENT", "FAILED"]);

// ── Users (migrated to pg) ─────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ── Providers ─────────────────────────────────────────────
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }),
  category: serviceCategory("category").notNull(),
  specialty: text("specialty").notNull().default(""),
  locationText: varchar("locationText", { length: 256 }).notNull(), 
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  hourlyRate: integer("hourlyRate").notNull().default(0),            
  availabilityStatus: availabilityStatus("availabilityStatus").default("available").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  yearsExperience: integer("yearsExperience").default(0).notNull(),
  totalJobsDone: integer("totalJobsDone").default(0).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── Reviews ──────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  providerId: integer("providerId").notNull().references(() => providers.id),
  bookingId: integer("bookingId"),                                    
  reviewerName: varchar("reviewerName", { length: 64 }).default("Anonymous"),
  rating: integer("rating").notNull(),                               
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── Conversations ─────────────
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),        
  messages: json("messages").notNull().default([]),                  
  extractedIntent: json("extractedIntent"),                          
  userPriority: json("userPriority"),                                // { mode: "budget"|"quality"|"proximity", name?: string }
  stage: text("stage").default("intent_gathering").notNull(),        
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ── Bookings ─────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingCode: varchar("bookingCode", { length: 32 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 64 }),
  userId: integer("userId").references(() => users.id),
  providerId: integer("providerId").notNull().references(() => providers.id),
  serviceType: varchar("serviceType", { length: 64 }).notNull(),
  taskDescription: text("taskDescription"),
  userLocationText: varchar("userLocationText", { length: 256 }),
  userLatitude: real("userLatitude"),
  userLongitude: real("userLongitude"),
  scheduledTime: varchar("scheduledTime", { length: 128 }),
  status: bookingStatus("status").default("confirmed").notNull(),
  llmReasoning: text("llmReasoning"),                               
  estimatedCost: integer("estimatedCost"),                           
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ── Notifications ─────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").notNull().references(() => bookings.id),
  type: notificationType("type").notNull(),
  message: text("message").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: notificationStatus("status").default("PENDING").notNull(),
  sentAt: timestamp("sentAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
