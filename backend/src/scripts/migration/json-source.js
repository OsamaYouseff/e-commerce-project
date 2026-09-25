/**
 * Shared EJSON file source for the importer/reconciler when the live MongoDB is
 * unreachable. Reads mongoexport --jsonArray extended-JSON exports
 * (<db>.<collection>.json or <collection>.json) and normalizes them to plain JS
 * docs matching what the live driver returns:
 *
 *   { "$oid":  hex }            -> hex string
 *   { "$date": ISO }            -> ISO date string
 *   { "$numberInt"       ... }  -> Number
 *   { "$numberLong"      ... }  -> Number
 *   { "$numberDouble"    ... }  -> Number
 *   { "$binary", "$type" }      -> base64 payload string
 *   nested arrays/objects       -> recursed
 */

const fs = require("fs");
const path = require("path");

function decode(v) {
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === "object") {
    if (typeof v.$oid === "string") return v.$oid;
    if ("$date" in v) return String(v.$date);
    if ("$numberInt" in v) return Number(v.$numberInt);
    if ("$numberLong" in v) return Number(v.$numberLong);
    if ("$numberDouble" in v) return Number(v.$numberDouble);
    if ("$binary" in v && "$type" in v) return String(v.$binary);
    if (Object.keys(v).length === 0) return v;
    const out = {};
    for (const k of Object.keys(v)) out[k] = decode(v[k]);
    return out;
  }
  return v;
}

function loadCollection(dir, name) {
  const direct = path.join(dir, `${name}.json`);
  if (fs.existsSync(direct)) return decode(JSON.parse(fs.readFileSync(direct, "utf8")));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const hit = files.find((f) => f.endsWith(`.${name}.json`));
  if (hit) return decode(JSON.parse(fs.readFileSync(path.join(dir, hit), "utf8")));
  throw new Error(`missing ${name}.json (or <db>.${name}.json) in ${dir}`);
}

function loadBackup(dir) {
  const names = ["users", "products", "addresses", "carts", "wishlists", "orders"];
  const out = {};
  for (const name of names) out[name] = loadCollection(dir, name);
  return out;
}

module.exports = { loadCollection, loadBackup, decode };