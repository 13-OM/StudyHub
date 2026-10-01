/**
 * asyncHandler - wraps an async controller so we do not need
 * try/catch in every single controller function.
 *
 * Any rejected promise is forwarded to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
