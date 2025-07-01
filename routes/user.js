const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../middleware/auth')

// GET /api/user/profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    // Return user data (password is excluded by the toJSON method)
    res.json({
      success: true,
      user: req.user.toJSON()
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// PUT /api/user/profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = req.user

    // Update allowed fields
    if (name) user.name = name
    if (email) user.email = email

    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// POST /api/user/like-song/:songId
router.post('/like-song/:songId', authenticateUser, async (req, res) => {
  try {
    const { songId } = req.params
    const user = req.user

    await user.likeSong(songId)

    res.json({
      success: true,
      message: 'Song liked successfully'
    })

  } catch (error) {
    console.error('Like song error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// DELETE /api/user/like-song/:songId
router.delete('/like-song/:songId', authenticateUser, async (req, res) => {
  try {
    const { songId } = req.params
    const user = req.user

    await user.unlikeSong(songId)

    res.json({
      success: true,
      message: 'Song unliked successfully'
    })

  } catch (error) {
    console.error('Unlike song error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

module.exports = router 