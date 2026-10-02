/**
 * Repository tests driven by an injected query double.
 *
 * The backend plan's test section asks for exactly this: prove without a live
 * database that SQL stays parameterized, that updates only accept allowlisted
 * columns, and that a failing transaction rolls back and releases its client.
 *
 * Repositories fall back to the shared pool when no client is passed, so this
 * file passing with no DATABASE_URL configured is also proof that the injected
 * double is the one doing the work.
 */
const test = require("node:test");
const assert = require("node:assert/strict");

const cartsRepository = require("../../src/modules/carts/infrastructure/carts.repository");
const wishlistsRepository = require("../../src/modules/wishlists/infrastructure/wishlists.repository");
const ordersRepository = require("../../src/modules/orders/infrastructure/orders.repository");

const POOL_PATH = require.resolve("../../src/shared/database/pool.js");
const TRANSACTION_PATH = require.resolve("../../src/shared/database/transaction.js");

// ---------------------------------------------------------------- query double

const recorder = (respond) => {
  const calls = [];
  return {
    calls,
    query: async (text, values) => {
      calls.push({ text, values });
      return respond ? respond(text, values, calls.length - 1) : { rows: [], rowCount: 0 };
    },
  };
};

const flat = (client) => client.calls.map((c) => c.text.replace(/\s+/g, " ").trim());

const highestPlaceholder = (text) =>
  (text.match(/\$(\d+)/g) || []).reduce((max, p) => Math.max(max, Number(p.slice(1))), 0);

/** Every value must be bound, and the placeholders must line up 1..n. */
const assertParameterized = (call) => {
  assert.equal(highestPlaceholder(call.text), call.values.length, `placeholder/value mismatch: ${call.text}`);
  for (const value of call.values) {
    if (typeof value !== "string" || value.length < 8) continue;
    assert.ok(!call.text.includes(value), `value ${JSON.stringify(value)} was interpolated into: ${call.text}`);
  }
};

const assertAllParameterized = (client) => client.calls.forEach(assertParameterized);

const cartRow = (over = {}) => ({
  id: "cart-0000000000001",
  user_id: "user-000000000001",
  created_at: new Date("2024-01-01T00:00:00.000Z"),
  updated_at: new Date("2024-01-02T00:00:00.000Z"),
  ...over,
});

const orderRow = (over = {}) => ({
  id: "order-000000000001",
  user_id: "user-000000000001",
  subtotal_in_cents: 1000,
  discount_in_cents: 0,
  shipping_cost_in_cents: 0,
  total_amount_in_cents: 1000,
  currency: "USD",
  coupon_code: null,
  status: "pending",
  payment_method: "cash_on_delivery",
  tracking_number: null,
  estimated_delivery_at: null,
  ship_to_full_address: "1 Test Street",
  ship_to_phone_number: "+201000000000",
  ship_to_first_name: "Test",
  ship_to_last_name: "User",
  ship_to_label: "Home",
  request_fingerprint: "fp-1",
  created_at: new Date("2024-01-01T00:00:00.000Z"),
  updated_at: new Date("2024-01-01T00:00:00.000Z"),
  ...over,
});

// ------------------------------------------------------------ shared fixtures

const cartWithItems = (items) =>
  recorder((text) => {
    if (text.startsWith("SELECT id, user_id, created_at")) return { rows: [cartRow()] };
    if (text.startsWith("SELECT product_id, quantity")) return { rows: items };
    return { rows: [], rowCount: 1 };
  });

// ------------------------------------------------------------ withTransaction

const fakePool = (log, failOn = null) => ({
  connect: async () => {
    log.push("connect");
    return {
      query: async (text) => {
        log.push(text);
        if (text === failOn) throw new Error(`statement failed: ${text}`);
        return { rows: [], rowCount: 0 };
      },
      release: () => log.push("release"),
    };
  },
});

/** Loads transaction.js against a stub pool without disturbing other modules. */
const withStubbedPool = (stub) => {
  const original = require.cache[POOL_PATH];
  require.cache[POOL_PATH] = {
    id: POOL_PATH,
    filename: POOL_PATH,
    loaded: true,
    children: [],
    paths: [],
    exports: { getPool: () => stub, closePool: async () => {} },
  };
  delete require.cache[TRANSACTION_PATH];
  const mod = require(TRANSACTION_PATH);
  delete require.cache[TRANSACTION_PATH];
  if (original) require.cache[POOL_PATH] = original;
  else delete require.cache[POOL_PATH];
  return mod;
};

test("withTransaction commits and releases the client on success", async () => {
  const log = [];
  const { withTransaction } = withStubbedPool(fakePool(log));

  const result = await withTransaction(async (client) => {
    await client.query("UPDATE carts SET updated_at = now() WHERE id = $1", ["cart-1"]);
    return "done";
  });

  assert.equal(result, "done");
  assert.deepEqual(log, ["connect", "BEGIN", "UPDATE carts SET updated_at = now() WHERE id = $1", "COMMIT", "release"]);
});

test("withTransaction rolls back, releases, and rethrows when the work fails", async () => {
  const log = [];
  const { withTransaction } = withStubbedPool(fakePool(log, "UPDATE carts SET quantity = 1"));

  await assert.rejects(
    withTransaction(async (client) => {
      await client.query("UPDATE carts SET quantity = 1");
    }),
    /statement failed: UPDATE carts SET quantity = 1/,
  );

  assert.deepEqual(log, [
    "connect",
    "BEGIN",
    "UPDATE carts SET quantity = 1",
    "ROLLBACK",
    "release",
  ]);
});

test("withTransaction reports the original failure when ROLLBACK itself fails", async () => {
  const log = [];
  const { withTransaction } = withStubbedPool(fakePool(log, "ROLLBACK"));

  await assert.rejects(
    withTransaction(async () => {
      throw new Error("original failure");
    }),
    /original failure/,
  );

  assert.ok(log.includes("ROLLBACK"));
  assert.ok(log.includes("release"), "the client must be released even when rollback fails");
});

// ---------------------------------------------------------------- carts

test("carts repository selects by bound user id", async () => {
  const client = cartWithItems([]);
  const cart = await cartsRepository.getCartByUserId("user-000000000001", client);

  assert.deepEqual(flat(client), [
    "SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1",
  ]);
  assert.deepEqual(client.calls[0].values, ["user-000000000001"]);
  assert.equal(cart._id, "cart-0000000000001");
  assert.equal(cart.userId, "user-000000000001");
  assert.equal(cart.createdAt, "2024-01-01T00:00:00.000Z");
  assertAllParameterized(client);
});

test("carts create stays on one row per user instead of inserting a duplicate", async () => {
  const client = recorder(() => ({ rows: [cartRow()] }));
  await cartsRepository.create({ id: "cart-new-0000001", userId: "user-000000000001" }, client);

  const [call] = client.calls;
  assert.match(flat(client)[0], /INSERT INTO carts \(id, user_id\) VALUES \(\$1, \$2\) ON CONFLICT \(user_id\) DO UPDATE/);
  assert.deepEqual(call.values, ["cart-new-0000001", "user-000000000001"]);
  assertParameterized(call);
});

test("a partial purchase decrements the line and keeps the rest of the cart", async () => {
  const client = cartWithItems([
    { product_id: "p1", quantity: 5 },
    { product_id: "p2", quantity: 2 },
  ]);

  const result = await cartsRepository.removePurchasedItems("user-000000000001", new Map([["p1", 3]]), client);

  assert.deepEqual(result, { removed: 0, remaining: 2 });
  const texts = flat(client);
  assert.ok(!texts.some((t) => t.startsWith("DELETE FROM cart_items")), "a partial purchase must not delete the line");
  const update = client.calls.find((c) => c.text.startsWith("UPDATE cart_items"));
  assert.deepEqual(update.values, [2, "cart-0000000000001", "p1"]);
  assert.ok(texts.some((t) => t === "UPDATE carts SET updated_at = now() WHERE id = $1"), "the cart timestamp must move");
  assertAllParameterized(client);
});

test("purchasing the whole quantity deletes the line", async () => {
  const client = cartWithItems([
    { product_id: "p1", quantity: 5 },
    { product_id: "p2", quantity: 2 },
  ]);

  const result = await cartsRepository.removePurchasedItems("user-000000000001", new Map([["p1", 5]]), client);

  assert.deepEqual(result, { removed: 1, remaining: 1 });
  const del = client.calls.find((c) => c.text.startsWith("DELETE FROM cart_items"));
  assert.deepEqual(del.values, ["cart-0000000000001", "p1"]);
  assertAllParameterized(client);
});

test("removePurchasedItems binds the id list as an array instead of building IN (...)", async () => {
  const client = cartWithItems([
    { product_id: "p1", quantity: 5 },
    { product_id: "p2", quantity: 2 },
  ]);
  await cartsRepository.removePurchasedItems(
    "user-000000000001",
    new Map([
      ["p1", 1],
      ["p2", 1],
    ]),
    client,
  );

  const select = client.calls.find((c) => c.text.includes("ANY($2::text[])"));
  assert.deepEqual(select.values, ["cart-0000000000001", ["p1", "p2"]]);
  assertAllParameterized(client);
});

test("removePurchasedItems is a no-op for an empty purchase and for a missing cart", async () => {
  const empty = cartWithItems([]);
  assert.deepEqual(await cartsRepository.removePurchasedItems("user-000000000001", new Map(), empty), {
    removed: 0,
    remaining: 0,
  });
  assert.equal(empty.calls.length, 0, "an empty purchase must not touch the database");

  const missing = recorder(() => ({ rows: [], rowCount: 0 }));
  assert.deepEqual(await cartsRepository.removePurchasedItems("user-000000000001", new Map([["p1", 1]]), missing), {
    removed: 0,
    remaining: 0,
  });
  assert.equal(missing.calls.length, 1, "only the cart lookup should run");
});

test("replaceItems rewrites the cart in position order with bound values", async () => {
  const client = recorder(() => ({ rows: [], rowCount: 1 }));
  await cartsRepository.replaceItems(
    "cart-0000000000001",
    [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ],
    client,
  );

  assert.deepEqual(flat(client), [
    "DELETE FROM cart_items WHERE cart_id = $1",
    "INSERT INTO cart_items (cart_id, product_id, quantity, position) VALUES ($1, $2, $3, $4)",
    "INSERT INTO cart_items (cart_id, product_id, quantity, position) VALUES ($1, $2, $3, $4)",
    "UPDATE carts SET updated_at = now() WHERE id = $1",
  ]);
  assert.deepEqual(client.calls[1].values, ["cart-0000000000001", "p1", 2, 0]);
  assert.deepEqual(client.calls[2].values, ["cart-0000000000001", "p2", 1, 1]);
  assertAllParameterized(client);
});

// -------------------------------------------------------------- wishlists

test("wishlists create stays on one row per user", async () => {
  const client = recorder(() => ({ rows: [cartRow()] }));
  await wishlistsRepository.create({ id: "wish-00000000001", userId: "user-000000000001" }, client);

  assert.match(flat(client)[0], /INSERT INTO wishlists \(id, user_id\) VALUES \(\$1, \$2\) ON CONFLICT \(user_id\) DO UPDATE/);
  assert.deepEqual(client.calls[0].values, ["wish-00000000001", "user-000000000001"]);
  assertParameterized(client.calls[0]);
});

test("wishlist replaceItems rewrites the list in position order", async () => {
  const client = recorder(() => ({ rows: [], rowCount: 1 }));
  await wishlistsRepository.replaceItems("wish-00000000001", ["p1", "p2", "p3"], client);

  assert.deepEqual(flat(client), [
    "DELETE FROM wishlist_items WHERE wishlist_id = $1",
    "INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1, $2, $3)",
    "INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1, $2, $3)",
    "INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1, $2, $3)",
    "UPDATE wishlists SET updated_at = now() WHERE id = $1",
  ]);
  assert.deepEqual(client.calls[3].values, ["wish-00000000001", "p3", 2]);
  assertAllParameterized(client);
});

// ----------------------------------------------------------------- orders

test("orders update only writes allowlisted columns and binds every value", async () => {
  const client = recorder(() => ({ rows: [orderRow()] }));

  await ordersRepository.update(
    "order-000000000001",
    {
      userId: "user-000000000001",
      status: "shipped",
      paymentMethod: "cash_on_delivery",
      financials: {
        subtotalInCents: 5000,
        discount: 500,
        shippingCostInCents: 0,
        totalAmountInCents: 4500,
        currency: "USD",
        ignoredField: "nope",
      },
      shippingAddress: {
        fullAddress: "2 Test Street",
        phoneNumber: "+201111111111",
        firstName: "Test",
        lastName: "User",
        label: "Work",
        ignoredField: "nope",
      },
      shippingInfo: { trackingNumber: "TRACK-1", estimatedDeliveryDate: null, ignoredField: "nope" },
      // Hostile keys: none of these may reach the SET clause.
      id: "attacker-controlled-id",
      user_id: "attacker-column",
      total_amount_in_cents: 999999,
      deleted_at: "yesterday",
    },
    client,
  );

  const expectedSets = [
    "subtotal_in_cents = $1",
    "discount_in_cents = $2",
    "shipping_cost_in_cents = $3",
    "total_amount_in_cents = $4",
    "currency = $5",
    "ship_to_full_address = $6",
    "ship_to_phone_number = $7",
    "ship_to_first_name = $8",
    "ship_to_last_name = $9",
    "ship_to_label = $10",
    "tracking_number = $11",
    "estimated_delivery_at = $12",
    "user_id = $13",
    "status = $14",
    "payment_method = $15",
  ].join(", ");

  const [call] = client.calls;
  const [setClause, returning] = call.text.split(" RETURNING ");
  assert.equal(
    setClause,
    `UPDATE orders SET ${expectedSets}, updated_at = now() WHERE id = $16`,
  );
  assert.match(returning, /^id, user_id, subtotal_in_cents/);
  assert.ok(returning.includes("coupon_code") && returning.includes("request_fingerprint"));
  assert.deepEqual(call.values, [
    5000,
    500,
    0,
    4500,
    "USD",
    "2 Test Street",
    "+201111111111",
    "Test",
    "User",
    "Work",
    "TRACK-1",
    null,
    "user-000000000001",
    "shipped",
    "cash_on_delivery",
    "order-000000000001",
  ]);
  assert.ok(!call.text.includes("attacker-controlled-id"));
  assert.ok(!call.text.includes("deleted_at"), "unknown columns must not be written");
  assert.ok(!call.text.includes("ignoredField"));
  const ALLOWED = new Set([
    "subtotal_in_cents",
    "discount_in_cents",
    "shipping_cost_in_cents",
    "total_amount_in_cents",
    "currency",
    "ship_to_full_address",
    "ship_to_phone_number",
    "ship_to_first_name",
    "ship_to_last_name",
    "ship_to_label",
    "tracking_number",
    "estimated_delivery_at",
    "user_id",
    "status",
    "payment_method",
  ]);
  const assigned = setClause
    .slice(setClause.indexOf("SET ") + 4, setClause.indexOf(", updated_at"))
    .split(", ")
    .map((pair) => pair.split(" = ")[0]);
  assert.equal(assigned.length, 15);
  assert.equal(new Set(assigned).size, 15, "no column may be assigned twice");
  for (const column of assigned) {
    assert.ok(ALLOWED.has(column), `${column} is not an allowlisted order column`);
  }
  assertParameterized(call);
});

test("orders update reads instead of writing when nothing is allowlisted", async () => {
  const client = recorder(() => ({ rows: [orderRow()] }));
  const order = await ordersRepository.update("order-000000000001", { unknown: "x", user_id: "attacker" }, client);

  assert.match(flat(client)[0], /^SELECT id, user_id, subtotal_in_cents/);
  assert.deepEqual(client.calls[0].values, ["order-000000000001"]);
  assert.equal(order._id, "order-000000000001");
  assert.equal(order.requestFingerprint, "fp-1");
  assert.equal(order.financials.totalAmountInCents, 1000);
  assertAllParameterized(client);
});

test("orders update returns null when the row is gone", async () => {
  const client = recorder(() => ({ rows: [], rowCount: 0 }));
  assert.equal(await ordersRepository.update("order-000000000001", { status: "cancelled" }, client), null);
});

test("orders setStatus binds status and id", async () => {
  const client = recorder((text) =>
    text.startsWith("UPDATE orders")
      ? { rows: [orderRow({ status: "delivered" })] }
      : { rows: [{ product_id: "p1", quantity: 2, price_at_order_in_cents: 500 }] },
  );

  const order = await ordersRepository.setStatus("order-000000000001", "delivered", client);

  assert.match(flat(client)[0], /^UPDATE orders SET status = \$1, updated_at = now\(\) WHERE id = \$2 RETURNING/);
  assert.deepEqual(client.calls[0].values, ["delivered", "order-000000000001"]);
  assert.equal(order.status, "delivered");
  assert.deepEqual(order.items, [{ productId: "p1", quantity: 2, priceAtOrderInCents: 500 }]);
  assertAllParameterized(client);
});

test("orders setStatus returns null when nothing matched", async () => {
  const client = recorder(() => ({ rows: [], rowCount: 0 }));
  assert.equal(await ordersRepository.setStatus("order-000000000001", "delivered", client), null);
});