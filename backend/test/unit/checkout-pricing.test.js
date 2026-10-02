const test = require("node:test");
const assert = require("node:assert/strict");

const {
  computeTotals,
  couponRate,
  requestFingerprint,
  FREE_SHIPPING_THRESHOLD_IN_CENTS,
  FLAT_SHIPPING_IN_CENTS,
} = require("../../src/modules/orders/application/checkout-pricing");

const HEX24 = "a".repeat(24);
const HEX24_B = "b".repeat(24);
const baseBody = {
  shippingAddress: {
    fullAddress: "Egypt, street 1",
    phoneNumber: "+20 01111111111",
    firstName: "Ada",
    lastName: "Byron",
    label: "Home",
  },
  paymentMethod: "cash_on_delivery",
};

test("no coupon means no discount", () => {
  const totals = computeTotals({ subtotalInCents: 10_000, couponCode: "" });
  assert.equal(totals.discount, 0);
  assert.equal(totals.couponCode, null);
});

test("an unknown coupon is rejected rather than ignored", () => {
  assert.throws(() => computeTotals({ subtotalInCents: 10_000, couponCode: "NOPE" }), /Invalid coupon code/);
  assert.equal(couponRate("NOPE"), null);
  assert.equal(couponRate(undefined), 0);
});

test("coupon codes are case and whitespace insensitive", () => {
  const a = computeTotals({ subtotalInCents: 19_999, couponCode: "10off" });
  const b = computeTotals({ subtotalInCents: 19_999, couponCode: "  10OFF  " });
  assert.deepEqual(a, b);
  assert.equal(a.discount, 2000);
  assert.equal(a.couponCode, "10OFF");
});

test("every advertised coupon applies its own rate", () => {
  const expected = { "10OFF": 0.1, "15OFF": 0.15, "20OFF": 0.2, "25OFF": 0.25, "50OFF": 0.5 };
  for (const [code, rate] of Object.entries(expected)) {
    const totals = computeTotals({ subtotalInCents: 10_000, couponCode: code });
    assert.equal(totals.discount, Math.round(10_000 * rate), code);
  }
});

test("shipping is charged below the threshold and free at or above it", () => {
  const below = computeTotals({ subtotalInCents: FREE_SHIPPING_THRESHOLD_IN_CENTS - 1 });
  assert.equal(below.shippingCostInCents, FLAT_SHIPPING_IN_CENTS);

  const at = computeTotals({ subtotalInCents: FREE_SHIPPING_THRESHOLD_IN_CENTS });
  assert.equal(at.shippingCostInCents, 0);

  const above = computeTotals({ subtotalInCents: FREE_SHIPPING_THRESHOLD_IN_CENTS + 1 });
  assert.equal(above.shippingCostInCents, 0);

  const empty = computeTotals({ subtotalInCents: 0 });
  assert.equal(empty.shippingCostInCents, 0);
  assert.equal(empty.totalAmountInCents, 0);
});

test("total is subtotal minus discount plus shipping", () => {
  const totals = computeTotals({ subtotalInCents: 4_999, couponCode: "25OFF" });
  assert.equal(totals.discount, 1_250);
  assert.equal(totals.shippingCostInCents, FLAT_SHIPPING_IN_CENTS);
  assert.equal(totals.totalAmountInCents, 4_999 - 1_250 + FLAT_SHIPPING_IN_CENTS);
});

test("a 50% coupon cannot produce a negative total", () => {
  const totals = computeTotals({ subtotalInCents: 100, couponCode: "50OFF" });
  assert.equal(totals.totalAmountInCents, totals.subtotalInCents - totals.discount + totals.shippingCostInCents);
  assert.ok(totals.totalAmountInCents >= 0);
});

const fingerprint = (overrides = {}) =>
  requestFingerprint({
    userId: "user-1",
    body: { ...baseBody },
    quantities: new Map([[HEX24, 2]]),
    ...overrides,
  });

test("the same request produces the same fingerprint", () => {
  assert.equal(fingerprint(), fingerprint());
});

test("item order does not change the fingerprint", () => {
  const a = fingerprint({ quantities: new Map([[HEX24, 2], [HEX24_B, 1]]) });
  const b = fingerprint({ quantities: new Map([[HEX24_B, 1], [HEX24, 2]]) });
  assert.equal(a, b);
});

test("a different quantity, item, address, coupon or method changes the fingerprint", () => {
  const base = fingerprint();
  assert.notEqual(base, fingerprint({ quantities: new Map([[HEX24, 3]]) }));
  assert.notEqual(base, fingerprint({ quantities: new Map([[HEX24_B, 2]]) }));
  assert.notEqual(base, fingerprint({ quantities: new Map() }));
  assert.notEqual(base, fingerprint({ userId: "user-2" }));
  assert.notEqual(
    base,
    fingerprint({ body: { ...baseBody, shippingAddress: { ...baseBody.shippingAddress, fullAddress: "elsewhere" } } }),
  );
  assert.notEqual(base, fingerprint({ body: { ...baseBody, couponCode: "10OFF" } }));
  assert.notEqual(base, fingerprint({ body: { ...baseBody, paymentMethod: "cash_on_delivery " } }));
});

test("client-supplied totals are not part of the fingerprint", () => {
  // Totals are server-computed; a stale preview is reported as `staleCart`
  // instead of turning a retry into a conflict.
  assert.equal(
    fingerprint({ body: { ...baseBody, financials: { totalAmountInCents: 1 } } }),
    fingerprint({ body: { ...baseBody, financials: { totalAmountInCents: 999_999 } } }),
  );
});

test("coupon case differences do not change the fingerprint", () => {
  assert.equal(
    fingerprint({ body: { ...baseBody, couponCode: "10off" } }),
    fingerprint({ body: { ...baseBody, couponCode: " 10OFF " } }),
  );
});