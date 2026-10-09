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

/**
 * Atomically decrements stock for a checkout, returning the product ids it could
 * not reserve (empty array when every line succeeded).
 *
 * The guard lives in the UPDATE, not in a prior SELECT: `stock_quantity >= $1`
 * is evaluated by PostgreSQL while the row is locked, so two concurrent
 * checkouts for the last unit cannot both pass. Reading stock and then writing
 * would leave exactly the window this closes — both readers see one unit, both
 * write, and stock goes negative. `is_deleted` is rechecked here too, because a
 * product can be disabled between the checkout read and this write.
 *
 * Lines are locked in product-id order so two multi-line checkouts holding the
 * same products in different orders cannot deadlock. Any failed line aborts the
 * caller's transaction, which rolls back the successful lines as well.
 */
const decrementStock = async (items, client) => {
  const c = clientOf(client);
  const ordered = [...items].sort((a, b) => (a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0));
  const insufficient = [];
  for (const { productId, quantity } of ordered) {
    const { rowCount } = await c.query(
      `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = now()
       WHERE id = $2 AND stock_quantity >= $1 AND is_deleted = false`,
      [quantity, productId],
    );
    if (rowCount === 0) insufficient.push(productId);
  }
  return insufficient;
};

/**
 * Returns reserved quantities to stock, the inverse of `decrementStock`.
 *
 * Used when an order is canceled or deleted while it still holds inventory. The
 * increment needs no availability guard — it cannot oversell — but lines are
 * still applied in ascending product-id order so a restore cannot deadlock
 * against a concurrent checkout holding the same products. A product that was
 * hard-deleted after the order was placed matches no row and is skipped, which
 * is correct: there is no catalog row left to restock.
 */
const restoreStock = async (items, client) => {
  const c = clientOf(client);
  const ordered = [...items]
    .filter((item) => item.productId)
    .sort((a, b) => (a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0));
  for (const { productId, quantity } of ordered) {
    await c.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = now()
       WHERE id = $2`,
      [quantity, productId],
    );
  }
};

const findById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  return rowWithItems(rows[0], await getItemRows(id, c));
};

/**
 * Same as `findById` but takes a row lock, so two concurrent status changes or
 * deletes for one order serialize. That locked read is what makes restock
 * idempotent: the second caller sees the status the first already wrote and does
 * not return the same units twice.
 */
const findByIdForUpdate = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1 FOR UPDATE`, [id]);
  if (!rows[0]) return null;
  return rowWithItems(rows[0], await getItemRows(id, c));
};

const findScopedForUpdate = async (id, userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
    [id, userId],
  );
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
  findByIdForUpdate,
  findScopedForUpdate,
  create,
  setStatus,
  deleteById,
  deleteScoped,
  findByUser,
  listPaginatedAdmin,
  searchById,
  detailedById,
  minimizedForUser,
  getProductsForCheckout,
  decrementStock,
  restoreStock,
};