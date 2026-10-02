const { test } = require("node:test");
const assert = require("node:assert/strict");

const { errorMiddleware } = require("../../src/shared/http/error-middleware");
const { ApiError } = require("../../src/shared/http/api-error");

const handler = (err) => {
  let status;
  let body;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };
  errorMiddleware(err, {}, res, () => {});
  return { status, body };
};

test("ApiError is passed through with its status and message", () => {
  const { status, body } = handler(new ApiError(409, "Order already exists"));
  assert.equal(status, 409);
  assert.equal(body.message, "Order already exists");
});

test("ApiError.conflict carries details so the client can be told the real value", () => {
  // Checkout refuses a stale preview with the authoritative totals, which the
  // storefront has to show before the customer spends the idempotency key.
  const err = ApiError.conflict("Order pricing changed", {
    details: { staleCart: true, financials: { totalAmountInCents: 15000 } },
  });
  const { status, body } = handler(err);
  assert.equal(status, 409);
  assert.equal(body.details.staleCart, true);
  assert.equal(body.details.financials.totalAmountInCents, 15000);

  // A conflict with nothing to report must not grow an empty `details`.
  assert.equal(handler(ApiError.conflict("Order already exists")).body.details, undefined);
});

test("allowlist of PG constraint codes maps to 4xx responses", () => {
  const cases = [
    ["23505", 409],
    ["23503", 400],
    ["23502", 400],
    ["23514", 400],
    ["22P02", 400],
    ["22003", 400],
  ];
  for (const [code, expected] of cases) {
    const { status } = handler(Object.assign(new Error("boom"), { code }));
    assert.equal(status, expected, `code ${code} should map to ${expected}`);
  }
});

test("unknown errors fall through to 500", () => {
  const { status } = handler(new Error("boom"));
  assert.equal(status, 500);
});