const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isPhoneValid,
  isPasswordStrong,
} = require("../../middleware/UserValidation.js");

test("isPhoneValid accepts Egyptian mobile formats", () => {
  assert.equal(isPhoneValid("01012345678"), true);
  assert.equal(isPhoneValid("01112345678"), true);
  assert.equal(isPhoneValid("01212345678"), true);
  assert.equal(isPhoneValid("01512345678"), true);
});

test("isPhoneValid rejects malformed numbers", () => {
  assert.equal(isPhoneValid("0101234567"), false); // too short
  assert.equal(isPhoneValid("010123456789"), false); // too long
  assert.equal(isPhoneValid("01112345a78"), false);
  assert.equal(isPhoneValid("01612345678"), false); // 3rd digit not in {0,1,2,5}
  assert.ok(!isPhoneValid(undefined));
  assert.ok(!isPhoneValid(null));
});

test("isEmailValid checks basic shape", () => {
  assert.equal(isEmailValid("a@b.co"), true);
  assert.equal(isEmailValid("not-an-email"), false);
  assert.ok(!isEmailValid("")); // returns falsy for empty input
});

test("isUsernameValid requires trimmed length >= 3", () => {
  assert.equal(isUsernameValid("abc"), true);
  assert.equal(isUsernameValid("ab"), false);
  assert.equal(isUsernameValid("  "), false);
});

test("isPasswordValid requires at least 8 chars", () => {
  assert.equal(isPasswordValid("12345678"), true);
  assert.equal(isPasswordValid("1234567"), false);
});

test("isPasswordStrong enforces upper/lower/number/non-alphanumeric", () => {
  assert.equal(isPasswordStrong("Ab123456!"), true);
  assert.equal(isPasswordStrong("abcdefgh"), false); // no upper/no number/no symbol
  assert.equal(isPasswordStrong("ABCDEFGH1"), false); // no lower
  assert.equal(isPasswordStrong("Abcdefgh1"), false); // no symbol
  assert.equal(isPasswordStrong("Ab1!a"), false); // too short
  assert.equal(isPasswordStrong("Ab1!aB2!aB3!aB4!aB5!aB6!aB7!aB8!"), false); // too long
});