const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../../src/shared/http/auth-middleware.js");

process.env.JWT_SEC = "test-secret";

const makeRes = () => {
  const res = { statusCode: null, body: null, nextCalled: false };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  res.next = () => {
    res.nextCalled = true;
  };
  return res;
};

const sign = (payload) => jwt.sign(payload, process.env.JWT_SEC);

test("verifyToken denies missing token with 401", () => {
  const res = makeRes();
  const called = verifyToken({ headers: {} }, res, res.next);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "You are not authenticated!" });
  assert.equal(res.nextCalled, false);
});

test("verifyToken denies malformed Authorization header with 401", () => {
  const res = makeRes();
  verifyToken({ headers: { authorization: "not-bearer-format" } }, res, res.next);
  assert.equal(res.statusCode, 401);
});

test("verifyToken denies invalid token with 403", () => {
  const res = makeRes();
  verifyToken(
    { headers: { authorization: "Bearer definitely.not.valid" } },
    res,
    res.next
  );
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Token is not valid!" });
});

test("verifyToken accepts a valid Bearer token and attaches the principal", () => {
  const req = { headers: { authorization: `Bearer ${sign({ id: "aaa", isAdmin: false })}` } };
  const res = makeRes();
  verifyToken(req, res, res.next);
  assert.equal(res.statusCode, null);
  assert.equal(res.nextCalled, true);
  assert.deepEqual(req.user, { id: "aaa", isAdmin: false });
});

test("verifyToken accepts the legacy token header", () => {
  const req = { headers: { token: sign({ id: "bbb", isAdmin: true }) } };
  const res = makeRes();
  verifyToken(req, res, res.next);
  assert.equal(res.nextCalled, true);
  assert.deepEqual(req.user, { id: "bbb", isAdmin: true });
});

test("verifyTokenAndAuthorization forbids non-owner non-admin", () => {
  const req = {
    params: { id: "other" },
    headers: { authorization: `Bearer ${sign({ id: "me", isAdmin: false })}` },
  };
  const res = makeRes();
  verifyTokenAndAuthorization(req, res, res.next);
  assert.equal(res.statusCode, 403);
  assert.equal(res.nextCalled, false);
});

test("verifyTokenAndAuthorization allows owner", () => {
  const req = {
    params: { id: "me" },
    headers: { authorization: `Bearer ${sign({ id: "me", isAdmin: false })}` },
  };
  const res = makeRes();
  verifyTokenAndAuthorization(req, res, () => {
    res.allowed = true;
  });
  assert.equal(res.allowed, true);
});

test("verifyTokenAndAuthorization allows admin", () => {
  const req = {
    params: { id: "other" },
    headers: { authorization: `Bearer ${sign({ id: "admin", isAdmin: true })}` },
  };
  const res = makeRes();
  verifyTokenAndAuthorization(req, res, () => {
    res.allowed = true;
  });
  assert.equal(res.allowed, true);
});

test("verifyTokenAndAdmin forbids non-admin", () => {
  const req = {
    headers: { authorization: `Bearer ${sign({ id: "me", isAdmin: false })}` },
  };
  const res = makeRes();
  verifyTokenAndAdmin(req, res, res.next);
  assert.equal(res.statusCode, 403);
});

test("verifyTokenAndAdmin allows admin", () => {
  const req = {
    headers: { authorization: `Bearer ${sign({ id: "admin", isAdmin: true })}` },
  };
  const res = makeRes();
  verifyTokenAndAdmin(req, res, () => {
    res.allowed = true;
  });
  assert.equal(res.allowed, true);
});