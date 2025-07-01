const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  stripe: {
    type: String,
    trim: true
  },
  affiliateCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    default: function() {
      // Generate a unique affiliate code based on user email and random string
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
      const emailPrefix = this.email.split('@')[0].substring(0, 4).toUpperCase()
      return `${emailPrefix}${randomStr}`
    }
  },
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to add song to liked songs
UserSchema.methods.likeSong = function(songId) {
  if (!this.likedSongs.includes(songId)) {
    this.likedSongs.push(songId)
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to remove song from liked songs
UserSchema.methods.unlikeSong = function(songId) {
  this.likedSongs = this.likedSongs.filter(id => !id.equals(songId))
  return this.save()
}



// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

module.exports = mongoose.models.User || mongoose.model('User', UserSchema) 