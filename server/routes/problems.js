const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const POTD = require('../models/POTD');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ==============================================
// ✅ GLOBAL CACHE SETTINGS (30 Seconds)
// ==============================================
let problemsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 Seconds

// ==============================================
// ADD PROBLEM (Clears Cache)
// ==============================================
router.post('/add', async (req, res) => {
  const { id, title, link, difficulty, topic, solutionLink, codeLink } = req.body;

  try {
    let problem = await Problem.findOne({ id });
    if (problem) {
      return res.status(400).json({ msg: `Problem with ID ${id} already exists` });
    }

    problem = new Problem({
      id, title, link, difficulty, topic,
      solutionLink: solutionLink || "",
      codeLink: codeLink || ""
    });

    await problem.save();
    
    // ✅ Clear cache so the new problem shows up immediately
    problemsCache = null;

    res.json({ msg: 'Problem added successfully', problem });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// GET ALL PROBLEMS (With Auto-Refresh Cache)
// ==============================================
router.get('/all', async (req, res) => {
  try {
    const now = Date.now();

    // 1. Return cached list ONLY if it is fresh (less than 30s old)
    if (problemsCache && (now - lastCacheTime < CACHE_DURATION)) {
      return res.json(problemsCache);
    }

    // 2. Fetch from DB if cache is empty or expired
    const problems = await Problem.find({});
    
    // 3. Save to cache and update timestamp
    problemsCache = problems;
    lastCacheTime = now;
    
    res.json(problems);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ==============================================
// POTD ROUTE
// ==============================================
router.get('/potd', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let potdEntry = await POTD.findOne({ date: today }).populate('problem');

    if (!potdEntry) {
      const count = await Problem.countDocuments();
      if (count === 0) return res.status(404).json({ msg: "No problems in DB" });

      const random = Math.floor(Math.random() * count);
      const randomProblem = await Problem.findOne().skip(random);

      potdEntry = new POTD({
        date: today,
        problem: randomProblem._id
      });
      await potdEntry.save();
      potdEntry = await potdEntry.populate('problem');
    }
    res.json(potdEntry.problem);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// GET PROBLEMS BY TOPIC (Smart Slug Handling)
// ==============================================
router.get('/:topic', async (req, res) => {
  try {
    let topicParam = req.params.topic;
    
    // 1. ✅ Restore the "Hyphen-to-Space" logic
    // This allows URL ".../linked-lists" to find DB topic "linked lists"
    topicParam = topicParam.replace(/-/g, " ");

    // 2. Search (Case Insensitive)
    // Note: If your DB is "linked lists" (plural), your URL must be ".../linked-lists"
    const problems = await Problem.find({ 
      topic: { $regex: new RegExp(`^${topicParam}$`, 'i') } 
    }).sort({ id: 1 });

    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// SYNC SOLVED STATUS
// ==============================================
router.post('/sync', auth, async (req, res) => {
  const { problemId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const idStr = String(problemId);
    const isSolved = user.solvedProblems.includes(idStr);
    let updatedUser;

    if (isSolved) {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $pull: { solvedProblems: idStr } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { solvedProblems: idStr } },
        { new: true }
      );
    }
    res.json(updatedUser.solvedProblems);
  } catch (err) {
    console.error("Sync Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;