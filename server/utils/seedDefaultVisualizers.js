const Visualizer = require('../models/Visualizer');
const defaultVisualizers = require('../data/defaultVisualizers');

const seedDefaultVisualizers = async () => {
  try {
    const visualizerCount = await Visualizer.countDocuments();
    if (visualizerCount > 0) {
      return;
    }

    await Visualizer.insertMany(defaultVisualizers);
    console.log(`Seeded ${defaultVisualizers.length} default visualizers`);
  } catch (err) {
    console.error('Failed to seed default visualizers:', err.message);
  }
};

module.exports = seedDefaultVisualizers;
