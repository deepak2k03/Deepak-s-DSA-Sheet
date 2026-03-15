const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  solvedProblems: [{ type: String }],
  solvedHistory: [
    {
      problemId: { type: String, required: true },
      solvedAt: { type: Date, default: Date.now },
    },
  ],
  role: {
    type: String,
    enum: ['user', 'moderator', 'content_manager', 'admin'],
    default: 'user',
  },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: '' },
  emailVerificationExpires: { type: Date, default: null },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 },
  tokensInvalidBefore: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);