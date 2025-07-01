const express = require('express')
const router = express.Router()
const connectDB = require('../lib/mongodb')
const Playlist = require('../models/Playlist')
const Song = require('../models/Song')

// GET /api/playlists - Get all playlists
router.get('/', async (req, res) => {
  try {
    await connectDB()
    
    // For now, fetch all playlists. Later you can add user-specific filtering
    const playlists = await Playlist.find({})
      .populate('songs.song', 'title artist duration')
      .sort({ createdAt: -1 })
      .limit(50) // Limit to prevent too much data
    
    res.json({
      success: true,
      playlists: playlists
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlists'
    })
  }
})



// GET /api/playlists/metadata - Get playlist metadata only
router.get('/metadata', async (req, res) => {
  try {
    await connectDB()
    
    // Fetch only playlist metadata without populating songs for faster loading
    const playlists = await Playlist.find({})
      .select('name description category coverImageUrl backgroundImageUrl playCount createdAt songs')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean() // Use lean for better performance
    
    // Transform data to include song count without loading actual songs
    const playlistMetadata = playlists.map(playlist => ({
      _id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      category: playlist.category,
      coverImageUrl: playlist.coverImageUrl,
      backgroundImageUrl: playlist.backgroundImageUrl,
      playCount: playlist.playCount || 0,
      songCount: playlist.songs?.length || 0,
      createdAt: playlist.createdAt
    }))
    
    res.json({
      success: true,
      playlists: playlistMetadata,
      count: playlistMetadata.length
    })
  } catch (error) {
    console.error('Error fetching playlist metadata:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlist metadata'
    })
  }
})

// GET /api/playlists/:id - Get specific playlist with songs
router.get('/:id', async (req, res) => {
  try {
    await connectDB()
    
    const { id } = req.params
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Playlist ID is required'
      })
    }
    
    // Fetch playlist with populated song details
    const playlist = await Playlist.findById(id)
      .populate({
        path: 'songs.song',
        select: 'title artist album genre duration fileUrl fileName coverImageUrl playCount likedBy tags metadata'
      })
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      })
    }
    
    // Increment play count when playlist is accessed
    playlist.playCount += 1
    playlist.lastPlayedAt = new Date()
    await playlist.save()
    
    res.json({
      success: true,
      playlist: playlist
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlist'
    })
  }
})

module.exports = router 