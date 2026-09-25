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

const getByUserId = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM wishlists WHERE user_id = $1`, [userId]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const create = async ({ id, userId }, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `INSERT INTO wishlists (id, user_id) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [id, userId],
  );
  return toDomain(rows[0]);
};

const getItems = async (wishlistId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "SELECT product_id FROM wishlist_items WHERE wishlist_id = $1 ORDER BY position",
    [wishlistId],
  );
  return rows.map((r) => ({ productId: r.product_id }));
};

const replaceItems = async (wishlistId, productIds, client) => {
  const c = clientOf(client);
  await c.query("DELETE FROM wishlist_items WHERE wishlist_id = $1", [wishlistId]);
  for (const [index, productId] of productIds.entries()) {
    await c.query(
      "INSERT INTO wishlist_items (wishlist_id, product_id, position) VALUES ($1, $2, $3)",
      [wishlistId, productId, index],
    );
  }
  await c.query("UPDATE wishlists SET updated_at = now() WHERE id = $1", [wishlistId]);
};

const clearItems = async (wishlistId, client) => {
  const c = clientOf(client);
  await c.query("DELETE FROM wishlist_items WHERE wishlist_id = $1", [wishlistId]);
  await c.query("UPDATE wishlists SET updated_at = now() WHERE id = $1", [wishlistId]);
};

const deleteByUserId = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`DELETE FROM wishlists WHERE user_id = $1 RETURNING ${COLUMNS}`, [userId]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const listAll = async (client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM wishlists ORDER BY created_at DESC, id`);
  const out = [];
  for (const row of rows) {
    const wishlist = toDomain(row);
    wishlist.products = await getItems(row.id, c);
    out.push(wishlist);
  }
  return out;
};

const getByUserIdWithItems = async (userId, client) => {
  const wishlist = await getByUserId(userId, client);
  if (!wishlist) return null;
  wishlist.products = await getItems(wishlist._id, client);
  return wishlist;
};

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

module.exports = {
  getByUserId,
  create,
  getItems,
  replaceItems,
  clearItems,
  deleteByUserId,
  listAll,
  getByUserIdWithItems,
  getProductDetails,
};