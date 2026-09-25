const { Pool } = require("pg");
const { env } = require("../../config/env");

let pool = null;

const getPool = () => {
  if (pool) return pool;

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  pool.on("error", (err) => {
    process.stderr.write(JSON.stringify({ level: "error", message: "pg pool error", error: err.message }) + "\n");
  });

  return pool;
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = { getPool, closePool };