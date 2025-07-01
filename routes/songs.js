const express = require('express')
const router = express.Router()
const connectDB = require('../lib/mongodb')
const Song = require('../models/Song')
const { authenticateUser, optionalAuth } = require('../middleware/auth')

// GET /api/songs - Get all songs with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    await connectDB()
    
    const { limit = 50, page = 1 } = req.query
    const query = {}
    
    
    const skip = (page - 1) * limit
    
    const songs = await Song.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean()
    
    const total = await Song.countDocuments(query)
    
    res.json({
      success: true,
      songs,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching songs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch songs'
    })
  }
})



// GET /api/songs/:id - Get specific song
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    await connectDB()
    
    const { id } = req.params
    
    const song = await Song.findById(id)
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }
    
    res.json({
      success: true,
      song
    })
  } catch (error) {
    console.error('Error fetching song:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch song'
    })
  }
})

// POST /api/songs/:id/play - Increment play count
router.post('/:id/play', optionalAuth, async (req, res) => {
  try {
    await connectDB()
    
    const { id } = req.params
    
    const song = await Song.findById(id)
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }
    
    await song.incrementPlayCount()
    
    res.json({
      success: true,
      message: 'Play count incremented',
      playCount: song.playCount
    })
  } catch (error) {
    console.error('Error incrementing play count:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to increment play count'
    })
  }
})

module.exports = router 