const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  parsePagination,
  requireObjectId,
  validateProductInput,
  validateAddressInput,
  validateCartEntry,
} = require("../../src/shared/http/validation");
const { ApiError } = require("../../src/shared/http/api-error");

const expectBadRequest = (fn) => {
  assert.throws(fn, (e) => e instanceof ApiError && e.statusCode === 400);
};

test("parsePagination defaults page=1 limit=10", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10 });
  assert.deepEqual(parsePagination({ page: "2", limit: "25" }), { page: 2, limit: 25 });
});

test("parsePagination rejects out-of-range or non-integer page/limit", () => {
  expectBadRequest(() => parsePagination({ page: "0" }));
  expectBadRequest(() => parsePagination({ page: "-1" }));
  expectBadRequest(() => parsePagination({ page: "1.5" }));
  expectBadRequest(() => parsePagination({ limit: "0" }));
  expectBadRequest(() => parsePagination({ limit: "101" }));
  expectBadRequest(() => parsePagination({ limit: "abc" }));
});

test("parsePagination caps the accepted limit at 100", () => {
  assert.equal(parsePagination({ limit: "100" }).limit, 100);
});

test("requireObjectId accepts 24-hex and rejects other shapes", () => {
  const valid = "6a940ab7845fa9999ee6d6b1";
  assert.equal(requireObjectId(valid), valid);
  expectBadRequest(() => requireObjectId("short"));
  expectBadRequest(() => requireObjectId("gggggggggggggggggggggggg"));
  expectBadRequest(() => requireObjectId(undefined));
});

test("validateProductInput requires complete data for creates", () => {
  expectBadRequest(() => validateProductInput({}));
  expectBadRequest(() => validateProductInput({ title: "T", price: -1 }));
  assert.doesNotThrow(() =>
    validateProductInput({ title: "T", desc: "D", price: 10, amount: 3, categories: ["a"], rating: 4.5 }),
  );
});

test("validateProductInput enforces partial rules on updates", () => {
  expectBadRequest(() => validateProductInput({ rating: 6 }, { partial: true }));
  expectBadRequest(() => validateProductInput({ amount: 1.5 }, { partial: true }));
  assert.doesNotThrow(() => validateProductInput({ title: "T" }, { partial: true }));
});

test("validateProductInput normalizes the numeric strings the admin form submits", () => {
  // The admin form stores `e.target.value` from number inputs, so price, amount
  // and rating arrive as strings and used to be rejected with 400.
  const created = validateProductInput({ title: "T", desc: "D", price: "12.50", amount: "9", rating: "3.5" });
  assert.equal(created.price, 12.5);
  assert.equal(created.amount, 9);
  assert.equal(created.rating, 3.5);

  const updated = validateProductInput({ price: " 14.25 ", amount: "11" }, { partial: true });
  assert.equal(updated.price, 14.25);
  assert.equal(updated.amount, 11);

  assert.equal(validateProductInput({ price: "0" }, { partial: true }).price, 0);
});

test("a blank rating becomes the numeric default, not an empty string", () => {
  // The admin form's Reset left `rating: ""`, which passed validation and was
  // then sent to a numeric column, failing an otherwise valid new product with a
  // database error. A cleared field means "no rating given", which is 0.
  const created = validateProductInput({ title: "T", desc: "D", price: 10, amount: 1, rating: "" });
  assert.equal(created.rating, 0);
  assert.equal(typeof created.rating, "number");

  const cleared = validateProductInput({ rating: "" }, { partial: true });
  assert.equal(cleared.rating, 0);

  // An explicit null still means "leave unchanged" on a partial update.
  assert.equal(validateProductInput({ rating: null }, { partial: true }).rating, null);
});

test("validateProductInput still rejects unusable numeric strings", () => {
  expectBadRequest(() => validateProductInput({ price: "" }, { partial: true }));
  expectBadRequest(() => validateProductInput({ price: "abc" }, { partial: true }));
  expectBadRequest(() => validateProductInput({ price: "-1" }, { partial: true }));
  expectBadRequest(() => validateProductInput({ amount: "1.5" }, { partial: true }));
  expectBadRequest(() => validateProductInput({ rating: "6" }, { partial: true }));
  expectBadRequest(() => validateProductInput({ price: "Infinity" }, { partial: true }));
});

test("validateAddressInput requires shipping fields and known label", () => {
  expectBadRequest(() => validateAddressInput({}));
  expectBadRequest(() =>
    validateAddressInput({ firstName: "A", lastName: "B", fullAddress: "X", phoneNumber: "01012345678", label: "Office" }),
  );
  assert.doesNotThrow(() =>
    validateAddressInput({ firstName: "A", lastName: "B", fullAddress: "X", phoneNumber: "01012345678", label: "Home" }),
  );
});

test("validateAddressInput accepts local and international phone formats", () => {
  assert.doesNotThrow(() =>
    validateAddressInput({ firstName: "A", lastName: "B", fullAddress: "X", phoneNumber: "01012345678" }),
  );
  assert.doesNotThrow(() =>
    validateAddressInput({ firstName: "A", lastName: "B", fullAddress: "X", phoneNumber: "+20 01000000000" }),
  );
});

test("validateAddressInput rejects grossly malformed phone numbers", () => {
  expectBadRequest(() =>
    validateAddressInput({ firstName: "A", lastName: "B", fullAddress: "X", phoneNumber: "12345" }),
  );
});

test("validateCartEntry requires a hex productId and quantity in 1..999", () => {
  expectBadRequest(() => validateCartEntry({ productId: "nope", quantity: 1 }));
  expectBadRequest(() => validateCartEntry({ productId: "6a940ab7845fa9999ee6d6b1", quantity: 0 }));
  expectBadRequest(() => validateCartEntry({ productId: "6a940ab7845fa9999ee6d6b1", quantity: 1000 }));
  assert.doesNotThrow(() => validateCartEntry({ productId: "6a940ab7845fa9999ee6d6b1", quantity: 100 }));
});