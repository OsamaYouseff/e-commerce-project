/**
 * Pure mapping/validation layer shared by the importer and the reconciliation
 * script. No I/O: takes Mongo documents and returns normalized rows plus
 * validation/quarantine diagnostics.
 */

const HEX24 = /^[a-f0-9]{24}$/i;
const BCRYPT = /^\$2[aby]\$\d{2}\$/;
const ORDER_STATUS = ["pending", "processing", "delivered", "cancelled", "canceled"];
const LABELS = new Set(["Home", "Work"]);

const isHex24 = (v) => HEX24.test(String(v || ""));
const isBcrypt = (v) => BCRYPT.test(String(v || ""));

const mapUsers = (users) => {
  const failures = [];
  const rows = users.map((u) => {
    const id = String(u._id);
    if (!isHex24(id)) failures.push({ table: "users", id, field: "_id", detail: "not 24-hex" });
    if (!u.username || !u.email || !u.phone || typeof u.password !== "string") {
      failures.push({ table: "users", id, field: "required", detail: "missing username/email/phone/password" });
    }
    if (!isBcrypt(u.password)) failures.push({ table: "users", id, field: "password", detail: "hash format" });
    if (typeof u.isAdmin !== "boolean") failures.push({ table: "users", id, field: "isAdmin", detail: `type ${typeof u.isAdmin}` });
    return {
      id,
      firstname: u.firstname ?? null,
      lastname: u.lastname ?? null,
      username: u.username,
      email: u.email,
      password_hash: u.password,
      is_admin: u.isAdmin === true,
      gender: u.gender ?? null,
      phone: u.phone,
      created_at: u.createdAt ?? null,
      updated_at: u.updatedAt ?? null,
    };
  });
  const history = rows
    .map((r) => (r ? (users.find((u) => String(u._id) === r.id).passwordHistory || []).map((h, position) => ({ user_id: r.id, position, password_hash: h })) : []))
    .flat();
  return { rows, history, failures };
};

const mapProducts = (products) => {
  const failures = [];
  const rows = products.map((p) => {
    const id = String(p._id);
    if (!isHex24(id)) failures.push({ table: "products", id, field: "_id", detail: "not 24-hex" });
    if (!p.title || !p.desc || !p.img || typeof p.price !== "number" || typeof p.amount !== "number") {
      failures.push({ table: "products", id, field: "required", detail: "missing title/desc/img/price/amount" });
    }
    if (typeof p.price !== "number" || p.price < 0) failures.push({ table: "products", id, field: "price", detail: `invalid ${p.price}` });
    if (typeof p.rating === "number" && (p.rating < 0 || p.rating > 5)) failures.push({ table: "products", id, field: "rating", detail: `out of range ${p.rating}` });
    if (typeof p.amount !== "number" || p.amount < 0) failures.push({ table: "products", id, field: "amount", detail: `invalid ${p.amount}` });
    let categories = null;
    if (p.categories !== undefined) {
      if (!Array.isArray(p.categories)) failures.push({ table: "products", id, field: "categories", detail: "not an array" });
      else {
        categories = p.categories.map((c) => {
          if (typeof c !== "string") failures.push({ table: "products", id, field: "categories", detail: `element type ${typeof c}` });
          return String(c);
        });
      }
    }
    return {
      id,
      title: p.title,
      description: p.desc,
      image_url: p.img,
      categories,
      size: typeof p.size === "string" ? p.size : null,
      color: typeof p.color === "string" ? p.color : null,
      price: p.price,
      rating: p.rating ?? 0,
      stock_quantity: p.amount,
      is_deleted: p.isDeleted === true,
      created_at: p.createdAt ?? null,
      updated_at: p.updatedAt ?? null,
    };
  });
  return { rows, failures };
};

const mapAddresses = (addresses, userIds) => {
  const failures = [];
  const rows = addresses.map((a) => {
    const id = String(a._id);
    if (!isHex24(id)) failures.push({ table: "addresses", id, field: "_id", detail: "not 24-hex" });
    const uid = String(a.userId || "");
    if (!isHex24(uid)) failures.push({ table: "addresses", id, field: "userId", detail: "not 24-hex" });
    if (!userIds.has(uid)) failures.push({ table: "addresses", id, field: "userId", detail: "orphan user reference" });
    if (a.label != null && !LABELS.has(a.label)) failures.push({ table: "addresses", id, field: "label", detail: `unexpected ${a.label}` });
    if (!a.fullAddress || !a.phoneNumber || !a.firstName || !a.lastName) {
      failures.push({ table: "addresses", id, field: "required", detail: "missing shipping name/address/phone" });
    }
    return {
      id,
      user_id: uid,
      full_address: a.fullAddress,
      phone_number: a.phoneNumber,
      first_name: a.firstName,
      last_name: a.lastName,
      label: a.label ?? null,
      is_default: a.isDefault === true,
      created_at: a.createdAt ?? null,
      updated_at: a.updatedAt ?? null,
    };
  });
  return { rows, failures };
};

const mapCarts = (carts, userIds, productIds) => {
  const failures = [];
  const quarantined = [];
  const rows = carts.map((c) => {
    const id = String(c._id);
    if (!isHex24(id)) failures.push({ table: "carts", id, field: "_id", detail: "not 24-hex" });
    const uid = String(c.userId || "");
    if (!isHex24(uid)) failures.push({ table: "carts", id, field: "userId", detail: "not 24-hex" });
    if (!userIds.has(uid)) failures.push({ table: "carts", id, field: "userId", detail: "orphan user reference" });
    const items = [];
    for (const [position, item] of (c.products || []).entries()) {
      const pid = String(item.productId || "");
      if (typeof item.quantity !== "number" || item.quantity < 1) failures.push({ table: "cart_items", id, field: "quantity", detail: `invalid ${item.quantity}` });
      if (!productIds.has(pid)) {
        quarantined.push({ cart_id: id, product_id: pid, reason: "orphan product reference", action: "quarantine" });
        continue;
      }
      items.push({ cart_id: id, product_id: pid, quantity: item.quantity, position });
    }
    return { cart: { id, user_id: uid, created_at: c.createdAt ?? null, updated_at: c.updatedAt ?? null }, items };
  });
  return { rows, quarantined, failures };
};

const mapWishlists = (wishlists, userIds, productIds) => {
  const failures = [];
  const quarantined = [];
  const rows = wishlists.map((w) => {
    const id = String(w._id);
    if (!isHex24(id)) failures.push({ table: "wishlists", id, field: "_id", detail: "not 24-hex" });
    const uid = String(w.userId || "");
    if (!isHex24(uid)) failures.push({ table: "wishlists", id, field: "userId", detail: "not 24-hex" });
    if (!userIds.has(uid)) failures.push({ table: "wishlists", id, field: "userId", detail: "orphan user reference" });
    const items = [];
    for (const [position, item] of (w.products || []).entries()) {
      const pid = String(item.productId || "");
      if (!productIds.has(pid)) {
        quarantined.push({ wishlist_id: id, product_id: pid, reason: "orphan product reference", action: "quarantine" });
        continue;
      }
      items.push({ wishlist_id: id, product_id: pid, position });
    }
    return { wishlist: { id, user_id: uid, created_at: w.createdAt ?? null, updated_at: w.updatedAt ?? null }, items };
  });
  return { rows, quarantined, failures };
};

const mapOrders = (orders, userIds, productIds, productsById) => {
  const failures = [];
  const quarantined = [];
  const rows = orders.map((o) => {
    const id = String(o._id);
    if (!isHex24(id)) failures.push({ table: "orders", id, field: "_id", detail: "not 24-hex" });
    const uid = String(o.userId || "");
    if (!isHex24(uid)) failures.push({ table: "orders", id, field: "userId", detail: "not 24-hex" });
    if (!userIds.has(uid)) failures.push({ table: "orders", id, field: "userId", detail: "orphan user reference" });
    if (o.status != null && !ORDER_STATUS.includes(o.status)) failures.push({ table: "orders", id, field: "status", detail: `unexpected ${o.status}` });
    const f = o.financials || {};
    const subtotal = f.subtotalInCents;
    const discount = f.discount ?? 0;
    const shipping = f.shippingCostInCents ?? 0;
    const total = f.totalAmountInCents;
    const vals = [subtotal, discount, shipping, total];
    if (vals.some((v) => typeof v !== "number" || v < 0)) failures.push({ table: "orders", id, field: "financials", detail: "negative or missing" });
    const expected = subtotal - discount + shipping;
    if (typeof total === "number" && total !== expected) failures.push({ table: "orders", id, field: "financials", detail: `total ${total} != ${expected}` });
    const sa = o.shippingAddress || {};
    if (sa.label != null && !LABELS.has(sa.label)) failures.push({ table: "orders", id, field: "shippingAddress.label", detail: `unexpected ${sa.label}` });
    if (!sa.fullAddress || !sa.phoneNumber || !sa.firstName || !sa.lastName) {
      failures.push({ table: "orders", id, field: "shippingAddress", detail: "missing name/address/phone" });
    }
    const currency = typeof f.currency === "string" && f.currency.length === 3 ? f.currency : "USD";
    const items = [];
    for (const [line_number, item] of (o.items || []).entries()) {
      const pid = String(item.productId || "");
      const product = productIds.has(pid) ? productsById.get(pid) : null;
      if (!product) quarantined.push({ order_id: id, product_id: pid || null, reason: "orphan product reference", action: "quarantine" });
      if (typeof item.quantity !== "number" || item.quantity < 1) failures.push({ table: "order_items", id, field: "quantity", detail: `invalid ${item.quantity}` });
      if (typeof item.priceAtOrderInCents !== "number" || item.priceAtOrderInCents < 0) {
        failures.push({ table: "order_items", id, field: "priceAtOrderInCents", detail: `invalid ${item.priceAtOrderInCents}` });
      }
      items.push({
        order_id: id,
        line_number,
        product_id: product ? pid : null,
        product_title_snapshot: product ? product.title : null,
        product_image_snapshot: product ? product.img : null,
        quantity: item.quantity,
        price_at_order_in_cents: item.priceAtOrderInCents,
      });
    }
    return {
      order: {
        id,
        user_id: uid,
        subtotal_in_cents: subtotal,
        discount_in_cents: discount,
        shipping_cost_in_cents: shipping,
        total_amount_in_cents: total,
        currency,
        status: o.status ?? "pending",
        payment_method: o.paymentMethod,
        tracking_number: o.trackingNumber ?? null,
        estimated_delivery_at: o.estimatedDeliveryAt ?? null,
        ship_to_full_address: sa.fullAddress,
        ship_to_phone_number: sa.phoneNumber,
        ship_to_first_name: sa.firstName,
        ship_to_last_name: sa.lastName,
        ship_to_label: sa.label ?? null,
        created_at: o.createdAt ?? null,
        updated_at: o.updatedAt ?? null,
      },
      items,
    };
  });
  return { rows, quarantined, failures };
};

module.exports = {
  HEX24,
  BCRYPT,
  ORDER_STATUS,
  LABELS,
  isHex24,
  isBcrypt,
  mapUsers,
  mapProducts,
  mapAddresses,
  mapCarts,
  mapWishlists,
  mapOrders,
};