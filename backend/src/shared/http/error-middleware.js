const { ApiError } = require("./api-error");

const PG_ERRORS = {
  "23505": { status: 409, message: "Duplicate value already exists" },
  "23503": { status: 400, message: "Referenced record does not exist" },
  "23502": { status: 400, message: "Missing required value" },
  "23514": { status: 400, message: "Value does not satisfy the required format" },
  "22P02": { status: 400, message: "Invalid value format" },
  "22003": { status: 400, message: "Value is out of range" },
};

const errorMiddleware = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    const body = { message: err.message };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value already exists" });
  }

  if (err && typeof err.code === "string" && PG_ERRORS[err.code]) {
    return res.status(PG_ERRORS[err.code].status).json({ message: PG_ERRORS[err.code].message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "An error occurred" });
};

module.exports = { errorMiddleware };