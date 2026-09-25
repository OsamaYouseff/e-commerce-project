// Reverse importer (rollback path, plan §29): PostgreSQL snapshot ->
// mongoexport-shaped EJSON so a staged Mongo can be restored to the app.
//
//   DATABASE_URL=<pg> node export-mongo.js            # -> <scripts>/exports/<stamp>/test.*.json
//   DATABASE_URL=<pg> node export-mongo.js --out /path/to/dir
//
// Output preserves the Phase 3 imported contract: $oid for ids, $date for
// timestamps, plain strings for carts/wishlists.userId (legacy shape), and the
// original field names (desc/img/amount/isDeleted/password, financials, ...).
//
// Fidelity notes (intentional, reviewer-visible):
//   - Synthetic PG-only data is NOT re-materialized: order_items
//     product_title_snapshot / product_image_snapshot are import artifacts.
//   - Quarantined source refs are absent from PG by FK design and are NOT
//     re-materialized (see the originating import report). Child-table _ids
//     (cart/wishlist/order items) were not stored in PG; they are re-derived
//     deterministically (sha1(parentId:position)) so exports are reproducible.
//   - shippingInfo.estimatedDeliveryDate is emitted when estimated_delivery_at
//     is set (the importer currently maps only via shippingInfo, so a source
//     using it populates at import time; reverse keeps that state).
//
// Post-export validation (nice-to-have): run the importer dry-run against the
// outputdir to re-verify every document maps cleanly back to the schema.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const { getPool, closePool } = require("../../shared/database/pool");

const DEFAULT_DB = "test";
const argVal = (name) => {
  const i = process.argv.findIndex((a) => a === name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
};
const DATABASE_URL = process.env.DATABASE_URL;
const PREFIX = argVal("--prefix") || process.env.MONGO_DB || DEFAULT_DB;
const EXPDIR = argVal("--out") || path.join(__dirname, "exports", new Date().toISOString().replace(/[:.]/g, "-"));
const SKIP_VALIDATE = process.argv.includes("--skip-validate");

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const oid = (id) => ({ $oid: id });
const date = (d) => ({ $date: d.toISOString() });
const maybeDate = (v) => (v ? date(v) : v);
const num = (v) => (v == null ? v : Number(v));
const deriveId = (parentId, position) => crypto.createHash("sha1").update(`${parentId}:${position}`).digest("hex").slice(0, 24);

async function one(client, q) {
  return (await client.query(q)).rows;
}
async function first(client, q) {
  return (await client.query(q)).rows[0];
}

async function exportUsers(client) {
  const users = await one(client, "SELECT * FROM users ORDER BY id");
  const historyBy = new Map();
  for (const h of await one(client, "SELECT * FROM user_password_history ORDER BY user_id, position")) {
    if (!historyBy.has(h.user_id)) historyBy.set(h.user_id, []);
    historyBy.get(h.user_id).push(h.password_hash);
  }
  return users.map((u) => {
    const history = historyBy.get(u.id) || [];
    return {
      _id: oid(u.id),
      firstname: u.firstname,
      lastname: u.lastname,
      username: u.username,
      email: u.email,
      password: u.password_hash,
      ...(history.length ? { passwordHistory: history } : {}),
      isAdmin: u.is_admin,
      gender: u.gender,
      phone: u.phone,
      createdAt: maybeDate(u.created_at),
      updatedAt: maybeDate(u.updated_at),
    };
  });
}

async function exportProducts(client) {
  const rows = await one(client, "SELECT * FROM products ORDER BY id");
  return rows.map((p) => ({
    _id: oid(p.id),
    title: p.title,
    desc: p.description,
    img: p.image_url,
    ...(p.categories ? { categories: p.categories } : {}),
    ...(p.size != null ? { size: p.size } : {}),
    ...(p.color != null ? { color: p.color } : {}),
    price: num(p.price),
    rating: num(p.rating),
    amount: num(p.stock_quantity),
    isDeleted: p.is_deleted,
    createdAt: maybeDate(p.created_at),
    updatedAt: maybeDate(p.updated_at),
  }));
}

async function exportAddresses(client) {
  const rows = await one(client, "SELECT * FROM addresses ORDER BY id");
  return rows.map((a) => ({
    _id: oid(a.id),
    userId: oid(a.user_id),
    firstName: a.first_name,
    lastName: a.last_name,
    fullAddress: a.full_address,
    phoneNumber: a.phone_number,
    ...(a.label != null ? { label: a.label } : {}),
    isDefault: a.is_default,
    createdAt: maybeDate(a.created_at),
    updatedAt: maybeDate(a.updated_at),
  }));
}

async function exportCarts(client) {
  const carts = await one(client, "SELECT * FROM carts ORDER BY id");
  const itemsBy = new Map();
  for (const it of await one(client, "SELECT * FROM cart_items ORDER BY cart_id, position")) {
    if (!itemsBy.has(it.cart_id)) itemsBy.set(it.cart_id, []);
    itemsBy.get(it.cart_id).push(it);
  }
  return carts.map((c) => ({
    _id: oid(c.id),
    userId: c.user_id,
    products: (itemsBy.get(c.id) || []).map((it) => ({
      _id: oid(deriveId(c.id, it.position)),
      productId: it.product_id,
      quantity: num(it.quantity),
    })),
    createdAt: maybeDate(c.created_at),
    updatedAt: maybeDate(c.updated_at),
  }));
}

async function exportWishlists(client) {
  const wishlists = await one(client, "SELECT * FROM wishlists ORDER BY id");
  const itemsBy = new Map();
  for (const it of await one(client, "SELECT * FROM wishlist_items ORDER BY wishlist_id, position")) {
    if (!itemsBy.has(it.wishlist_id)) itemsBy.set(it.wishlist_id, []);
    itemsBy.get(it.wishlist_id).push(it);
  }
  return wishlists.map((w) => ({
    _id: oid(w.id),
    userId: w.user_id,
    products: (itemsBy.get(w.id) || []).map((it) => ({
      _id: oid(deriveId(w.id, it.position)),
      productId: it.product_id,
    })),
    createdAt: maybeDate(w.created_at),
    updatedAt: maybeDate(w.updated_at),
  }));
}

async function exportOrders(client) {
  const orders = await one(client, "SELECT * FROM orders ORDER BY id");
  const itemsBy = new Map();
  for (const it of await one(client, "SELECT * FROM order_items ORDER BY order_id, line_number")) {
    if (!itemsBy.has(it.order_id)) itemsBy.set(it.order_id, []);
    itemsBy.get(it.order_id).push(it);
  }
  return orders.map((o) => {
    const items = (itemsBy.get(o.id) || []).map((it) => ({
      _id: oid(deriveId(o.id, it.line_number)),
      productId: it.product_id ? oid(it.product_id) : null,
      quantity: num(it.quantity),
      priceAtOrderInCents: num(it.price_at_order_in_cents),
    }));
    return {
      _id: oid(o.id),
      userId: oid(o.user_id),
      financials: {
        currency: String(o.currency).trim(),
        subtotalInCents: num(o.subtotal_in_cents),
        discount: num(o.discount_in_cents),
        shippingCostInCents: num(o.shipping_cost_in_cents),
        totalAmountInCents: num(o.total_amount_in_cents),
      },
      items,
      status: o.status,
      paymentMethod: o.payment_method,
      ...(o.tracking_number != null ? { trackingNumber: o.tracking_number } : {}),
      ...(o.estimated_delivery_at ? { shippingInfo: { estimatedDeliveryDate: date(o.estimated_delivery_at) } } : {}),
      shippingAddress: {
        firstName: o.ship_to_first_name,
        lastName: o.ship_to_last_name,
        fullAddress: o.ship_to_full_address,
        phoneNumber: o.ship_to_phone_number,
        ...(o.ship_to_label != null ? { label: o.ship_to_label } : {}),
      },
      createdAt: maybeDate(o.created_at),
      updatedAt: maybeDate(o.updated_at),
    };
  });
}

async function main() {
  const startedAt = Date.now();
  const pool = getPool();
  const client = await pool.connect();
  const out = {};
  out.users = await exportUsers(client);
  out.products = await exportProducts(client);
  out.addresses = await exportAddresses(client);
  out.carts = await exportCarts(client);
  out.wishlists = await exportWishlists(client);
  out.orders = await exportOrders(client);
  client.release();

  fs.mkdirSync(EXPDIR, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), outDir: EXPDIR, prefix: PREFIX, collections: {} };
  for (const name of Object.keys(out)) {
    const file = path.join(EXPDIR, `${PREFIX}.${name}.json`);
    fs.writeFileSync(file, JSON.stringify(out[name]));
    report.collections[name] = { count: out[name].length, file };
    console.log(`[${name}] ${out[name].length} doc(s) -> ${file}`);
  }

  const reportPath = path.join(__dirname, "reports", `export-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (!SKIP_VALIDATE) {
    const dry = spawnSync(
      process.execPath,
      [path.join(__dirname, "import-mongo.js")],
      { stdio: "inherit", env: { ...process.env, MONGO_BACKUP_DIR: EXPDIR } },
    );
    if (dry.status !== 0) {
      console.error("REVERSE EXPORT FAILED VALIDATION (importer dry-run reported mapping failures)");
      process.exitCode = 1;
    }
  }
  console.log(`Export written to ${EXPDIR} (${Date.now() - startedAt}ms)`);
  await closePool();
}

main().catch((err) => {
  console.error("Export failed:", err.message);
  process.exit(1);
});
