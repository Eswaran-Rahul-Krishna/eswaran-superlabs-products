/**
 * Database migration runner.
 * Reads all .sql files from supabase/migrations/ (sorted), executes each via
 * a direct Postgres connection. Requires DATABASE_URL in your .env.local.
 *
 * Get DATABASE_URL from:
 *   Supabase Dashboard → Settings → Database → Connection string → URI
 *   (Use the "Session pooler" URI if you see one, or the direct URI)
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate.ts
 */

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set in .env.local");
  console.error(
    "    Get it from: Supabase Dashboard → Settings → Database → Connection string → URI"
  );
  process.exit(1);
}

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("✅  Connected to Postgres\n");

    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration file(s):\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`  Running: ${file}`);
      try {
        await client.query(sql);
        console.log(`  ✅  ${file} — OK`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Ignore "already exists" errors (idempotent re-runs)
        if (msg.includes("already exists")) {
          console.log(`  ⚠️   ${file} — already applied (skipped)`);
        } else {
          console.error(`  ❌  ${file} — FAILED: ${msg}`);
        }
      }
    }

    console.log("\n✅  Migration complete.");
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
