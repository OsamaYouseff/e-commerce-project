/**
 * Concurrency tests against a real PostgreSQL database.
 *
 * Every cart, wishlist and address mutation in the app takes a
 * `pg_advisory_xact_lock(hashtext(...))` scoped to the user, and the plan's test
 * section asks for a parallel-request test that proves those locks actually
 * serialize. Serial requests cannot show that, so every case here fires several
 * HTTP requests at once and then asserts the *resulting* state is one the
 * business rules allow.
 *
 * Run it against a scratch database that has had the migrations applied:
 *
 *   INTEGRATION_DATABASE_URL="postgresql://postgres@/evo_market_test?host=/tmp/opencode/pgdata&port=55432" \
 *     npm run test:integration
 *
 * Without INTEGRATION_DATABASE_URL the whole file is skipped, so `npm test`
 * stays runnable on a machine with no database.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const DATABASE_URL = process.env.INTEGRATION_DATABASE_URL;
const SKIP = DATABASE_URL
  ? false
  : "set INTEGRATION_DATABASE_URL to run the PostgreSQL concurrency tests (npm run test:integration)";

// Must be set before the app (and therefore dotenv/env.js) is loaded. dotenv
// never overwrites an already-exported variable, so this wins over backend/.env.
if (DATABASE_URL) {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = DATABASE_URL;
  process.env.JWT_SEC = process.env.JWT_SEC || "integration-test-secret";
  process.env.DATABASE_POOL_MAX = process.env.DATABASE_POOL_MAX || "20";
  // Keep the request log out of the test output.
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || "silent";
}

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, max: 20 }) : null;

// --------------------------------------------------------------------- fixtures

const hexId = () => crypto.randomBytes(12).toString("hex");
const uniq = crypto.randomBytes(4).toString("hex");

const seedUser = async (over = {}) => {
  const id = over.id || hexId();
  const suffix = `${uniq}-${id.slice(0, 6)}`;
  await pool.query(
    `INSERT INTO users (id, username, email, phone, password_hash, firstname, lastname, is_admin)
     VALUES ($1, $2, $3, $4, $5, 'Concurrent', 'Tester', false)`,
    [id, `race_${suffix}`, `race_${suffix}@example.test`, `+2011${id}`, "x"],
  );
  const token = jwt.sign({ id, isAdmin: false }, process.env.JWT_SEC, { expiresIn: "10m" });
  return { id, token };
};

const seedProduct = async (price, title) => {
  const id = hexId();
  await pool.query(
    `INSERT INTO products (id, title, description, image_url, price, rating, stock_quantity, is_deleted)
     VALUES ($1, $2, 'concurrency fixture', 'http://example.test/p.jpg', $3, 4, 500, false)`,
    [id, title || `race-product-${id}`, price],
  );
  return { id, priceCents: Math.round(Number(price) * 100) };
};

const seedAddress = async (userId) => {
  const id = hexId();
  await pool.query(
    `INSERT INTO addresses (id, user_id, full_address, phone_number, first_name, last_name, label, is_default)
     VALUES ($1, $2, '1 Race Street, Cairo', '+20 100 000 0000', 'Concurrent', 'Tester', 'Home', true)`,
    [id, userId],
  );
  return id;
};

const addressPayload = (userId, isDefault = true) => ({
  userId,
  firstName: "Concurrent",
  lastName: "Tester",
  fullAddress: "1 Race Street, Cairo",
  phoneNumber: "+20 100 000 0000",
  label: "Home",
  isDefault,
});

/**
 * Mirrors the storefront payload; the server is expected to recompute totals.
 *
 * The `financials` below is a deliberately wrong 1-cent preview. The API now
 * refuses an order whose preview does not match its authoritative total until the
 * customer acknowledges the real one, so these payloads carry
 * `acceptPricingChange: true`: they test locking and idempotency, not pricing.
 * The refusal itself is covered by its own test below.
 */
const orderPayload = ({ userId, items, idempotencyKey, couponCode, financials }) => ({
  userId,
  idempotencyKey,
  couponCode,
  // These cases are about locking and idempotency, not pricing, so no client
  // preview is sent: the API only compares a total it is given, and omitting it
  // keeps the pricing refusal out of their way. The one-cent `priceAtOrderInCents`
  // below is likewise ignored by design. Pricing has its own tests.
  items: items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    priceAtOrderInCents: 1,
  })),
  ...(financials ? { financials, acceptPricingChange: true } : {}),
  shippingAddress: {
    fullAddress: "1 Race Street, Cairo",
    phoneNumber: "+20 100 000 0000",
    firstName: "Concurrent",
    lastName: "Tester",
    label: "Home",
  },
  paymentMethod: "cash_on_delivery",
});

// ----------------------------------------------------------------- http client

let server = null;
let baseUrl = null;

const send = async (method, path, { body, token } = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body: parsed };
};

const statuses = (results) => results.map((r) => r.status).sort((a, b) => a - b);

/** Rows come back ordered by id; expectations are written in request order. */
const byId = (items) => [...items].sort((a, b) => (a.productId < b.productId ? -1 : 1));

const cartItems = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ci.product_id, ci.quantity FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = $1 ORDER BY ci.product_id`,
    [userId],
  );
  return rows.map((r) => ({ productId: r.product_id, quantity: Number(r.quantity) }));
};

const wishlistItems = async (userId) => {
  const { rows } = await pool.query(
    `SELECT wi.product_id FROM wishlist_items wi
     JOIN wishlists w ON w.id = wi.wishlist_id WHERE w.user_id = $1 ORDER BY wi.product_id`,
    [userId],
  );
  return rows.map((r) => r.product_id);
};

test.before(async () => {
  if (!DATABASE_URL) return;
  await pool.query("SELECT 1 FROM users LIMIT 1").catch((err) => {
    throw new Error(`INTEGRATION_DATABASE_URL is not reachable or not migrated: ${err.message}`);
  });
  // The request logger writes JSON lines to stdout, which is the TAP stream.
  const { logger } = require("../../src/config/logger");
  logger.info = () => {};
  logger.debug = () => {};

  const { createApp } = require("../../src/app");
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (pool) await pool.end();
  const { closePool } = require("../../src/shared/database/pool");
  await closePool();
});

// --------------------------------------------------------------------- the cases

test("parallel cart creates produce exactly one cart holding only the winner's items", { skip: SKIP }, async () => {
  const user = await seedUser();
  const products = await Promise.all([seedProduct(10), seedProduct(20), seedProduct(30), seedProduct(40)]);

  // Each request asks for a different product, so a lost race is visible: the
  // pre-lock version of this code let the loser overwrite the winner's items.
  const results = await Promise.all(
    products.map((p) => send("POST", "/api/carts", { token: user.token, body: { products: [{ productId: p.id, quantity: 1 }] } })),
  );

  assert.deepEqual(statuses(results), [200, 400, 400, 400]);
  for (const loser of results.filter((r) => r.status === 400)) {
    assert.match(loser.body.message, /Cart already exists/);
  }
  assert.equal(results.filter((r) => r.status === 500).length, 0, "no request may fail with a server error");

  const winner = results.find((r) => r.status === 200);
  const winnerProduct = products[results.indexOf(winner)].id;

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM carts WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 1, "the database must hold one cart for the user");
  assert.deepEqual(
    await cartItems(user.id),
    [{ productId: winnerProduct, quantity: 1 }],
    "only the request that won the lock may leave items behind",
  );
});

test("parallel add-to-cart calls keep every line (no lost update)", { skip: SKIP }, async () => {
  const user = await seedUser();
  const [a, b, c] = await Promise.all([seedProduct(11), seedProduct(12), seedProduct(13)]);

  // addOrUpdateProduct rewrites the whole line set; without the lock two of
  // these interleaved and one product vanished.
  const results = await Promise.all(
    [a, b, c].map((p) =>
      send("POST", `/api/carts/add_update-product/${user.id}`, { token: user.token, body: { productId: p.id, quantity: 2 } }),
    ),
  );

  assert.deepEqual(statuses(results), [200, 200, 200]);
  assert.deepEqual(byId(await cartItems(user.id)), byId([
    { productId: a.id, quantity: 2 },
    { productId: b.id, quantity: 2 },
    { productId: c.id, quantity: 2 },
  ]));
});

test("adding the same product to a wishlist twice in parallel stores it once", { skip: SKIP }, async () => {
  const user = await seedUser();
  const product = await seedProduct(15);

  const results = await Promise.all(
    [0, 1, 2].map(() =>
      send("POST", `/api/wishlist/add-product/${user.id}`, { token: user.token, body: { productId: product.id } }),
    ),
  );

  assert.deepEqual(statuses(results), [200, 400, 400]);
  for (const rejected of results.filter((r) => r.status === 400)) {
    assert.match(rejected.body.message, /Product already exists in the Wishlist/);
  }
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS n FROM wishlists WHERE user_id = $1",
    [user.id],
  );
  assert.equal(rows[0].n, 1);
  assert.deepEqual(await wishlistItems(user.id), [product.id]);
});

test("parallel wishlist adds and removes converge without losing or duplicating a product", { skip: SKIP }, async () => {
  const user = await seedUser();
  const [keep, drop] = await Promise.all([seedProduct(16), seedProduct(17)]);
  const created = await send("POST", "/api/wishlist", { token: user.token, body: { products: [keep.id, drop.id] } });
  assert.equal(created.status, 200);

  const extra = await Promise.all([seedProduct(18), seedProduct(19)]);

  // add keep again (already present), remove drop, and add two new products:
  // whichever way these four interleave, the invariants below must hold.
  const results = await Promise.all([
    send("POST", `/api/wishlist/add-product/${user.id}`, { token: user.token, body: { productId: keep.id } }),
    send("POST", `/api/wishlist/remove-product/${user.id}`, { token: user.token, body: { productId: drop.id } }),
    ...extra.map((p) =>
      send("POST", `/api/wishlist/add-product/${user.id}`, { token: user.token, body: { productId: p.id } }),
    ),
  ]);
  const newIds = extra.map((p) => p.id);

  for (const res of results) {
    assert.ok(res.status === 200 || res.status === 400, `unexpected status ${res.status}: ${JSON.stringify(res.body)}`);
  }

  const items = await wishlistItems(user.id);
  assert.equal(new Set(items).size, items.length, "the wishlist must not contain duplicates");
  assert.ok(!items.includes(drop.id), "a removed product must stay removed");
  for (const id of newIds) assert.ok(items.includes(id), "a concurrently added product must not be lost");
  assert.ok(items.includes(keep.id), "an untouched product must survive");

  const view = await send("GET", `/api/wishlist/find/${user.id}`, { token: user.token });
  assert.deepEqual(
    view.body.products.map((p) => p.productId).sort(),
    [...items].sort(),
    "the API view must match the stored rows",
  );
});

test("a concurrent add cannot be erased by an in-flight partial checkout", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const [purchased, added] = await Promise.all([seedProduct(60), seedProduct(70)]);

  const seeded = await send("POST", `/api/carts/add_update-product/${user.id}`, {
    token: user.token,
    body: { productId: purchased.id, quantity: 5 },
  });
  assert.equal(seeded.status, 200);

  // The cart holds 5 of `purchased`; buy 3 and add `added` at the same time.
  const [checkout, concurrentAdd] = await Promise.all([
    send("POST", `/api/orders/${user.id}`, {
      token: user.token,
      body: orderPayload({
        userId: user.id,
        idempotencyKey: `race-${crypto.randomUUID()}`,
        items: [{ productId: purchased.id, quantity: 3 }],
      }),
    }),
    send("POST", `/api/carts/add_update-product/${user.id}`, {
      token: user.token,
      body: { productId: added.id, quantity: 3 },
    }),
  ]);

  assert.equal(checkout.status, 201, `checkout failed: ${JSON.stringify(checkout.body)}`);
  assert.equal(concurrentAdd.status, 200, `add failed: ${JSON.stringify(concurrentAdd.body)}`);

  // Server-authoritative totals, not the client's claimed 1 cent. The payload
  // acknowledged the change, so the order was created.
  assert.equal(checkout.body.financials.subtotalInCents, purchased.priceCents * 3);
  assert.equal(checkout.body.financials.discount, 0);
  assert.equal(checkout.body.financials.totalAmountInCents, purchased.priceCents * 3);
  assert.equal(checkout.body.items[0].priceAtOrderInCents, purchased.priceCents);
  assert.equal(checkout.body.items[0].quantity, 3);

  const remaining = await cartItems(user.id);

  // Both paths hold the same advisory lock, so whichever request ran second
  // still saw the other's write: 5 - 3 = 2 must survive the concurrent add.
  assert.deepEqual(byId(remaining), byId([
    { productId: added.id, quantity: 3 },
    { productId: purchased.id, quantity: 2 },
  ]));
  const purchasedLine = remaining.find((i) => i.productId === purchased.id);
  assert.ok(remaining.some((i) => i.productId === added.id), "the concurrently added line must survive the checkout");
  assert.equal(purchasedLine.quantity, 2);
  for (const line of remaining) assert.ok(line.quantity > 0, "no line may be left at zero or negative");

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 1, "a single checkout must create a single order");
});

test("a stale preview is refused until the customer accepts the real total", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const product = await seedProduct(75);
  const idempotencyKey = `race-${crypto.randomUUID()}`;

  // The storefront preview is stale, and the product price moved since it was
  // computed: 1 unit at $0.75 is now $1.50.
  await pool.query("UPDATE products SET price = $2 WHERE id = $1", [product.id, (product.priceCents * 2) / 100]);
  const preview = {
    subtotalInCents: product.priceCents,
    discount: 0,
    shippingCostInCents: 2000,
    totalAmountInCents: product.priceCents + 2000,
    currency: "USD",
  };

  const stale = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: {
      ...orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: product.id, quantity: 1 }] }),
      acceptPricingChange: false,
      financials: preview,
    },
  });

  assert.equal(stale.status, 409, `expected 409, got ${stale.status}: ${JSON.stringify(stale.body)}`);
  assert.equal(stale.body.details.staleCart, true);
  // The authoritative figure the customer must be shown before spending the key.
  assert.equal(stale.body.details.financials.subtotalInCents, product.priceCents * 2);
  assert.equal(stale.body.details.financials.totalAmountInCents, product.priceCents * 2);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 0, "a refused checkout must not create an order");
  const { rows: cartRows } = await pool.query("SELECT COUNT(*)::int AS n FROM carts WHERE user_id = $1", [user.id]);
  assert.equal(cartRows[0].n, 0, "a refused checkout must not remove anything from the cart");

  // Accepting the reported total reuses the same key and creates the order.
  const accepted = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: {
      ...orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: product.id, quantity: 1 }] }),
      acceptPricingChange: true,
      financials: stale.body.details.financials,
    },
  });

  assert.equal(accepted.status, 201, `expected 201, got ${accepted.status}: ${JSON.stringify(accepted.body)}`);
  assert.equal(accepted.body.financials.totalAmountInCents, product.priceCents * 2);
  assert.equal(accepted.body.staleCart, undefined, "a placed order must not be flagged as needing confirmation");
  const { rows: after } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(after[0].n, 1);
});

test("a price that changes again after confirmation is refused again", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const product = await seedProduct(80);
  const idempotencyKey = `race-${crypto.randomUUID()}`;
  const line = [{ productId: product.id, quantity: 1 }];
  // A preview the customer was shown before the price moved.
  const stalePreview = { subtotalInCents: 1, discount: 0, shippingCostInCents: 0, totalAmountInCents: 1, currency: "USD" };

  const first = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({ userId: user.id, idempotencyKey, items: line, financials: stalePreview }),
  });
  assert.equal(first.status, 409, `expected 409, got ${first.status}: ${JSON.stringify(first.body)}`);
  const confirmedTotal = first.body.details.financials.totalAmountInCents;

  // The customer is about to confirm, and the price moves again. `acceptPricingChange`
  // carries no authority of its own: it only accompanies a total that was agreed to.
  const currentCents = product.priceCents;
  await pool.query("UPDATE products SET price = $2 WHERE id = $1", [product.id, (currentCents + 5000) / 100]);

  const second = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: {
      ...orderPayload({ userId: user.id, idempotencyKey, items: line }),
      acceptPricingChange: true,
      financials: first.body.details.financials,
    },
  });

  assert.equal(second.status, 409, `expected a second 409, got ${second.status}: ${JSON.stringify(second.body)}`);
  assert.equal(second.body.details.staleCart, true);
  assert.notEqual(
    second.body.details.financials.totalAmountInCents,
    confirmedTotal,
    "the second conflict must report the new total, not the confirmed one",
  );

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 0, "no order may exist while the customer has not confirmed the current total");

  // Confirming the newly reported total does place it, still on the same key.
  const accepted = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: {
      ...orderPayload({ userId: user.id, idempotencyKey, items: line }),
      acceptPricingChange: true,
      financials: second.body.details.financials,
    },
  });
  assert.equal(accepted.status, 201, `expected 201, got ${accepted.status}: ${JSON.stringify(accepted.body)}`);
  assert.equal(accepted.body.financials.totalAmountInCents, second.body.details.financials.totalAmountInCents);

  const { rows: after } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(after[0].n, 1, "the whole sequence must still produce exactly one order");
});

test("duplicate lines cannot exceed the per-product quantity limit", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const product = await seedProduct(30);

  // Each line is individually valid at the 999 limit; summed they are not.
  const tooMany = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({
      userId: user.id,
      idempotencyKey: `race-${crypto.randomUUID()}`,
      items: Array.from({ length: 100 }, () => ({ productId: product.id, quantity: 999 })),
    }),
  });
  assert.equal(tooMany.status, 400, `expected 400, got ${tooMany.status}: ${JSON.stringify(tooMany.body)}`);
  assert.match(tooMany.body.message, /Invalid quantity/);

  // The aggregated total, not the per-line one, is what the limit governs.
  const atLimit = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({
      userId: user.id,
      idempotencyKey: `race-${crypto.randomUUID()}`,
      items: [
        { productId: product.id, quantity: 500 },
        { productId: product.id, quantity: 499 },
      ],
    }),
  });
  assert.equal(atLimit.status, 201, `expected 201, got ${atLimit.status}: ${JSON.stringify(atLimit.body)}`);
  assert.equal(atLimit.body.items.length, 1, "the repeated lines must collapse into one order line");
  assert.equal(atLimit.body.items[0].quantity, 999);

  // One unit over the aggregated limit is still refused.
  const overLimit = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({
      userId: user.id,
      idempotencyKey: `race-${crypto.randomUUID()}`,
      items: [
        { productId: product.id, quantity: 500 },
        { productId: product.id, quantity: 500 },
      ],
    }),
  });
  assert.equal(overLimit.status, 400, `expected 400, got ${overLimit.status}: ${JSON.stringify(overLimit.body)}`);
});

test("cart deletion takes the per-user lock, so it cannot race a concurrent add", { skip: SKIP }, async () => {
  const user = await seedUser();
  const product = await seedProduct(100);

  const created = await send("POST", `/api/carts`, { token: user.token, body: { userId: user.id } });
  assert.ok(created.status === 200 || created.status === 201, `cart create failed: ${JSON.stringify(created.body)}`);

  const added = await send("POST", `/api/carts/add_update-product/${user.id}`, {
    token: user.token,
    body: { productId: product.id, quantity: 2 },
  });
  assert.equal(added.status, 200, `add failed: ${JSON.stringify(added.body)}`);

  const cartId = added.body._id;
  assert.match(cartId, /^[0-9a-f]{24}$/, `unexpected cart id: ${cartId}`);

  // Delete cascades to cart_items, so it has to join the same lock protocol as
  // the add path. Holding that lock here proves the delete waits for it: without
  // it the delete would run immediately, while the other way round an add
  // could insert a line after the parent row was gone and fail the foreign key.
  const holder = await pool.connect();
  try {
    await holder.query("BEGIN");
    await holder.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`cart:${user.id}`]);

    let settled = false;
    // The path id is the customer's id, like every other cart route.
    const deletion = send("DELETE", `/api/carts/${user.id}`, { token: user.token }).then((response) => {
      settled = true;
      return response;
    });

    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal(settled, false, "the delete must block while the cart lock is held");

    const concurrentAdd = send("POST", `/api/carts/add_update-product/${user.id}`, {
      token: user.token,
      body: { productId: product.id, quantity: 7 },
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal(settled, false, "the delete must block while another cart mutation is in the lock");

    await holder.query("COMMIT");

    const [deleted, updated] = await Promise.all([deletion, concurrentAdd]);
    assert.equal(deleted.status, 200, `delete failed: ${JSON.stringify(deleted.body)}`);
    // Whichever of the two took the lock second saw the other's write, so the
    // add either updated the cart before it was deleted or created a fresh one
    // after. Neither may fail on the cart_items foreign key.
    assert.equal(updated.status, 200, `add failed: ${JSON.stringify(updated.body)}`);
  } finally {
    await holder.query("ROLLBACK").catch(() => {});
    holder.release();
  }

  const { rows: carts } = await pool.query("SELECT COUNT(*)::int AS n FROM carts WHERE user_id = $1", [user.id]);
  assert.ok(carts[0].n <= 1, `a user must not end up with ${carts[0].n} carts`);

  // The invariant that matters: the cascade and the inserts can interleave, but
  // no cart_items row may outlive its cart.
  const { rows: orphans } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM cart_items ci
     WHERE NOT EXISTS (SELECT 1 FROM carts c WHERE c.id = ci.cart_id)`,
  );
  assert.equal(orphans[0].n, 0, "no cart item may outlive its cart");
});

test("the same idempotency key in parallel creates one order and replays it", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const product = await seedProduct(80);
  const idempotencyKey = `race-${crypto.randomUUID()}`;
  const payload = orderPayload({
    userId: user.id,
    idempotencyKey,
    items: [{ productId: product.id, quantity: 1 }],
  });

  const results = await Promise.all([1, 2, 3].map(() => send("POST", `/api/orders/${user.id}`, { token: user.token, body: payload })));

  assert.equal(results.filter((r) => r.status === 201).length, 1, "exactly one request may create the order");
  assert.equal(results.filter((r) => r.status === 200).length, 2, "the retries must replay the existing order");
  const ids = new Set(results.map((r) => r.body._id));
  assert.equal(ids.size, 1, "all responses must describe the same order");

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 1, "a replayed key must not duplicate the order");
  const { rows: itemRows } = await pool.query(
    "SELECT COUNT(*)::int AS n FROM order_items WHERE order_id = $1",
    [[...ids][0]],
  );
  assert.equal(itemRows[0].n, 1, "a replayed key must not duplicate the order lines");
});

test("one key reused with a different payload is rejected as a conflict", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const [first, second] = await Promise.all([seedProduct(90), seedProduct(91)]);
  const idempotencyKey = `race-${crypto.randomUUID()}`;

  const created = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: first.id, quantity: 1 }] }),
  });
  assert.equal(created.status, 201);

  const reused = await send("POST", `/api/orders/${user.id}`, {
    token: user.token,
    body: orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: second.id, quantity: 1 }] }),
  });
  assert.equal(reused.status, 409, `expected 409, got ${reused.status}: ${JSON.stringify(reused.body)}`);
  assert.match(reused.body.message, /already used with a different order payload/);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
  assert.equal(rows[0].n, 1);
});

test("parallel requests sharing a key but not a payload cannot both succeed", { skip: SKIP }, async () => {
  const user = await seedUser();
  await seedAddress(user.id);
  const [first, second] = await Promise.all([seedProduct(90), seedProduct(91)]);

  // The sequential case above is caught by the lookup at the top of the
  // transaction. Here both requests are in flight together, so either can pass
  // that lookup before the other commits and then discover the conflict on
  // insert instead. Repeated because that interleaving is timing dependent, and
  // the insert path is the one with nothing guarding it.
  const ROUNDS = 8;
  for (let round = 0; round < ROUNDS; round++) {
    const idempotencyKey = `race-${crypto.randomUUID()}`;
    const results = await Promise.all([
      send("POST", `/api/orders/${user.id}`, {
        token: user.token,
        body: orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: first.id, quantity: 1 }] }),
      }),
      send("POST", `/api/orders/${user.id}`, {
        token: user.token,
        body: orderPayload({ userId: user.id, idempotencyKey, items: [{ productId: second.id, quantity: 1 }] }),
      }),
    ]);

    const created = results.filter((r) => r.status === 201);
    const refused = results.filter((r) => r.status === 409);
    assert.equal(created.length, 1, `round ${round}: expected one 201, got ${JSON.stringify(results.map((r) => r.status))}`);
    // Whoever loses the insert must be refused, not handed the winner's order.
    assert.equal(
      refused.length,
      1,
      `round ${round}: the losing payload must be refused, got ${JSON.stringify(results.map((r) => ({ status: r.status, message: r.body && r.body.message, product: r.body && r.body.items && r.body.items[0] && r.body.items[0].productId })))}`,
    );

    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1", [user.id]);
    assert.equal(rows[0].n, round + 1, `round ${round}: a contested key must leave exactly one order`);
  }
});

test("parallel default-address creation still leaves exactly one default", { skip: SKIP }, async () => {
  const user = await seedUser();

  const results = await Promise.all(
    [0, 1, 2].map(() =>
      send("POST", `/api/addresses/${user.id}`, { token: user.token, body: addressPayload(user.id, true) }),
    ),
  );

  assert.deepEqual(statuses(results), [201, 201, 201]);
  const { rows } = await pool.query(
    "SELECT id, label, is_default FROM addresses WHERE user_id = $1 ORDER BY created_at",
    [user.id],
  );
  assert.equal(rows.length, 3, "every address must be created");
  assert.equal(rows.filter((r) => r.is_default).length, 1, "an account cannot have two default addresses");

  const view = await send("GET", `/api/addresses/${user.id}`, { token: user.token });
  assert.equal(view.body.filter((a) => a.isDefault).length, 1, "the API must report a single default");
});