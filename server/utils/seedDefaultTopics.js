const Topic = require('../models/Topic');
const defaultTopics = require('../data/defaultTopics');

const seedDefaultTopics = async () => {
  const topicCount = await Topic.countDocuments();

  if (topicCount > 0) {
    return;
  }

  await Topic.insertMany(defaultTopics);
  console.log(`Seeded ${defaultTopics.length} default topics`);
};

module.exports = seedDefaultTopics;