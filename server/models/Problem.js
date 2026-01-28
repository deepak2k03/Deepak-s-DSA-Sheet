const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // The ID (1, 2, 3...)
  title: { type: String, required: true },
  link: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, default: 'arrays' }, // 'arrays', 'strings', etc.
  solutionLink: String,
  codeLink: String
});


module.exports = mongoose.model('Problem', problemSchema);