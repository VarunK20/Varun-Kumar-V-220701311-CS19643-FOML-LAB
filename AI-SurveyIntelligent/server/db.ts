import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Simple connection
const pool = new Pool({ 
  user: 'postgres',                          // Change if different
  password: 'Varun2026',        // Your actual password
  host: 'localhost',
  port: 5432,
  database: 'surveyapp'                      // Your database name
});

export const db = drizzle(pool, { schema });

// Test connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Call test on startup
testConnection();