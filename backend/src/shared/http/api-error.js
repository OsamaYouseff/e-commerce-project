class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.expose = options.expose !== false;
    this.details = options.details || undefined;
  }

  static badRequest(message, options = {}) {
    return new ApiError(400, message, options);
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

  /**
   * `details` is carried to the response body, so a 409 can tell the caller
   * what the server's authoritative value is (used by checkout to report the
   * real total after a stale preview).
   */
  static conflict(message, options = {}) {
    return new ApiError(409, message, options);
  }
}

module.exports = { ApiError };