import { db } from "./index.js";
import { orders, invoices, refunds, messages } from "./schema.js";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    /* ===================== */
    /* ORDERS */
    /* ===================== */
    console.log("Adding orders...");
    await db.insert(orders).values([
      {
        id: "ORD-001",
        userId: "user-123",
        status: "shipped",
        items: [
          { name: "Laptop", quantity: 1, price: 999.99 },
          { name: "Mouse", quantity: 2, price: 29.99 },
        ],
        total: 1059.97,
        trackingNumber: "TRK123456789",
        estimatedDelivery: new Date("2026-01-20"),
      },
      {
        id: "ORD-002",
        userId: "user-123",
        status: "processing",
        items: [{ name: "Keyboard", quantity: 1, price: 149.99 }],
        total: 149.99,
        trackingNumber: null,
        estimatedDelivery: new Date("2026-01-25"),
      },
      {
        id: "ORD-003",
        userId: "user-456",
        status: "delivered",
        items: [{ name: "Monitor", quantity: 1, price: 399.99 }],
        total: 399.99,
        trackingNumber: "TRK987654321",
        estimatedDelivery: new Date("2026-01-10"),
      },
    ]);
    console.log("✅ Orders added");

    /* ===================== */
    /* INVOICES */
    /* ===================== */
    console.log("Adding invoices...");
    await db.insert(invoices).values([
      {
        id: "INV-001",
        userId: "user-123",
        orderId: "ORD-001",
        amount: 1059.97,
        status: "paid",
        dueDate: new Date("2026-01-15"),
        paidDate: new Date("2026-01-14"),
      },
      {
        id: "INV-002",
        userId: "user-123",
        orderId: "ORD-002",
        amount: 149.99,
        status: "pending",
        dueDate: new Date("2026-01-30"),
        paidDate: null,
      },
      {
        id: "INV-003",
        userId: "user-456",
        orderId: "ORD-003",
        amount: 399.99,
        status: "paid",
        dueDate: new Date("2026-01-05"),
        paidDate: new Date("2026-01-03"),
      },
    ]);
    console.log("✅ Invoices added");

    /* ===================== */
    /* REFUNDS */
    /* ===================== */
    console.log("Adding refunds...");
    await db.insert(refunds).values([
      {
        id: "REF-001",
        invoiceId: "INV-003",
        amount: 399.99,
        status: "completed",
        reason: "Product defect",
        processedDate: new Date("2026-01-12"),
      },
      {
        id: "REF-002",
        invoiceId: "INV-001",
        amount: 29.99,
        status: "pending",
        reason: "Item not as described",
        processedDate: null,
      },
    ]);
    console.log("✅ Refunds added");

    /* ===================== */
    /* MESSAGES */
    /* ===================== */
    console.log("Adding messages...");
    await db.insert(messages).values([
      {
        id: "MSG-001",
        conversationId: "CONV-001",
        role: "user",
        content: "Where is my order ORD-001?",
      },
      {
        id: "MSG-002",
        conversationId: "CONV-001",
        role: "agent",
        content: "Your order ORD-001 has been shipped and is on the way.",
      },
      {
        id: "MSG-003",
        conversationId: "CONV-002",
        role: "user",
        content: "I want a refund for order ORD-003.",
      },
      {
        id: "MSG-004",
        conversationId: "CONV-002",
        role: "agent",
        content: "Your refund for order ORD-003 is being processed.",
      },
    ]);
    console.log("✅ Messages added");

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
