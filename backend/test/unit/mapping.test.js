const { test } = require("node:test");
const assert = require("node:assert/strict");

const m = require("../../src/scripts/migration/mapping");
const fg = require("../../src/scripts/migration/fingerprint");

const USER = {
  _id: "6a940ab7845fa9999ee6d6b1",
  username: "osama",
  email: "o@example.com",
  phone: "01012345678",
  password: "$2a$10$abcdefghijklmnopqrstuv",
  isAdmin: false,
};

test("mapUsers records database-default fallbacks for missing timestamps", () => {
  const { rows, defaultedTimestamps } = m.mapUsers([{ ...USER, createdAt: new Date("2026-01-01T00:00:00Z") }]);
  assert.equal(rows[0].created_at instanceof Date, true);
  assert.equal(rows[0].updated_at, null);
  assert.deepEqual(defaultedTimestamps, [{ table: "users", id: USER._id, fields: ["updated_at"] }]);
});

test("mapUsers is clean when timestamps are present", () => {
  const { rows, defaultedTimestamps } = m.mapUsers([
    { ...USER, createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-02T00:00:00Z") },
  ]);
  assert.equal(rows[0].created_at instanceof Date, true);
  assert.equal(defaultedTimestamps.length, 0);
});

test("mapOrders derives estimated_delivery_at from shippingInfo.estimatedDeliveryDate", () => {
  const order = {
    _id: "6a940ab7845fa9999ee6d6b2",
    userId: USER._id,
    status: "pending",
    paymentMethod: "cash_on_delivery",
    financials: { subtotalInCents: 1000, discount: 0, shippingCostInCents: 50, totalAmountInCents: 1050 },
    shippingAddress: { fullAddress: "X", phoneNumber: "01012345678", firstName: "A", lastName: "B" },
    items: [{ productId: "6a940ab7845fa9999ee6d6b3", quantity: 1, priceAtOrderInCents: 1000 }],
    shippingInfo: { estimatedDeliveryDate: new Date("2026-02-01T00:00:00Z") },
  };
  const userIds = new Set([USER._id]);
  const productIds = new Set([order.items[0].productId]);
  const productsById = new Map([[productIds.values().next().value, { title: "T", img: "i" }]]);
  const { rows } = m.mapOrders([order], userIds, productIds, productsById);
  assert.ok(rows[0].order.estimated_delivery_at instanceof Date);
});

test("mapOrders falls back to createdAt/updatedAt defaults when absent", () => {
  const order = {
    _id: "6a940ab7845fa9999ee6d6b2",
    userId: USER._id,
    status: "pending",
    paymentMethod: "cash_on_delivery",
    financials: { subtotalInCents: 1000, discount: 0, shippingCostInCents: 0, totalAmountInCents: 1000 },
    shippingAddress: { fullAddress: "X", phoneNumber: "01012345678", firstName: "A", lastName: "B" },
    items: [],
  };
  const userIds = new Set([USER._id]);
  const { defaultedTimestamps } = m.mapOrders([order], userIds, new Set(), new Map());
  assert.deepEqual(defaultedTimestamps, [{ table: "orders", id: order._id, fields: ["created_at", "updated_at"] }]);
});

test("rowsMatch skips only default-fallback timestamps", () => {
  const missing = { id: "x", firstname: "A", created_at: null, updated_at: null };
  const missingDefaultFilled = { id: "x", firstname: "A", created_at: new Date(86400000), updated_at: new Date(86400000) };
  const ts = { id: "x", firstname: "A", created_at: new Date(0), updated_at: null };
  const tsSame = { id: "x", firstname: "A", created_at: new Date(0), updated_at: null };
  const tsDifferent = { id: "x", firstname: "A", created_at: new Date(1), updated_at: null };
  assert.equal(fg.rowsMatch("users", missing, missingDefaultFilled), true);
  assert.equal(fg.rowsMatch("users", ts, tsSame), true);
  assert.equal(fg.rowsMatch("users", ts, tsDifferent), false);
  assert.equal(fg.rowsMatch("users", ts, missing), false);
  assert.equal(fg.rowsMatch("users", { ...ts, phone: "000" }, tsSame), false);
});

test("childFingerprints is order-sensitive for order items", () => {
  const row = (order_id, line_number, product_id, price) => ({ order_id, line_number, product_id, price_at_order_in_cents: price });
  const a = fg.childFingerprints("order_items", [row("O1", 0, "p1", 100), row("O1", 1, "p2", 200)]);
  const b = fg.childFingerprints("order_items", [row("O1", 1, "p2", 200), row("O1", 0, "p1", 100)]);
  assert.equal(a.get("O1"), b.get("O1"));
  const changed = fg.childFingerprints("order_items", [row("O1", 0, "p1", 100), row("O1", 1, "p2", 999)]);
  assert.notEqual(a.get("O1"), changed.get("O1"));
});