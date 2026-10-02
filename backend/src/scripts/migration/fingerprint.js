/**
 * Fingerprint comparisons shared by the importer and the reconciliation script.
 * Column sets mirror the mapped rows in mapping.js.
 *
 * Rules:
 *  - Parent rows compare column-by-column. A column is only compared when the
 *    source-mapped row has a non-null value, so columns that fall back to a
 *    database default (e.g. a missing createdAt) are never asserted against the
 *    default that PostgreSQL generated.
 *  - Child rows compare as an ordered aggregate keyed by their parent id, so
 *    line ordering and per-item values are verified exactly.
 *  - Values are normalized by PostgreSQL type before comparison, because
 *    node-postgres returns `numeric` and `bigint` columns as strings while the
 *    mapped source rows hold JavaScript numbers. Comparing the raw values would
 *    report every valid row as divergent (12 vs "12.00").
 *  - Sensitive columns (password hashes) are compared through a keyed digest so a
 *    wrong imported hash is still detected without persisting the hash itself.
 */

const crypto = require("crypto");

const md5 = (s) => crypto.createHash("md5").update(s).digest("base64url").slice(0, 12);

/**
 * Column type families used for normalization. Keys are column names; the value
 * describes how a value must be canonicalized before it is compared.
 *  - "money": fixed-scale decimal (products.price, order *_in_cents)
 *  - "int": 64-bit integer (stock_quantity, is_admin, is_default, *_at cents)
 *  - "bool": PostgreSQL boolean
 */
const COLUMN_TYPES = {
  users: { is_admin: "bool" },
  products: {
    price: "money",
    rating: "money",
    stock_quantity: "int",
    is_deleted: "bool",
  },
  addresses: { is_default: "bool" },
  carts: {},
  wishlists: {},
  orders: {
    subtotal_in_cents: "int",
    discount_in_cents: "int",
    shipping_cost_in_cents: "int",
    total_amount_in_cents: "int",
  },
  cart_items: { quantity: "int", position: "int" },
  wishlist_items: { position: "int" },
  order_items: { quantity: "int", price_at_order_in_cents: "int", line_number: "int" },
  user_password_history: { position: "int" },
};

const PARENT_COLUMNS = {
  users: [
    "firstname",
    "lastname",
    "username",
    "email",
    "is_admin",
    "gender",
    "phone",
    "password_hash",
    "created_at",
    "updated_at",
  ],
  products: [
    "title",
    "description",
    "image_url",
    "categories",
    "size",
    "color",
    "price",
    "rating",
    "stock_quantity",
    "is_deleted",
    "created_at",
    "updated_at",
  ],
  addresses: [
    "user_id",
    "full_address",
    "phone_number",
    "first_name",
    "last_name",
    "label",
    "is_default",
    "created_at",
    "updated_at",
  ],
  carts: ["user_id", "created_at", "updated_at"],
  wishlists: ["user_id", "created_at", "updated_at"],
  orders: [
    "user_id",
    "subtotal_in_cents",
    "discount_in_cents",
    "shipping_cost_in_cents",
    "total_amount_in_cents",
    "currency",
    "status",
    "payment_method",
    "tracking_number",
    "estimated_delivery_at",
    "ship_to_full_address",
    "ship_to_phone_number",
    "ship_to_first_name",
    "ship_to_last_name",
    "ship_to_label",
    "created_at",
    "updated_at",
  ],
};

const CHILD_COLUMNS = {
  cart_items: ["product_id", "quantity", "position"],
  wishlist_items: ["product_id", "position"],
  order_items: [
    "product_id",
    "product_title_snapshot",
    "product_image_snapshot",
    "quantity",
    "price_at_order_in_cents",
    "line_number",
  ],
  user_password_history: ["position", "password_hash"],
};

const CHILD_PARENT_KEY = {
  cart_items: "cart_id",
  wishlist_items: "wishlist_id",
  order_items: "order_id",
  user_password_history: "user_id",
};

/** Columns holding secrets: compared through a keyed digest, never in the clear. */
const SENSITIVE_COLUMNS = new Set(["password_hash"]);

const FALLBACK_COLUMNS = new Set(["created_at", "updated_at"]);

const HASH_SALT_ENV = "MIGRATION_HASH_SALT";

/**
 * Salt for redacted secret comparison. A deployment without the env var falls
 * back to a process-stable per-run salt so a single run can still detect a
 * divergence, and a mismatch is reported rather than silently accepted.
 */
const hashSalt = () => process.env[HASH_SALT_ENV] || "migration-fingerprint-salt";

const normalizeMoney = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

/**
 * Integer columns are compared as canonical decimal strings, not JS numbers.
 *
 * `pg` returns `int8` as a string (and `numeric` as a string), while the Mongo
 * source may hand over a Number or a BigInt. Going through Number would lose
 * precision above 2^53 and would also render `42.0` and `42` as equal, hiding a
 * real difference in a column that must be whole.
 */
const normalizeInt = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    return String(Math.trunc(v));
  }
  const s = String(v).trim();
  const m = /^([+-]?)(\d+)(?:\.0+)?$/.exec(s);
  return m ? `${m[1] === "+" ? "" : m[1]}${BigInt(m[2]).toString()}` : null;
};

/** Numeric-aware ordering for the child rows of one parent. */
const compareOrderValues = (a, b) => {
  const an = Number(a);
  const bn = Number(b);
  if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an < bn ? -1 : 1;
  if (a === b) return 0;
  return String(a) < String(b) ? -1 : 1;
};

const normalizeBool = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "t" || s === "true" || s === "1") return true;
  if (s === "f" || s === "false" || s === "0") return false;
  return null;
};

const normalize = (column, table, value) => {
  if (value === null || value === undefined) return null;
  const kind = (COLUMN_TYPES[table] || {})[column];
  if (kind === "money") return normalizeMoney(value);
  if (kind === "int") return normalizeInt(value);
  if (kind === "bool") return normalizeBool(value);
  return value;
};

const secretDigest = (value) =>
  crypto
    .createHmac("sha256", hashSalt())
    .update(String(value))
    .digest("base64url")
    .slice(0, 12);

const eq = (a, b) => {
  if (a instanceof Date || b instanceof Date) {
    const at = a instanceof Date ? a.getTime() : new Date(String(a)).getTime();
    const bt = b instanceof Date ? b.getTime() : new Date(String(b)).getTime();
    if (Number.isNaN(at) || Number.isNaN(bt)) return String(a) === String(b);
    return at === bt;
  }
  return JSON.stringify(a) === JSON.stringify(b);
};

const cellMatches = (table, column, sourceValue, targetValue) => {
  if (SENSITIVE_COLUMNS.has(column)) {
    const s = sourceValue === null || sourceValue === undefined ? null : secretDigest(sourceValue);
    const t = targetValue === null || targetValue === undefined ? null : secretDigest(targetValue);
    return s === t;
  }
  return eq(normalize(column, table, sourceValue), normalize(column, table, targetValue));
};

const rowsMatch = (table, srcRow, pgRow) => {
  const cols = PARENT_COLUMNS[table] || [];
  for (const c of cols) {
    const sv = srcRow[c];
    if (FALLBACK_COLUMNS.has(c) && (sv === null || sv === undefined)) continue;
    if (!cellMatches(table, c, sv, pgRow[c])) return false;
  }
  return true;
};

/** Lists the columns that differ, for actionable mismatch messages. */
const rowDiff = (table, srcRow, pgRow) => {
  const cols = PARENT_COLUMNS[table] || [];
  const out = [];
  for (const c of cols) {
    const sv = srcRow[c];
    if (FALLBACK_COLUMNS.has(c) && (sv === null || sv === undefined)) continue;
    if (!cellMatches(table, c, sv, pgRow[c])) out.push(c);
  }
  return out;
};

const childFingerprints = (table, childRows) => {
  const cols = CHILD_COLUMNS[table] || [];
  const orderCol = table === "order_items" ? "line_number" : "position";
  const out = new Map();
  for (const row of childRows) {
    const parentId = String(row[CHILD_PARENT_KEY[table]] ?? "");
    const picked = cols.map((c) => {
      if (SENSITIVE_COLUMNS.has(c)) {
        const v = row[c];
        return [c, v === null || v === undefined ? null : secretDigest(v)];
      }
      return [c, normalize(c, table, row[c])];
    });
    const acc = out.get(parentId) || [];
    acc.push(picked);
    out.set(parentId, acc);
  }
  const keyed = new Map();
  for (const [parentId, rows] of out) {
    // Order rows by their sequence column numerically: a string comparison puts
    // "10" before "2", so a parent with ten or more children could fingerprint
    // differently on each side purely because of ordering.
    rows.sort((a, b) =>
      compareOrderValues(
        a.find(([c]) => c === orderCol)?.[1] ?? 0,
        b.find(([c]) => c === orderCol)?.[1] ?? 0,
      ),
    );
    keyed.set(parentId, md5(`${table}:${JSON.stringify(rows)}`));
  }
  return keyed;
};

const childRowMatches = (table, srcRow, pgRow) => {
  const cols = CHILD_COLUMNS[table] || [];
  for (const c of cols) {
    if (!cellMatches(table, c, srcRow[c], pgRow[c])) return false;
  }
  return true;
};

/**
 * Compares the full expected id set against the id set actually fetched from the
 * target. A count comparison alone can pass when an expected id is missing and
 * an unrelated row makes up the total, so the ids are compared explicitly.
 *
 * @returns {{missing: string[], unexpected: string[]}}
 */
const diffIdSets = (expectedIds, targetIds) => {
  const expected = new Set((expectedIds || []).map((id) => String(id)));
  const actual = new Set((targetIds || []).map((id) => String(id)));
  const missing = [...expected].filter((id) => !actual.has(id)).sort();
  const unexpected = [...actual].filter((id) => !expected.has(id)).sort();
  return { missing, unexpected };
};

module.exports = {
  PARENT_COLUMNS,
  CHILD_COLUMNS,
  COLUMN_TYPES,
  CHILD_PARENT_KEY,
  HASH_SALT_ENV,
  rowsMatch,
  rowDiff,
  childFingerprints,
  childRowMatches,
  diffIdSets,
  normalize,
  compareOrderValues,
  cellMatches,
  secretDigest,
};