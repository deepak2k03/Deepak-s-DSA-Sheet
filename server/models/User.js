const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ✅ CORRECT: Storing IDs as Strings prevents "1" vs 1 mismatches
  solvedProblems: [{ type: String }], 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);