const mongoose = require('mongoose')

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: [100, 'Playlist name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  songs: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
  }],
  coverImageUrl: {
    type: String,
    trim: true
  },
  backgroundImageUrl: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  category: {
    type: String,
    enum: ['personal', 'mood', 'genre', 'workout', 'study', 'party', 'chill', 'favorites', 'other'],
    default: 'personal'
  },
  playCount: {
    type: Number,
    default: 0,
    min: [0, 'Play count cannot be negative']
  },
}, {
  timestamps: true
})

// Index for search and performance optimization
PlaylistSchema.index({ name: 'text', description: 'text' })

// Virtual for song count
PlaylistSchema.virtual('songCount').get(function() {
  return this.songs.length
})

// Virtual for total duration
PlaylistSchema.virtual('totalDuration').get(function() {
  return this.songs.reduce((total, item) => {
    return total + (item.song.duration || 0)
  }, 0)
})

// Method to increment play count
PlaylistSchema.methods.incrementPlayCount = function() {
  this.playCount += 1
  this.lastPlayedAt = new Date()
  return this.save()
}

// Format total duration helper
PlaylistSchema.methods.getFormattedTotalDuration = function() {
  const totalSeconds = this.totalDuration
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

module.exports = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema) 