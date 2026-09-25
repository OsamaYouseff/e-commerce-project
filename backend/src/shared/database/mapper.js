const { generateId } = require("./ids");

const toIso = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const fromIso = (value) => (value == null ? null : value);

/**
 * Maps optional user input to a 24-hex id for a new row; uses generateId
 * when none is supplied (defensive; callers normally pass an explicit id).
 */
const rowId = (value) => (value ? String(value) : generateId());

module.exports = { toIso, fromIso, rowId, generateId };