const connectDB = require('../lib/mongodb')
const User = require('../models/User')
const { verifyToken } = require('../lib/auth')

/**
 * Middleware to authenticate user with JWT token
 * Adds user object to req.user if authentication is successful
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    
    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token'
      })
    }

    // Connect to database
    await connectDB()

    // Find user by ID
    const user = await User.findById(decoded.id)
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Add user to request object
    req.user = user
    next()

  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
}

/**
 * Optional authentication middleware
 * Adds user to req.user if token is valid, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (decoded) {
      await connectDB()
      const user = await User.findById(decoded.id)
      if (user) {
        req.user = user
      }
    }
    
    next()

  } catch (error) {
    // Log error but continue without authentication
    console.warn('Optional auth error:', error)
    next()
  }
}

module.exports = {
  authenticateUser,
  optionalAuth
} 