const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const User = require('../models/User');
const POTD = require('../models/POTD');
const auth = require('../middleware/auth');
const {
  clearProblemsCache,
  getCachedProblems,
  setCachedProblems,
} = require('../utils/problemCache');
const { clearLeaderboardCache } = require('../utils/leaderboardCache');
const { getCanonicalTopicSlug } = require('../utils/topics');

// ==============================================
// ADD PROBLEM (Clears Cache)
// ==============================================
router.post('/add', async (req, res) => {
  const { id, title, link, difficulty, topic, tutorialLink, solutionLink, codeLink } = req.body;

  try {
    let problem = await Problem.findOne({ id, isDeleted: { $ne: true } });
    if (problem) {
      return res.status(400).json({ msg: `Problem with ID ${id} already exists` });
    }

    problem = new Problem({
      id, title, link, difficulty, topic,
      tutorialLink: tutorialLink || "",
      solutionLink: solutionLink || "",
      codeLink: codeLink || "",
      isDeleted: false,
      deletedAt: null,
    });

    await problem.save();
    
    clearProblemsCache();

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
    const cachedProblems = getCachedProblems();

    if (cachedProblems) {
      return res.json(cachedProblems);
    }

    const problems = await Problem.find({ isDeleted: { $ne: true } }).sort({ order: 1, id: 1 });
    
    setCachedProblems(problems);
    
    res.json(problems);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ==============================================
// GET SINGLE PROBLEM
// ==============================================
router.get('/single/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id, isDeleted: { $ne: true } });
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.json(problem);
  } catch (err) {
    console.error(err.message);
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
      const count = await Problem.countDocuments({ isDeleted: { $ne: true } });
      if (count === 0) return res.status(404).json({ msg: "No problems in DB" });

      const random = Math.floor(Math.random() * count);
      const randomProblem = await Problem.findOne({ isDeleted: { $ne: true } }).skip(random);

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
// GET PROBLEMS BY TOPIC (Hybrid Search)
// ==============================================
router.get('/:topic', async (req, res) => {
  try {
    const canonicalTopicSlug = getCanonicalTopicSlug(req.params.topic);
    const problems = (await Problem.find({ isDeleted: { $ne: true } }).sort({ order: 1, id: 1 })).filter(
      (problem) => getCanonicalTopicSlug(problem.topic) === canonicalTopicSlug,
    );

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
    if (!user.isActive) return res.status(403).json({ msg: 'Account access denied' });

    const idStr = String(problemId);
    const problem = await Problem.findOne({ id: Number(idStr), isDeleted: { $ne: true } }).select('id');
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });

    const isSolved = user.solvedProblems.includes(idStr);
    let updatedUser;

    if (isSolved) {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {
          $pull: {
            solvedProblems: idStr,
            solvedHistory: { problemId: idStr },
          },
        },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {
          $addToSet: { solvedProblems: idStr },
          $push: { solvedHistory: { problemId: idStr, solvedAt: new Date() } },
        },
        { new: true }
      );
    }
    clearLeaderboardCache();
    res.json(updatedUser.solvedProblems);
  } catch (err) {
    console.error("Sync Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// SYNC REVISION STATUS
// ==============================================
router.post('/sync-revision', auth, async (req, res) => {
  const { problemId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!user.isActive) return res.status(403).json({ msg: 'Account access denied' });

    const idStr = String(problemId);
    const problem = await Problem.findOne({ id: Number(idStr), isDeleted: { $ne: true } }).select('id');
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });

    const isMarked = user.revisionProblems?.includes(idStr);
    let updatedUser;

    if (isMarked) {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $pull: { revisionProblems: idStr } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { revisionProblems: idStr } },
        { new: true }
      );
    }
    res.json(updatedUser.revisionProblems || []);
  } catch (err) {
    console.error("Sync Revision Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// SYNC NOTE
// ==============================================
router.post('/sync-note', auth, async (req, res) => {
  const { problemId, note } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!user.isActive) return res.status(403).json({ msg: 'Account access denied' });

    const idStr = String(problemId);
    const problem = await Problem.findOne({ id: Number(idStr), isDeleted: { $ne: true } }).select('id');
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });

    const noteIndex = user.problemNotes?.findIndex(n => n.problemId === idStr);
    let updatedUser;

    if (noteIndex !== undefined && noteIndex !== -1) {
      if (!note || note.trim() === '') {
        // Remove note if empty
        updatedUser = await User.findByIdAndUpdate(
          req.userId,
          { $pull: { problemNotes: { problemId: idStr } } },
          { new: true }
        );
      } else {
        // Update existing note
        updatedUser = await User.findOneAndUpdate(
          { _id: req.userId, "problemNotes.problemId": idStr },
          { 
            $set: { 
              "problemNotes.$.note": note,
              "problemNotes.$.updatedAt": new Date()
            } 
          },
          { new: true }
        );
      }
    } else if (note && note.trim() !== '') {
      // Add new note
      updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { 
          $push: { 
            problemNotes: { problemId: idStr, note: note, updatedAt: new Date() } 
          } 
        },
        { new: true }
      );
    } else {
      updatedUser = user;
    }
    
    res.json(updatedUser.problemNotes || []);
  } catch (err) {
    console.error("Sync Note Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;