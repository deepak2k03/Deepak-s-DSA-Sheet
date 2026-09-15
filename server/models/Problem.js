const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // The ID (1, 2, 3...)
  title: { type: String, required: true },
  link: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, default: 'arrays' }, // 'arrays', 'strings', etc.
  tutorialLink: String,
  solutionLink: String,
  codeLink: String,
  videoSolutionUrl: String,
  approaches: [{
    id: String,
    title: String,
    algorithm: String,
    timeComplexity: String,
    spaceComplexity: String,
    codeSnippets: [{
      language: String,
      code: String
    }]
  }],
  order: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });


module.exports = mongoose.model('Problem', problemSchema);