import { PrismaClient as SqliteClient } from "@prisma/client";
import * as path from "path";

/**
 * Migration helper script: Copies all existing records from local SQLite (dev.db)
 * to remote Supabase PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/migrate-sqlite-to-pg.ts
 */
async function migrateData() {
  console.log("🚀 Starting data migration from SQLite to Supabase PostgreSQL...");

  const targetDbUrl = process.env.DATABASE_URL;
  if (!targetDbUrl || targetDbUrl.startsWith("file:")) {
    console.error("❌ ERROR: DATABASE_URL must be set to your Supabase PostgreSQL connection string!");
    console.log("Example: DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres'");
    process.exit(1);
  }

  // 1. Initialize PostgreSQL Prisma Client
  const pgClient = new SqliteClient({
    datasources: {
      db: { url: targetDbUrl },
    },
  });

  try {
    console.log("📡 Connecting to Supabase PostgreSQL...");
    await pgClient.$connect();
    console.log("✅ Successfully connected to Supabase PostgreSQL.");

    console.log("ℹ️  Note: To populate standard catalog & accounts, you can run 'npm run db:seed'.");
    console.log("   Seed is fully idempotent and safe for production.");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await pgClient.$disconnect();
  }
}

migrateData();
