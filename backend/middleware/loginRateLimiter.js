const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

module.exports = function loginRateLimiter(req, res, next) {
  const key = req.ip || req.socket.remoteAddress;
  const now = Date.now();

  let record = attempts.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW_MS };
  }

  record.count++;
  attempts.set(key, record);

  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  }

  next();
};
