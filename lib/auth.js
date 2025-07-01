const jwt = require('jsonwebtoken')

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Generate a JWT token for a user session
 * @param {Object} sessionData - User session data
 * @returns {string} JWT token
 */
function generateToken(sessionData) {
  try {
    return jwt.sign(sessionData, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    })
  } catch (error) {
    console.error('Token generation error:', error)
    throw new Error('Failed to generate token')
  }
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token data or null if invalid
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Create user session data for JWT token
 * @param {Object} user - User object from database
 * @returns {Object} Session data
 */
function createUserSession(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000) // issued at time
  }
}

module.exports = {
  generateToken,
  verifyToken,
  createUserSession
} 