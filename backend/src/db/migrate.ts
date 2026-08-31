import dotenv from 'dotenv';
dotenv.config();

import { isPostgresConfigured, initPostgresSchema, syncAllDataToPostgres, pingPostgres } from './postgres.js';
import { db } from './storage.js';

async function runMigration() {
  console.log('🔄 Running FarmGo Database Migration...');

  if (!isPostgresConfigured()) {
    console.error('❌ Error: DATABASE_URL environment variable is not set.');
    console.log('💡 Tip: Set DATABASE_URL to your PostgreSQL connection string (Neon, Supabase, Railway, etc.)');
    process.exit(1);
  }

  const ping = await pingPostgres();
  if (!ping.connected) {
    console.error('❌ Error: Could not connect to PostgreSQL:', ping.error);
    process.exit(1);
  }

  console.log(`✅ Connected to PostgreSQL (${ping.latencyMs}ms)`);
  console.log('🛠️ Creating tables and indexes from schema.sql...');

  const schemaOk = await initPostgresSchema();
  if (!schemaOk) {
    console.error('❌ Failed to apply schema migration');
    process.exit(1);
  }

  console.log('🌱 Seeding database with initial FarmGo poultry data...');
  const seedData = db.getSeedData();
  await syncAllDataToPostgres(seedData);

  console.log('🎉 Database migration & seeding completed successfully!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
