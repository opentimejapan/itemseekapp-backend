import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../packages/db/src/schema.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment variables.');
  console.error('Current directory:', process.cwd());
  console.error('Please ensure:');
  console.error('1. You have a .env file in the root directory');
  console.error('2. The .env file contains DATABASE_URL=postgresql://...');
  console.error('3. Run: cp .env.example .env');
  process.exit(1);
}

// Create PostgreSQL connection
const sql = postgres(process.env.DATABASE_URL, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Export for migrations
export { sql };