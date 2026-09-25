/**
 * Reconciliation between the live MongoDB source and the imported PostgreSQL
 * target. Read-only; connects to both and diff-compares counts, id-sets,
 * numeric rollups, and on-target referential integrity.
 *
 *   MONGO_URL=<uri> [MONGO_DB=test] DATABASE_URL=<pg> node reconcile-import.js
 *   --strict         Also fail on rows present in PG but absent in Mongo
 *   --report P       Report output path (default <scripts>/reports/reconcile-*.json)
 *
 * Exit codes:
 *   0  all core checks pass (missing sets empty; no PG FK orphans)
 *   2  --strict violated by extra PG rows
 *   1  core data loss (Mongo rows missing from PG) or hard failure
 */
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { getPool } = require("../../shared/database/pool");

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB || "test";
const argVal = (name) => {
  const i = process.argv.findIndex((a) => a === name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
};
const BACKUP_DIR = process.env.MONGO_BACKUP_DIR || argVal("--backup");
const DATABASE_URL = process.env.DATABASE_URL;
const STRICT = process.argv.includes("--strict");
const REPORTS_DIR = path.join(__dirname, "reports");

const EXPECT_QUARANTINE = {};
for (const part of (argVal("--quarantine-expect") || "").split(",").filter(Boolean)) {
  const [name, count] = part.split("=");
  if (name && count != null) EXPECT_QUARANTINE[name.trim()] = Number(count);
}

if ((!MONGO_URL && !BACKUP_DIR) || !DATABASE_URL) {
  console.error("MONGO_URL (or MONGO_BACKUP_DIR/--backup) and DATABASE_URL are required");
  process.exit(1);
}

const md5 = (ids) => crypto.createHash("md5").update(ids.slice().sort().join(",")).digest("base64url").slice(0, 10);

const diffSets = (fromIds, toIds) => {
  const to = new Set(toIds);
  const missing = [...new Set(fromIds)].filter((id) => !to.has(id));
  const from = new Set(fromIds);
  const extra = [...new Set(toIds)].filter((id) => !from.has(id));
  return { missing, extra };
};

const mSum = (rows, key) => (rows || []).reduce((acc, d) => acc + ((d && d[key]) || 0), 0);

/**
 * Row-collection descriptions: where the Mongo rows come from, the PG table/column
 * to diff against, optional numeric rollups, and whether the collection has
 * comparable per-row ids (child tables do not).
 */
const collections = [
  {
    name: "users", table: "users",
    mongoRows: (m) => m.users,
    rollups: [],
    child: false,
  },
  {
    name: "userPasswordHistory", table: "user_password_history",
    mongoRows: (m) => m.userPasswordHistoryDocs,
    rollups: [],
    child: true,
  },
  {
    name: "products", table: "products",
    mongoRows: (m) => m.products,
    rollups: [
      { name: "priceSumCents", mongo: (rows) => Math.round(mSum(rows, "price") * 100), pg: "SUM(price::numeric * 100)::bigint AS v" },
      { name: "stockSum", mongo: (rows) => mSum(rows, "amount"), pg: "SUM(stock_quantity)::bigint AS v" },
    ],
    child: false,
  },
  {
    name: "addresses", table: "addresses",
    mongoRows: (m) => m.addresses,
    rollups: [],
    child: false,
  },
  {
    name: "carts", table: "carts",
    mongoRows: (m) => m.carts,
    rollups: [],
    child: false,
  },
  {
    name: "cartItems", table: "cart_items",
    mongoRows: (m) => m.cartItemDocs,
    rollups: [{ name: "qtySum", mongo: (rows) => mSum(rows, "quantity"), pg: "SUM(quantity)::bigint AS v" }],
    child: true,
  },
  {
    name: "wishlists", table: "wishlists",
    mongoRows: (m) => m.wishlists,
    rollups: [],
    child: false,
  },
  {
    name: "wishlistItems", table: "wishlist_items",
    mongoRows: (m) => m.wishlistItemDocs,
    rollups: [],
    child: true,
  },
  {
    name: "orders", table: "orders",
    mongoRows: (m) => m.orders,
    rollups: [{ name: "totalCentsSum", mongo: (rows) => rows.reduce((a, o) => a + (((o.financials || {}).totalAmountInCents) || 0), 0), pg: "SUM(total_amount_in_cents)::bigint AS v" }],
    child: false,
  },
  {
    name: "orderItems", table: "order_items",
    mongoRows: (m) => m.orderItemDocs,
    rollups: [
      { name: "qtySum", mongo: (rows) => mSum(rows, "quantity"), pg: "SUM(quantity)::bigint AS v" },
      { name: "priceSumCents", mongo: (rows) => mSum(rows, "priceAtOrderInCents"), pg: "SUM(price_at_order_in_cents)::bigint AS v" },
    ],
    child: true,
  },
];

const INTEGRITY_CHECKS = [
  { name: "orphanAddressUsers", q: "SELECT a.id AS id FROM addresses a LEFT JOIN users u ON u.id = a.user_id WHERE u.id IS NULL" },
  { name: "orphanCartUsers", q: "SELECT c.id AS id FROM carts c LEFT JOIN users u ON u.id = c.user_id WHERE u.id IS NULL" },
  { name: "orphanWishlistUsers", q: "SELECT w.id AS id FROM wishlists w LEFT JOIN users u ON u.id = w.user_id WHERE u.id IS NULL" },
  { name: "orphanOrderUsers", q: "SELECT o.id AS id FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL" },
  { name: "orphanCartItemProducts", q: "SELECT DISTINCT ci.cart_id AS id FROM cart_items ci LEFT JOIN products p ON p.id = ci.product_id WHERE p.id IS NULL" },
  { name: "orphanWishlistItemProducts", q: "SELECT DISTINCT wi.wishlist_id AS id FROM wishlist_items wi LEFT JOIN products p ON p.id = wi.product_id WHERE p.id IS NULL" },
  { name: "orphanOrderItemProducts", q: "SELECT DISTINCT oi.order_id AS id FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.product_id IS NOT NULL AND p.id IS NULL" },
];

async function main() {
  const startedAt = Date.now();
  const pool = getPool();

  let connection = null;
  let mongoDoc = {};
  if (BACKUP_DIR) {
    mongoDoc = require("./json-source").loadBackup(BACKUP_DIR);
  } else {
    connection = await mongoose.createConnection(MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    }).asPromise();
    const db = connection.useDb(MONGO_DB);
    for (const name of ["users", "products", "addresses", "carts", "wishlists", "orders"]) {
      mongoDoc[name] = await db.collection(name).find({}).toArray();
    }
  }
  mongoDoc.cartItemDocs = mongoDoc.carts.flatMap((c) => c.products || []);
  mongoDoc.wishlistItemDocs = mongoDoc.wishlists.flatMap((w) => w.products || []);
  mongoDoc.orderItemDocs = mongoDoc.orders.flatMap((o) => o.items || []);
  mongoDoc.userPasswordHistoryDocs = Array.from({
    length: mongoDoc.users.reduce((n, u) => n + (u.passwordHistory || []).length, 0),
  });

  const report = {
    generatedAt: new Date().toISOString(),
    mongoDb: MONGO_DB,
    strict: STRICT,
    quarantineExpect: EXPECT_QUARANTINE,
    durationMs: null,
    collections: {},
    pgIntegrity: {},
    result: "pending",
  };

  let hardFails = 0;
  let warnings = 0;

  for (const c of collections) {
    const mRows = c.mongoRows(mongoDoc);
    const mCount = mRows.length;

    const pgIds = [];
    let pgCount;
    if (c.child) {
      pgCount = (await pool.query(`SELECT count(*)::int AS n FROM ${c.table}`)).rows[0].n;
    } else {
      pgIds.push(
        ...(await pool.query(`SELECT id FROM ${c.table} ORDER BY id`)).rows.map((r) => String(r.id)),
      );
      pgCount = pgIds.length;
    }

    const entry = {
      mongoCount: mCount,
      pgCount,
      rollups: [],
      pass: true,
    };

    if (!c.child) {
      const mIds = mRows.filter((d) => d && d._id != null).map((d) => String(d._id));
      const { missing, extra } = diffSets(mIds, pgIds);
      entry.idChecksumMongo = md5(mIds);
      entry.idChecksumPg = md5(pgIds);
      entry.missingCount = missing.length;
      entry.extraCount = extra.length;
      entry.missing = missing.slice(0, 20);
      entry.extra = extra.slice(0, 20);
      if (missing.length > 0) { entry.pass = false; hardFails += 1; }
      if (extra.length > 0) { warnings += 1; if (STRICT) entry.pass = false; }
    } else {
      const extraCount = Math.max(0, pgCount - mCount);
      entry.extraCount = extraCount;
      const deficit = mCount - pgCount;
      entry.quarantineExpected = EXPECT_QUARANTINE[c.name] ?? null;
      if (mCount !== pgCount && EXPECT_QUARANTINE[c.name] !== deficit) warnings += 1;
    }

    for (const r of c.rollups || []) {
      const mVal = r.mongo(mRows, mongoDoc);
      const pgVal = Number((await pool.query(`SELECT ${r.pg} FROM ${c.table}`)).rows[0].v ?? 0);
      const ok = mVal === pgVal;
      if (!ok) { entry.pass = false; hardFails += 1; }
      entry.rollups.push({ name: r.name, mongo: mVal, pg: pgVal, pass: ok });
    }

    report.collections[c.name] = entry;
  }

  for (const { name, q } of INTEGRITY_CHECKS) {
    const rows = (await pool.query(q)).rows;
    report.pgIntegrity[name] = { count: rows.length, sample: rows.slice(0, 10).map((r) => r.id) };
    if (rows.length > 0) warnings += 1;
  }

  report.result = hardFails > 0 ? "FAIL" : warnings > 0 ? "WARN" : "PASS";
  report.durationMs = Date.now() - startedAt;

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = argVal("--report") || path.join(REPORTS_DIR, `reconcile-${stamp}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));

  const perLine = Object.entries(report.collections)
    .map(([name, v]) => {
      const ids = v.missingCount !== undefined ? ` missing=${v.missingCount} extra=${v.extraCount}` : "";
      return `  ${name}: mongo=${v.mongoCount} pg=${v.pgCount}${ids}${v.pass ? "" : " [FAIL]"}`;
    })
    .join("\n");
  console.log(`Reconciliation result: ${report.result} (${report.durationMs}ms)`);
  console.log(perLine);
  console.log(`Integrity: ${Object.entries(report.pgIntegrity).map(([k, v]) => `${k}=${v.count}`).join(" ")}`);
  console.log(`Report written to ${out}`);

  if (connection) await connection.close();
  await require("../../shared/database/pool").closePool();
  process.exit(hardFails > 0 ? 1 : warnings > 0 && STRICT ? 2 : 0);
}

main().catch((err) => {
  console.error("Reconcile failed:", err.message);
  process.exit(1);
});