const { test } = require("node:test");
const assert = require("node:assert/strict");

const fg = require("../../src/scripts/migration/fingerprint");

// node-postgres returns `numeric` and `bigint` columns as strings by default,
// while mapping.js produces JavaScript numbers. These helpers mimic the shapes a
// real query result carries so the fixtures exercise the same comparisons.
const pgNumeric = (n) => (typeof n === "number" ? n.toFixed(2) : n);
const pgBigint = (n) => String(n);

const PRODUCT_ID = "6a940ab7845fa9999ee6d6b1";
const USER_ID = "6a940ab7845fa9999ee6d6b2";
const ORDER_ID = "6a940ab7845fa9999ee6d6b3";

test("rowsMatch treats numeric price 12 and PostgreSQL numeric '12.00' as equal", () => {
  const source = {
    id: PRODUCT_ID,
    title: "Widget",
    description: "d",
    image_url: "u",
    categories: null,
    size: null,
    color: null,
    price: 12,
    rating: 4.5,
    stock_quantity: 7,
    is_deleted: false,
    created_at: new Date(0),
    updated_at: new Date(0),
  };
  const target = {
    ...source,
    price: pgNumeric(12),
    rating: pgNumeric(4.5),
    stock_quantity: pgBigint(7),
    is_deleted: "f",
  };
  assert.equal(fg.rowsMatch("products", source, target), true);
  assert.deepEqual(fg.rowDiff("products", source, target), []);
});

test("rowsMatch still detects a genuinely different price", () => {
  const source = { id: PRODUCT_ID, title: "W", price: 12, created_at: null, updated_at: null };
  const target = { id: PRODUCT_ID, title: "W", price: pgNumeric(13), created_at: null, updated_at: null };
  assert.equal(fg.rowsMatch("products", source, target), false);
  assert.deepEqual(fg.rowDiff("products", source, target), ["price"]);
});

test("rowsMatch compares order bigint cents as numbers", () => {
  const source = {
    id: ORDER_ID,
    user_id: USER_ID,
    subtotal_in_cents: 24900,
    discount_in_cents: 0,
    shipping_cost_in_cents: 0,
    total_amount_in_cents: 24900,
    created_at: null,
    updated_at: null,
  };
  const target = {
    ...source,
    subtotal_in_cents: pgBigint(24900),
    discount_in_cents: pgBigint(0),
    shipping_cost_in_cents: pgBigint(0),
    total_amount_in_cents: pgBigint(24900),
  };
  assert.equal(fg.rowsMatch("orders", source, target), true);
  const wrong = { ...target, total_amount_in_cents: pgBigint(1) };
  assert.equal(fg.rowsMatch("orders", source, wrong), false);
});

test("rowsMatch detects a wrong imported password hash through the redacted digest", () => {
  const source = { id: USER_ID, firstname: "A", password_hash: "$2a$10$goodhash", created_at: null, updated_at: null };
  const same = { id: USER_ID, firstname: "A", password_hash: "$2a$10$goodhash", created_at: null, updated_at: null };
  const wrong = { id: USER_ID, firstname: "A", password_hash: "$2a$10$otherhash", created_at: null, updated_at: null };
  const absent = { id: USER_ID, firstname: "A", password_hash: null, created_at: null, updated_at: null };

  assert.equal(fg.rowsMatch("users", source, same), true);
  assert.equal(fg.rowsMatch("users", source, wrong), false);
  assert.deepEqual(fg.rowDiff("users", source, wrong), ["password_hash"]);
  assert.equal(fg.rowsMatch("users", source, absent), false);
});

test("secretDigest is stable and does not expose the hash", () => {
  const digest = fg.secretDigest("$2a$10$goodhash");
  assert.equal(digest, fg.secretDigest("$2a$10$goodhash"));
  assert.notEqual(digest, fg.secretDigest("$2a$10$otherhash"));
  assert.equal(digest.includes("goodhash"), false);
});

test("childFingerprints normalizes numeric and secret columns", () => {
  const source = [
    { user_id: USER_ID, position: 0, password_hash: "$2a$10$h1" },
    { user_id: USER_ID, position: 1, password_hash: "$2a$10$h2" },
  ];
  const target = [
    { user_id: USER_ID, position: 0, password_hash: "$2a$10$h1" },
    { user_id: USER_ID, position: 1, password_hash: "$2a$10$h2" },
  ];
  const reordered = [target[1], target[0]];
  const wrongHash = [{ ...target[0] }, { ...target[1], password_hash: "$2a$10$nope" }];
  const a = fg.childFingerprints("user_password_history", source);
  const b = fg.childFingerprints("user_password_history", target);
  const c = fg.childFingerprints("user_password_history", reordered);
  const d = fg.childFingerprints("user_password_history", wrongHash);
  assert.equal(a.get(USER_ID), b.get(USER_ID));
  assert.equal(a.get(USER_ID), c.get(USER_ID));
  assert.notEqual(a.get(USER_ID), d.get(USER_ID));
});

test("childFingerprints treats bigint quantity equal to its string form", () => {
  const src = [{ cart_id: "C1", product_id: PRODUCT_ID, quantity: 3, position: 0 }];
  const dst = [{ cart_id: "C1", product_id: PRODUCT_ID, quantity: "3", position: "0" }];
  assert.equal(
    fg.childFingerprints("cart_items", src).get("C1"),
    fg.childFingerprints("cart_items", dst).get("C1"),
  );
});

test("diffIdSets reports a missing expected id even when unrelated rows exist", () => {
  const expected = ["a", "b", "c"];
  const fetched = ["a", "b", "zzz-other"];
  const diff = fg.diffIdSets(expected, fetched);
  assert.deepEqual(diff.missing, ["c"]);
  assert.deepEqual(diff.unexpected, ["zzz-other"]);
});

test("diffIdSets is empty when the sets match", () => {
  const diff = fg.diffIdSets(["a", "b"], ["b", "a"]);
  assert.deepEqual(diff, { missing: [], unexpected: [] });
});

test("normalize canonicalizes by PostgreSQL type family", () => {
  assert.equal(fg.normalize("price", "products", "12.00"), 12);
  assert.equal(fg.normalize("is_deleted", "products", "t"), true);
  assert.equal(fg.normalize("is_deleted", "products", "f"), false);
  assert.equal(fg.normalize("title", "products", "12.00"), "12.00");
});

test("integer columns are canonicalized as decimal strings", () => {
  // `pg` hands back int8/numeric as strings; a Number would lose precision above
  // 2^53 and would make "42.0" and "42" look equal for a whole-number column.
  assert.equal(fg.normalize("stock_quantity", "products", "7"), "7");
  assert.equal(fg.normalize("stock_quantity", "products", 7), "7");
  assert.equal(fg.normalize("stock_quantity", "products", "07"), "7");
  assert.equal(fg.normalize("stock_quantity", "products", "42.0"), "42");
  assert.equal(fg.normalize("stock_quantity", "products", -3n), "-3");
  assert.equal(fg.normalize("quantity", "order_items", "9007199254740993"), "9007199254740993");
  assert.equal(fg.normalize("stock_quantity", "products", ""), null);
  assert.equal(fg.normalize("stock_quantity", "products", "seven"), null);
});

test("child ordering is numeric, not lexicographic", () => {
  const row = (position, quantity) => ({ wishlist_id: "w1", product_id: `p${position}`, position, quantity });
  const shuffled = [row(10, 1), row(2, 1), row(1, 1)];
  const ordered = [row(1, 1), row(2, 1), row(10, 1)];
  assert.equal(
    fg.childFingerprints("wishlist_items", shuffled).get("w1"),
    fg.childFingerprints("wishlist_items", ordered).get("w1"),
  );
});