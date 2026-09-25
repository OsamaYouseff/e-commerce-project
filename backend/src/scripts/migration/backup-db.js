#!/usr/bin/env node
/**
 * Phase 7 — PostgreSQL backup helper.
 *
 * Wraps pg_dump (custom format) so a cutover can take a consistent, restorable
 * snapshot of a live DATABASE_URL before the final import.
 *
 *   DATABASE_URL="postgresql://user@/db?...&port=55432" node backup-db.js
 *   # writes backups/db-YYYY-MM-DDTHH-MM-SSZ.dump and prints the path.
 *
 * Exit 0 on success; non-zero (with the pg_dump output captured) on failure.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { parseDbUrl } = require("./db-url");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const { db, user, host, port } = parseDbUrl(url);
const backupsDir = path.join(__dirname, "backups");
fs.mkdirSync(backupsDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.join(backupsDir, `${db}-${stamp}.dump`);

const args = [
  `--host=${host}`,
  `--port=${port}`,
  `--username=${user}`,
  `--dbname=${db}`,
  "--format=custom",
  "--no-owner",
  "--no-privileges",
  `--file=${out}`,
];

try {
  execFileSync("pg_dump", args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });
  console.log(`Backup written: ${out}`);
} catch (err) {
  console.error(`pg_dump failed: ${err.stderr || err.message}`);
  process.exit(1);
}
