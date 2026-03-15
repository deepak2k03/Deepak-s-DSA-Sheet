const User = require('../models/User');

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.isActive) {
      return res.status(403).json({ msg: 'Account access denied' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = adminOnly;