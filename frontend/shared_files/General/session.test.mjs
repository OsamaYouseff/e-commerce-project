/**
 * Runs with Node's built-in test runner and no bundler, because `session.mjs`
 * has no browser imports:
 *
 *   node --test frontend/shared_files/General/session.test.mjs
 *
 * The "remember me" case is the regression: a profile persisted in localStorage
 * must not count as a logged-in session once the token cookie has expired.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { isLoggedIn } from "./session.mjs";

test("a persisted localStorage profile without a token is not logged in", () => {
  assert.equal(isLoggedIn({ localInfo: "{}", sessionInfo: null, token: undefined }), false);
});

test("a sessionStorage profile without a token is not logged in", () => {
  assert.equal(isLoggedIn({ localInfo: null, sessionInfo: "{}", token: undefined }), false);
});

test("a token with neither profile store populated is not logged in", () => {
  assert.equal(isLoggedIn({ localInfo: null, sessionInfo: null, token: "jwt" }), false);
});

test("a profile with its token is logged in from either store", () => {
  assert.equal(isLoggedIn({ localInfo: "{}", sessionInfo: null, token: "jwt" }), true);
  assert.equal(isLoggedIn({ localInfo: null, sessionInfo: "{}", token: "jwt" }), true);
});

test("missing arguments are not logged in", () => {
  assert.equal(isLoggedIn(), false);
  assert.equal(isLoggedIn({}), false);
});
