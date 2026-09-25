/**
 * Re-runnable migration importer from live MongoDB into the Phase 3+ relational
 * schema.
 *
 *   Dry-run (default, read-only; safe): maps + validates every source document
 *   against the target schema. No inserts.
 *
 *   --insert        Write to PostgreSQL. Idempotent: every insert uses
 *                   ON CONFLICT DO NOTHING on the natural key/primary key, so a
 *                   re-run cannot duplicate rows.
 *   --reset         Drop the public schema, re-run all migrations, then import.
 *   --force         Ignore the checkpoint state file and re-run all phases.
 *   --backup DIR    Read the source from a mongoexport --jsonArray directory
 *                   (EJSON files: <db>.<collection>.json or <collection>.json)
 *                   instead of connecting to live MongoDB. Same contract as the
 *                   live driver (ids decoded from $oid, dates from $date).
 *   --checkpoint P  State file path (default <backend>/.migration-checkpoint.json)
 *   --report P      Report output path (default <scripts>/reports/import-*.json)
 *   --exceptions P  Optional JSON ledger of approved quarantine decisions
 *                   ([{...quarantined entry, approved:true, note}]). Informational
 *                   only: quarantined rows stay excluded either way.
 *   --fail-on-quarantine  Exit non-zero if any row had to be quarantined.
 *
 * Always exits 1 if any mapping failure (constraint/format) is found. Quarantine
 * (orphan reference) records deterministic exclusions that a human approves via
 * the exceptions ledger.
 */
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const mongoose = require("mongoose");

const m = require("./mapping");

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB || "test";
const argVal = (name) => {
  const i = process.argv.findIndex((a) => a === name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
};
const BACKUP_DIR = process.env.MONGO_BACKUP_DIR || argVal("--backup");
const DATABASE_URL = process.env.DATABASE_URL;
const INSERT = process.argv.includes("--insert");
const RESET = process.argv.includes("--reset");
const FORCE = process.argv.includes("--force");
const FAIL_ON_QUARANTINE = process.argv.includes("--fail-on-quarantine");

const CHECKPOINT_PATH =
  argVal("--checkpoint") || path.resolve(__dirname, "../../../.migration-checkpoint.json");
const REPORTS_DIR = path.join(__dirname, "reports");
const EXCEPTIONS_PATH = argVal("--exceptions");

if (!MONGO_URL && !BACKUP_DIR) {
  console.error("MONGO_URL (live source) or MONGO_BACKUP_DIR/--backup (EJSON export dir) is required");
  process.exit(1);
}
if (INSERT) {
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is required with --insert");
    process.exit(1);
  }
  if (RESET && !argVal("--checkpoint")) {
    fs.rmSync(CHECKPOINT_PATH, { force: true });
  }
}

if (!INSERT && RESET) {
  console.error("--reset requires --insert");
  process.exit(1);
}

const { getPool } = require("../../shared/database/pool");

const trunc = (v) => String(v ?? "").slice(0, 12);
const checksumOf = (ids) => {
  const hex = ids.map((id) => trunc(id)).sort().join(",");
  return crypto.createHash("md5").update(hex).digest("base64url").slice(0, 10);
};

const report = {
  db: MONGO_DB,
  mode: INSERT ? "import" : "preview",
  generatedAt: new Date().toISOString(),
  source: {},
  plan: {},
  quarantined: [],
  quarantinedSummary: {},
  failures: [],
  exceptionsUsed: [],
};

const applyExceptions = () => {
  if (!EXCEPTIONS_PATH) return;
  if (!fs.existsSync(EXCEPTIONS_PATH)) {
    console.error(`Exceptions ledger not found at ${EXCEPTIONS_PATH}`);
    process.exit(1);
  }
  const ledger = JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, "utf8"));
  const approved = new Set(ledger.map((e) => JSON.stringify({ table: e.table, id: e.id })));
  report.quarantined.forEach((q) => {
    const key = JSON.stringify({ table: q.table, id: q.id });
    if (approved.has(key)) report.exceptionsUsed.push({ ...q, approved: true, note: q.note });
  });
};

const chunkRows = (rows, count) => (rows.length <= count ? [rows] : [rows.slice(0, count), ...chunkRows(rows.slice(count), count)]);

const PHASES = [
  { name: "users", table: "users", conflict: "(id)", columns: ["id","firstname","lastname","username","email","password_hash","is_admin","gender","phone","created_at","updated_at"], get: (d) => d.users.rows },
  { name: "user_password_history", table: "user_password_history", conflict: "(user_id, position)", columns: ["user_id","position","password_hash"], get: (d) => d.users.history },
  { name: "products", table: "products", conflict: "(id)", columns: ["id","title","description","image_url","categories","size","color","price","rating","stock_quantity","is_deleted","created_at","updated_at"], get: (d) => d.products.rows },
  { name: "addresses", table: "addresses", conflict: "(id)", columns: ["id","user_id","full_address","phone_number","first_name","last_name","label","is_default","created_at","updated_at"], get: (d) => d.addresses.rows },
  { name: "carts", table: "carts", conflict: "(id)", columns: ["id","user_id","created_at","updated_at"], get: (d) => d.carts.rows.map((c) => c.cart) },
  { name: "cart_items", table: "cart_items", conflict: "(cart_id, position)", columns: ["cart_id","product_id","quantity","position"], get: (d) => d.carts.rows.map((c) => c.items.map((i) => ({ ...i, cart_id: c.cart.id }))).flat() },
  { name: "wishlists", table: "wishlists", conflict: "(id)", columns: ["id","user_id","created_at","updated_at"], get: (d) => d.wishlists.rows.map((w) => w.wishlist) },
  { name: "wishlist_items", table: "wishlist_items", conflict: "(wishlist_id, position)", columns: ["wishlist_id","product_id","position"], get: (d) => d.wishlists.rows.map((w) => w.items.map((i) => ({ ...i, wishlist_id: w.wishlist.id }))).flat() },
  { name: "orders", table: "orders", conflict: "(id)", columns: ["id","user_id","subtotal_in_cents","discount_in_cents","shipping_cost_in_cents","total_amount_in_cents","currency","status","payment_method","tracking_number","estimated_delivery_at","ship_to_full_address","ship_to_phone_number","ship_to_first_name","ship_to_last_name","ship_to_label","created_at","updated_at"], get: (d) => d.orders.rows.map((o) => o.order) },
  { name: "order_items", table: "order_items", conflict: "(order_id, line_number)", columns: ["order_id","line_number","product_id","product_title_snapshot","product_image_snapshot","quantity","price_at_order_in_cents"], get: (d) => d.orders.rows.map((o) => o.items.map((i) => ({ ...i, order_id: o.order.id }))).flat() },
];

async function insertTable(client, table, columns, rows, conflict) {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };
  const colList = columns.join(", ");
  let inserted = 0;
  let skipped = 0;
  for (const batch of chunkRows(rows, 200)) {
    const valueList = batch
      .map((_, i) => `(${columns.map((c, ci) => `$${i * columns.length + ci + 1}`).join(", ")})`)
      .join(", ");
    const values = batch.flatMap((row) => columns.map((c) => row[c]));
    const result = await client.query(
      `INSERT INTO ${table} (${colList}) VALUES ${valueList} ON CONFLICT ${conflict} DO NOTHING`,
      values,
    );
    inserted += result.rowCount;
    skipped += batch.length - result.rowCount;
  }
  return { inserted, skipped };
}

const resetTarget = () => {
  console.log("[reset] dropping schema and re-running migrations...");
  const env = { ...process.env, DATABASE_URL };
  const drop = spawnSync("psql", [DATABASE_URL, "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"], {
    env,
    stdio: "inherit",
  });
  if (drop.status !== 0) throw new Error("reset: could not drop/recreate public schema");
  const binDir = path.resolve(__dirname, "../../../node_modules/.bin");
  const migrate = spawnSync(path.join(binDir, "node-pg-migrate"), ["up", "-m", "db/migrations"], {
    cwd: path.resolve(__dirname, "../../.."),
    env,
    stdio: "inherit",
  });
  if (migrate.status !== 0) throw new Error("reset: migrations failed");
};

async function main() {
  const startedAt = Date.now();
  const pool = INSERT ? getPool() : null;

  const loadCheckpoint = () => {
    if (FORCE || !fs.existsSync(CHECKPOINT_PATH)) return {};
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf8"));
    } catch {
      return {};
    }
  };
  const checkpoint = loadCheckpoint();

  if (INSERT && RESET) resetTarget();

  const connection = BACKUP_DIR
    ? null
    : await mongoose.createConnection(MONGO_URL, {
        serverSelectionTimeoutMS: 10000,
      }).asPromise();

  const sources = {};
  if (BACKUP_DIR) {
    Object.assign(sources, require("./json-source").loadBackup(BACKUP_DIR));
  } else {
    const db = connection.useDb(MONGO_DB);
    for (const coll of ["users", "products", "addresses", "carts", "wishlists", "orders"]) {
      sources[coll] = await db.collection(coll).find({}).toArray();
    }
  }

  for (const coll of ["users", "products", "addresses", "carts", "wishlists", "orders"]) {
    const docs = sources[coll];
    report.source[coll] = {
      count: docs.length,
      idChecksum: checksumOf(docs.map((d) => String(d._id || ""))),
    };
  }

  const userIds = new Set(sources.users.map((u) => String(u._id)));
  const productIds = new Set(sources.products.map((p) => String(p._id)));
  const productsById = new Map(sources.products.map((p) => [String(p._id), p]));

  const data = {
    users: m.mapUsers(sources.users),
    products: m.mapProducts(sources.products),
    addresses: m.mapAddresses(sources.addresses, userIds),
    carts: m.mapCarts(sources.carts, userIds, productIds),
    wishlists: m.mapWishlists(sources.wishlists, userIds, productIds),
    orders: m.mapOrders(sources.orders, userIds, productIds, productsById),
  };

  Object.values(data).forEach(({ failures }) => report.failures.push(...failures));
  for (const key of ["carts", "wishlists", "orders"]) report.quarantined.push(...data[key].quarantined);

  const dup = (vals) => {
    const by = new Map();
    for (const v of vals) by.set(v, (by.get(v) || 0) + 1);
    const n = [...by.values()].filter((c) => c > 1).length;
    return n > 0 ? [...by.entries()].filter(([, c]) => c > 1).map(([v, c]) => `${trunc(v)}x${c}`) : [];
  };
  const dups = {
    username: dup(sources.users.map((u) => String(u.username || ""))),
    email: dup(sources.users.map((u) => String(u.email || ""))),
    phone: dup(sources.users.map((u) => String(u.phone || ""))),
    productTitle: dup(sources.products.map((p) => String(p.title || ""))),
    cartPerUser: dup(sources.carts.map((c) => String(c.userId || ""))),
    wishlistPerUser: dup(sources.wishlists.map((w) => String(w.userId || ""))),
  };
  for (const [field, list] of Object.entries(dups)) {
    if (list.length) report.failures.push({ table: "*", id: "*", field, detail: `${list.length} duplicate(s): ${list.join(", ")}` });
  }

  const defaultsPerUser = new Map();
  for (const a of data.addresses.rows) if (a.is_default) defaultsPerUser.set(a.user_id, (defaultsPerUser.get(a.user_id) || 0) + 1);
  const multiDefault = [...defaultsPerUser].filter(([, n]) => n > 1).length;
  if (multiDefault > 0) report.failures.push({ table: "addresses", id: "*", field: "is_default", detail: `${multiDefault} user(s) with multiple defaults` });

  applyExceptions();
  report.quarantinedSummary = {
    cartItems: report.quarantined.filter((q) => q.cart_id).length,
    wishlistItems: report.quarantined.filter((q) => q.wishlist_id).length,
    orderItems: report.quarantined.filter((q) => q.order_id).length,
  };

  if (report.failures.length > 0) {
    console.error(JSON.stringify(report, null, 2));
    console.error(`Aborting: ${report.failures.length} mapping failure(s) found.`);
    if (connection) await connection.close();
    process.exit(1);
  }

  const plan = {};
  for (const phase of PHASES) {
    const rows = phase.get(data);
    plan[phase.name] = { rows: rows.length, conflict: phase.conflict };
  }
  report.plan = plan;

  if (!INSERT) {
    report.durationMs = Date.now() - startedAt;
    writeReport();
    console.log(JSON.stringify(report, null, 2));
    if (connection) await connection.close();
    process.exit(report.quarantined.length && FAIL_ON_QUARANTINE ? 1 : 0);
  }

  const dbLabel = (() => {
  try {
    const p = new URL(DATABASE_URL).pathname.replace(/^\//, "");
    if (p) return p;
  } catch {
    /* fall through */
  }
  return DATABASE_URL.split("@").pop().split("/").pop();
})();
console.log(`Importing into ${dbLabel}...`);
  const client = await pool.connect();
  let phaseCount = 0;
  try {
    for (const phase of PHASES) {
      const rows = phase.get(data);
      const expected = rows.length;

      const state = checkpoint[phase.name];
      if (state && state.done && state.expected === expected) {
        const existing = (
          await client.query(`SELECT count(*)::int AS n FROM ${phase.table}`)
        ).rows[0].n;
        if (existing >= expected) {
          console.log(`[${phase.name}] checkpoint hit (${expected} rows already present)`);
          continue;
        }
      }

      const { inserted, skipped } = await insertTable(client, phase.table, phase.columns, rows, phase.conflict);
      phaseCount += 1;
      console.log(`[${phase.name}] ${inserted} inserted, ${skipped} skipped`);

      checkpoint[phase.name] = { done: true, expected, at: new Date().toISOString() };
      fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
    }
  } finally {
    client.release();
  }

  report.phasesRun = phaseCount;
  report.durationMs = Date.now() - startedAt;
  writeReport();
  console.log(`Import complete in ${report.durationMs}ms (${phaseCount} phases).`);

  if (connection) await connection.close();
  if (pool) await require("../../shared/database/pool").closePool();
  process.exit(report.quarantined.length && FAIL_ON_QUARANTINE ? 1 : 0);
}

function writeReport() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = argVal("--report") || path.join(REPORTS_DIR, `import-${stamp}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Report written to ${out}`);
}

main().catch(async (err) => {
  console.error("Import failed:", err.message);
  if (INSERT) {
    try {
      await require("../../shared/database/pool").closePool();
    } catch {
      /* pool may not exist */
    }
  }
  process.exit(1);
});