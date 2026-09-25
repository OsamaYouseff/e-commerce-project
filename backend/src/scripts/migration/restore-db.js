#!/usr/bin/env node
/**
 * Phase 7 — PostgreSQL restore helper.
 *
 * Restores a custom-format dump produced by backup-db.js into the target
 * DATABASE_URL, dropping conflicting objects first (--clean --if-exists).
 * "Restore-tested backups" is a Phase 7 precondition: run this into a scratch
 * database and reconcile it before cutover.
 *
 *   DATABASE_URL="..." BACKUP=backups/db-....dump node restore-db.js
 *
 * Exit 0 on success; non-zero on failure.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { parseDbUrl } = require("./db-url");

const url = process.env.DATABASE_URL;
const backupPath = process.env.BACKUP;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!backupPath || !fs.existsSync(backupPath)) {
  console.error(`BACKUP file not found: ${backupPath}`);
  process.exit(1);
}

const { db, user, host, port } = parseDbUrl(url);
const args = [
  `--host=${host}`,
  `--port=${port}`,
  `--username=${user}`,
  `--dbname=${db}`,
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
  backupPath,
];

try {
  execFileSync("pg_restore", args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });
  console.log(`Restored ${backupPath} -> ${db}`);
} catch (err) {
  console.error(`pg_restore failed: ${err.stderr || err.message}`);
  process.exit(1);
}
