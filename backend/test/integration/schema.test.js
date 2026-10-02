/**
 * Schema, constraint and transaction tests against an isolated PostgreSQL
 * database.
 *
 * This file creates its own throwaway database from `INTEGRATION_DATABASE_URL`
 * (the path/host are reused, the database name is random), applies the real
 * migrations in `db/migrations` with node-pg-migrate, and then checks that the
 * constraints the plan depends on actually reject bad data. Nothing here
 * touches an environment database: the database is dropped again in `after`.
 *
 *   INTEGRATION_DATABASE_URL="postgresql://postgres@/evo_market_test?host=/tmp/opencode/pgdata&port=55432" \
 *     npm run test:integration
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const { Client } = require("pg");
const { runner } = require("node-pg-migrate");

const SOURCE_URL = process.env.INTEGRATION_DATABASE_URL;
const SKIP = SOURCE_URL
  ? false
  : "set INTEGRATION_DATABASE_URL to run the schema tests (npm run test:integration)";

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "db", "migrations");

// PG error codes, so a failure message says what actually went wrong.
const CHECK_VIOLATION = "23514";
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const NOT_NULL_VIOLATION = "23502";

const hexId = () => crypto.randomBytes(12).toString("hex");

const databaseUrl = (url, name) => url.replace(/\/[^/?]*(\?|$)/, `/${name}$1`);

// A single-connection pool on purpose: if withTransaction leaked a client, the
// second transaction here would never start.
if (SOURCE_URL) {
  process.env.DATABASE_POOL_MAX = "1";
  process.env.JWT_SEC = process.env.JWT_SEC || "schema-test-secret";
}

let admin = null;
let client = null;
let scratchName = null;
let scratchUrl = null;

const migrate = (direction, extra = {}) =>
  runner({
    databaseUrl: scratchUrl,
    dir: MIGRATIONS_DIR,
    direction,
    // `down` defaults to a single step; "reversible" here means all the way.
    count: Number.POSITIVE_INFINITY,
    migrationsTable: "pgmigrations",
    log: () => {},
    verbose: false,
    ...extra,
  });

const q = async (text, values) => (await client.query(text, values)).rows;
const one = async (text, values) => (await q(text, values))[0];
const count = async (table, where = "", values = []) =>
  Number((await one(`SELECT COUNT(*)::int AS n FROM ${table} ${where}`, values)).n);

const insertUser = (id = hexId(), over = {}) =>
  one(
    `INSERT INTO users (id, username, email, phone, password_hash, firstname, lastname, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      id,
      over.username ?? `u_${id}`,
      over.email ?? `u_${id}@example.test`,
      over.phone ?? `+2011${id}`,
      over.password_hash ?? "hash",
      over.firstname ?? "Test",
      over.lastname ?? "User",
      over.is_admin ?? false,
    ],
  );

const insertProduct = (over = {}) =>
  one(
    `INSERT INTO products (id, title, description, image_url, price, rating, stock_quantity, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      over.id ?? hexId(),
      over.title ?? `p_${crypto.randomBytes(6).toString("hex")}`,
      over.description ?? "d",
      over.image_url ?? "u",
      over.price ?? 10,
      over.rating ?? 4,
      over.stock_quantity ?? 5,
      over.is_deleted ?? false,
    ],
  );

const insertAddress = (userId, over = {}) =>
  one(
    `INSERT INTO addresses (id, user_id, full_address, phone_number, first_name, last_name, label, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      over.id ?? hexId(),
      userId,
      over.full_address ?? "1 Street",
      over.phone_number ?? "+201000000000",
      over.first_name ?? "Test",
      over.last_name ?? "User",
      over.label ?? "Home",
      over.is_default ?? true,
    ],
  );

const insertCart = (userId, id = hexId()) => one(`INSERT INTO carts (id, user_id) VALUES ($1,$2) RETURNING id`, [id, userId]);

const insertCartItem = (cartId, productId, over = {}) =>
  one(`INSERT INTO cart_items (cart_id, product_id, quantity, position) VALUES ($1,$2,$3,$4) RETURNING cart_id`, [
    cartId,
    productId,
    over.quantity ?? 1,
    over.position ?? 0,
  ]);

const insertWishlist = (userId, id = hexId()) =>
  one(`INSERT INTO wishlists (id, user_id) VALUES ($1,$2) RETURNING id`, [id, userId]);

const insertOrder = (userId, over = {}) =>
  one(
    `INSERT INTO orders (id, user_id, subtotal_in_cents, discount_in_cents, shipping_cost_in_cents,
                         total_amount_in_cents, currency, status, payment_method,
                         ship_to_full_address, ship_to_phone_number, ship_to_first_name, ship_to_last_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [
      over.id ?? hexId(),
      userId,
      over.subtotal_in_cents ?? 1000,
      over.discount_in_cents ?? 0,
      over.shipping_cost_in_cents ?? 0,
      over.total_amount_in_cents ?? 1000,
      over.currency ?? "USD",
      over.status ?? "pending",
      over.payment_method ?? "cash_on_delivery",
      over.ship_to_full_address ?? "1 Street",
      over.ship_to_phone_number ?? "+201000000000",
      over.ship_to_first_name ?? "Test",
      over.ship_to_last_name ?? "User",
    ],
  );

const insertOrderItem = (orderId, over = {}) =>
  one(
    `INSERT INTO order_items (order_id, line_number, product_id, product_title_snapshot, quantity, price_at_order_in_cents)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING order_id`,
    [
      orderId,
      over.line_number ?? 0,
      over.product_id ?? null,
      over.product_title_snapshot ?? "Snapshot",
      over.quantity ?? 1,
      over.price_at_order_in_cents ?? 1000,
    ],
  );

/** Asserts that `fn` fails with a specific SQLSTATE, and returns the error. */
const rejects = async (fn, code, message) => {
  try {
    await fn();
  } catch (err) {
    assert.equal(err.code, code, `${message}: expected SQLSTATE ${code}, got ${err.code} (${err.message})`);
    return err;
  }
  assert.fail(`${message}: expected the statement to be rejected with ${code}`);
};

const injectPool = (url) => {
  process.env.DATABASE_URL = url;
  for (const id of [
    "../../src/shared/database/pool.js",
    "../../src/shared/database/transaction.js",
    "../../src/config/env.js",
  ]) {
    delete require.cache[require.resolve(id)];
  }
  return require("../../src/shared/database/transaction");
};

const releasePool = async () => {
  const { closePool } = require("../../src/shared/database/pool");
  await closePool();
  process.env.DATABASE_URL = SOURCE_URL;
};

test.before(async () => {
  if (!SOURCE_URL) return;
  scratchName = `schema_it_${crypto.randomBytes(4).toString("hex")}`;
  scratchUrl = databaseUrl(SOURCE_URL, scratchName);

  admin = new Client({ connectionString: databaseUrl(SOURCE_URL, "postgres") });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${scratchName}"`);

  await migrate("up");
  client = new Client({ connectionString: scratchUrl });
  await client.connect();
});

test.after(async () => {
  if (client) await client.end().catch(() => {});
  if (process.env.SCHEMA_KEEP_DB !== "1" && scratchName && admin) {
    await admin.query(`DROP DATABASE IF EXISTS "${scratchName}" WITH (FORCE)`).catch(() => {});
  }
  if (admin) await admin.end().catch(() => {});
});

// --------------------------------------------------------------------- schema

test("migrations apply to an empty database and record every step", { skip: SKIP }, async () => {
  const applied = await q("SELECT name FROM pgmigrations ORDER BY run_on, id");
  assert.deepEqual(
    applied.map((r) => r.name),
    [
      "1700000000000_baseline",
      "1700000000001_initial-commerce-schema",
      "1700000000002_pg_trgm_text_search",
      "1700000000003_order_checkout_metadata",
    ],
  );

  const tables = await q(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name",
  );
  const names = tables.map((r) => r.table_name);
  for (const expected of [
    "app_meta",
    "users",
    "user_password_history",
    "products",
    "addresses",
    "carts",
    "cart_items",
    "wishlists",
    "wishlist_items",
    "orders",
    "order_items",
  ]) {
    assert.ok(names.includes(expected), `${expected} is missing from the migrated schema`);
  }
});

test("the checkout metadata columns exist and are nullable for legacy rows", { skip: SKIP }, async () => {
  const user = await insertUser();
  const order = await insertOrder(user.id);
  const row = await one("SELECT request_fingerprint, coupon_code FROM orders WHERE id = $1", [order.id]);
  assert.equal(row.request_fingerprint, null);
  assert.equal(row.coupon_code, null);

  await client.query("UPDATE orders SET request_fingerprint = $1, coupon_code = $2 WHERE id = $3", [
    "fp-1",
    "10OFF",
    order.id,
  ]);
  const updated = await one("SELECT request_fingerprint, coupon_code FROM orders WHERE id = $1", [order.id]);
  assert.equal(updated.request_fingerprint, "fp-1");
  assert.equal(updated.coupon_code, "10OFF");
});

test("fuzzy title search is backed by pg_trgm", { skip: SKIP }, async () => {
  const extension = await one("SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'");
  assert.ok(extension, "the pg_trgm extension must be installed");
  const index = await one("SELECT indexdef FROM pg_indexes WHERE indexname = 'products_title_trgm_gin'");
  assert.ok(index, "products_title_trgm_gin is missing");
  assert.match(index.indexdef, /gin_trgm_ops/);
});

// ------------------------------------------------------------------ constraints

test("ids must be 24 lowercase hex characters", { skip: SKIP }, async () => {
  await rejects(
    () =>
      client.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,$5)", [
        "not-an-object-id",
        "u1",
        "u1@example.test",
        "+2011",
        "h",
      ]),
    CHECK_VIOLATION,
    "a non-hex id",
  );
  await rejects(
    () =>
      client.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,$5)", [
        hexId().toUpperCase(),
        "u2",
        "u2@example.test",
        "+2012",
        "h",
      ]),
    CHECK_VIOLATION,
    "an uppercase id",
  );
  await rejects(
    () =>
      client.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,$5)", [
        hexId().slice(0, 23),
        "u3",
        "u3@example.test",
        "+2013",
        "h",
      ]),
    CHECK_VIOLATION,
    "a 23-character id",
  );
  // 24 lowercase hex must be accepted.
  await insertUser();
});

test("catalog money, stock and rating stay in range", { skip: SKIP }, async () => {
  await rejects(() => insertProduct({ price: -1 }), CHECK_VIOLATION, "a negative price");
  await rejects(() => insertProduct({ stock_quantity: -1 }), CHECK_VIOLATION, "negative stock");
  await rejects(() => insertProduct({ rating: 6 }), CHECK_VIOLATION, "a rating above 5");
  await rejects(() => insertProduct({ rating: -0.5 }), CHECK_VIOLATION, "a negative rating");
  await insertProduct({ price: 0, stock_quantity: 0, rating: 0 });
});

test("cart and order line quantities must be positive", { skip: SKIP }, async () => {
  const user = await insertUser();
  const product = await insertProduct();
  const cart = await insertCart(user.id);
  await rejects(() => insertCartItem(cart.id, product.id, { quantity: 0 }), CHECK_VIOLATION, "a zero cart quantity");
  await rejects(() => insertCartItem(cart.id, product.id, { quantity: -2 }), CHECK_VIOLATION, "a negative cart quantity");

  const order = await insertOrder(user.id);
  await rejects(() => insertOrderItem(order.id, { quantity: 0 }), CHECK_VIOLATION, "a zero order quantity");
  await rejects(
    () => insertOrderItem(order.id, { quantity: 1, line_number: 0, price_at_order_in_cents: -1 }),
    CHECK_VIOLATION,
    "a negative order price",
  );
});

test("order money, status and label are constrained", { skip: SKIP }, async () => {
  const user = await insertUser();
  await rejects(() => insertOrder(user.id, { subtotal_in_cents: -1 }), CHECK_VIOLATION, "a negative subtotal");
  await rejects(() => insertOrder(user.id, { discount_in_cents: -1 }), CHECK_VIOLATION, "a negative discount");
  await rejects(() => insertOrder(user.id, { shipping_cost_in_cents: -1 }), CHECK_VIOLATION, "negative shipping");
  await rejects(() => insertOrder(user.id, { status: "refunded" }), CHECK_VIOLATION, "an unknown status");
  await rejects(
    () =>
      client.query(
        `INSERT INTO orders (id, user_id, subtotal_in_cents, discount_in_cents, shipping_cost_in_cents, total_amount_in_cents,
                             currency, status, payment_method, ship_to_full_address, ship_to_phone_number,
                             ship_to_first_name, ship_to_last_name, ship_to_label)
         VALUES ($1,$2,0,0,0,0,'USD','pending','cash_on_delivery','a','b','c','d',$3)`,
        [hexId(), user.id, "Office"],
      ),
    CHECK_VIOLATION,
    "an unsupported shipping label",
  );
  // Both legacy spellings are accepted during the transition period.
  await insertOrder(user.id, { status: "cancelled" });
  await insertOrder(user.id, { status: "canceled" });
});

test("address labels are limited to Home and Work, and NULL is allowed", { skip: SKIP }, async () => {
  const user = await insertUser();
  await rejects(() => insertAddress(user.id, { label: "Office" }), CHECK_VIOLATION, "an unknown label");
  await insertAddress(user.id, { label: null, is_default: false });
});

test("required columns are enforced", { skip: SKIP }, async () => {
  await rejects(
    () => client.query("INSERT INTO users (id, username, email, phone) VALUES ($1,$2,$3,$4)", [hexId(), "n1", "n1@e.test", "+1"]),
    NOT_NULL_VIOLATION,
    "a user without a password hash",
  );
});

// ------------------------------------------------------------------- uniqueness

test("a user can only have one cart and one wishlist", { skip: SKIP }, async () => {
  const user = await insertUser();
  await insertCart(user.id);
  await rejects(() => insertCart(user.id), UNIQUE_VIOLATION, "a second cart");

  await insertWishlist(user.id);
  await rejects(() => insertWishlist(user.id), UNIQUE_VIOLATION, "a second wishlist");
});

test("an account cannot have two default addresses", { skip: SKIP }, async () => {
  const user = await insertUser();
  await insertAddress(user.id, { is_default: true });
  await rejects(() => insertAddress(user.id, { is_default: true }), UNIQUE_VIOLATION, "a second default address");

  // Non-default duplicates are allowed: only the partial index on is_default
  // restricts the table.
  await insertAddress(user.id, { is_default: false });
  await insertAddress(user.id, { is_default: false });
  assert.equal(await count("addresses", "WHERE user_id = $1", [user.id]), 3);
  assert.equal(await count("addresses", "WHERE user_id = $1 AND is_default", [user.id]), 1);
});

test("a cart or wishlist cannot hold the same product twice", { skip: SKIP }, async () => {
  const user = await insertUser();
  const product = await insertProduct();
  const cart = await insertCart(user.id);
  await insertCartItem(cart.id, product.id, { position: 0 });
  await rejects(
    () => insertCartItem(cart.id, product.id, { position: 1 }),
    UNIQUE_VIOLATION,
    "a duplicate cart line",
  );

  const wishlist = await insertWishlist(user.id);
  await one("INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1,$2,$3)", [
    wishlist.id,
    product.id,
    0,
  ]);
  await rejects(
    () => client.query("INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1,$2,$3)", [
      wishlist.id,
      product.id,
      1,
    ]),
    UNIQUE_VIOLATION,
    "a duplicate wishlist line",
  );
});

test("an order cannot repeat a line number", { skip: SKIP }, async () => {
  const user = await insertUser();
  const order = await insertOrder(user.id);
  await insertOrderItem(order.id, { line_number: 0 });
  await rejects(() => insertOrderItem(order.id, { line_number: 0 }), UNIQUE_VIOLATION, "a duplicate line number");
});

// -------------------------------------------------------------- foreign keys

test("orphan rows are rejected", { skip: SKIP }, async () => {
  const user = await insertUser();
  const product = await insertProduct();
  const cart = await insertCart(user.id);
  await insertCartItem(cart.id, product.id);

  await rejects(() => insertCart(hexId()), FOREIGN_KEY_VIOLATION, "a cart for a missing user");
  await rejects(
    () => insertCartItem(cart.id, hexId(), { position: 9 }),
    FOREIGN_KEY_VIOLATION,
    "a cart line for a missing product",
  );
  await rejects(
    () => client.query("INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1,$2,$3)", [hexId(), product.id, 0]),
    FOREIGN_KEY_VIOLATION,
    "a wishlist line for a missing wishlist",
  );
  await rejects(() => insertWishlist(hexId()), FOREIGN_KEY_VIOLATION, "a wishlist for a missing user");
  await rejects(() => insertAddress(hexId()), FOREIGN_KEY_VIOLATION, "an address for a missing user");
  await rejects(() => insertOrder(hexId()), FOREIGN_KEY_VIOLATION, "an order for a missing user");
  await rejects(
    () => insertOrderItem(hexId()),
    FOREIGN_KEY_VIOLATION,
    "an order line for a missing order",
  );
});

test("deleting a user cascades to their cart, wishlist, addresses and orders", { skip: SKIP }, async () => {
  const user = await insertUser();
  const product = await insertProduct();
  const cart = await insertCart(user.id);
  await insertCartItem(cart.id, product.id);
  const wishlist = await insertWishlist(user.id);
  await client.query("INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1,$2,$3)", [
    wishlist.id,
    product.id,
    0,
  ]);
  await insertAddress(user.id);
  await insertAddress(user.id, { is_default: false });
  const order = await insertOrder(user.id);
  await insertOrderItem(order.id, { product_id: product.id });
  await client.query("INSERT INTO user_password_history (user_id, position, password_hash) VALUES ($1,0,'h')", [user.id]);

  // Every child row must exist before the delete, or the assertions below would
  // pass against an empty table.
  assert.equal(await count("cart_items", "WHERE cart_id = $1", [cart.id]), 1, "the fixture cart line is missing");
  assert.equal(await count("wishlist_items", "WHERE wishlist_id = $1", [wishlist.id]), 1);
  assert.equal(await count("order_items", "WHERE order_id = $1", [order.id]), 1);
  assert.equal(await count("user_password_history", "WHERE user_id = $1", [user.id]), 1);

  await client.query("DELETE FROM users WHERE id = $1", [user.id]);

  assert.equal(await count("carts", "WHERE id = $1", [cart.id]), 0, "the cart must be removed");
  assert.equal(await count("cart_items", "WHERE cart_id = $1", [cart.id]), 0, "cart lines must be removed");
  assert.equal(await count("wishlists", "WHERE id = $1", [wishlist.id]), 0, "the wishlist must be removed");
  assert.equal(await count("wishlist_items", "WHERE wishlist_id = $1", [wishlist.id]), 0, "wishlist lines must be removed");
  assert.equal(await count("addresses", "WHERE user_id = $1", [user.id]), 0, "addresses must be removed");
  assert.equal(await count("orders", "WHERE id = $1", [order.id]), 0, "orders must be removed");
  assert.equal(await count("order_items", "WHERE order_id = $1", [order.id]), 0, "order lines must be removed");
  assert.equal(await count("user_password_history", "WHERE user_id = $1", [user.id]), 0, "password history must be removed");
  // The catalog is not owned by the user.
  assert.equal(await count("products", "WHERE id = $1", [product.id]), 1, "the product must survive");
});

test("deleting a product nulls the order line but keeps the order history", { skip: SKIP }, async () => {
  const user = await insertUser();
  const product = await insertProduct();
  const cart = await insertCart(user.id);
  await insertCartItem(cart.id, product.id);
  const order = await insertOrder(user.id);
  await insertOrderItem(order.id, { product_id: product.id, product_title_snapshot: "Original title" });

  assert.equal(await count("cart_items", "WHERE cart_id = $1", [cart.id]), 1, "the fixture cart line is missing");

  await client.query("DELETE FROM products WHERE id = $1", [product.id]);

  assert.equal(
    await count("cart_items", "WHERE cart_id = $1 AND product_id = $2", [cart.id, product.id]),
    0,
    "cart lines are removed with the product",
  );
  const line = await one("SELECT product_id, product_title_snapshot FROM order_items WHERE order_id = $1", [order.id]);
  assert.equal(line.product_id, null, "the order line keeps a null product_id (SET NULL)");
  assert.equal(line.product_title_snapshot, "Original title", "the snapshot still explains the sale");
  assert.equal(await count("orders", "WHERE id = $1", [order.id]), 1, "the order must survive");
});

// -------------------------------------------------------------- transactions

test("a failed transaction leaves nothing behind and still releases its client", { skip: SKIP }, async () => {
  const before = {
    users: await count("users"),
    carts: await count("carts"),
    orders: await count("orders"),
  };

  const { withTransaction } = injectPool(scratchUrl);

  const userId = hexId();
  await assert.rejects(
    withTransaction(async (client) => {
      await client.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,'h')", [
        userId,
        `u_${userId}`,
        `u_${userId}@example.test`,
        `+2011${userId}`,
      ]);
      await client.query("INSERT INTO carts (id, user_id) VALUES ($1,$2)", [hexId(), userId]);
      await client.query("INSERT INTO orders (id, user_id, subtotal_in_cents, discount_in_cents, shipping_cost_in_cents, total_amount_in_cents, currency, status, payment_method, ship_to_full_address, ship_to_phone_number, ship_to_first_name, ship_to_last_name) VALUES ($1,$2,1,0,0,1,'USD','pending','cash_on_delivery','a','b','c','d')", [
        hexId(),
        userId,
      ]);
      throw new Error("forced failure after the writes");
    }),
    /forced failure after the writes/,
  );

  assert.equal(await count("users", "WHERE id = $1", [userId]), 0, "the user insert must be rolled back");
  assert.equal(await count("carts", "WHERE user_id = $1", [userId]), 0, "the cart insert must be rolled back");
  assert.equal(await count("orders", "WHERE user_id = $1", [userId]), 0, "the order insert must be rolled back");
  assert.deepEqual(
    { users: await count("users"), carts: await count("carts"), orders: await count("orders") },
    before,
    "the table counts must be unchanged",
  );

  // The pool has max=1. If the failed transaction had leaked its client, this
  // would hang instead of committing.
  const committed = await withTransaction(async (txClient) => {
    await txClient.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,'h')", [
      hexId(),
      `u_${crypto.randomBytes(6).toString("hex")}`,
      `u_${crypto.randomBytes(6).toString("hex")}@example.test`,
      `+2011${hexId()}`,
    ]);
    return txClient.query("SELECT COUNT(*)::int AS n FROM users");
  });
  assert.ok(committed.rows[0].n > before.users, "the next transaction must still get a client");

  await releasePool();
});

test("a constraint violation inside a transaction surfaces as an error, not a partial write", { skip: SKIP }, async () => {
  const { withTransaction } = injectPool(scratchUrl);

  const userId = hexId();
  await assert.rejects(
    withTransaction(async (txClient) => {
      await txClient.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,'h')", [
        userId,
        `u_${userId}`,
        `u_${userId}@example.test`,
        `+2011${userId}`,
      ]);
      throw new Error("forced failure after the write");
    }),
    /forced failure after the write/,
  );
  assert.equal(await count("users", "WHERE id = $1", [userId]), 0, "the insert must be rolled back");

  await assert.rejects(
    withTransaction(async (txClient) => {
      await txClient.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,'h')", [
        userId,
        `u_${userId}`,
        `u_${userId}@example.test`,
        `+2011${userId}`,
      ]);
      await txClient.query("INSERT INTO users (id, username, email, phone, password_hash) VALUES ($1,$2,$3,$4,'h')", [
        hexId(),
        `u_${userId}`,
        `u_${userId}@example.test`,
        `+2011${hexId()}`,
      ]);
    }),
    (err) => err.code === UNIQUE_VIOLATION,
  );
  assert.equal(await count("users", "WHERE id = $1", [userId]), 0, "the duplicate-key insert must roll back");

  await releasePool();
});

// ---------------------------------------------------------------- reversibility

test("migrations roll all the way back and forward again", { skip: SKIP }, async () => {
  const before = await count("users");

  await migrate("down");
  const remaining = await q(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
  );
  const leftovers = remaining
    .map((r) => r.table_name)
    .filter((name) => !["pgmigrations", "spatial_ref_sys"].includes(name));
  assert.deepEqual(leftovers, [], `rollback left tables behind: ${leftovers.join(", ")}`);
  const extension = await one("SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'");
  assert.equal(extension, undefined, "pg_trgm must be dropped by its own migration's down");

  await migrate("up");
  const tables = (await q("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")).map(
    (r) => r.table_name,
  );
  for (const expected of ["users", "products", "carts", "cart_items", "wishlists", "wishlist_items", "orders", "order_items", "addresses"]) {
    assert.ok(tables.includes(expected), `${expected} was not recreated by the forward migration`);
  }
  assert.equal(await count("users"), 0, "a rolled-back and re-applied schema starts empty");
  assert.equal(before >= 0, true);

  // The re-applied schema still enforces the constraints.
  await rejects(() => insertProduct({ price: -1 }), CHECK_VIOLATION, "a negative price after re-migration");
});