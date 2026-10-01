const jwt = require('jsonwebtoken');

/**
 * Create a signed JSON Web Token for a logged in user.
 * The token stores only the user id -> it is sent in every API request
 * inside the "Authorization: Bearer <token>" header.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
