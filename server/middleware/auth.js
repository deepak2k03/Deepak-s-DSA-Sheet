const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  let token = req.header('x-auth-token');

  if (!token && req.header('authorization')) {
    const authHeader = req.header('authorization').trim();
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.user?.id || decoded.id;

    if (!userId) {
      return res.status(401).json({ msg: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('isActive tokenVersion tokensInvalidBefore');

    if (!user || !user.isActive) {
      return res.status(401).json({ msg: 'Account access denied' });
    }

    if (typeof decoded.tokenVersion === 'number' && decoded.tokenVersion !== (user.tokenVersion || 0)) {
      return res.status(401).json({ msg: 'Session expired. Please login again.' });
    }

    if (user.tokensInvalidBefore && decoded.iat) {
      const issuedAtMs = decoded.iat * 1000;
      if (issuedAtMs < new Date(user.tokensInvalidBefore).getTime()) {
        return res.status(401).json({ msg: 'Session expired. Please login again.' });
      }
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
