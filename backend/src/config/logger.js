const { createRequire } = require("module");
const requireFromProcess = createRequire(process.cwd() + "/");

let crypto;
try {
  crypto = requireFromProcess("crypto");
} catch {
  crypto = null;
}

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const now = () => new Date().toISOString();

const serialize = (fields) => {
  const clean = { ...fields };
  const blocked = /password|hash|token|secret|jwt|authorization|card|cvv|address/i;
  for (const key of Object.keys(clean)) {
    if (blocked.test(key)) clean[key] = "[REDACTED]";
    else if (typeof clean[key] === "object" && clean[key] !== null) clean[key] = serialize(clean[key]);
  }
  return clean;
};

const log = (level, message, fields = {}) => {
  const entry = {
    level,
    time: now(),
    message,
    ...serialize(fields),
  };
  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
};

const logger = {
  debug: (message, fields) => log("debug", message, fields),
  info: (message, fields) => log("info", message, fields),
  warn: (message, fields) => log("warn", message, fields),
  error: (message, fields) => log("error", message, fields),
  LEVELS,
};

module.exports = { logger };