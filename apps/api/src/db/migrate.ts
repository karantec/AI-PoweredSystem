import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/customer_support',
});

const db = drizzle(pool);

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Create conversations table
    console.log('📝 Creating conversations table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create messages table
    console.log('📝 Creating messages table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        conversation_id VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL,
        agent_type VARCHAR(20),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create orders table
    console.log('📝 Creating orders table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC NOT NULL,
        tracking_number VARCHAR(100),
        estimated_delivery TIMESTAMP
      );
    `);

    // Create invoices table
    console.log('📝 Creating invoices table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        order_id VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL,
        status VARCHAR(20) NOT NULL,
        due_date TIMESTAMP,
        paid_date TIMESTAMP
      );
    `);

    // Create refunds table
    console.log('📝 Creating refunds table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS refunds (
        id VARCHAR(50) PRIMARY KEY,
        invoice_id VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL,
        status VARCHAR(20) NOT NULL,
        reason TEXT,
        processed_date TIMESTAMP
      );
    `);

    // Create indexes
    console.log('📝 Creating indexes...');
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
      CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);
    `);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  migrate().catch(console.error);
}

export { migrate };