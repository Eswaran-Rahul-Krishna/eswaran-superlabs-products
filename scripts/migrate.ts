/**
 * Database migration runner.
 * Tries multiple connection methods in order:
 *  1. DATABASE_URL env var (direct pg connection)
 *  2. Supabase Management API (tries service_role key + SUPABASE_ACCESS_TOKEN)
 *  3. Falls back to printing the SQL + a direct link to the Supabase SQL editor
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate.ts
 */

import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const databaseUrl = process.env.DATABASE_URL ?? "";

function getProjectRef(): string | null {
  const m = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

function getMigrationFiles() {
  const dir = path.join(process.cwd(), "supabase", "migrations");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((file) => ({ file, sql: fs.readFileSync(path.join(dir, file), "utf-8") }));
}

// ─── Method 1: Direct pg connection via DATABASE_URL ─────────────────────────
async function tryPgConnection(): Promise<boolean> {
  if (!databaseUrl) return false;
  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log("✅  Connected via DATABASE_URL\n");
    for (const { file, sql } of getMigrationFiles()) {
      process.stdout.write(`  Running ${file}... `);
      try {
        await client.query(sql);
        console.log("✅  OK");
      } catch (e: unknown) {
        const msg = (e as Error).message;
        if (msg.includes("already exists")) console.log("⚠️  already applied");
        else console.log(`❌  ${msg.split("\n")[0]}`);
      }
    }
    await client.end();
    console.log("\n✅  Migration complete.");
    return true;
  } catch (e: unknown) {
    console.log(`DATABASE_URL connection failed: ${(e as Error).message.split("\n")[0]}`);
    return false;
  }
}

// ─── Method 2: Supabase Management API ────────────────────────────────────────
async function tryManagementApi(): Promise<boolean> {
  const ref = getProjectRef();
  if (!ref) return false;

  const candidates = [
    process.env.SUPABASE_ACCESS_TOKEN ?? "",
    serviceRoleKey,
  ].filter(Boolean);

  for (const token of candidates) {
    let allOk = true;
    for (const { file, sql } of getMigrationFiles()) {
      try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query: sql }),
        });
        if (res.ok) {
          console.log(`  ${file} — ✅  OK`);
        } else if (res.status === 401 || res.status === 403) {
          allOk = false;
          break; // token rejected, try next
        } else {
          const body = await res.text();
          if (body.includes("already exists")) {
            console.log(`  ${file} — ⚠️  already applied`);
          } else {
            console.log(`  ${file} — ❌  ${res.status}: ${body.slice(0, 120)}`);
          }
        }
      } catch {
        allOk = false;
        break;
      }
    }
    if (allOk) {
      console.log("\n✅  Migration applied via Management API.");
      return true;
    }
  }
  return false;
}

// ─── Fallback: Print SQL + instructions ────────────────────────────────────────
function printManualInstructions() {
  const ref = getProjectRef();
  const sqlEditorUrl = ref
    ? `https://supabase.com/dashboard/project/${ref}/sql/new`
    : "https://supabase.com/dashboard";

  // Show only the reviews restore migration specifically
  const migrations = getMigrationFiles();
  const restoreMigration = migrations.find((m) => m.file === "003_restore_reviews.sql")
    ?? migrations.find((m) => m.file.includes("restore"))
    ?? migrations[migrations.length - 1];

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUTO-CONNECT FAILED — run the migration manually (takes ~30s):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Step 1 — Open the Supabase SQL Editor:
   ${sqlEditorUrl}

 Step 2 — Paste and run this SQL (${restoreMigration.file}):

${restoreMigration.sql}
 Step 3 — Seed the reviews:
   npm run seed:reviews

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 OR add DATABASE_URL to .env.local to automate future migrations:
   Supabase Dashboard → Settings → Database → Connection string (URI)
   DATABASE_URL=postgresql://postgres:[password]@db.${ref ?? "[ref]"}.supabase.co:5432/postgres
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Supabase Migration Runner ===\n");
  if (await tryPgConnection()) return;
  console.log("Trying Supabase Management API...");
  if (await tryManagementApi()) return;
  printManualInstructions();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
