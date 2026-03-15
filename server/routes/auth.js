const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getRoleForEmail, sanitizeUser } = require('../utils/userAccess');
const { getCachedLeaderboard, setCachedLeaderboard } = require('../utils/leaderboardCache');

// ==============================================
// 1. REGISTER USER
// @route   POST /api/auth/signup
// ==============================================
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const role = getRoleForEmail(email);

    user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      solvedProblems: [],
      role,
    });
    
    await user.save();

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==============================================
// 2. LOGIN USER
// @route   POST /api/auth/login
// ==============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Your account has been disabled. Contact an admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const resolvedRole = getRoleForEmail(user.email, user.role);
    if (resolvedRole !== user.role) {
      user.role = resolvedRole;
      await user.save();
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==============================================
// 3. GET CURRENT USER
// @route   GET /api/auth/me
// ==============================================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ msg: 'Account access denied' });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==============================================
// 4. GET LEADERBOARD (WITH CACHING) - ✅ FIXED
// @route   GET /api/auth/leaderboard
// ==============================================

router.get('/leaderboard', async (req, res) => {
  try {
    // 1. Check if cache is valid
    const cached = getCachedLeaderboard();
    if (cached) {
      return res.json(cached);
    }

    // 2. If expired, fetch from DB — only active users
    console.log("Refreshing Leaderboard Cache...");

    const users = await User.find({ isActive: { $ne: false } }).select('username solvedProblems');

    const leaderboard = users
      .map(user => ({
        username: user.username,
        solvedCount: user.solvedProblems ? user.solvedProblems.length : 0
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .slice(0, 50);

    // 3. Update shared cache
    setCachedLeaderboard(leaderboard);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;