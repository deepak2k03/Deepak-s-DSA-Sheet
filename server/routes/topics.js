const express = require('express');
const Topic = require('../models/Topic');
const Problem = require('../models/Problem');
const { getCanonicalTopicSlug } = require('../utils/topics');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [topics, problems] = await Promise.all([
      Topic.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1, name: 1 }).lean(),
      Problem.find({ isDeleted: { $ne: true } }).select('topic').lean(),
    ]);

    const counts = problems.reduce((accumulator, problem) => {
      const slug = getCanonicalTopicSlug(problem.topic);

      if (slug) {
        accumulator[slug] = (accumulator[slug] || 0) + 1;
      }

      return accumulator;
    }, {});

    return res.json(
      topics.map((topic) => ({
        ...topic,
        problemCount: counts[topic.slug] || 0,
      })),
    );
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;