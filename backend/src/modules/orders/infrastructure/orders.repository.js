const { getPool } = require("../../../shared/database/pool");
const { toIso } = require("../../../shared/database/mapper");

const ORDER_COLUMNS =
  "id, user_id, subtotal_in_cents, discount_in_cents, shipping_cost_in_cents, total_amount_in_cents, currency, coupon_code, status, payment_method, tracking_number, estimated_delivery_at, ship_to_full_address, ship_to_phone_number, ship_to_first_name, ship_to_last_name, ship_to_label, request_fingerprint, created_at, updated_at";

const resultColumn =
  "o.id, o.user_id, o.subtotal_in_cents, o.discount_in_cents, o.shipping_cost_in_cents, o.total_amount_in_cents, o.currency, o.coupon_code, o.status, o.payment_method, o.tracking_number, o.estimated_delivery_at, o.ship_to_full_address, o.ship_to_phone_number, o.ship_to_first_name, o.ship_to_last_name, o.ship_to_label, o.request_fingerprint, o.created_at, o.updated_at";

const clientOf = (client) => client || getPool();

const toDomain = (row) => ({
  _id: row.id,
  userId: row.user_id,
  // Digest of the client payload that produced this order; used to reject an
  // idempotency key reused with a different cart/address.
  requestFingerprint: row.request_fingerprint ?? null,
  financials: {
    subtotalInCents: Number(row.subtotal_in_cents),
    discount: Number(row.discount_in_cents),
    shippingCostInCents: Number(row.shipping_cost_in_cents),
    totalAmountInCents: Number(row.total_amount_in_cents),
    currency: String(row.currency || "").trim(),
  },
  couponCode: row.coupon_code ?? null,
  shippingAddress: {
    fullAddress: row.ship_to_full_address,
    phoneNumber: row.ship_to_phone_number,
    firstName: row.ship_to_first_name,
    lastName: row.ship_to_last_name,
    label: row.ship_to_label,
  },
  status: row.status,
  paymentMethod: row.payment_method,
  shippingInfo: {
    trackingNumber: row.tracking_number ?? null,
    estimatedDeliveryDate: toIso(row.estimated_delivery_at),
  },
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const rowWithItems = (orderRow, itemRows) => ({
  ...toDomain(orderRow),
  items: itemRows.map((it) => ({
    productId: it.product_id,
    quantity: it.quantity,
    priceAtOrderInCents: Number(it.price_at_order_in_cents),
  })),
});

const getItemRows = async (orderId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "SELECT product_id, quantity, price_at_order_in_cents FROM order_items WHERE order_id = $1 ORDER BY line_number",
    [orderId],
  );
  return rows;
};

const getProductSnapshots = async (productIds, client) => {
  const c = clientOf(client);
  if (productIds.length === 0) return new Map();
  const { rows } = await c.query(
    "SELECT id, title, image_url FROM products WHERE id = ANY($1::text[])",
    [productIds],
  );
  return new Map(rows.map((r) => [r.id, { title: r.title, img: r.image_url }]));
};

const getProductsForCheckout = async (productIds, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "SELECT id, title, image_url, price, is_deleted FROM products WHERE id = ANY($1::text[])",
    [productIds],
  );
  return new Map(rows.map((r) => [r.id, {
    title: r.title,
    img: r.image_url,
    price: Number(r.price),
    isDeleted: r.is_deleted,
  }]));
};

const findById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  return rowWithItems(rows[0], await getItemRows(id, c));
};

const create = async ({ id, userId, body, itemRows, requestFingerprint }, client) => {
  const c = clientOf(client);
  const f = body.financials || {};
  const sa = body.shippingAddress || {};
  const si = body.shippingInfo || {};
  const { rows } = await c.query(
    `INSERT INTO orders
       (id, user_id, subtotal_in_cents, discount_in_cents, shipping_cost_in_cents, total_amount_in_cents, currency, coupon_code, status, payment_method,
        tracking_number, estimated_delivery_at, ship_to_full_address, ship_to_phone_number, ship_to_first_name, ship_to_last_name, ship_to_label, request_fingerprint)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO NOTHING
     RETURNING ${ORDER_COLUMNS}`,
    [
      id,
      userId,
      f.subtotalInCents,
      f.discount ?? 0,
      f.shippingCostInCents ?? 0,
      f.totalAmountInCents,
      f.currency ?? "USD",
      body.couponCode ?? null,
      body.status ?? "pending",
      body.paymentMethod,
      si.trackingNumber ?? null,
      si.estimatedDeliveryDate ?? null,
      sa.fullAddress,
      sa.phoneNumber,
      sa.firstName,
      sa.lastName,
      sa.label ?? null,
      requestFingerprint ?? null,
    ],
  );
  const orderRow = rows[0];
  if (!orderRow) return null;
  for (const [index, item] of itemRows.entries()) {
    await c.query(
      `INSERT INTO order_items (order_id, line_number, product_id, product_title_snapshot, product_image_snapshot, quantity, price_at_order_in_cents)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, index, item.productId, item.title ?? null, item.img ?? null, item.quantity, item.priceAtOrderInCents],
    );
  }
  return rowWithItems(orderRow, itemRows.map((it, index) => ({
    product_id: it.productId,
    quantity: it.quantity,
    price_at_order_in_cents: it.priceAtOrderInCents,
  })));
};

const update = async (id, body, client) => {
  const c = clientOf(client);
  const fields = {};
  if (body.financials) {
    const f = body.financials;
    if (f.subtotalInCents !== undefined) fields.subtotal_in_cents = f.subtotalInCents;
    if (f.discount !== undefined) fields.discount_in_cents = f.discount;
    if (f.shippingCostInCents !== undefined) fields.shipping_cost_in_cents = f.shippingCostInCents;
    if (f.totalAmountInCents !== undefined) fields.total_amount_in_cents = f.totalAmountInCents;
    if (f.currency !== undefined) fields.currency = f.currency;
  }
  if (body.shippingAddress) {
    const sa = body.shippingAddress;
    if (sa.fullAddress !== undefined) fields.ship_to_full_address = sa.fullAddress;
    if (sa.phoneNumber !== undefined) fields.ship_to_phone_number = sa.phoneNumber;
    if (sa.firstName !== undefined) fields.ship_to_first_name = sa.firstName;
    if (sa.lastName !== undefined) fields.ship_to_last_name = sa.lastName;
    if (sa.label !== undefined) fields.ship_to_label = sa.label;
  }
  if (body.shippingInfo) {
    const si = body.shippingInfo;
    if (si.trackingNumber !== undefined) fields.tracking_number = si.trackingNumber;
    if (si.estimatedDeliveryDate !== undefined) fields.estimated_delivery_at = si.estimatedDeliveryDate;
  }
  for (const key of ["userId", "status", "paymentMethod"]) {
    if (body[key] !== undefined) fields[mapField(key)] = body[key];
  }

  const entries = Object.entries(fields);
  let orderRow = null;
  if (entries.length > 0) {
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
    const values = entries.map(([, v]) => v);
    values.push(id);
    const { rows } = await c.query(
      `UPDATE orders SET ${sets}, updated_at = now() WHERE id = $${values.length} RETURNING ${ORDER_COLUMNS}`,
      values,
    );
    orderRow = rows[0] ?? null;
  } else {
    const { rows } = await c.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1`, [id]);
    orderRow = rows[0] ?? null;
  }
  if (!orderRow) return null;

  if (Array.isArray(body.items)) {
    await c.query("DELETE FROM order_items WHERE order_id = $1", [id]);
    for (const [index, item] of body.items.entries()) {
      await c.query(
        `INSERT INTO order_items (order_id, line_number, product_id, product_title_snapshot, product_image_snapshot, quantity, price_at_order_in_cents)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, index, item.productId ?? null, item.title ?? null, item.img ?? null, item.quantity, item.priceAtOrderInCents],
      );
    }
  }
  return rowWithItems(orderRow, await getItemRows(id, c));
};

const mapField = (key) => {
  const map = { userId: "user_id", status: "status", paymentMethod: "payment_method" };
  return map[key];
};

const setStatus = async (id, status, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING ${ORDER_COLUMNS}`,
    [status, id],
  );
  return rows[0] ? rowWithItems(rows[0], await getItemRows(id, c)) : null;
};

const deleteById = async (id, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM orders WHERE id = $1", [id]);
  return rowCount > 0;
};

const deleteScoped = async (id, userId, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM orders WHERE id = $1 AND user_id = $2", [id, userId]);
  return rowCount > 0;
};

const findByUser = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = $1 ORDER BY created_at DESC, id`,
    [userId],
  );
  const out = [];
  for (const row of rows) out.push(rowWithItems(row, await getItemRows(row.id, c)));
  return out;
};

const listPaginatedAdmin = async ({ page, limit, ascending }, client) => {
  const c = clientOf(client);
  const order = ascending ? "ASC" : "DESC";
  const offset = (page - 1) * limit;
  const [items, total] = await Promise.all([
    c.query(
      `SELECT o.id AS order_id, u.username, o.total_amount_in_cents, o.status, o.created_at
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at ${order}, o.id LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
    c.query("SELECT count(*)::int AS total FROM orders"),
  ]);
  return {
    items: items.rows.map((r) => ({
      _id: r.order_id,
      username: r.username,
      totalAmountInCents: Number(r.total_amount_in_cents),
      status: r.status,
      createdAt: toIso(r.created_at),
    })),
    total: total.rows[0].total,
  };
};

const searchById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT o.id AS order_id, u.username, o.total_amount_in_cents, o.status, o.created_at
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = $1 LIMIT 1`,
    [id],
  );
  if (!rows[0]) return null;
  return {
    _id: rows[0].order_id,
    username: rows[0].username,
    totalAmountInCents: Number(rows[0].total_amount_in_cents),
    status: rows[0].status,
    createdAt: toIso(rows[0].created_at),
  };
};

const detailedById = async (id, userId, client) => {
  const c = clientOf(client);
  const where = userId ? "o.id = $1 AND o.user_id = $2" : "o.id = $1";
  const params = userId ? [id, userId] : [id];
  const { rows } = await c.query(
    `SELECT ${resultColumn},
       COALESCE(json_agg(
         json_build_object(
           '_id', oi.product_id,
           'productId', oi.product_id,
           'title', COALESCE(oi.product_title_snapshot, p.title),
           'img', COALESCE(oi.product_image_snapshot, p.image_url),
           'priceAtOrderInCents', oi.price_at_order_in_cents,
           'quantity', oi.quantity
         ) ORDER BY oi.line_number
       ) FILTER (WHERE oi.line_number IS NOT NULL), '[]') AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE ${where}
     GROUP BY o.id
     LIMIT 1`,
    params,
  );
  if (!rows[0]) return null;
  const order = toDomain(rows[0]);
  order.createdAt = toIso(rows[0].created_at);
  order.items = rows[0].items;
  return order;
};

const minimizedForUser = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT o.id AS order_id, o.status, o.estimated_delivery_at,
       COALESCE(json_agg(
         json_build_object(
'_id', oi.product_id,
             'productId', oi.product_id,
             'title', COALESCE(oi.product_title_snapshot, p.title),
             'img', COALESCE(oi.product_image_snapshot, p.image_url)
         ) ORDER BY oi.line_number
       ) FILTER (WHERE oi.line_number IS NOT NULL), '[]') AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.estimated_delivery_at DESC NULLS LAST`,
    [userId],
  );
  return rows.map((r) => ({
    orderId: r.order_id,
    items: r.items,
    status: r.status,
    estimatedDeliveryDate: toIso(r.estimated_delivery_at),
  }));
};

module.exports = {
  findById,
  create,
  update,
  setStatus,
  deleteById,
  deleteScoped,
  findByUser,
  listPaginatedAdmin,
  searchById,
  detailedById,
  minimizedForUser,
  getProductSnapshots,
  getProductsForCheckout,
};