const mongoose = require('mongoose');

const visualizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Searching',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    description: { type: String, default: '', trim: true },
    htmlPath: { type: String, required: false, default: '', trim: true },
    storageType: {
      type: String,
      enum: ['r2', 'local'],
      default: 'r2',
    },
    r2Key: { type: String, trim: true, default: '' },
    r2Bucket: { type: String, trim: true, default: '' },
    contentUrl: { type: String, trim: true, default: '' },
    fileSize: { type: Number, default: 0 },
    fileChecksum: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'unavailable',
    },
    timeComplexity: {
      best: { type: String, default: 'O(1)' },
      average: { type: String, default: 'O(n)' },
      worst: { type: String, default: 'O(n)' },
    },
    spaceComplexity: { type: String, default: 'O(1)' },
    tags: [{ type: String, trim: true }],
    keyConcepts: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visualizer', visualizerSchema);
