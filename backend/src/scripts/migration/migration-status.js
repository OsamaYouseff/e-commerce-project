// Show applied migrations (node-pg-migrate 7.x removed the CLI `status`
// subcommand; this queries the pgmigrations tracking table instead).
//   DATABASE_URL=<pg> node migration-status.js
const { getPool, closePool } = require("../../shared/database/pool");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = getPool();
  const hasTable = await pool.query(
    "SELECT to_regclass('public.pgmigrations') AS t",
  );
  if (!hasTable.rows[0].t) {
    console.log("No pgmigrations table (migrations not applied yet).");
    await closePool();
    return;
  }
  const { rows } = await pool.query(
    "SELECT id, name, run_on FROM pgmigrations ORDER BY run_on, id",
  );
  console.log(`${rows.length} migration(s) applied:`);
  for (const r of rows) console.log(`  ${String(r.id).padEnd(3)} ${r.name}  (${r.run_on.toISOString()})`);
  await closePool();
}

main().catch((err) => {
  console.error("Migration status failed:", err.message);
  process.exit(1);
});
