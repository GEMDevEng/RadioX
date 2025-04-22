const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Create Redis client
let redisClient;
try {
  redisClient = new Redis(process.env.REDIS_URL);
} catch (error) {
  logger.error(`Error connecting to Redis: ${error.message}`);
}

// Configure rate limiting options
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      message: 'Too many requests, please try again later.',
    },
  };

  const limiterOptions = {
    ...defaultOptions,
    ...options,
  };

  // Use Redis store if Redis is available
  if (redisClient) {
    limiterOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
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

module.exports = {
  apiLimiter,
  authLimiter,
  searchLimiter,
  audioCreationLimiter,
};
