import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// We don't necessarily need a real DB connection for this MemStorage-based app,
// but we'll keep the standard setup in case it's needed later.
// If DATABASE_URL is missing, we won't crash immediately unless we try to use 'db'.

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/db" 
});
export const db = drizzle(pool, { schema });
