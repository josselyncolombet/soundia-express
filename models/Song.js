const mongoose = require('mongoose')

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    maxlength: [200, 'Artist name cannot be more than 200 characters']
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [100, 'Genre cannot be more than 100 characters']
  },
  duration: {
    type: Number, // Duration in seconds
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 second']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  coverImageUrl: {
    type: String,
    trim: true
  },
  playCount: {
    type: Number,
    default: 0,
    min: [0, 'Play count cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }]
}, {
  timestamps: true
})

// Index for search optimization
SongSchema.index({ title: 'text', genre: 'text' })
SongSchema.index({ artist: 1})
SongSchema.index({ createdAt: -1 })
SongSchema.index({ playCount: -1 })

// Virtual for like count
SongSchema.virtual('likeCount').get(function() {
  return this.likedBy.length
})

// Method to increment play count
SongSchema.methods.incrementPlayCount = function() {
  this.playCount += 1
  return this.save()
}

// Method to toggle like by user
SongSchema.methods.toggleLike = function(userId) {
  const userIndex = this.likedBy.indexOf(userId)
  if (userIndex > -1) {
    this.likedBy.splice(userIndex, 1)
  } else {
    this.likedBy.push(userId)
  }
  return this.save()
}

// Static method to find songs by artist
SongSchema.statics.findByArtist = function(artist) {
  return this.find({ artist: new RegExp(artist, 'i') })
}

// Static method to find songs by album
SongSchema.statics.findByAlbum = function(album) {
  return this.find({ album: new RegExp(album, 'i') })
}

// Format duration helper
SongSchema.methods.getFormattedDuration = function() {
  const minutes = Math.floor(this.duration / 60)
  const seconds = this.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

module.exports = mongoose.models.Song || mongoose.model('Song', SongSchema) 