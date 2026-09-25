const { getPool } = require("../../../shared/database/pool");
const { toIso } = require("../../../shared/database/mapper");

const COLUMNS =
  "id, user_id, full_address, phone_number, first_name, last_name, label, is_default, created_at, updated_at";

const clientOf = (client) => client || getPool();

const toDomain = (row) => ({
  _id: row.id,
  userId: row.user_id,
  fullAddress: row.full_address,
  phoneNumber: row.phone_number,
  firstName: row.first_name,
  lastName: row.last_name,
  label: row.label,
  isDefault: row.is_default,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const findById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM addresses WHERE id = $1`, [id]);
  return rows[0] ? toDomain(rows[0]) : null;
};

const findForUserById = async (userId, id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM addresses WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const findByUser = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC, id`,
    [userId],
  );
  return rows.map(toDomain);
};

const findDefault = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1`,
    [userId],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const countByUser = async (userId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query("SELECT count(*)::int AS total FROM addresses WHERE user_id = $1", [userId]);
  return rows[0].total;
};

const create = async (address, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `INSERT INTO addresses (id, user_id, full_address, phone_number, first_name, last_name, label, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${COLUMNS}`,
    [
      address.id,
      address.userId,
      address.fullAddress,
      address.phoneNumber,
      address.firstName,
      address.lastName,
      address.label ?? null,
      address.isDefault === true,
    ],
  );
  return toDomain(rows[0]);
};

const update = async (id, fields, client) => {
  const c = clientOf(client);
  const mapping = {
    fullAddress: "full_address",
    phoneNumber: "phone_number",
    firstName: "first_name",
    lastName: "last_name",
    label: "label",
    isDefault: "is_default",
  };
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(mapping)) {
    if (fields[key] === undefined) continue;
    values.push(fields[key]);
    sets.push(`${column} = $${values.length}`);
  }
  values.push(id);
  if (sets.length === 0) return findById(id, c);
  const { rows } = await c.query(
    `UPDATE addresses SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length} RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const setAllDefaultFalse = async (userId, exceptId, client) => {
  const c = clientOf(client);
  if (exceptId) {
    await c.query("UPDATE addresses SET is_default = false, updated_at = now() WHERE user_id = $1 AND id <> $2", [
      userId,
      exceptId,
    ]);
  } else {
    await c.query("UPDATE addresses SET is_default = false, updated_at = now() WHERE user_id = $1", [userId]);
  }
};

const setDefault = async (id, isDefault, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    "UPDATE addresses SET is_default = $1, updated_at = now() WHERE id = $2 RETURNING " + COLUMNS,
    [isDefault, id],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const findNewestOther = async (userId, exceptId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM addresses WHERE user_id = $1 AND id <> $2 ORDER BY created_at DESC, id LIMIT 1`,
    [userId, exceptId],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const findEarliestOther = async (userId, exceptId, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `SELECT ${COLUMNS} FROM addresses WHERE user_id = $1 AND id <> $2 ORDER BY created_at ASC, id LIMIT 1`,
    [userId, exceptId],
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const remove = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`DELETE FROM addresses WHERE id = $1 RETURNING ${COLUMNS}`, [id]);
  return rows[0] ? toDomain(rows[0]) : null;
};

module.exports = {
  findById,
  findForUserById,
  findByUser,
  findDefault,
  countByUser,
  create,
  update,
  setAllDefaultFalse,
  setDefault,
  findNewestOther,
  findEarliestOther,
  remove,
};