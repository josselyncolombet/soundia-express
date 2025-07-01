const express = require('express')
const router = express.Router()
const connectDB = require('../lib/mongodb')
const User = require('../models/User')
const { generateToken, createUserSession } = require('../lib/auth')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔐 Login attempt for:', email)

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password')
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    // Connect to database
    console.log('🔌 Connecting to database...')
    await connectDB()
    console.log('✅ Database connected')

    // For fake/development mode
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
      console.log('🚀 Using development mode with fake user')
      // Simulate login with demo credentials
      if (email === 'demo@soundia.com' && password === 'demo123') {
        const fakeUser = {
          _id: 'fake-user-id',
          email: 'demo@soundia.com',
          name: 'Demo User',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=1ed760&color=fff'
        }
        
        const token = generateToken(createUserSession(fakeUser))
        
        return res.json({
          message: 'Login successful',
          user: fakeUser,
          token
        })
      } else {
        return res.status(401).json({
          error: 'Invalid credentials'
        })
      }
    }

    // Find user by email
    console.log('🔍 Looking for user with email:', email)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      console.log('❌ User not found')
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    console.log('✅ User found:', user.email)

    // Check password
    console.log('🔑 Checking password...')
    const isValidPassword = await user.comparePassword(password)
    console.log('🔑 Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(createUserSession(user))

    console.log('✅ Login successful for:', user.email)

    return res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    return res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    console.log('📝 Registration attempt for:', email)

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      })
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      })
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    })

    await user.save()

    // Generate token
    const token = generateToken(createUserSession(user))

    console.log('✅ Registration successful for:', user.email)

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      })
    }

    const { verifyToken } = require('../lib/auth')
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token'
      })
    }

    await connectDB()
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    res.json({
      message: 'Token valid',
      user: user.toJSON()
    })

  } catch (error) {
    console.error('❌ Token verification error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

module.exports = router 