/**
 * ApiError - a small helper class for throwing HTTP errors with a status code.
 *
 * Usage:  throw new ApiError(404, 'Study group not found');
 *
 * Using a custom error keeps controllers short and lets the central
 * error handler decide the final response format.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // expected error (not a crash)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
