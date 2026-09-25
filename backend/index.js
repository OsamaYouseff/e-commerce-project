const { createApp } = require("./src/app");
const { logger } = require("./src/config/logger");

// Export the app for serverless runtimes (Vercel @vercel/node).
const app = createApp();
module.exports = app;

// Boot the process server only when run directly (npm start).
if (require.main === module) {
  const { boot } = require("./src/server");
  boot(app).catch((err) => {
    logger.error("failed to start server", { error: err.message });
    process.exit(1);
  });
}