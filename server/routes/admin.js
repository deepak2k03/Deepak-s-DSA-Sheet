const express = require('express');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const POTD = require('../models/POTD');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { clearProblemsCache } = require('../utils/problemCache');
const { clearLeaderboardCache } = require('../utils/leaderboardCache');
const { getCanonicalTopicSlug, slugifyTopic } = require('../utils/topics');
const { sanitizeUser } = require('../utils/userAccess');
const { writeAuditLog } = require('../utils/audit');

const router = express.Router();

router.use(auth, adminOnly);

const ALLOWED_ROLES = ['user', 'moderator', 'content_manager', 'admin'];

const parsePaging = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const paginate = (items, total, page, limit) => ({
  items,
  pagination: {
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  },
});

const serializeTopic = (topic, problemCount = 0) => ({
  id: String(topic._id),
  name: topic.name,
  slug: topic.slug,
  description: topic.description,
  difficulty: topic.difficulty,
  iconKey: topic.iconKey,
  order: topic.order,
  isActive: topic.isActive,
  isDeleted: Boolean(topic.isDeleted),
  deletedAt: topic.deletedAt || null,
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
  isDeleted: Boolean(problem.isDeleted),
  deletedAt: problem.deletedAt || null,
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

const getDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getLastNDaysKeys = (days) => {
  const keys = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(getDateKey(d));
  }

  return keys;
};

router.get('/overview', async (req, res) => {
  try {
    const [users, problems, topics, todayPotd] = await Promise.all([
      User.find({}).select('role isActive solvedProblems solvedHistory createdAt').lean(),
      Problem.find({ isDeleted: { $ne: true } }).select('id title topic').lean(),
      Topic.find({ isDeleted: { $ne: true } }).lean(),
      POTD.findOne({ date: new Date().toISOString().split('T')[0] }).populate('problem').lean(),
    ]);

    const activeUsers = users.filter((user) => user.isActive !== false);
    const adminCount = activeUsers.filter((user) => user.role === 'admin').length;
    const totalSolved = users.reduce(
      (sum, user) => sum + ((user.solvedProblems || []).length || 0),
      0,
    );

    const userKeys = getLastNDaysKeys(7);
    const newUsersByDayMap = Object.fromEntries(userKeys.map((k) => [k, 0]));
    users.forEach((user) => {
      if (!user.createdAt) return;
      const key = getDateKey(user.createdAt);
      if (key in newUsersByDayMap) newUsersByDayMap[key] += 1;
    });

    const solvesByDayMap = Object.fromEntries(userKeys.map((k) => [k, 0]));
    const topicSolveCounts = {};
    const problemTopicMap = Object.fromEntries(
      problems.map((problem) => [String(problem.id), getCanonicalTopicSlug(problem.topic)]),
    );

    users.forEach((user) => {
      (user.solvedHistory || []).forEach((entry) => {
        const dayKey = getDateKey(entry.solvedAt || new Date());
        if (dayKey in solvesByDayMap) {
          solvesByDayMap[dayKey] += 1;
        }

        const topicSlug = problemTopicMap[String(entry.problemId)] || '';
        if (topicSlug) {
          topicSolveCounts[topicSlug] = (topicSolveCounts[topicSlug] || 0) + 1;
        }
      });
    });

    const topTopics = Object.entries(topicSolveCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([slug, solves]) => {
        const topic = topics.find((t) => t.slug === slug);
        return {
          slug,
          name: topic?.name || slug,
          solves,
        };
      });

    return res.json({
      stats: {
        users: users.length,
        activeUsers: activeUsers.length,
        admins: adminCount,
        problems: problems.length,
        topics: topics.length,
        totalSolved,
      },
      trends: {
        newUsersByDay: userKeys.map((k) => ({ date: k, value: newUsersByDayMap[k] || 0 })),
        solvesByDay: userKeys.map((k) => ({ date: k, value: solvesByDayMap[k] || 0 })),
        topTopics,
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
    const { page, limit, skip } = parsePaging(req.query);
    const q = (req.query.query || '').trim();
    const status = req.query.status || 'all';

    const filter = {};
    if (status === 'deleted') {
      filter.isDeleted = true;
    } else if (status === 'active') {
      filter.isDeleted = { $ne: true };
      filter.isActive = true;
    } else if (status === 'hidden') {
      filter.isDeleted = { $ne: true };
      filter.isActive = false;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }

    const [allProblems, total, topics] = await Promise.all([
      Problem.find({ isDeleted: { $ne: true } }).select('topic').lean(),
      Topic.countDocuments(filter),
      Topic.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit),
    ]);

    const counts = countProblemsByTopic(allProblems);
    const data = topics.map((topic) => serializeTopic(topic, counts[topic.slug] || 0));
    return res.json(paginate(data, total, page, limit));
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

    const existingTopic = await Topic.findOne({ slug: nextSlug, isDeleted: { $ne: true } });

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
      isDeleted: false,
      deletedAt: null,
    });

    await writeAuditLog(req, {
      action: 'admin.topic.create',
      entityType: 'topic',
      entityId: String(topic._id),
      metadata: { slug: topic.slug },
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

    const conflictingTopic = await Topic.findOne({ slug: nextSlug, _id: { $ne: topic._id }, isDeleted: { $ne: true } });

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

    const allProblems = await Problem.find({ isDeleted: { $ne: true } });
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

    await writeAuditLog(req, {
      action: 'admin.topic.update',
      entityType: 'topic',
      entityId: String(topic._id),
      metadata: { slug: topic.slug, isActive: topic.isActive },
    });

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

    topic.isDeleted = true;
    topic.isActive = false;
    topic.deletedAt = new Date();
    await topic.save();

    await writeAuditLog(req, {
      action: 'admin.topic.soft_delete',
      entityType: 'topic',
      entityId: String(topic._id),
      metadata: { slug: topic.slug },
    });

    return res.json({ msg: 'Topic archived successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/topics/:topicId/restore', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).json({ msg: 'Topic not found' });
    }

    topic.isDeleted = false;
    topic.deletedAt = null;
    topic.isActive = true;
    await topic.save();

    await writeAuditLog(req, {
      action: 'admin.topic.restore',
      entityType: 'topic',
      entityId: String(topic._id),
      metadata: { slug: topic.slug },
    });

    return res.json({ msg: 'Topic restored successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/problems', async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const q = (req.query.query || '').trim();
    const difficulty = req.query.difficulty || '';
    const topic = req.query.topic || '';
    const status = req.query.status || 'all';

    const filter = {};

    if (status === 'deleted') {
      filter.isDeleted = true;
    } else if (status === 'live') {
      filter.isDeleted = { $ne: true };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (topic) {
      filter.topic = topic;
    }

    if (q) {
      const maybeNumber = Number(q);
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        ...(Number.isFinite(maybeNumber) ? [{ id: maybeNumber }] : []),
      ];
    }

    const [total, problems] = await Promise.all([
      Problem.countDocuments(filter),
      Problem.find(filter).sort({ id: 1 }).skip(skip).limit(limit),
    ]);

    return res.json(paginate(problems.map(serializeProblem), total, page, limit));
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

    const existingTopic = await Topic.findOne({ slug: getCanonicalTopicSlug(topic), isDeleted: { $ne: true } });

    if (!existingTopic) {
      return res.status(400).json({ msg: 'Select a valid topic before creating a problem' });
    }

    let nextProblemNumber = Number(problemNumber);

    if (!Number.isFinite(nextProblemNumber) || nextProblemNumber <= 0) {
      const latestProblem = await Problem.findOne({ isDeleted: { $ne: true } }).sort({ id: -1 }).select('id');
      nextProblemNumber = latestProblem ? latestProblem.id + 1 : 1;
    }

    const duplicate = await Problem.findOne({ id: nextProblemNumber, isDeleted: { $ne: true } });

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
      isDeleted: false,
      deletedAt: null,
    });

    clearProblemsCache();

    await writeAuditLog(req, {
      action: 'admin.problem.create',
      entityType: 'problem',
      entityId: String(problem._id),
      metadata: { id: problem.id, topic: problem.topic },
    });

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
      const duplicate = await Problem.findOne({ id: Number(problemNumber), _id: { $ne: problem._id }, isDeleted: { $ne: true } });
      if (duplicate) {
        return res.status(400).json({ msg: 'Problem number already exists' });
      }
      problem.id = Number(problemNumber);
    }

    if (topic) {
      const existingTopic = await Topic.findOne({ slug: getCanonicalTopicSlug(topic), isDeleted: { $ne: true } });
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

    await writeAuditLog(req, {
      action: 'admin.problem.update',
      entityType: 'problem',
      entityId: String(problem._id),
      metadata: { id: problem.id, topic: problem.topic },
    });

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

    problem.isDeleted = true;
    problem.deletedAt = new Date();
    await problem.save();

    await POTD.deleteMany({ problem: problem._id });
    clearProblemsCache();

    await writeAuditLog(req, {
      action: 'admin.problem.soft_delete',
      entityType: 'problem',
      entityId: String(problem._id),
      metadata: { id: problem.id },
    });

    return res.json({ msg: 'Problem archived successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/problems/:problemId/restore', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    problem.isDeleted = false;
    problem.deletedAt = null;
    await problem.save();

    clearProblemsCache();

    await writeAuditLog(req, {
      action: 'admin.problem.restore',
      entityType: 'problem',
      entityId: String(problem._id),
      metadata: { id: problem.id },
    });

    return res.json({ msg: 'Problem restored successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const q = (req.query.query || '').trim();
    const role = req.query.role || '';
    const status = req.query.status || '';

    const filter = {};

    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
    }

    if (status === 'disabled') {
      filter.isActive = false;
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.json(paginate(users.map((user) => sanitizeUser(user)), total, page, limit));
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
    if (!ALLOWED_ROLES.includes(nextRole)) {
      return res.status(400).json({ msg: 'Invalid role supplied' });
    }

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

    if (activeStatusChanged && !nextActive) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      user.tokensInvalidBefore = new Date();
    }

    await user.save();

    clearLeaderboardCache();

    await writeAuditLog(req, {
      action: 'admin.user.update_access',
      entityType: 'user',
      entityId: String(user._id),
      metadata: { role: user.role, isActive: user.isActive },
    });

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/potd', async (req, res) => {
  const { problemId } = req.body;

  try {
    const problem = await Problem.findOne({ _id: problemId, isDeleted: { $ne: true } });

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    await POTD.findOneAndUpdate(
      { date: today },
      { date: today, problem: problem._id },
      { upsert: true, new: true },
    );

    await writeAuditLog(req, {
      action: 'admin.potd.set',
      entityType: 'potd',
      entityId: today,
      metadata: { problemId: String(problem._id), problemNumber: problem.id },
    });

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

router.get('/audit-logs', async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const q = (req.query.query || '').trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { action: { $regex: q, $options: 'i' } },
        { entityType: { $regex: q, $options: 'i' } },
        { actorEmail: { $regex: q, $options: 'i' } },
      ];
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return res.json(paginate(logs, total, page, limit));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
