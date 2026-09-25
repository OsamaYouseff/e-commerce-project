const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  JWT_SEC: process.env.JWT_SEC,
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  DB_SSL: process.env.DB_SSL === "true" || process.env.DB_SSL === "1",
  DATABASE_POOL_MAX: parseInt(process.env.DATABASE_POOL_MAX || "10", 10),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

const REQUIREMENTS = {
  runtime: ["JWT_SEC"],
  postgres: ["JWT_SEC", "DATABASE_URL"],
};

const validateEnv = (mode = "postgres") => {
  const missing = REQUIREMENTS[mode].filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
  return env;
};

module.exports = { env, validateEnv, REQUIREMENTS };
