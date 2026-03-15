const express = require('express');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const POTD = require('../models/POTD');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { clearProblemsCache } = require('../utils/problemCache');
const { clearLeaderboardCache } = require('../utils/leaderboardCache');
const { getCanonicalTopicSlug, slugifyTopic } = require('../utils/topics');
const { sanitizeUser } = require('../utils/userAccess');

const router = express.Router();

router.use(auth, adminOnly);

const serializeTopic = (topic, problemCount = 0) => ({
  id: String(topic._id),
  name: topic.name,
  slug: topic.slug,
  description: topic.description,
  difficulty: topic.difficulty,
  iconKey: topic.iconKey,
  order: topic.order,
  isActive: topic.isActive,
  problemCount,
  createdAt: topic.createdAt,
  updatedAt: topic.updatedAt,
});

const serializeProblem = (problem) => ({
  id: String(problem._id),
  problemNumber: problem.id,
  title: problem.title,
  link: problem.link,
  difficulty: problem.difficulty,
  topic: problem.topic,
  solutionLink: problem.solutionLink || '',
  codeLink: problem.codeLink || '',
  createdAt: problem.createdAt,
  updatedAt: problem.updatedAt,
});

const countProblemsByTopic = (problems) =>
  problems.reduce((accumulator, problem) => {
    const slug = getCanonicalTopicSlug(problem.topic);

    if (slug) {
      accumulator[slug] = (accumulator[slug] || 0) + 1;
    }

    return accumulator;
  }, {});

router.get('/overview', async (req, res) => {
  try {
    const [users, problems, topics, todayPotd] = await Promise.all([
      User.find({}).select('role isActive solvedProblems').lean(),
      Problem.find({}).select('id title').lean(),
      Topic.find({}).lean(),
      POTD.findOne({ date: new Date().toISOString().split('T')[0] }).populate('problem').lean(),
    ]);

    const activeUsers = users.filter((user) => user.isActive !== false);
    const adminCount = activeUsers.filter((user) => user.role === 'admin').length;
    const totalSolved = users.reduce(
      (sum, user) => sum + ((user.solvedProblems || []).length || 0),
      0,
    );

    return res.json({
      stats: {
        users: users.length,
        activeUsers: activeUsers.length,
        admins: adminCount,
        problems: problems.length,
        topics: topics.length,
        totalSolved,
      },
      potd: todayPotd && todayPotd.problem
        ? {
            problemId: String(todayPotd.problem._id),
            problemNumber: todayPotd.problem.id,
            title: todayPotd.problem.title,
            date: todayPotd.date,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/topics', async (req, res) => {
  try {
    const [topics, problems] = await Promise.all([
      Topic.find({}).sort({ order: 1, name: 1 }),
      Problem.find({}).select('topic'),
    ]);

    const counts = countProblemsByTopic(problems);

    return res.json(topics.map((topic) => serializeTopic(topic, counts[topic.slug] || 0)));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/topics', async (req, res) => {
  const { name, slug, description, difficulty, iconKey, order, isActive } = req.body;

  try {
    const nextSlug = slugifyTopic(slug || name);

    if (!name || !nextSlug) {
      return res.status(400).json({ msg: 'Topic name is required' });
    }

    const existingTopic = await Topic.findOne({ slug: nextSlug });

    if (existingTopic) {
      return res.status(400).json({ msg: 'Topic slug already exists' });
    }

    const topic = await Topic.create({
      name: name.trim(),
      slug: nextSlug,
      description: (description || '').trim(),
      difficulty: difficulty || 'Medium',
      iconKey: iconKey || 'book-open',
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: isActive !== false,
    });

    return res.status(201).json(serializeTopic(topic, 0));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/topics/:topicId', async (req, res) => {
  const { name, slug, description, difficulty, iconKey, order, isActive } = req.body;

  try {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).json({ msg: 'Topic not found' });
    }

    const previousCanonicalSlug = getCanonicalTopicSlug(topic.slug || topic.name);
    const nextSlug = slugifyTopic(slug || name || topic.slug);

    if (!nextSlug) {
      return res.status(400).json({ msg: 'Valid topic slug is required' });
    }

    const conflictingTopic = await Topic.findOne({ slug: nextSlug, _id: { $ne: topic._id } });

    if (conflictingTopic) {
      return res.status(400).json({ msg: 'Topic slug already exists' });
    }

    topic.name = (name || topic.name).trim();
    topic.slug = nextSlug;
    topic.description = description !== undefined ? String(description).trim() : topic.description;
    topic.difficulty = difficulty || topic.difficulty;
    topic.iconKey = iconKey || topic.iconKey;
    topic.order = Number.isFinite(Number(order)) ? Number(order) : topic.order;
    topic.isActive = isActive !== undefined ? Boolean(isActive) : topic.isActive;

    await topic.save();

    const allProblems = await Problem.find({});
    const linkedProblemIds = allProblems
      .filter((problem) => getCanonicalTopicSlug(problem.topic) === previousCanonicalSlug)
      .map((problem) => problem._id);

    if (linkedProblemIds.length > 0) {
      await Problem.updateMany(
        { _id: { $in: linkedProblemIds } },
        { $set: { topic: topic.slug } },
      );
      clearProblemsCache();
    }

    return res.json(serializeTopic(topic, linkedProblemIds.length));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/topics/:topicId', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).json({ msg: 'Topic not found' });
    }

    const allProblems = await Problem.find({}).select('_id topic');
    const linkedProblems = allProblems.filter(
      (problem) => getCanonicalTopicSlug(problem.topic) === topic.slug,
    );

    if (linkedProblems.length > 0) {
      return res.status(400).json({ msg: 'Delete linked problems before removing this topic' });
    }

    await topic.deleteOne();
    return res.json({ msg: 'Topic deleted successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find({}).sort({ id: 1 });
    return res.json(problems.map(serializeProblem));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/problems', async (req, res) => {
  const { title, link, difficulty, topic, solutionLink, codeLink, problemNumber } = req.body;

  try {
    if (!title || !link || !topic) {
      return res.status(400).json({ msg: 'Title, link and topic are required' });
    }

    const existingTopic = await Topic.findOne({ slug: getCanonicalTopicSlug(topic) });

    if (!existingTopic) {
      return res.status(400).json({ msg: 'Select a valid topic before creating a problem' });
    }

    let nextProblemNumber = Number(problemNumber);

    if (!Number.isFinite(nextProblemNumber) || nextProblemNumber <= 0) {
      const latestProblem = await Problem.findOne({}).sort({ id: -1 }).select('id');
      nextProblemNumber = latestProblem ? latestProblem.id + 1 : 1;
    }

    const duplicate = await Problem.findOne({ id: nextProblemNumber });

    if (duplicate) {
      return res.status(400).json({ msg: 'Problem number already exists' });
    }

    const problem = await Problem.create({
      id: nextProblemNumber,
      title: title.trim(),
      link: link.trim(),
      difficulty: difficulty || 'Medium',
      topic: existingTopic.slug,
      solutionLink: (solutionLink || '').trim(),
      codeLink: (codeLink || '').trim(),
    });

    clearProblemsCache();
    return res.status(201).json(serializeProblem(problem));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/problems/:problemId', async (req, res) => {
  const { title, link, difficulty, topic, solutionLink, codeLink, problemNumber } = req.body;

  try {
    const problem = await Problem.findById(req.params.problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    if (problemNumber !== undefined && Number(problemNumber) !== problem.id) {
      const duplicate = await Problem.findOne({ id: Number(problemNumber), _id: { $ne: problem._id } });
      if (duplicate) {
        return res.status(400).json({ msg: 'Problem number already exists' });
      }
      problem.id = Number(problemNumber);
    }

    if (topic) {
      const existingTopic = await Topic.findOne({ slug: getCanonicalTopicSlug(topic) });
      if (!existingTopic) {
        return res.status(400).json({ msg: 'Select a valid topic' });
      }
      problem.topic = existingTopic.slug;
    }

    problem.title = title !== undefined ? String(title).trim() : problem.title;
    problem.link = link !== undefined ? String(link).trim() : problem.link;
    problem.difficulty = difficulty || problem.difficulty;
    problem.solutionLink = solutionLink !== undefined ? String(solutionLink).trim() : problem.solutionLink;
    problem.codeLink = codeLink !== undefined ? String(codeLink).trim() : problem.codeLink;

    await problem.save();
    clearProblemsCache();
    return res.json(serializeProblem(problem));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/problems/:problemId', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    await POTD.deleteMany({ problem: problem._id });
    await problem.deleteOne();
    clearProblemsCache();
    return res.json({ msg: 'Problem deleted successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.json(users.map((user) => sanitizeUser(user)));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.patch('/users/:userId', async (req, res) => {
  const { role, isActive } = req.body;

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const nextRole = role || user.role;
    const nextActive = isActive !== undefined ? Boolean(isActive) : user.isActive;

    if ((user.role === 'admin' && nextRole !== 'admin') || (user.role === 'admin' && !nextActive)) {
      const otherActiveAdmins = await User.countDocuments({
        _id: { $ne: user._id },
        role: 'admin',
        isActive: true,
      });

      if (otherActiveAdmins === 0) {
        return res.status(400).json({ msg: 'At least one active admin must remain on the platform' });
      }
    }

    const activeStatusChanged = user.isActive !== nextActive;
    user.role = nextRole;
    user.isActive = nextActive;
    await user.save();

    if (activeStatusChanged) {
      clearLeaderboardCache();
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/potd', async (req, res) => {
  const { problemId } = req.body;

  try {
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    await POTD.findOneAndUpdate(
      { date: today },
      { date: today, problem: problem._id },
      { upsert: true, new: true },
    );

    return res.json({
      msg: 'Problem of the day updated successfully',
      potd: {
        date: today,
        problemId: String(problem._id),
        problemNumber: problem.id,
        title: problem.title,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;