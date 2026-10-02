/**
 * PostgreSQL repository for the users module.
 * Handles bound SQL and row mapping only; no HTTP concerns.
 */
const { getPool } = require("../../../shared/database/pool");
const { toIso } = require("../../../shared/database/mapper");

const COLUMNS =
  "id, firstname, lastname, username, email, password_hash, is_admin, gender, phone, created_at, updated_at";

const PASSWORD_HISTORY_MAX = 5;

const clientOf = (client) => client || getPool();

const mapRow = async (client, row) => {
  const history = await getUserPasswordHistory(client, row.id);
  return {
    _id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    username: row.username,
    email: row.email,
    isAdmin: row.is_admin,
    gender: row.gender,
    phone: row.phone,
    password: row.password_hash,
    passwordHistory: history,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
};

const toSafeUser = (user) => {
  const { password, passwordHistory, ...safe } = user;
  return safe;
};

const getUserPasswordHistory = async (client, userId) => {
  const { rows } = await client.query(
    "SELECT password_hash FROM user_password_history WHERE user_id = $1 ORDER BY position",
    [userId],
  );
  return rows.map((r) => r.password_hash);
};

const findById = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

const findByIdForUpdate = async (id, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users WHERE id = $1 FOR UPDATE`, [id]);
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

const findByUsername = async (username, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users WHERE username = $1`, [username]);
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

const findByEmail = async (email, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users WHERE email = $1`, [email]);
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

const findByPhone = async (phone, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users WHERE phone = $1`, [phone]);
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

const create = async ({ id, firstname, lastname, username, email, gender, phone, passwordHash }, client) => {
  const c = clientOf(client);
  const { rows } = await c.query(
    `INSERT INTO users (id, firstname, lastname, username, email, password_hash, is_admin, gender, phone)
     VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
     RETURNING ${COLUMNS}`,
    [id, firstname ?? null, lastname ?? null, username, email, passwordHash, gender ?? null, phone],
  );
  return mapRow(c, rows[0]);
};

const updateFields = async (id, fields, client) => {
  const c = clientOf(client);
  const entries = Object.entries(fields);
  if (entries.length === 0) return findById(id, c);
  const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
  const values = entries.map(([, v]) => v);
  values.push(id);
  const { rows } = await c.query(
    `UPDATE users SET ${sets}, updated_at = now() WHERE id = $${entries.length + 1} RETURNING ${COLUMNS}`,
    values,
  );
  if (!rows[0]) return null;
  return mapRow(c, rows[0]);
};

/**
 * Replaces the user's password inside an existing transaction, pushing the
 * current hash into the bounded password history. The caller must have locked
 * the user row (findByIdForUpdate) and hold a transaction.
 */
const rotatePassword = async (id, newHash, current, history, client) => {
  const c = clientOf(client);
  const nextHistory = [current, ...history].slice(0, PASSWORD_HISTORY_MAX);
  await c.query("DELETE FROM user_password_history WHERE user_id = $1", [id]);
  for (let position = 0; position < nextHistory.length; position += 1) {
    await c.query(
      "INSERT INTO user_password_history (user_id, position, password_hash) VALUES ($1, $2, $3)",
      [id, position, nextHistory[position]],
    );
  }
  await c.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [newHash, id]);
  return findById(id, c);
};

const listAll = async (client) => {
  const c = clientOf(client);
  const { rows } = await c.query(`SELECT ${COLUMNS} FROM users ORDER BY created_at DESC, id`);
  const out = [];
  for (const row of rows) out.push(await mapRow(c, row));
  return out;
};

const deleteById = async (id, client) => {
  const c = clientOf(client);
  const { rowCount } = await c.query("DELETE FROM users WHERE id = $1", [id]);
  return rowCount > 0;
};

const countByValue = async (column, value, client) => {
  const c = clientOf(client);
  if (!["username", "email", "phone"].includes(column)) throw new Error(`Unsafe user column: ${column}`);
  const { rows } = await c.query(`SELECT 1 FROM users WHERE ${column} = $1 LIMIT 1`, [value]);
  return rows.length > 0;
};

const checkUsernameExists = async (username, client) => {
  const c = clientOf(client);
  const { rows } = await c.query("SELECT 1 FROM users WHERE username = $1 LIMIT 1", [username]);
  return rows.length > 0;
};

module.exports = {
  findById,
  findByIdForUpdate,
  findByUsername,
  findByEmail,
  findByPhone,
  create,
  updateFields,
  rotatePassword,
  listAll,
  deleteById,
  countByValue,
  checkUsernameExists,
  toSafeUser,
};