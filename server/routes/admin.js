const path = require('path');
const fs = require('fs');
const express = require('express');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const POTD = require('../models/POTD');
const AuditLog = require('../models/AuditLog');
const Visualizer = require('../models/Visualizer');
const VisualizerCategory = require('../models/VisualizerCategory');
const crypto = require('crypto');
const multer = require('multer');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { clearProblemsCache } = require('../utils/problemCache');
const { clearLeaderboardCache } = require('../utils/leaderboardCache');
const { getCanonicalTopicSlug, slugifyTopic } = require('../utils/topics');
const { sanitizeUser } = require('../utils/userAccess');
const { writeAuditLog } = require('../utils/audit');
const {
  isR2Configured,
  uploadToR2,
  getTextFromR2,
  deleteFromR2,
  checkR2Health,
} = require('../config/r2');


const router = express.Router();

router.use(auth, adminOnly);

const ALLOWED_ROLES = ['user', 'moderator', 'content_manager', 'admin'];

const parsePaging = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 500);
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
  tutorialLink: problem.tutorialLink || '',
  solutionLink: problem.solutionLink || '',
  githubLink: problem.githubLink || '',
  videoSolutionUrl: problem.videoSolutionUrl || '',
  approaches: problem.approaches || [],
  isDeleted: Boolean(problem.isDeleted),
  deletedAt: problem.deletedAt || null,
  createdAt: problem.createdAt,
  updatedAt: problem.updatedAt,
  order: problem.order || 0,
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
    const [users, problems, topics, todayPotd, visualizersCount] = await Promise.all([
      User.find({}).select('role isActive solvedProblems solvedHistory createdAt').lean(),
      Problem.find({ isDeleted: { $ne: true } }).select('id title topic').lean(),
      Topic.find({ isDeleted: { $ne: true } }).lean(),
      POTD.findOne({ date: new Date().toISOString().split('T')[0] }).populate('problem').lean(),
      Visualizer.countDocuments({ isDeleted: { $ne: true } }),
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
        visualizers: visualizersCount,
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

router.put('/topics/reorder', async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ msg: 'Invalid payload expected array of {id, order}' });
  }

  try {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { order: update.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await Topic.bulkWrite(bulkOps);
    }

    await writeAuditLog(req, {
      action: 'admin.topic.reorder',
      entityType: 'topic',
      entityId: 'multiple',
      metadata: { count: updates.length },
    });

    return res.json({ msg: 'Topics reordered successfully' });
  } catch (error) {
    console.error('Error reordering topics:', error);
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

router.put('/problems/reorder', async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ msg: 'Invalid payload expected array of {id, order}' });
  }

  try {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { order: update.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await Problem.bulkWrite(bulkOps);
    }

    clearProblemsCache();

    await writeAuditLog(req, {
      action: 'admin.problem.reorder',
      entityType: 'problem',
      entityId: 'multiple',
      metadata: { count: updates.length },
    });

    return res.json({ msg: 'Problems reordered successfully' });
  } catch (error) {
    console.error('Error reordering problems:', error);
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

    const conditions = [];

    if (status === 'deleted') {
      conditions.push({ isDeleted: true });
    } else if (status === 'live') {
      conditions.push({ isDeleted: { $ne: true } });
    }

    if (difficulty) {
      conditions.push({ difficulty });
    }

    if (topic) {
      const canonical = getCanonicalTopicSlug(topic);
      const regexPattern = `^(${canonical}|${canonical.replace(/-/g, '[- ]?')}|${topic})$`;
      conditions.push({
        $or: [
          { topic: { $regex: new RegExp(regexPattern, 'i') } },
          { topic: canonical },
          { topic },
          { topic: canonical.replace(/-/g, ' ') },
        ],
      });
    }

    if (q) {
      const maybeNumber = Number(q);
      conditions.push({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          ...(Number.isFinite(maybeNumber) ? [{ id: maybeNumber }] : []),
        ],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const [total, problems] = await Promise.all([
      Problem.countDocuments(filter),
      Problem.find(filter).sort({ order: 1, id: 1 }).skip(skip).limit(limit),
    ]);

    return res.json(paginate(problems.map(serializeProblem), total, page, limit));
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/problems', async (req, res) => {
  const { title, link, difficulty, topic, tutorialLink, solutionLink, githubLink, problemNumber, videoSolutionUrl, approaches, order } = req.body;

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
      const latestProblem = await Problem.findOne({}).sort({ id: -1 }).select('id');
      nextProblemNumber = latestProblem ? latestProblem.id + 1 : 1;
    }

    const duplicate = await Problem.findOne({ id: nextProblemNumber });

    if (duplicate) {
      return res.status(400).json({ msg: 'Problem number already exists' });
    }

    // Determine the problem order in the section so it is placed at the end by default
    const hasExplicitOrder = order !== undefined && order !== null && String(order).trim() !== '' && Number.isFinite(Number(order));
    let problemOrder;
    if (hasExplicitOrder) {
      problemOrder = Number(order);
    } else {
      const topicProblems = await Problem.find({
        isDeleted: { $ne: true },
      }).select('order topic');

      const maxOrder = topicProblems
        .filter((p) => getCanonicalTopicSlug(p.topic) === existingTopic.slug)
        .reduce((max, p) => (Number.isFinite(p.order) && p.order > max ? p.order : max), -1);

      problemOrder = maxOrder + 1;
    }

    const problem = await Problem.create({
      id: nextProblemNumber,
      title: title.trim(),
      link: link.trim(),
      difficulty: difficulty || 'Medium',
      topic: existingTopic.slug,
      order: problemOrder,
      tutorialLink: (tutorialLink || '').trim(),
      solutionLink: (solutionLink || '').trim(),
      githubLink: (githubLink || '').trim(),
      videoSolutionUrl: (videoSolutionUrl || '').trim(),
      approaches: Array.isArray(approaches) ? approaches : [],
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
  const { title, link, difficulty, topic, tutorialLink, solutionLink, githubLink, problemNumber, videoSolutionUrl, approaches } = req.body;

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
      const existingTopic = await Topic.findOne({ slug: getCanonicalTopicSlug(topic), isDeleted: { $ne: true } });
      if (!existingTopic) {
        return res.status(400).json({ msg: 'Select a valid topic' });
      }
      if (existingTopic.slug !== problem.topic) {
        problem.topic = existingTopic.slug;
        const hasExplicitOrder = req.body.order !== undefined && req.body.order !== null && String(req.body.order).trim() !== '' && Number.isFinite(Number(req.body.order));
        if (!hasExplicitOrder) {
          const topicProblems = await Problem.find({
            isDeleted: { $ne: true },
            _id: { $ne: problem._id },
          }).select('order topic');

          const maxOrder = topicProblems
            .filter((p) => getCanonicalTopicSlug(p.topic) === existingTopic.slug)
            .reduce((max, p) => (Number.isFinite(p.order) && p.order > max ? p.order : max), -1);

          problem.order = maxOrder + 1;
        }
      }
    }

    const hasExplicitOrder = req.body.order !== undefined && req.body.order !== null && String(req.body.order).trim() !== '' && Number.isFinite(Number(req.body.order));
    if (hasExplicitOrder) {
      problem.order = Number(req.body.order);
    }

    problem.title = title !== undefined ? String(title).trim() : problem.title;
    problem.link = link !== undefined ? String(link).trim() : problem.link;
    problem.difficulty = difficulty || problem.difficulty;
    problem.tutorialLink = tutorialLink !== undefined ? String(tutorialLink).trim() : problem.tutorialLink;
    problem.solutionLink = solutionLink !== undefined ? String(solutionLink).trim() : problem.solutionLink;
    problem.githubLink = githubLink !== undefined ? String(githubLink).trim() : problem.githubLink;
    problem.videoSolutionUrl = videoSolutionUrl !== undefined ? String(videoSolutionUrl).trim() : problem.videoSolutionUrl;
    if (approaches !== undefined) {
      problem.approaches = Array.isArray(approaches) ? approaches : problem.approaches;
    }

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

// ==========================================================
// VISUALIZER ADMIN ENDPOINTS (Cloudflare R2 + Local Fallback)
// ==========================================================

const getVisualizersDir = () => {
  const candidate1 = path.resolve(__dirname, '../../client/public/visualizers');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(process.cwd(), '../client/public/visualizers');
  if (fs.existsSync(candidate2)) return candidate2;
  return candidate1;
};

const generateSkeletonHtml = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} Visualizer</title>
  <style>
    /* ========================================================
       PASTE YOUR CUSTOM CSS / ANIMATION STYLES HERE
       ======================================================== */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0a0a0a;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    #visualizer-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <!-- ========================================================
       PASTE YOUR HTML VISUALIZATION MARKUP & CONTROLS HERE
       ======================================================== -->
  <div id="visualizer-container">
    <!-- Visualization canvas / DOM elements will mount here -->
  </div>

  <script>
    // ========================================================
    // PASTE YOUR ALGORITHM LOGIC & ANIMATION JAVASCRIPT HERE
    // ========================================================
  </script>
</body>
</html>
`;

// Multer in-memory storage: directly streams buffers to Cloudflare R2
// without storing temporary or permanent files on Render's ephemeral filesystem
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.html' && ext !== '.htm') {
      return cb(new Error('Only standalone HTML files (.html, .htm) are allowed.'));
    }
    cb(null, true);
  },
});

const handleMulterUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File size too large. Maximum allowed size is 5MB.' });
      }
      return res.status(400).json({ msg: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

const validateHtmlBuffer = (buffer) => {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Uploaded HTML file is empty.' };
  }
  const content = buffer.toString('utf8');
  const hasHtmlTag = /<html|<body|<div|<canvas|<svg|<script|<!doctype/i.test(content);
  if (!hasHtmlTag) {
    return { valid: false, error: 'The uploaded file does not appear to contain valid HTML markup.' };
  }
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  return { valid: true, checksum, content, size: buffer.length };
};

// GET /api/admin/visualizers/r2-status
router.get('/visualizers/r2-status', async (req, res) => {
  try {
    const status = await checkR2Health();
    return res.json(status);
  } catch (error) {
    console.error('Admin R2 status check error:', error);
    return res.status(500).json({ configured: false, status: 'error', message: error.message });
  }
});

// Ensure a category exists in VisualizerCategory
const ensureCategoryExists = async (categoryName) => {
  if (!categoryName || !categoryName.trim()) return;
  const trimmed = categoryName.trim();
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  try {
    const exists = await VisualizerCategory.findOne({
      $or: [{ slug }, { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }],
    });
    if (!exists) {
      const count = await VisualizerCategory.countDocuments();
      await VisualizerCategory.create({
        name: trimmed,
        slug,
        order: count + 1,
        isDefault: false,
      });
    }
  } catch (e) {
    // Ignore duplicate key race conditions
  }
};

// GET /api/admin/visualizers/categories - List all categories with algorithm counts
router.get('/visualizers/categories', async (req, res) => {
  try {
    const [dbCategories, usedVisualizers] = await Promise.all([
      VisualizerCategory.find().sort({ order: 1, name: 1 }).lean(),
      Visualizer.find({ isDeleted: false }).select('category').lean(),
    ]);

    const countMap = {};
    for (const v of usedVisualizers) {
      if (v.category) countMap[v.category] = (countMap[v.category] || 0) + 1;
    }

    const result = dbCategories.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      order: c.order || 0,
      isDefault: Boolean(c.isDefault),
      count: countMap[c.name] || 0,
    }));

    // Include any custom categories from existing visualizers not in dbCategories
    const existingNames = new Set(result.map((c) => c.name.toLowerCase()));
    for (const catName of Object.keys(countMap)) {
      if (!existingNames.has(catName.toLowerCase())) {
        result.push({
          id: catName.toLowerCase(),
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: '',
          order: 99,
          isDefault: false,
          count: countMap[catName],
        });
      }
    }

    return res.json(result);
  } catch (error) {
    console.error('Admin get categories error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// POST /api/admin/visualizers/categories - Create a new algorithm category
router.post('/visualizers/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: 'Category name is required' });
    }

    const trimmed = name.trim();
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await VisualizerCategory.findOne({
      $or: [{ slug }, { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }],
    });

    if (existing) {
      return res.status(400).json({ msg: 'A category with this name already exists' });
    }

    const count = await VisualizerCategory.countDocuments();
    const category = await VisualizerCategory.create({
      name: trimmed,
      slug,
      description: (description || '').trim(),
      order: count + 1,
      isDefault: false,
    });

    await writeAuditLog(req, {
      action: 'admin.visualizer_category.create',
      entityType: 'visualizer_category',
      entityId: String(category._id),
      metadata: { name: category.name, slug: category.slug },
    });

    return res.status(201).json({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isDefault: false,
      count: 0,
    });
  } catch (error) {
    console.error('Admin create visualizer category error:', error);
    return res.status(500).json({ msg: error.message || 'Server Error' });
  }
});

// DELETE /api/admin/visualizers/categories/:id - Delete an empty custom category
router.delete('/visualizers/categories/:id', async (req, res) => {
  try {
    const category = await VisualizerCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    const usedCount = await Visualizer.countDocuments({
      category: category.name,
      isDeleted: false,
    });

    if (usedCount > 0) {
      return res.status(400).json({
        msg: `Cannot delete "${category.name}" because it is currently used by ${usedCount} visualizer(s). Reassign them first.`,
      });
    }

    await VisualizerCategory.findByIdAndDelete(req.params.id);

    await writeAuditLog(req, {
      action: 'admin.visualizer_category.delete',
      entityType: 'visualizer_category',
      entityId: String(category._id),
      metadata: { name: category.name },
    });

    return res.json({ msg: 'Category deleted successfully' });
  } catch (error) {
    console.error('Admin delete visualizer category error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// GET /api/admin/visualizers
router.get('/visualizers', async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const q = (req.query.query || '').trim();
    const category = (req.query.category || '').trim();
    const status = (req.query.status || '').trim();

    const filter = { isDeleted: false };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [total, items, totalAll, liveCount, awaitingCount, r2Health] = await Promise.all([
      Visualizer.countDocuments(filter),
      Visualizer.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Visualizer.countDocuments({ isDeleted: false }),
      Visualizer.countDocuments({ isDeleted: false, status: 'available' }),
      Visualizer.countDocuments({ isDeleted: false, status: 'unavailable' }),
      checkR2Health(),
    ]);

    const itemsWithUrls = items.map((vis) => ({
      ...vis,
      id: String(vis._id),
      renderUrl: `/api/visualizers/render/${vis.slug}`,
    }));

    const result = paginate(itemsWithUrls, total, page, limit);
    result.stats = {
      total: totalAll,
      live: liveCount,
      awaiting: awaitingCount,
    };
    result.r2 = r2Health;


    return res.json(result);
  } catch (error) {
    console.error('Admin get visualizers error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// Shared handler for visualizer creation (supports both JSON and multipart with file)
const createVisualizerHandler = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      category,
      difficulty,
      description,
      timeComplexity,
      timeBest,
      timeAverage,
      timeWorst,
      spaceComplexity,
      tags,
      keyConcepts,
      status,
      order,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: 'Visualizer name is required' });
    }

    const slug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Visualizer.findOne({ slug });
    if (existing && !existing.isDeleted) {
      return res.status(400).json({ msg: 'A visualizer with this slug already exists' });
    }

    let parsedTimeComplexity = { best: 'O(1)', average: 'O(n)', worst: 'O(n)' };
    if (typeof timeComplexity === 'string') {
      try {
        parsedTimeComplexity = { ...parsedTimeComplexity, ...JSON.parse(timeComplexity) };
      } catch (e) {
        // Not a JSON string
      }
    } else if (typeof timeComplexity === 'object' && timeComplexity !== null) {
      parsedTimeComplexity = { ...parsedTimeComplexity, ...timeComplexity };
    }
    if (timeBest) parsedTimeComplexity.best = timeBest.trim();
    if (timeAverage) parsedTimeComplexity.average = timeAverage.trim();
    if (timeWorst) parsedTimeComplexity.worst = timeWorst.trim();

    let parsedTags = [];
    if (typeof tags === 'string') {
      try {
        const jsonParsed = JSON.parse(tags);
        if (Array.isArray(jsonParsed)) parsedTags = jsonParsed;
        else parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      } catch (e) {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    let parsedKeyConcepts = [];
    if (typeof keyConcepts === 'string') {
      try {
        const jsonParsed = JSON.parse(keyConcepts);
        if (Array.isArray(jsonParsed)) parsedKeyConcepts = jsonParsed;
        else parsedKeyConcepts = keyConcepts.split('\n').map((c) => c.trim()).filter(Boolean);
      } catch (e) {
        parsedKeyConcepts = keyConcepts.split('\n').map((c) => c.trim()).filter(Boolean);
      }
    } else if (Array.isArray(keyConcepts)) {
      parsedKeyConcepts = keyConcepts;
    }

    const htmlFileName = `${slug}.html`;
    const htmlPath = `/visualizers/${htmlFileName}`;

    let storageType = 'r2';
    let r2Key = '';
    let r2Bucket = '';
    let fileSize = 0;
    let fileChecksum = '';
    let originalFileName = '';

    // Handle uploaded file if present
    if (req.file) {
      originalFileName = req.file.originalname || '';
      const validation = validateHtmlBuffer(req.file.buffer);
      if (!validation.valid) {
        return res.status(400).json({ msg: validation.error });
      }

      fileSize = req.file.size;
      fileChecksum = validation.checksum;

      if (isR2Configured()) {
        r2Key = `visualizers/${slug}-${Date.now()}.html`;
        r2Bucket = process.env.R2_BUCKET_NAME || '';
        await uploadToR2({
          key: r2Key,
          body: req.file.buffer,
          contentType: 'text/html; charset=utf-8',
        });
        storageType = 'r2';
      } else {
        // Fallback to local file when R2 credentials are not yet supplied
        const targetDir = getVisualizersDir();
        const localPath = path.join(targetDir, htmlFileName);
        fs.writeFileSync(localPath, req.file.buffer);
        storageType = 'local';
      }
    } else {
      // No file uploaded: generate valid HTML skeleton
      const skeletonHtml = generateSkeletonHtml(name.trim());
      const skeletonBuffer = Buffer.from(skeletonHtml, 'utf8');
      fileSize = skeletonBuffer.length;
      fileChecksum = crypto.createHash('sha256').update(skeletonBuffer).digest('hex');

      if (isR2Configured()) {
        r2Key = `visualizers/${slug}-${Date.now()}.html`;
        r2Bucket = process.env.R2_BUCKET_NAME || '';
        await uploadToR2({
          key: r2Key,
          body: skeletonBuffer,
          contentType: 'text/html; charset=utf-8',
        });
        storageType = 'r2';
      } else {
        const targetDir = getVisualizersDir();
        const localPath = path.join(targetDir, htmlFileName);
        if (!fs.existsSync(localPath)) {
          fs.writeFileSync(localPath, skeletonHtml, 'utf8');
        }
        storageType = 'local';
      }
    }

    const finalCategory = (category || 'Searching').trim();
    await ensureCategoryExists(finalCategory);

    const payload = {
      name: name.trim(),
      slug,
      category: finalCategory,
      difficulty: difficulty || 'Medium',
      description: (description || '').trim(),
      htmlPath,
      storageType,
      r2Key,
      r2Bucket,
      originalFileName,
      fileSize,
      fileChecksum,
      status: status || 'unavailable',
      timeComplexity: parsedTimeComplexity,
      spaceComplexity: (spaceComplexity || 'O(1)').trim(),
      tags: parsedTags,
      keyConcepts: parsedKeyConcepts,
      order: Number(order) || 0,
      isDeleted: false,
      deletedAt: null,
    };

    let visualizer;
    if (existing && existing.isDeleted) {
      visualizer = await Visualizer.findByIdAndUpdate(existing._id, payload, { new: true });
    } else {
      visualizer = await Visualizer.create(payload);
    }

    await writeAuditLog(req, {
      action: 'admin.visualizer.create',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: {
        slug,
        name: visualizer.name,
        storageType: visualizer.storageType,
        r2Key: visualizer.r2Key,
      },
    });

    const responseData = visualizer.toObject();
    responseData.id = String(visualizer._id);
    responseData.renderUrl = `/api/visualizers/render/${visualizer.slug}`;

    return res.status(201).json(responseData);
  } catch (error) {
    console.error('Admin create visualizer error:', error);
    return res.status(500).json({ msg: error.message || 'Server Error' });
  }
};

// POST /api/admin/visualizers & POST /api/admin/visualizers/upload
router.post('/visualizers', handleMulterUpload, createVisualizerHandler);
router.post('/visualizers/upload', handleMulterUpload, createVisualizerHandler);

// PUT /api/admin/visualizers/:id/upload - Re-upload / replace standalone HTML animation in R2
router.put('/visualizers/:id/upload', handleMulterUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ msg: 'Please select an HTML animation file to upload.' });
    }

    const validation = validateHtmlBuffer(req.file.buffer);
    if (!validation.valid) {
      return res.status(400).json({ msg: validation.error });
    }

    const visualizer = await Visualizer.findById(id);
    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    // Clean up previous R2 object if exists
    if (visualizer.r2Key) {
      try {
        await deleteFromR2({ key: visualizer.r2Key });
      } catch (delError) {
        console.warn(`Could not delete previous R2 key ${visualizer.r2Key}:`, delError.message);
      }
    }

    if (isR2Configured()) {
      const newKey = `visualizers/${visualizer.slug}-${Date.now()}.html`;
      await uploadToR2({
        key: newKey,
        body: req.file.buffer,
        contentType: 'text/html; charset=utf-8',
      });

      visualizer.storageType = 'r2';
      visualizer.r2Key = newKey;
      visualizer.r2Bucket = process.env.R2_BUCKET_NAME || '';
      visualizer.originalFileName = req.file.originalname || '';
      visualizer.fileSize = req.file.size;
      visualizer.fileChecksum = validation.checksum;
    } else {
      // Local fallback
      const targetDir = getVisualizersDir();
      const localPath = path.join(targetDir, `${visualizer.slug}.html`);
      fs.writeFileSync(localPath, req.file.buffer);

      visualizer.storageType = 'local';
      visualizer.originalFileName = req.file.originalname || '';
      visualizer.fileSize = req.file.size;
      visualizer.fileChecksum = validation.checksum;
    }

    await visualizer.save();

    await writeAuditLog(req, {
      action: 'admin.visualizer.file_replace',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: {
        slug: visualizer.slug,
        originalFileName: visualizer.originalFileName,
        storageType: visualizer.storageType,
        r2Key: visualizer.r2Key,
        fileSize: visualizer.fileSize,
      },
    });

    const responseData = visualizer.toObject();
    responseData.id = String(visualizer._id);
    responseData.renderUrl = `/api/visualizers/render/${visualizer.slug}`;

    return res.json({
      msg: 'HTML animation uploaded successfully',
      visualizer: responseData,
    });
  } catch (error) {
    console.error('Admin upload visualizer error:', error);
    return res.status(500).json({ msg: error.message || 'Server Error' });
  }
});

// PUT /api/admin/visualizers/:id - Update metadata
router.put('/visualizers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      difficulty,
      description,
      timeComplexity,
      spaceComplexity,
      tags,
      keyConcepts,
      status,
      order,
      isActive,
    } = req.body;

    const visualizer = await Visualizer.findById(id);
    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    if (name) visualizer.name = name.trim();
    if (category) {
      const finalCategory = category.trim();
      visualizer.category = finalCategory;
      await ensureCategoryExists(finalCategory);
    }
    if (difficulty) visualizer.difficulty = difficulty;
    if (description !== undefined) visualizer.description = description.trim();
    if (status) visualizer.status = status;
    if (order !== undefined) visualizer.order = Number(order) || 0;
    if (isActive !== undefined) visualizer.isActive = Boolean(isActive);

    if (timeComplexity) {
      visualizer.timeComplexity = {
        best: timeComplexity.best !== undefined ? timeComplexity.best.trim() : visualizer.timeComplexity.best,
        average: timeComplexity.average !== undefined ? timeComplexity.average.trim() : visualizer.timeComplexity.average,
        worst: timeComplexity.worst !== undefined ? timeComplexity.worst.trim() : visualizer.timeComplexity.worst,
      };
    }
    if (spaceComplexity !== undefined) visualizer.spaceComplexity = spaceComplexity.trim();
    if (tags !== undefined) {
      visualizer.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (keyConcepts !== undefined) {
      visualizer.keyConcepts = Array.isArray(keyConcepts) ? keyConcepts : keyConcepts.split('\n').map((c) => c.trim()).filter(Boolean);
    }

    await visualizer.save();

    await writeAuditLog(req, {
      action: 'admin.visualizer.update',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: { slug: visualizer.slug, name: visualizer.name },
    });

    const responseData = visualizer.toObject();
    responseData.id = String(visualizer._id);
    responseData.renderUrl = `/api/visualizers/render/${visualizer.slug}`;

    return res.json(responseData);
  } catch (error) {
    console.error('Admin update visualizer error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// PATCH /api/admin/visualizers/:id/status
router.patch('/visualizers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be available or unavailable' });
    }

    const visualizer = await Visualizer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    await writeAuditLog(req, {
      action: 'admin.visualizer.status_toggle',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: { slug: visualizer.slug, status },
    });

    const responseData = visualizer.toObject();
    responseData.id = String(visualizer._id);
    responseData.renderUrl = `/api/visualizers/render/${visualizer.slug}`;

    return res.json(responseData);
  } catch (error) {
    console.error('Admin toggle visualizer status error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// GET /api/admin/visualizers/:id/code
router.get('/visualizers/:id/code', async (req, res) => {
  try {
    const visualizer = await Visualizer.findById(req.params.id);
    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    let content = '';

    // If stored in R2, fetch live string from Cloudflare R2
    if (visualizer.storageType === 'r2' && visualizer.r2Key && isR2Configured()) {
      try {
        content = await getTextFromR2({ key: visualizer.r2Key });
        return res.json({
          code: content,
          fileName: path.basename(visualizer.r2Key),
          filePath: visualizer.r2Key,
          storageType: 'r2',
        });
      } catch (r2Err) {
        console.warn('R2 read failed, falling back to local file:', r2Err.message);
      }
    }

    // Local file fallback
    const targetDir = getVisualizersDir();
    const fileName = path.basename(visualizer.htmlPath || `${visualizer.slug}.html`);
    const filePath = path.join(targetDir, fileName);

    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      content = generateSkeletonHtml(visualizer.name);
    }

    return res.json({
      code: content,
      fileName,
      filePath: visualizer.r2Key || `visualizers/${fileName}`,
      storageType: visualizer.storageType || 'r2',
    });
  } catch (error) {
    console.error('Admin get visualizer code error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT /api/admin/visualizers/:id/code
router.put('/visualizers/:id/code', async (req, res) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      return res.status(400).json({ msg: 'Code must be a string' });
    }

    const visualizer = await Visualizer.findById(req.params.id);
    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    const codeBuffer = Buffer.from(code, 'utf8');

    // Sync to R2 if configured
    if (isR2Configured()) {
      const key = visualizer.r2Key || `visualizers/${visualizer.slug}-${Date.now()}.html`;
      await uploadToR2({
        key,
        body: codeBuffer,
        contentType: 'text/html; charset=utf-8',
      });

      visualizer.storageType = 'r2';
      visualizer.r2Key = key;
      visualizer.r2Bucket = process.env.R2_BUCKET_NAME || '';
      visualizer.fileSize = codeBuffer.length;
      visualizer.fileChecksum = crypto.createHash('sha256').update(codeBuffer).digest('hex');
      await visualizer.save();
    }

    // Also sync to local filesystem only if file exists
    try {
      const targetDir = getVisualizersDir();
      if (fs.existsSync(targetDir)) {
        const fileName = path.basename(visualizer.htmlPath || `${visualizer.slug}.html`);
        const filePath = path.join(targetDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, code, 'utf8');
        }
      }
    } catch (localWriteErr) {
      // Ignored if local directory unavailable on production
    }

    await writeAuditLog(req, {
      action: 'admin.visualizer.code_update',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: { slug: visualizer.slug, r2Key: visualizer.r2Key },
    });

    return res.json({ msg: 'Visualizer code updated successfully' });
  } catch (error) {
    console.error('Admin save visualizer code error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// DELETE /api/admin/visualizers/:id
router.delete('/visualizers/:id', async (req, res) => {
  try {
    const visualizer = await Visualizer.findById(req.params.id);
    if (!visualizer || visualizer.isDeleted) {
      return res.status(404).json({ msg: 'Visualizer not found' });
    }

    // Clean up persistent R2 object
    if (visualizer.r2Key) {
      try {
        await deleteFromR2({ key: visualizer.r2Key });
      } catch (delError) {
        console.warn(`Could not delete R2 object ${visualizer.r2Key}:`, delError.message);
      }
    }

    visualizer.isDeleted = true;
    visualizer.deletedAt = new Date();
    await visualizer.save();

    await writeAuditLog(req, {
      action: 'admin.visualizer.delete',
      entityType: 'visualizer',
      entityId: String(visualizer._id),
      metadata: { slug: visualizer.slug, r2Key: visualizer.r2Key },
    });

    return res.json({ msg: 'Visualizer deleted successfully' });
  } catch (error) {
    console.error('Admin delete visualizer error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;


