const { env, validateEnv } = require("./config/env");
const { logger } = require("./config/logger");

const boot = async (app) => {
  validateEnv("postgres");

  const server = app.listen(env.PORT, () => {
    logger.info("Backend server is running", {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      dataMode: "postgres",
    });
  });

  const shutdown = async (signal) => {
    logger.info("shutting down", { signal });
    server.close(async () => {
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
};

module.exports = { boot };
