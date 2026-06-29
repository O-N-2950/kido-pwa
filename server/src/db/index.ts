// ============================================================
// KIDO — DB Connection
// Pattern: boom-contact → postgres driver + drizzle-orm
// ============================================================
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const sql = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(sql, { schema });
export { schema };
