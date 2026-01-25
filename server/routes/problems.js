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

// @route   POST /api/problems/add
// @desc    Add a new problem manually (e.g. via Postman)
router.post('/add', async (req, res) => {
  const { id, title, link, difficulty, topic, solutionLink, codeLink } = req.body;

  try {
    let problem = await Problem.findOne({ id });
    if (problem) {
      return res.status(400).json({ msg: `Problem with ID ${id} already exists` });
    }

    problem = new Problem({
      id,
      title,
      link,
      difficulty,
      topic,
      solutionLink: solutionLink || "",
      codeLink: codeLink || ""
    });

    await problem.save();
    res.json({ msg: 'Problem added successfully', problem });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/problems/all
// @desc    Get ALL problems (Used for Profile Stats)
// ⚠️ IMPORTANT: This must be BEFORE the /:topic route!
router.get('/all', async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.json(problems);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/potd', async (req, res) => {
  try {
    // 1. Get today's date string (e.g., "2023-10-27")
    const today = new Date().toISOString().split('T')[0];

    // 2. Check if we already have a POTD for today
    let potdEntry = await POTD.findOne({ date: today }).populate('problem');

    // 3. If NOT found, create one
    if (!potdEntry) {
      // Get count of all problems
      const count = await Problem.countDocuments();
      if (count === 0) return res.status(404).json({ msg: "No problems in DB" });

      // Pick a random index
      const random = Math.floor(Math.random() * count);
      const randomProblem = await Problem.findOne().skip(random);

      // Save it as today's POTD
      potdEntry = new POTD({
        date: today,
        problem: randomProblem._id
      });
      await potdEntry.save();
      
      // Populate the problem details before sending
      potdEntry = await potdEntry.populate('problem');
    }

    res.json(potdEntry.problem);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/problems/:topic
// @desc    Get problems for a specific topic (e.g. 'arrays')
router.get('/:topic', async (req, res) => {
  try {
    const problems = await Problem.find({ topic: req.params.topic }).sort({ id: 1 });
    res.json(problems);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/problems/sync
// @desc    Sync user progress (Atomic Update)
router.post('/sync', auth, async (req, res) => {
  const { problemId } = req.body;
  
  try {
    // 1. Get the user to check current status
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const idStr = String(problemId);
    
    // 2. Determine if we are Adding or Removing
    const isSolved = user.solvedProblems.includes(idStr);
    let updatedUser;

    if (isSolved) {
      // REMOVE: Use $pull to remove directly from DB
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $pull: { solvedProblems: idStr } },
        { new: true } // Return the updated document
      );
    } else {
      // ADD: Use $addToSet (prevents duplicates automatically)
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { solvedProblems: idStr } },
        { new: true }
      );
    }

    // 3. Return the updated list
    res.json(updatedUser.solvedProblems);

  } catch (err) {
    console.error("Sync Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;