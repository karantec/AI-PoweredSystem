import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
   connectionString:
    "postgresql://postgres:root@localhost:5432/customer_support",
});

export const db = drizzle(pool, { schema });