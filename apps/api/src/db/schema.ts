import {
  pgTable,
  text,
  varchar,
  jsonb,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

/* ORDERS */
export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const messages = pgTable("messages", {
  id: varchar("id", { length: 50 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // user | agent
  agentType: varchar("agent_type", { length: 20 }), // support | order | billing
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  items: jsonb("items").notNull(),
  total: numeric("total").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  estimatedDelivery: timestamp("estimated_delivery"),
});

/* INVOICES */
export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  orderId: varchar("order_id", { length: 50 }).notNull(),
  amount: numeric("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
});

/* REFUNDS */
export const refunds = pgTable("refunds", {
  id: varchar("id", { length: 50 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 50 }).notNull(),
  amount: numeric("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  reason: text("reason"),
  processedDate: timestamp("processed_date"),
});
