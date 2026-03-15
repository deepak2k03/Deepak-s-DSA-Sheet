const windows = new Map();

const createRateLimiter = ({ windowMs, maxRequests, keyBuilder }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyBuilder(req);
    const current = windows.get(key);

    if (!current || now > current.resetAt) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
      return res.status(429).json({ msg: 'Too many requests. Please try again later.' });
    }

    current.count += 1;
    windows.set(key, current);
    return next();
  };
};

const globalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 600,
  keyBuilder: (req) => `global:${req.ip || 'unknown'}`,
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyBuilder: (req) => `auth:${req.ip || 'unknown'}`,
});

module.exports = {
  createRateLimiter,
  globalRateLimiter,
  authRateLimiter,
};
