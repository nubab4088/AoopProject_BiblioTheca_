const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  kp: { type: Number, default: 0 },
  unlockedBooks: [{ type: String }],
  completedBooks: [{ type: String }],
  // Remove actualPoints field or keep it synced with kp
  // actualPoints field removed to prevent mismatch
}, {
  timestamps: true
});

// Pre-save hook to ensure KP consistency
userSchema.pre('save', function(next) {
  // Ensure kp is never negative
  if (this.kp < 0) {
    this.kp = 0;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
