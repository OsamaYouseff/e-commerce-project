const { getPool } = require("../../../shared/database/pool");
const { toIso } = require("../../../shared/database/mapper");

const COLUMNS = "id, user_id, created_at, updated_at";

const clientOf = (client) => client || getPool();

const toDomain = (row) => ({
  _id: row.id,
  userId: row.user_id,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const getCartByUserId = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM carts WHERE user_id = $1`, [userId]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const getCartById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM carts WHERE id = $1`, [id]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const create = async ({ id, userId }, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `INSERT INTO carts (id, user_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING RETURNING ${COLUMNS}`,
    [id, userId],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const getItems = async (cartId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "SELECT product_id, quantity, position FROM cart_items WHERE cart_id = $1 ORDER BY position",
    [cartId],
  );
  return rows.map((r) => ({ productId: r.product_id, quantity: r.quantity, position: r.position }));
};

const replaceItems = async (cartId, entries, client) => {
  const c = clientOf(client);
  await c.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  for (const [index, item] of entries.entries()) {
    await c.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity, position) VALUES ($1, $2, $3, $4)",
      [cartId, item.productId, item.quantity, index],
    );
  }
  await c.query("UPDATE carts SET updated_at = now() WHERE id = $1", [cartId]);
};

const clearItems = async (cartId, client) => {
  const c = clientOf(client);
  await c.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  await c.query("UPDATE carts SET updated_at = now() WHERE id = $1", [cartId]);
};

const deleteById = async (id, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM carts WHERE id = $1", [id]);
  return rowCount > 0;
};

const deleteScoped = async (id, userId, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM carts WHERE id = $1 AND user_id = $2", [id, userId]);
  return rowCount > 0;
};

const listAll = async (client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM carts ORDER BY created_at DESC, id`);
  const out = [];
  for (const row of rows) {
    const cart = toDomain(row);
    cart.products = await getItems(row.id, c);
    out.push(cart);
  }
  return out;
};

/**
 * Returns catalog rows for the requested product ids: { _id, title, desc,
 * img, categories, size, color, price, rating } in input order.
 */
const getProductDetails = async (productIds, client) => {
  const c = clientOf(client);
  if (productIds.length === 0) return [];
  const { rows } = await c.query(
    `SELECT id, title, description, image_url, categories, size, color, price, rating
     FROM products WHERE id = ANY($1::text[])
     ORDER BY array_position($1::text[], id)`,
    [productIds],
  );
  return rows.map((r) => ({
    _id: r.id,
    title: r.title,
    desc: r.description,
    img: r.image_url,
    categories: r.categories || null,
    size: r.size,
    color: r.color,
    price: Number(r.price),
    rating: Number(r.rating),
  }));
};

const getCartByIdWithItems = async (id, client) => {
  const cart = await getCartById(id, client);
  if (!cart) return null;
  cart.products = await getItems(id, client);
  return cart;
};

const getCartByUserIdWithItems = async (userId, client) => {
  const cart = await getCartByUserId(userId, client);
  if (!cart) return null;
  cart.products = await getItems(cart._id, client);
  return cart;
};

module.exports = {
  getCartByUserId,
  getCartById,
  create,
  getItems,
  replaceItems,
  clearItems,
  deleteById,
  deleteScoped,
  listAll,
  getProductDetails,
  getCartByIdWithItems,
  getCartByUserIdWithItems,
};