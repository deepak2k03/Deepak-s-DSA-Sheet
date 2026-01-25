const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- Middleware to Verify Token (Inline for simplicity) ---
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

    user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      solvedProblems: [] 
    });
    
    await user.save();

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, username, email, solvedProblems: [] } });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        solvedProblems: user.solvedProblems 
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==============================================
// 3. GET CURRENT USER (The Missing Link!)
// @route   GET /api/auth/me
// ==============================================
router.get('/me', auth, async (req, res) => {
  try {
    // Fetch user but don't send back the password
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    // Fetch all users, but ONLY get username and solvedProblems
    // We don't want to send passwords or emails to the public!
    const users = await User.find().select('username solvedProblems');

    // Transform data: Calculate solved count for each user
    const leaderboard = users.map(user => ({
      username: user.username,
      solvedCount: user.solvedProblems.length
    }));

    // Sort by Solved Count (Descending: Highest first)
    leaderboard.sort((a, b) => b.solvedCount - a.solvedCount);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;