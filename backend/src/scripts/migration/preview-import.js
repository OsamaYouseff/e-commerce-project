/**
 * Dry-run import preview: maps every live MongoDB document into the Phase 3
 * relational schema's normalized rows and validates them against that
 * schema's constraints (types, ranges, uniques, FKs) without writing to PG.
 *
 * Read-only. Never prints password hashes or per-person PII values; hashes are
 * reported as masked fingerprints only.
 *
 * Usage:
 *   MONGO_URL=<uri> [MONGO_DB=test] node src/scripts/migration/preview-import.js
 *
 * Exit 0 if every row maps cleanly; exit 1 if any mapping violates a constraint
 * it would hit in PostgreSQL (row still reported, but flagged).
 */
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB || "test";
const INSERT = process.argv.includes("--insert");

if (!MONGO_URL && !INSERT) {
  console.error("MONGO_URL is required");
  process.exit(1);
}

let pgPool;
if (INSERT) {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required with --insert");
    process.exit(1);
  }
  const { getPool } = require("../../shared/database/pool");
  pgPool = getPool();
}

const HEX24 = /^[a-f0-9]{24}$/i;
const BCRYPT = /^\$2[aby]\$\d{2}\$/;
const ORDER_STATUS = ["pending", "processing", "delivered", "cancelled", "canceled"];
const LABELS = new Set(["Home", "Work"]);

const report = {
  db: MONGO_DB,
  generatedAt: new Date().toISOString(),
  insertPlan: {},
  failures: [],
  quarantined: {},
};

function fail(table, docId, field, detail) {
  report.failures.push({ table, id: String(docId), field, detail });
}

function insertPlan(name, rows) {
  report.insertPlan[name] = { rows: rows.length };
}

function normalizeUser(u) {
  const id = String(u._id);
  if (!HEX24.test(id)) fail("users", id, "_id", "not 24-hex");
  if (!u.username || !u.email || !u.phone || typeof u.password !== "string") {
    fail("users", id, "required", "missing username/email/phone/password");
  }
  if (!BCRYPT.test(String(u.password || ""))) fail("users", id, "password", "hash format");
  if (typeof u.isAdmin !== "boolean") fail("users", id, "isAdmin", `type ${typeof u.isAdmin}`);
  return {
    id,
    firstname: u.firstname ?? null,
    lastname: u.lastname ?? null,
    username: u.username,
    email: u.email,
    password_hash: u.password,
    is_admin: u.isAdmin === true,
    gender: u.gender ?? null,
    phone: u.phone,
    created_at: u.createdAt ?? null,
    updated_at: u.updatedAt ?? null,
  };
}

function normalizePasswordHistory(u) {
  return (u.passwordHistory || []).map((h, position) => ({
    user_id: String(u._id),
    position,
    password_hash: h,
  }));
}

function normalizeProduct(p) {
  const id = String(p._id);
  if (!HEX24.test(id)) fail("products", id, "_id", "not 24-hex");
  if (!p.title || !p.desc || !p.img || typeof p.price !== "number" || typeof p.amount !== "number") {
    fail("products", id, "required", "missing title/desc/img/price/amount");
  }
  if (typeof p.price !== "number" || p.price < 0) fail("products", id, "price", `invalid ${p.price}`);
  if (typeof p.rating === "number" && (p.rating < 0 || p.rating > 5)) fail("products", id, "rating", `out of range ${p.rating}`);
  if (typeof p.amount !== "number" || p.amount < 0) fail("products", id, "amount", `invalid ${p.amount}`);
  let categories = null;
  if (p.categories !== undefined) {
    if (!Array.isArray(p.categories)) fail("products", id, "categories", "not an array");
    else {
      categories = p.categories.map((c) => {
        if (typeof c !== "string") fail("products", id, "categories", `element type ${typeof c}`);
        return String(c);
      });
    }
  }
  return {
    id,
    title: p.title,
    description: p.desc,
    image_url: p.img,
    categories,
    size: typeof p.size === "string" ? p.size : null,
    color: typeof p.color === "string" ? p.color : null,
    price: p.price,
    rating: p.rating ?? 0,
    stock_quantity: p.amount,
    is_deleted: p.isDeleted === true,
    created_at: p.createdAt ?? null,
    updated_at: p.updatedAt ?? null,
  };
}

function normalizeAddress(a, userIds) {
  const id = String(a._id);
  if (!HEX24.test(id)) fail("addresses", id, "_id", "not 24-hex");
  const uid = String(a.userId || "");
  if (!HEX24.test(uid)) fail("addresses", id, "userId", "not 24-hex");
  if (!userIds.has(uid)) fail("addresses", id, "userId", "orphan user reference");
  if (a.label != null && !LABELS.has(a.label)) fail("addresses", id, "label", `unexpected ${a.label}`);
  if (!a.fullAddress || !a.phoneNumber || !a.firstName || !a.lastName) {
    fail("addresses", id, "required", "missing shipping name/address/phone");
  }
  return {
    id,
    user_id: uid,
    full_address: a.fullAddress,
    phone_number: a.phoneNumber,
    first_name: a.firstName,
    last_name: a.lastName,
    label: a.label ?? null,
    is_default: a.isDefault === true,
    created_at: a.createdAt ?? null,
    updated_at: a.updatedAt ?? null,
  };
}

function normalizeCart(c, userIds, productIds) {
  const id = String(c._id);
  if (!HEX24.test(id)) fail("carts", id, "_id", "not 24-hex");
  const uid = String(c.userId || "");
  if (!HEX24.test(uid)) fail("carts", id, "userId", "not 24-hex");
  if (!userIds.has(uid)) fail("carts", id, "userId", "orphan user reference");
  const items = [];
  for (const [position, item] of (c.products || []).entries()) {
    const pid = String(item.productId || "");
    if (typeof item.quantity !== "number" || item.quantity < 1) {
      fail("cart_items", id, "quantity", `invalid ${item.quantity}`);
    }
    if (!productIds.has(pid)) {
      if (!report.quarantined.cartItems) report.quarantined.cartItems = [];
      report.quarantined.cartItems.push({ cart_id: id, product_id: pid });
    }
    items.push({ cart_id: id, product_id: pid, quantity: item.quantity, position });
  }
  return { cart: { id, user_id: uid, created_at: c.createdAt ?? null, updated_at: c.updatedAt ?? null }, items };
}

function normalizeWishlist(w, userIds, productIds) {
  const id = String(w._id);
  if (!HEX24.test(id)) fail("wishlists", id, "_id", "not 24-hex");
  const uid = String(w.userId || "");
  if (!HEX24.test(uid)) fail("wishlists", id, "userId", "not 24-hex");
  if (!userIds.has(uid)) fail("wishlists", id, "userId", "orphan user reference");
  const items = [];
  for (const [position, item] of (w.products || []).entries()) {
    const pid = String(item.productId || "");
    if (!productIds.has(pid)) {
      if (!report.quarantined.wishlistItems) report.quarantined.wishlistItems = [];
      report.quarantined.wishlistItems.push({ wishlist_id: id, product_id: pid });
      continue;
    }
    items.push({ wishlist_id: id, product_id: pid, position });
  }
  return { wishlist: { id, user_id: uid, created_at: w.createdAt ?? null, updated_at: w.updatedAt ?? null }, items };
}

function normalizeOrder(o, userIds, productIds, productsById) {
  const id = String(o._id);
  if (!HEX24.test(id)) fail("orders", id, "_id", "not 24-hex");
  const uid = String(o.userId || "");
  if (!HEX24.test(uid)) fail("orders", id, "userId", "not 24-hex");
  if (!userIds.has(uid)) fail("orders", id, "userId", "orphan user reference");
  if (o.status != null && !ORDER_STATUS.includes(o.status)) fail("orders", id, "status", `unexpected ${o.status}`);
  const f = o.financials || {};
  const subtotal = f.subtotalInCents;
  const discount = f.discount ?? 0;
  const shipping = f.shippingCostInCents ?? 0;
  const total = f.totalAmountInCents;
  const vals = [subtotal, discount, shipping, total];
  if (vals.some((v) => typeof v !== "number" || v < 0)) fail("orders", id, "financials", "negative or missing");
  const expected = subtotal - discount + shipping;
  if (typeof total === "number" && total !== expected) fail("orders", id, "financials", `total ${total} != ${expected}`);
  const sa = o.shippingAddress || {};
  if (sa.label != null && !LABELS.has(sa.label)) fail("orders", id, "shippingAddress.label", `unexpected ${sa.label}`);
  if (!sa.fullAddress || !sa.phoneNumber || !sa.firstName || !sa.lastName) {
    fail("orders", id, "shippingAddress", "missing name/address/phone");
  }
  const currency = typeof f.currency === "string" && f.currency.length === 3 ? f.currency : "USD";
  const items = [];
  for (const [line_number, item] of (o.items || []).entries()) {
    const pid = String(item.productId || "");
    const product = productIds.has(pid) ? productsById.get(pid) : null;
    if (!product) {
      if (!report.quarantined.orderItems) report.quarantined.orderItems = [];
      report.quarantined.orderItems.push({ order_id: id, product_id: pid || null });
    }
    if (typeof item.quantity !== "number" || item.quantity < 1) fail("order_items", id, "quantity", `invalid ${item.quantity}`);
    if (typeof item.priceAtOrderInCents !== "number" || item.priceAtOrderInCents < 0) {
      fail("order_items", id, "priceAtOrderInCents", `invalid ${item.priceAtOrderInCents}`);
    }
    items.push({
      order_id: id,
      line_number,
      product_id: product ? pid : null,
      product_title_snapshot: product ? product.title : null,
      product_image_snapshot: product ? product.img : null,
      quantity: item.quantity,
      price_at_order_in_cents: item.priceAtOrderInCents,
    });
  }
  return {
    order: {
      id,
      user_id: uid,
      subtotal_in_cents: subtotal,
      discount_in_cents: discount,
      shipping_cost_in_cents: shipping,
      total_amount_in_cents: total,
      currency,
      status: o.status ?? "pending",
      payment_method: o.paymentMethod,
      tracking_number: o.trackingNumber ?? null,
      estimated_delivery_at: o.estimatedDeliveryAt ?? null,
      ship_to_full_address: sa.fullAddress,
      ship_to_phone_number: sa.phoneNumber,
      ship_to_first_name: sa.firstName,
      ship_to_last_name: sa.lastName,
      ship_to_label: sa.label ?? null,
      created_at: o.createdAt ?? null,
      updated_at: o.updatedAt ?? null,
    },
    items,
  };
}

async function insertRows(table, rows, columns) {
  if (rows.length === 0) return;
  const colList = columns.join(", ");
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    for (const row of rows) {
      await client.query(
        `INSERT INTO ${table} (${colList}) VALUES (${placeholders})`,
        columns.map((c) => row[c]),
      );
    }
    await client.query("COMMIT");
    console.log(`  inserted ${rows.length} rows into ${table}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  const connection = await mongoose.createConnection(MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  }).asPromise();
  const db = connection.useDb(MONGO_DB);

  const users = await db.collection("users").find({}).toArray();
  const products = await db.collection("products").find({}).toArray();
  const addresses = await db.collection("addresses").find({}).toArray();
  const carts = await db.collection("carts").find({}).toArray();
  const wishlists = await db.collection("wishlists").find({}).toArray();
  const orders = await db.collection("orders").find({}).toArray();

  const userIds = new Set(users.map((u) => String(u._id)));
  const productIds = new Set(products.map((p) => String(p._id)));
  const productsById = new Map(products.map((p) => [String(p._id), p]));

  const userRows = users.map(normalizeUser);
  const phRows = users.flatMap(normalizePasswordHistory);
  const productRows = products.map(normalizeProduct);
  const addressRows = addresses.map((a) => normalizeAddress(a, userIds));
  const cartRows = carts.map((c) => normalizeCart(c, userIds, productIds));
  const wishlistRows = wishlists.map((w) => normalizeWishlist(w, userIds, productIds));
  const orderRows = orders.map((o) => normalizeOrder(o, userIds, productIds, productsById));

  const cartJoin = cartRows
    .map((c) => c.items.map((i) => ({ ...i, cart_id: c.cart.id })))
    .flat();
  const wishlistJoin = wishlistRows
    .map((w) => w.items.map((i) => ({ ...i, wishlist_id: w.wishlist.id })))
    .flat();
  const orderJoin = orderRows
    .map((o) => o.items.map((i) => ({ ...i, order_id: o.order.id })))
    .flat();

  const dup = (vals) => {
    const m = new Map();
    for (const v of vals) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].filter(([, n]) => n > 1).length;
  };
  if (dup(users.map((u) => String(u.username || ""))) > 0) fail("users", "*", "username", "duplicate usernames");
  if (dup(users.map((u) => String(u.email || ""))) > 0) fail("users", "*", "email", "duplicate emails");
  if (dup(users.map((u) => String(u.phone || ""))) > 0) fail("users", "*", "phone", "duplicate phones");
  const titleDup = dup(products.map((p) => String(p.title || "")));
  if (titleDup > 0) fail("products", "*", "title", `${titleDup} duplicate titles`);
  const cartUserDup = dup(carts.map((c) => String(c.userId || "")));
  if (cartUserDup > 0) fail("carts", "*", "userId", `${cartUserDup} users with multiple carts`);
  const wishlistUserDup = dup(wishlists.map((w) => String(w.userId || "")));
  if (wishlistUserDup > 0) fail("wishlists", "*", "userId", `${wishlistUserDup} users with multiple wishlists`);
  const defaultsPerUser = new Map();
  for (const a of addressRows) if (a.is_default) defaultsPerUser.set(a.user_id, (defaultsPerUser.get(a.user_id) || 0) + 1);
  const multiDefault = [...defaultsPerUser].filter(([, n]) => n > 1).length;
  if (multiDefault > 0) fail("addresses", "*", "is_default", `${multiDefault} users with multiple defaults`);

  insertPlan("users", userRows);
  insertPlan("user_password_history", phRows);
  insertPlan("products", productRows);
  insertPlan("addresses", addressRows);
  insertPlan("carts", cartRows.map((c) => c.cart));
  insertPlan("cart_items", cartJoin);
  insertPlan("wishlists", wishlistRows.map((w) => w.wishlist));
  insertPlan("wishlist_items", wishlistJoin);
  insertPlan("orders", orderRows.map((o) => o.order));
  insertPlan("order_items", orderJoin);

  report.quarantinedSummary = {
    wishlistItems: (report.quarantined.wishlistItems || []).length,
    orderItems: (report.quarantined.orderItems || []).length,
    cartItems: (report.quarantined.cartItems || []).length,
  };

  if (report.failures.length > 0) {
    console.error(JSON.stringify(report, null, 2));
    console.error(`Aborting: ${report.failures.length} mapping failure(s) found.`);
    await connection.close();
    process.exit(1);
  }

  if (INSERT) {
    console.log("Inserting (FK-ordered)...");
    const userCols = ["id","firstname","lastname","username","email","password_hash","is_admin","gender","phone","created_at","updated_at"];
    await insertRows("users", userRows, userCols);
    await insertRows("user_password_history", phRows, ["user_id","position","password_hash"]);
    const prodCols = ["id","title","description","image_url","categories","size","color","price","rating","stock_quantity","is_deleted","created_at","updated_at"];
    await insertRows("products", productRows, prodCols);
    const addrCols = ["id","user_id","full_address","phone_number","first_name","last_name","label","is_default","created_at","updated_at"];
    await insertRows("addresses", addressRows, addrCols);
    await insertRows("carts", cartRows.map((c) => c.cart), ["id","user_id","created_at","updated_at"]);
    await insertRows("cart_items", cartJoin, ["cart_id","product_id","quantity","position"]);
    await insertRows("wishlists", wishlistRows.map((w) => w.wishlist), ["id","user_id","created_at","updated_at"]);
    await insertRows("wishlist_items", wishlistJoin, ["wishlist_id","product_id","position"]);
    const orderCols = ["id","user_id","subtotal_in_cents","discount_in_cents","shipping_cost_in_cents","total_amount_in_cents","currency","status","payment_method","tracking_number","estimated_delivery_at","ship_to_full_address","ship_to_phone_number","ship_to_first_name","ship_to_last_name","ship_to_label","created_at","updated_at"];
    await insertRows("orders", orderRows.map((o) => o.order), orderCols);
    await insertRows("order_items", orderJoin, ["order_id","line_number","product_id","product_title_snapshot","product_image_snapshot","quantity","price_at_order_in_cents"]);
    console.log("Import complete.");
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  await connection.close();
  await (pgPool ? require("../../shared/database/pool").closePool() : Promise.resolve());
  process.exit(0);
}

main().catch((err) => {
  console.error("Preview failed:", err.message);
  process.exit(1);
});