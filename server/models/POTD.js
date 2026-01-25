const mongoose = require('mongoose');

const potdSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Store as "YYYY-MM-DD"
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }
});

module.exports = mongoose.model('POTD', potdSchema);