const express = require("express");
const cors = require("cors");

const { errorMiddleware } = require("./shared/http/error-middleware");
const { logger } = require("./config/logger");
const { env } = require("./config/env");
const { getPool } = require("./shared/database/pool");

const pgRouters = {
  auth: require("./modules/auth/http/auth.router"),
  users: require("./modules/users/http/users.router"),
  products: require("./modules/products/http/products.router"),
  carts: require("./modules/carts/http/carts.router"),
  orders: require("./modules/orders/http/orders.router"),
  addresses: require("./modules/addresses/http/addresses.router"),
  wishlist: require("./modules/wishlists/http/wishlists.router"),
};

const requestLogger = (req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    logger.info("http request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });
  next();
};

const createApp = () => {
  const app = express();
  const routers = pgRouters;

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));

  if (env.CORS_ORIGIN) {
    app.use(
      cors({
        origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      })
    );
  } else {
    app.use(cors());
  }

  app.use(requestLogger);

  // Liveness: process is up
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Readiness: the active database(s) are reachable
  app.get("/api/ready", async (req, res) => {
    try {
      const pgUp = await checkPg();
      return res.status(pgUp ? 200 : 503).json({ ready: pgUp, mongo: null, postgres: pgUp });
    } catch (err) {
      return res.status(503).json({ ready: false, error: err.message });
    }
  });

  app.use("/api/auth", routers.auth);
  app.use("/api/users", routers.users);
  app.use("/api/products", routers.products);
  app.use("/api/carts", routers.carts);
  app.use("/api/orders", routers.orders);
  app.use("/api/addresses", routers.addresses);
  app.use("/api/wishlist", routers.wishlist);

  app.use(errorMiddleware);

  return app;
};

async function checkPg() {
  if (!env.DATABASE_URL) return false;
  try {
    const client = await getPool().connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    return false;
  }
}

module.exports = { createApp };