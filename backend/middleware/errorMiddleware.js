const ApiError = require('../utils/ApiError');

/**
 * notFound - runs when no route matched.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * errorHandler - single place where every error becomes a JSON response.
 * Format: { success: false, message: '...' , errors: [...] }
 *
 * Mongoose errors (validation, bad ObjectId, duplicate key) are converted
 * into friendly 400 responses so raw database messages never reach the user.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Invalid MongoDB ObjectId (e.g. /api/groups/abc)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format in the request';
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `Duplicate value for ${field}. Please use another one.`;
  }

  if (statusCode >= 500) {
    console.error('[SERVER ERROR]', err);
    // Never leak stack traces / driver details to clients
    message = 'Something went wrong on the server. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  });
};

module.exports = { notFound, errorHandler };
