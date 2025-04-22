const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { sessionClient } = require('../config/redis');
const logger = require('../utils/logger');

// Session configuration
const sessionConfig = {
  store: new RedisStore({
    client: sessionClient,
    prefix: 'radiox:sess:'
  }),
  secret: process.env.SESSION_SECRET || 'radiox-session-secret',
  resave: false,
  saveUninitialized: false,
  name: 'radiox.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax'
  }
};

// In production, set secure cookies
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true;
  sessionConfig.proxy = true;
}

// Create session middleware
const sessionMiddleware = session(sessionConfig);

// Session tracking middleware
const sessionTrackingMiddleware = (req, res, next) => {
  // Skip for static assets and health checks
  if (req.path.startsWith('/static') || req.path === '/health' || req.path === '/metrics') {
    return next();
  }
  
  // Track active sessions
  if (req.session && req.session.id) {
    const sessionKey = `radiox:active:${req.session.id}`;
    sessionClient.set(sessionKey, Date.now(), 'EX', 3600) // 1 hour
      .catch(err => logger.error('Error tracking session:', err));
  }
  
  next();
};

// Get active session count
const getActiveSessionCount = async () => {
  try {
    const keys = await sessionClient.keys('radiox:active:*');
    return keys.length;
  } catch (err) {
    logger.error('Error getting active session count:', err);
    return 0;
  }
};

module.exports = {
  sessionMiddleware,
  sessionTrackingMiddleware,
  getActiveSessionCount
};
