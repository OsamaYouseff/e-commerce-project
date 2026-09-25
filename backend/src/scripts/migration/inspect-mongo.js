/**
 * Read-only audit of the MongoDB source data.
 * Never mutates data and never prints hashes or PII values.
 *
 * Usage:
 *   MONGO_URL=<uri> [MONGO_DB=test] node src/scripts/migration/inspect-mongo.js
 *
 * Exits 0 on success. Output is a JSON report written to stdout (or a file
 * via --out=path).
 */
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB || "test";
const OUT = process.argv.find((a) => a.startsWith("--out="))?.split("=")[1];

if (!MONGO_URL) {
  console.error("MONGO_URL is required");
  process.exit(1);
}

const HEX24 = /^[a-f0-9]{24}$/i;

const report = {
  db: MONGO_DB,
  generatedAt: new Date().toISOString(),
  counts: {},
  users: {},
  products: {},
  addresses: {},
  carts: {},
  wishlists: {},
  orders: {},
  orphans: {},
};

async function auditUsers(db) {
  const users = await db.collection("users").find({}).toArray();
  report.counts.users = users.length;
  const bcryptHash = /^\$2[aby]\$\d{2}\$/;

  const byUsername = new Map();
  const byEmail = new Map();
  const byPhone = new Map();
  const lowerUsername = new Map();
  const lowerEmail = new Map();
  let missingRequired = 0;
  let missingTimestamps = 0;
  let invalidPasswordHash = 0;
  let adminCount = 0;

  for (const u of users) {
    byUsername.set(u.username || String(u._id), (byUsername.get(u.username || String(u._id)) || 0) + 1);
    byEmail.set(u.email || String(u._id), (byEmail.get(u.email || String(u._id)) || 0) + 1);
    byPhone.set(u.phone || String(u._id), (byPhone.get(u.phone || String(u._id)) || 0) + 1);
    const lu = String(u.username || "").toLowerCase();
    const le = String(u.email || "").toLowerCase();
    if (lu) lowerUsername.set(lu, (lowerUsername.get(lu) || 0) + 1);
    if (le) lowerEmail.set(le, (lowerEmail.get(le) || 0) + 1);

    if (!u.username || !u.email || !u.phone || !u.password) missingRequired++;
    if (!u.createdAt || !u.updatedAt) missingTimestamps++;
    if (typeof u.password !== "string" || !bcryptHash.test(u.password)) invalidPasswordHash++;
    if (u.isAdmin) adminCount++;
  }

  const dup = (map, key) =>
    [...map.entries()].filter(([, n]) => n > 1).map(([k, n]) => ({ key: String(k).slice(0, 3) + "…", count: n }));
  const dupList = (map) => [...map.entries()].filter(([, n]) => n > 1).length;

  report.users = {
    total: users.length,
    admins: adminCount,
    missingRequiredFields: missingRequired,
    missingTimestamps: missingTimestamps,
    invalidPasswordHashFormat: invalidPasswordHash,
    duplicateCounts: {
      username: dupList(byUsername),
      email: dupList(byEmail),
      phone: dupList(byPhone),
      usernameCi: dupList(lowerUsername),
      emailCi: dupList(lowerEmail),
    },
    duplicateSamples: {
      username: dup(byUsername).slice(0, 10),
      email: dup(byEmail).slice(0, 10),
      phone: dup(byPhone).slice(0, 10),
      usernameCi: dup(lowerUsername).slice(0, 10),
      emailCi: dup(lowerEmail).slice(0, 10),
    },
    idValidity: {
      invalidHex: users.filter((u) => !HEX24.test(String(u._id))).length,
    },
  };
}

async function auditProducts(db) {
  const products = await db.collection("products").find({}).toArray();
  report.counts.products = products.length;

  const titles = new Map();
  let missingRequired = 0;
  let missingTimestamps = 0;
  let deleted = 0;
  let nonStringCategories = 0;
  let categoryElemTypes = new Set();
  let invalidPrice = 0;
  let invalidAmount = 0;
  let invalidRating = 0;

  for (const p of products) {
    titles.set(p.title || String(p._id), (titles.get(p.title || String(p._id)) || 0) + 1);
    if (!p.title || !p.desc || !p.img || typeof p.price !== "number" || typeof p.amount !== "number") missingRequired++;
    if (!p.createdAt || !p.updatedAt) missingTimestamps++;
    if (p.isDeleted) deleted++;
    if (typeof p.price !== "number" || !(p.price >= 0)) invalidPrice++;
    if (typeof p.amount !== "number" || !(p.amount >= 1)) invalidAmount++;
    if (Array.isArray(p.rating)) invalidRating++;
    else if (typeof p.rating === "number" && (p.rating < 0 || p.rating > 5)) invalidRating++;

    if (p.categories !== undefined) {
      if (!Array.isArray(p.categories)) {
        nonStringCategories++;
        categoryElemTypes.add(typeof p.categories);
      } else {
        for (const c of p.categories) {
          if (typeof c !== "string") {
            nonStringCategories++;
            categoryElemTypes.add(typeof c);
          }
        }
      }
    }
  }

  const dupTitles = [...titles.entries()].filter(([, n]) => n > 1);

  report.products = {
    total: products.length,
    isDeletedTrue: deleted,
    missingRequiredFields: missingRequired,
    missingTimestamps: missingTimestamps,
    categories: {
      usersWithoutCategories: products.filter((p) => p.categories === undefined).length,
      nonStringCategoryValues: nonStringCategories,
      observedElementTypes: [...categoryElemTypes],
    },
    priceAllIntegersOrDecimals: {
      min: Math.min(...products.map((p) => (typeof p.price === "number" ? p.price : Infinity))),
      max: Math.max(...products.map((p) => (typeof p.price === "number" ? p.price : -Infinity))),
      zeroOrNegative: invalidPrice,
    },
    amount: { invalidOrBelowOne: invalidAmount },
    rating: { outOfRange: invalidRating },
    duplicateTitles: dupTitles.length,
    duplicateTitleSamples: dupTitles.slice(0, 10).map(([k, n]) => ({ title: String(k).slice(0, 25), count: n })),
    idValidity: { invalidHex: products.filter((p) => !HEX24.test(String(p._id))).length },
  };
}

async function auditAddresses(db) {
  const addresses = await db.collection("addresses").find({}).toArray();
  report.counts.addresses = addresses.length;
  const defaultPerUser = new Map();
  let missingRequired = 0;
  let invalidLabel = 0;
  let invalidUserId = 0;

  for (const a of addresses) {
    const uid = String(a.userId);
    if (!HEX24.test(uid)) invalidUserId++;
    if (!a.fullAddress || !a.phoneNumber || !a.firstName || !a.lastName) missingRequired++;
    if (a.label != null && !["Home", "Work"].includes(a.label)) invalidLabel++;
    if (a.isDefault) {
      defaultPerUser.set(uid, (defaultPerUser.get(uid) || 0) + 1);
    }
  }

  report.addresses = {
    total: addresses.length,
    missingRequiredFields: missingRequired,
    invalidUserIdHex: invalidUserId,
    invalidLabel: invalidLabel,
    usersWithMultipleDefaults: [...defaultPerUser.entries()].filter(([, n]) => n > 1).length,
  };
}

async function auditCarts(db, userIds) {
  const carts = await db.collection("carts").find({}).toArray();
  report.counts.carts = carts.length;
  const usersWithMultipleCarts = new Map();
  let invalidUserId = 0;
  let orphanUser = 0;
  let unresolvedItems = 0;
  let duplicateProductRows = 0;
  let invalidQty = 0;

  for (const c of carts) {
    const uid = String(c.userId);
    if (!HEX24.test(uid)) invalidUserId++;
    if (!userIds.has(uid)) orphanUser++;
    usersWithMultipleCarts.set(uid, (usersWithMultipleCarts.get(uid) || 0) + 1);
    const seen = new Set();
    for (const item of c.products || []) {
      if (typeof item.quantity !== "number" || item.quantity < 1) invalidQty++;
      if (seen.has(item.productId)) duplicateProductRows++;
      seen.add(item.productId);
    }
  }

  report.carts = {
    total: carts.length,
    usersWithMultipleCarts: [...usersWithMultipleCarts.entries()].filter(([, n]) => n > 1).length,
    invalidUserIdHex: invalidUserId,
    orphanUserReferences: orphanUser,
    duplicateProductRows: duplicateProductRows,
    invalidQuantities: invalidQty,
  };
}

async function auditWishlists(db, productIds) {
  const wishlists = await db.collection("wishlists").find({}).toArray();
  report.counts.wishlists = wishlists.length;
  let orphanUser = 0;
  let orphanProduct = 0;
  let duplicateProductRows = 0;
  const perUser = new Map();

  for (const w of wishlists) {
    perUser.set(String(w.userId), (perUser.get(String(w.userId)) || 0) + 1);
    const seen = new Set();
    for (const item of w.products || []) {
      if (!productIds.has(String(item.productId))) orphanProduct++;
      if (seen.has(item.productId)) duplicateProductRows++;
      seen.add(item.productId);
    }
  }

  report.wishlists = {
    total: wishlists.length,
    usersWithMultipleWishlists: [...perUser.entries()].filter(([, n]) => n > 1).length,
    orphanProductReferences: orphanProduct,
    duplicateProductRows: duplicateProductRows,
  };
}

async function auditOrders(db, productIds) {
  const orders = await db.collection("orders").find({}).toArray();
  report.counts.orders = orders.length;
  const statusCounts = {};
  const paymentCounts = {};
  let orphanProduct = 0;
  let missingItemField = 0;
  let totalMismatch = 0;
  let negativeFinancial = 0;
  let invalidLabel = 0;
  let unresolvedProductLines = 0;

  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    paymentCounts[o.paymentMethod] = (paymentCounts[o.paymentMethod] || 0) + 1;
    const f = o.financials || {};
    const vals = [f.subtotalInCents, f.discount, f.shippingCostInCents, f.totalAmountInCents];
    if (vals.some((v) => typeof v !== "number" || v < 0)) negativeFinancial++;
    const expected = f.subtotalInCents - (f.discount || 0) + f.shippingCostInCents;
    if (typeof f.totalAmountInCents === "number" && typeof expected === "number" && expected !== f.totalAmountInCents) {
      totalMismatch++;
    }
    if (o.shippingAddress) {
      const sa = o.shippingAddress;
      if (sa.label != null && !["Home", "Work"].includes(sa.label)) invalidLabel++;
    } else {
      missingItemField++;
    }
    for (const item of o.items || []) {
      if (!item.productId || !item.quantity || typeof item.priceAtOrderInCents !== "number") missingItemField++;
      if (!productIds.has(String(item.productId))) {
        orphanProduct++;
        unresolvedProductLines++;
      }
    }
  }

  report.orders = {
    total: orders.length,
    statusDistribution: statusCounts,
    paymentMethodDistribution: paymentCounts,
    productReferenceUnresolvedLines: orphanProduct,
    missingItemOrShippingField: missingItemField,
    financialsNegativeValue: negativeFinancial,
    totalDoesNotMatchSubtotalMinusDiscountPlusShipping: totalMismatch,
    invalidShippingLabel: invalidLabel,
  };
}

async function main() {
  const connection = await mongoose.createConnection(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  }).asPromise();

  const db = connection.useDb(MONGO_DB);

  const users = await db.collection("users").find({}, { _id: 1 }).toArray();
  const products = await db.collection("products").find({}, { _id: 1 }).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));
  const productIds = new Set(products.map((p) => String(p._id)));

  await auditUsers(db);
  await auditProducts(db);
  await auditAddresses(db);
  await auditCarts(db, userIds);
  await auditWishlists(db, productIds);
  await auditOrders(db, productIds);

  report.orphans = {
    cartUserOrphans: report.carts.orphanUserReferences,
    unresolvedOrderProductLines: report.orders.productReferenceUnresolvedLines,
    wishlistProductOrphans: report.wishlists.orphanProductReferences,
  };

  const json = JSON.stringify(report, null, 2);
  if (OUT) {
    require("fs").writeFileSync(OUT, json);
    console.log(`Report written to ${OUT}`);
  } else {
    console.log(json);
  }

  await connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Audit failed:", err.message);
  process.exit(1);
});