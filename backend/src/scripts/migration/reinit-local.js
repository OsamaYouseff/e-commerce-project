// Re-initialize the local PostgreSQL cluster and databases from repo artifacts.
//
// Source of truth is ALWAYS the repo, never /tmp:
//   - PG dumps:      backend/src/scripts/migration/backups/ (pg_restore, byte-exact)
//   - Mongo snapshot: <repo-root>/mongodb-backup/test.*.json (canonical importer source)
// /tmp only holds the cluster runtime dir and disappears on reboot.
//
// Usage:
//   node reinit-local.js                  # restore dumps (fast, byte-exact)
//   node reinit-local.js --import         # canonical path: import from mongodb-backup snapshot
//   node reinit-local.js --import --db evo_market_prod
//
// Env overrides: PGDATA, PGPORT, SKIP_START=1 (cluster already running).
// Apply responsive to prod: run from backend/ with the same PATH postgresql/16/bin available.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { parseDbUrl } = require("./db-url.js");

const PGDATA = process.env.PGDATA || "/tmp/opencode/pgdata";
const PGPORT = process.env.PGPORT || "55432";
const DBS = { staging: "evo_market_staging", prod: "evo_market_prod", test: "evo_market_test" };
const RESTORE_MAP = { evo_market_staging: /^evo_market_staging-.*\.dump$/, evo_market_prod: /^evo_market_prod-.*\.dump$/ };
const args = process.argv.slice(2);
const wantImport = args.includes("--import");
const onlyDb = (() => {
  const i = args.indexOf("--db");
  return i >= 0 ? args[i + 1] : undefined;
})();
const targets = onlyDb ? [onlyDb] : Object.values(DBS);

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function ensurePgBin() {
  const dirs = (process.env.PATH || "").split(":");
  const has = (b) => dirs.some((d) => fs.existsSync(path.join(d, b)));
  if (has("pg_ctl") && has("initdb")) return;
  const candidates = [];
  for (let v = 18; v >= 13; v--) candidates.push(`/usr/lib/postgresql/${v}/bin`);
  candidates.push("/usr/lib/postgresql/bin");
  const found = candidates.find((d) => fs.existsSync(path.join(d, "pg_ctl")) && fs.existsSync(path.join(d, "initdb")));
  if (!found) fail("PostgreSQL binaries not found. Install postgresql-16 or export PATH to its bin.");
  process.env.PATH = `${found}:${process.env.PATH}`;
}

function run(cmd, binArgs, opts = {}) {
  return execFileSync(cmd, binArgs, { stdio: ["ignore", "inherit", "pipe"], ...opts });
}

function dbUrl(db) {
  return `postgresql://postgres@/${db}?host=${PGDATA}&port=${PGPORT}`;
}

function ensureCluster() {
  fs.mkdirSync(path.dirname(PGDATA), { recursive: true });
  const hasCluster = fs.existsSync(path.join(PGDATA, "PG_VERSION"));
  let running = false;
  try {
    execFileSync("pg_ctl", ["-D", PGDATA, "status"], { stdio: "pipe" });
    running = true;
  } catch {
    running = false;
  }
  if (running) {
    console.log(`[1/4] cluster already running on :${PGPORT}`);
    return;
  }
  if (process.env.SKIP_START === "1") fail(`SKIP_START=1 but cluster at ${PGDATA} is not running.`);
  if (!hasCluster) {
    console.log(`[1/4] initdb -> ${PGDATA}`);
    run("initdb", ["-D", PGDATA, "-U", "postgres", "--auth=trust"]);
  }
  console.log(`[1/4] starting cluster on :${PGPORT}`);
  run("pg_ctl", ["-D", PGDATA, "-o", `-p ${PGPORT} -k ${PGDATA} -h 127.0.0.1`, "-w", "-l", path.join(PGDATA, "pg.log"), "start"]);
}

function ensureDbs() {
  console.log("[2/4] ensuring databases");
  for (const name of targets) {
    let exists = "";
    try {
      exists = execFileSync("psql", ["-h", "127.0.0.1", "-p", PGPORT, "-U", "postgres", "-d", "postgres", "-tAc", `SELECT 1 FROM pg_database WHERE datname='${name}'`], { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
    } catch { exists = ""; }
    if (exists !== "1") {
      run("createdb", ["-h", "127.0.0.1", "-p", PGPORT, "-U", "postgres", name]);
      console.log(`    created ${name}`);
    } else {
      console.log(`    exists ${name}`);
    }
  }
}

function latestDump(dbName) {
  const re = RESTORE_MAP[dbName];
  if (!re) return null;
  const dir = path.join(__dirname, "backups");
  if (!fs.existsSync(dir)) return null;
  const hit = fs.readdirSync(dir).filter((f) => re.test(f)).sort().slice(-1)[0];
  return hit ? path.join(dir, hit) : null;
}

function restoreStep() {
  console.log("[3/4] restoring dumps");
  for (const name of targets) {
    const dump = latestDump(name);
    if (!dump) { console.log(`    ${name}: no dump, leaving empty (use --import)`); continue; }
    run("node", [path.join(__dirname, "restore-db.js")], { env: { ...process.env, DATABASE_URL: dbUrl(name), BACKUP: dump } });
  }
}

function importStep() {
  console.log("[3/4] importing from mongodb-backup snapshot");
  const snap = path.join(__dirname, "../../../../mongodb-backup");
  if (!fs.existsSync(path.join(snap, "test.users.json"))) fail(`snapshot not found at ${snap}`);
  for (const name of targets) {
    if (name === "evo_market_test") { console.log("    evo_market_test: skipped (no snapshot data expected)"); continue; }
    console.log(`    importing -> ${name}`);
    run("node", [path.join(__dirname, "import-mongo.js"), "--reset", "--insert"], { env: { ...process.env, DATABASE_URL: dbUrl(name), MONGO_BACKUP_DIR: snap } });
  }
}

function finish() {
  console.log("[4/4] done. Connect with:");
  console.log(`  psql "postgresql://postgres@/evo_market_prod?host=${PGDATA}&port=${PGPORT}"`);
  console.log("  GUI (DBeaver/pgAdmin): host 127.0.0.1, port " + PGPORT + ", user postgres, no password, SSL off.");
  console.log("  NOTE: this cluster lives under /tmp — it does NOT survive reboot; re-run this script to recover.");
}

ensurePgBin();
ensureCluster();
ensureDbs();
if (wantImport) importStep(); else restoreStep();
finish();
