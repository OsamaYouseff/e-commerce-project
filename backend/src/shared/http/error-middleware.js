const { ApiError } = require("./api-error");

const errorMiddleware = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    const body = { message: err.message };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err && (err.code === 11000 || /duplicate key/i.test(err.message || ""))) {
    return res.status(409).json({ message: "Duplicate value already exists" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "An error occurred" });
};

module.exports = { errorMiddleware };