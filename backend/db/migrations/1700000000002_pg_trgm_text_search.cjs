/**
 * Fuzzy text search for catalog lookups.
 *
 * `searchByTitle` uses `title ILIKE '%term%'`. Without an index this is a
 * sequential scan; a trigram GIN index lets PostgreSQL use the index even for
 * wildcards on both ends and is case-insensitive-friendly when combined with
 * ILIKE (non-deterministic ICU collations would let ILIKE use the index
 * directly; with the default collation the index still qualifies the LIKE
 * pattern, so we keep ILIKE for semantics).
 */
exports.up = async (pgm) => {
  pgm.createExtension("pg_trgm", { ifNotExists: true });
  pgm.createIndex("products", "title", {
    name: "products_title_trgm_gin",
    method: "gin",
    opclass: "gin_trgm_ops",
  });
};

exports.down = async (pgm) => {
  pgm.dropIndex("products", "title", {
    name: "products_title_trgm_gin",
  });
  pgm.dropExtension("pg_trgm");
};