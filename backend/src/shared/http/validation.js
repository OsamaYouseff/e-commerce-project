const { ApiError } = require("./api-error");
const { isObjectId } = require("../database/ids");

const HEX24 = /^[a-f0-9]{24}$/;
const LABELS = ["Home", "Work"];
const PHONE_PATTERN = /^\+?[\d\s().-]{8,20}$/;

const parsePagination = (query) => {
  const parseOr = (v) => {
    if (typeof v !== "string") return v;
    return /^\d+$/.test(v.trim()) ? parseInt(v, 10) : NaN;
  };
  const rawPage = query.page === undefined ? 1 : parseOr(query.page);
  const rawLimit = query.limit === undefined ? 10 : parseOr(query.limit);
  if (!Number.isInteger(rawPage) || rawPage < 1) {
    throw ApiError.badRequest("page must be an integer >= 1");
  }
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
    throw ApiError.badRequest("limit must be an integer between 1 and 100");
  }
  return { page: rawPage, limit: rawLimit };
};

const requireObjectId = (value, label = "id") => {
  if (typeof value !== "string" || !HEX24.test(value)) {
    throw ApiError.badRequest(`${label} must be a valid 24-character hex id`);
  }
  return value;
};

/**
 * Normalizes a numeric field that may arrive as a string.
 *
 * The admin product form keeps `e.target.value` from `type="number"` inputs, so
 * price, stock and rating reach the API as `"12.50"`. Requiring
 * `typeof === "number"` rejected every create and every price/stock edit with
 * 400 even though the values were valid. Returns `null` for anything that is not
 * a finite number so the caller can report it as a validation error.
 */
const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/**
 * Validates and returns the normalized product payload. Callers must use the
 * returned copy: it is the only place a numeric string becomes a number before
 * it reaches a query.
 */
const validateProductInput = (input, { partial = false } = {}) => {
  const errors = [];
  const price = input.price === undefined ? undefined : toNumber(input.price);
  const rating = input.rating === undefined ? undefined : toNumber(input.rating);
  const amount = input.amount === undefined ? undefined : toNumber(input.amount);

  if (partial) {
    if (input.title !== undefined && (typeof input.title !== "string" || !input.title.trim())) errors.push("title must be a non-empty string");
    if (input.desc !== undefined && (typeof input.desc !== "string" || !input.desc.trim())) errors.push("desc must be a non-empty string");
  } else {
    if (typeof input.title !== "string" || !input.title.trim()) errors.push("title is required");
    if (typeof input.desc !== "string" || !input.desc.trim()) errors.push("desc is required");
  }
  if (price !== undefined) {
    if (price === null || price < 0) errors.push("price must be a non-negative number");
  } else if (!partial) {
    errors.push("price is required");
  }
  if (rating !== undefined && input.rating !== null && input.rating !== "") {
    if (rating === null || rating < 0 || rating > 5) errors.push("rating must be a number between 0 and 5");
  }
  if (amount !== undefined) {
    if (amount === null || !Number.isInteger(amount) || amount < 0) errors.push("amount must be a non-negative integer");
  } else if (!partial) {
    errors.push("amount is required");
  }
  if (input.categories !== undefined) {
    const list = Array.isArray(input.categories) ? input.categories : typeof input.categories === "string" ? input.categories.split(",") : null;
    if (!list || list.some((c) => typeof c !== "string" || !c.trim())) errors.push("categories must be a list of strings");
  }
  if (input.isDeleted !== undefined && typeof input.isDeleted !== "boolean") errors.push("isDeleted must be a boolean");
  if (errors.length) throw ApiError.badRequest(errors.join("; "));

  const normalized = { ...input };
  if (price !== undefined) normalized.price = price;
  if (amount !== undefined) normalized.amount = amount;
  // A blank rating is the admin form's cleared field, not a request to store
  // "". The column defaults to 0, so normalize to 0 here instead of passing the
  // empty string through to a numeric column and failing with a database error.
  // An explicit null still means "leave unchanged" for a partial update.
  if (input.rating !== undefined && input.rating !== null) normalized.rating = rating ?? 0;
  return normalized;
};

const validateAddressInput = (input, { partial = false } = {}) => {
  const errors = [];
  for (const key of ["firstName", "lastName", "fullAddress", "phoneNumber"]) {
    if (partial && input[key] === undefined) continue;
    if (typeof input[key] !== "string" || !input[key].trim()) errors.push(`${key} is required`);
  }
  if (input.label !== undefined && input.label != null && !LABELS.includes(String(input.label))) {
    errors.push("label must be 'Home' or 'Work'");
  }
  if (input.phoneNumber !== undefined && input.phoneNumber && !PHONE_PATTERN.test(String(input.phoneNumber))) {
    errors.push("phoneNumber has an unsupported format");
  }
  if (errors.length) throw ApiError.badRequest(errors.join("; "));
};

const validateCartEntry = (entry) => {
  if (!entry || !isObjectId(entry.productId)) throw ApiError.badRequest("Invalid product id");
  if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) {
    throw ApiError.badRequest("quantity must be an integer between 1 and 999");
  }
};

module.exports = {
  parsePagination,
  requireObjectId,
  validateProductInput,
  validateAddressInput,
  validateCartEntry,
};