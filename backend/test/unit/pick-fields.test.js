const { test } = require("node:test");
const assert = require("node:assert/strict");

const { pickFields } = require("../../src/shared/validation/pick-fields.js");

test("pickFields keeps only allowlisted present fields", () => {
  const input = { firstname: "A", username: "b", email: "a@b.co", isAdmin: true, password: "x" };
  const out = pickFields(input, ["firstname", "lastname", "username", "email", "gender", "phone"]);
  assert.deepEqual(out, { firstname: "A", username: "b", email: "a@b.co" });
});

test("pickFields drops forbidden role/credential fields even when present", () => {
  const out = pickFields({ isAdmin: true, password: "x", passwordHistory: [], gender: "M" }, ["gender"]);
  assert.deepEqual(out, { gender: "M" });
});

test("pickFields ignores missing fields", () => {
  const out = pickFields({ phone: "01012345678" }, ["firstname", "email", "phone"]);
  assert.deepEqual(out, { phone: "01012345678" });
});

test("pickFields returns empty object when nothing matches", () => {
  assert.deepEqual(pickFields({ isAdmin: true }, ["firstname"]), {});
});