const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false   // never returned by default
  },
  avatar: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  isPro: {
    type: Boolean,
    default: false
  },
  wishlist: [{
    gameId:    { type: Number, required: true },
    gameName:  { type: String, required: true },
    gameImage: { type: String, default: '' },
    addedAt:   { type: Date, default: Date.now }
  }],
  favorites: [{
    gameId:    { type: Number, required: true },
    gameName:  { type: String, required: true },
    gameImage: { type: String, default: '' },
    addedAt:   { type: Date, default: Date.now }
  }],
  searchHistory: [{
    query:      { type: String, required: true },
    searchedAt: { type: Date, default: Date.now }
  }],
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false }
}, { timestamps: true });

// ── Hash password before saving ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Compare password ──
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Strip password from JSON output ──
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
