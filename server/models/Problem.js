const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // The ID (1, 2, 3...)
  title: { type: String, required: true },
  link: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, default: 'arrays' }, // 'arrays', 'strings', etc.
  tutorialLink: String,
  solutionLink: String,
  githubLink: String,
  videoSolutionUrl: String,
  visualizerSlug: { type: String, trim: true, default: '' },
  hasVisualizer: { type: Boolean, default: false },
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


problemSchema.index({ isDeleted: 1, order: 1, id: 1 });
problemSchema.index({ topic: 1, isDeleted: 1, order: 1 });

module.exports = mongoose.model('Problem', problemSchema);