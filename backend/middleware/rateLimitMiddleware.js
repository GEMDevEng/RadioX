const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Create Redis client
let redisClient;
try {
  redisClient = new Redis(process.env.REDIS_URL);

  // Test Redis connection
  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
  });
} catch (error) {
  logger.error(`Error initializing Redis: ${error.message}`);
}

/**
 * Create a rate limiter with configurable options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
    // Skip rate limiting in development mode
    skip: (req) => process.env.NODE_ENV === 'development',
    // Use X-Forwarded-For header if behind a proxy
    keyGenerator: (req) => {
      return req.headers['x-forwarded-for'] || req.ip;
    },
    // Handler for when rate limit is exceeded
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`);
      res.status(429).json(options.message);
    },
  };

  const limiterOptions = {
    ...defaultOptions,
    ...options,
  };

  // Use Redis store if Redis is available
  if (redisClient && process.env.NODE_ENV === 'production') {
    try {
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'ratelimit:',
        // Add some redundancy in case of Redis failures
        resetExpiryOnChange: true,
        // Catch Redis errors
        catchErrors: true,
      });
      logger.info(`Rate limiter using Redis store with prefix 'ratelimit:'`);
    } catch (error) {
      logger.error(`Failed to create Redis store for rate limiter: ${error.message}`);
      logger.info('Falling back to memory store for rate limiting');
    }
  } else {
    logger.info('Rate limiter using memory store');
  }

  return rateLimit(limiterOptions);
};

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

// Auth endpoints rate limiter (more strict)
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.',
  },
});

// Search endpoints rate limiter
const searchLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes
});

// Audio creation rate limiter
const audioCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
});

// User account management rate limiter
const userLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
});

// Podcast management rate limiter
const podcastLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
});

// Admin endpoints rate limiter
const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
});

module.exports = {
  apiLimiter,
  authLimiter,
  searchLimiter,
  audioCreationLimiter,
  userLimiter,
  podcastLimiter,
  adminLimiter,
  createRateLimiter, // Export the factory function for custom limiters
};
