/**
 * Baseline marker migration.
 * The full relational schema lands in the next migration once Phase 3 schema
 * decisions are applied; this proves the migration pipeline end to end.
 */
exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key          text PRIMARY KEY,
      value        text NOT NULL,
      created_at   timestamptz NOT NULL DEFAULT now()
    );
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS app_meta;`);
};