const { getPool } = require("./pool");

/**
 * Runs `work(client)` inside a transaction using a single checked-out client.
 * The pool is released and the transaction rolled back on failure.
 *
 * Use cases that change multiple rows call this with the shared pg client;
 * repositories must not start nested transactions.
 */
const withTransaction = async (work) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // rollback failed; original error is more useful
    }
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { withTransaction };