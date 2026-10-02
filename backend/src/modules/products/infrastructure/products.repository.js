const { getPool } = require("../../../shared/database/pool");
const { toIso } = require("../../../shared/database/mapper");

const COLUMNS =
  "id, title, description, image_url, categories, size, color, price, rating, stock_quantity, is_deleted, created_at, updated_at";

const clientOf = (client) => client || getPool();

const toDomain = (row) => ({
  _id: row.id,
  title: row.title,
  desc: row.description,
  img: row.image_url,
  categories: row.categories || null,
  size: row.size,
  color: row.color,
  price: Number(row.price),
  rating: Number(row.rating),
  amount: row.stock_quantity,
  isDeleted: row.is_deleted,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const findById = async (id, client, options) => {
  const c = clientOf(client);
  const includeDeleted = Boolean(options && options.includeDeleted);
  const deletedFilter = includeDeleted ? "" : " AND is_deleted = false";
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM products WHERE id = $1${deletedFilter}`, [id]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const create = async (product, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `INSERT INTO products
       (id, title, description, image_url, categories, size, color, price, rating, stock_quantity, is_deleted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${COLUMNS}`,
    [
      product.id,
      product.title,
      product.desc,
      product.img,
      product.categories ?? null,
      product.size ?? null,
      product.color ?? null,
      product.price,
      product.rating ?? 0,
      product.amount,
      product.isDeleted ?? false,
    ],
  );
  return toDomain(rows[0]);
};

const update = async (id, fields, client) => {
  const c = clientOf(client);
  const mapping = {
    title: "title",
    desc: "description",
    img: "image_url",
    categories: "categories",
    size: "size",
    color: "color",
    price: "price",
    rating: "rating",
    amount: "stock_quantity",
    isDeleted: "is_deleted",
  };
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(mapping)) {
    if (fields[key] === undefined) continue;
    values.push(fields[key]);
    sets.push(`${column} = $${values.length}`);
  }
  if (sets.length === 0) return findById(id, c);
  values.push(id);
  const { rows } = await c.query(
    `UPDATE products SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const remove = async (id, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM products WHERE id = $1", [id]);
  return rowCount > 0;
};

const setDeleted = async (id, isDeleted, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "UPDATE products SET is_deleted = $1, updated_at = now() WHERE id = $2 RETURNING " + COLUMNS,
    [isDeleted, id],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const listFiltered = async ({ categories, size, color }, client) => {
  const c = clientOf(client);
  const conds = ["is_deleted = false"];
  const values = [];
  if (categories) {
    values.push(categories);
    conds.push(`categories && $${values.length}::text[]`);
  }
  if (size) {
    values.push(size);
    conds.push(`size = $${values.length}`);
  }
  if (color) {
    values.push(color);
    conds.push(`color = $${values.length}`);
  }
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM products WHERE ${conds.join(" AND ")} ORDER BY created_at DESC, id`,
    values,
  );
  return rows.map(toDomain);
};

const listPaginated = async ({ page, limit, ascending }, client) => {
  const c = clientOf(client);
  const order = ascending ? "ASC" : "DESC";
  const offset = (page - 1) * limit;
  const [items, total] = await Promise.all([
    c.query(`SELECT ${COLUMNS} FROM products WHERE is_deleted = false ORDER BY created_at ${order}, id LIMIT $1 OFFSET $2`, [limit, offset]),
    c.query("SELECT count(*)::int AS total FROM products WHERE is_deleted = false"),
  ]);
  return { items: items.rows.map(toDomain), total: total.rows[0].total };
};

const searchByTitle = async (term, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM products WHERE is_deleted = false AND title ILIKE '%' || $1 || '%' ORDER BY created_at DESC, id`,
    [term],
  );
  return rows.map(toDomain);
};

module.exports = { findById, create, update, remove, setDeleted, listFiltered, listPaginated, searchByTitle, toDomain };