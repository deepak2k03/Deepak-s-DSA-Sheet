const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authRateLimiter } = require('../utils/rateLimiter');
const { getRoleForEmail, sanitizeUser } = require('../utils/userAccess');
const {
  getCachedLeaderboard,
  setCachedLeaderboard,
  clearLeaderboardCache,
} = require('../utils/leaderboardCache');
const { createPlainToken, hashToken } = require('../utils/tokenSecurity');
const { sendPasswordResetEmail } = require('../utils/email');
const { writeAuditLog } = require('../utils/audit');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MAX_FAILED_LOGINS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const signSessionToken = (user) =>
  jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

router.post('/signup', authRateLimiter, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const role = getRoleForEmail(email);

    const verificationTokenPlain = createPlainToken();
    const verificationTokenHashed = hashToken(verificationTokenPlain);

    user = new User({
      username,
      email,
      password: hashedPassword,
      solvedProblems: [],
      solvedHistory: [],
      role,
      emailVerified: false,
      emailVerificationToken: verificationTokenHashed,
      emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 30),
    });

    await user.save();
    clearLeaderboardCache();

    const token = signSessionToken(user);

    await writeAuditLog(req, {
      actorEmail: email,
      action: 'auth.signup',
      entityType: 'user',
      entityId: String(user._id),
      metadata: { role: user.role },
    });

    return res.json({
      token,
      user: sanitizeUser(user),
      verification: {
        required: true,
        token: process.env.NODE_ENV === 'production' ? undefined : verificationTokenPlain,
        expiresInMinutes: 30,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.post('/login', authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Your account has been disabled. Contact an admin.' });
    }

    if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
      return res.status(423).json({ msg: 'Account temporarily locked due to repeated failed logins. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }
      await user.save();
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    if (process.env.ENFORCE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    const resolvedRole = getRoleForEmail(user.email, user.role);
    if (resolvedRole !== user.role) {
      user.role = resolvedRole;
    }
    await user.save();

    const token = signSessionToken(user);

    await writeAuditLog(req, {
      actorEmail: email,
      action: 'auth.login',
      entityType: 'user',
      entityId: String(user._id),
    });

    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.post('/google', authRateLimiter, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ msg: 'Token is required' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ msg: 'Invalid Google token' });

    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified && process.env.ENFORCE_EMAIL_VERIFICATION === 'true') {
      return res.status(403).json({ msg: 'Google email is not verified' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google login
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), salt);
      const role = getRoleForEmail(email);

      user = new User({
        username: name || email.split('@')[0],
        email,
        password: dummyPassword,
        authProvider: 'google',
        googleId,
        role,
        emailVerified: true,
      });

      await user.save();
      clearLeaderboardCache();

      await writeAuditLog(req, {
        actorEmail: email,
        action: 'auth.google_signup',
        entityType: 'user',
        entityId: String(user._id),
      });
    } else {
      // Link Google account to existing user if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.emailVerified = true;
        await user.save();
      }

      if (!user.isActive) {
        return res.status(403).json({ msg: 'Your account has been disabled.' });
      }
    }

    const sessionToken = signSessionToken(user);

    await writeAuditLog(req, {
      actorEmail: email,
      action: 'auth.google_login',
      entityType: 'user',
      entityId: String(user._id),
    });

    return res.json({ token: sessionToken, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    return res.status(500).json({ msg: 'Google authentication failed' });
  }
});

router.post('/request-email-verification', authRateLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: 'If an account exists, verification instructions were generated.' });

    const plain = createPlainToken();
    user.emailVerificationToken = hashToken(plain);
    user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    return res.json({
      msg: 'Verification token generated.',
      token: process.env.NODE_ENV === 'production' ? undefined : plain,
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/verify-email', authRateLimiter, async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid verification request' });

    const hashed = hashToken(token || '');
    const validToken =
      user.emailVerificationToken &&
      user.emailVerificationToken === hashed &&
      user.emailVerificationExpires &&
      new Date(user.emailVerificationExpires).getTime() > Date.now();

    if (!validToken) {
      return res.status(400).json({ msg: 'Verification token is invalid or expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ msg: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/request-password-reset', authRateLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    // Always return a generic message to prevent account enumeration
    const genericResponse = { msg: 'If an account with that email exists, a password reset link has been sent.' };

    if (!user) {
      return res.json(genericResponse);
    }

    const plain = createPlainToken();
    user.passwordResetToken = hashToken(plain);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 mins per instructions
    await user.save();

    // Send email in background to prevent API from hanging (especially if SMTP port is blocked)
    sendPasswordResetEmail(user.email, plain).catch(err => {
      console.error('Background email dispatch failed:', err);
    });

    return res.json(genericResponse);
  } catch (error) {
    console.error('Password reset request error:', error);
    // Still return the generic response to prevent leaking info
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/reset-password/:token', authRateLimiter, async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters long.' });
    }

    const hashed = hashToken(token || '');
    
    // Find user by hashed token, also ensuring it's not expired
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // If they were a Google-only account, they now have a local password.
    // Ensure authProvider includes 'local' if you need it, though 'local' or 'google' is fine.
    
    user.passwordResetToken = '';
    user.passwordResetExpires = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.tokensInvalidBefore = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.json({ msg: 'Password reset successful. Please log in again.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ msg: 'Account access denied' });
    }

    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const cached = getCachedLeaderboard();
    if (cached) {
      return res.json(cached);
    }

    const users = await User.find({ isActive: { $ne: false } }).select('username solvedProblems');

    const leaderboard = users
      .map((user) => ({
        username: user.username,
        solvedCount: user.solvedProblems ? user.solvedProblems.length : 0,
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .slice(0, 50)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setCachedLeaderboard(leaderboard);

    return res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
