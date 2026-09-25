const crypto = require("crypto");

const HEX24 = /^[a-f0-9]{24}$/;

/**
 * Generates a fresh Mongo-compatible 24-char lowercase hex identifier
 * (12 random bytes), so PG rows remain addressable by the same string
 * contract that ObjectIds use today.
 */
const generateId = () => crypto.randomBytes(12).toString("hex");

const isObjectId = (value) => typeof value === "string" && HEX24.test(value);

const assertObjectId = (value, label = "id") => {
  if (!isObjectId(value)) {
    const err = new Error(`${label} must be a valid 24-character hex id`);
    err.code = "INVALID_ID";
    throw err;
  }
  return value;
};

module.exports = { generateId, isObjectId, assertObjectId, HEX24 };