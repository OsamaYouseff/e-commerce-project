class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.expose = options.expose !== false;
    this.details = options.details || undefined;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = "You are not authenticated!") {
    return new ApiError(401, message);
  }

  static forbidden(message = "You are not allowed to do that!") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}

module.exports = { ApiError };