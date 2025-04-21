const { createClient } = require('redis');
const logger = require('../utils/logger');

/**
 * Create and connect to Redis client
 */
const connectRedis = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on('error', (err) => {
    logger.error(`Redis Error: ${err}`);
  });

  client.on('connect', () => {
    logger.info('Redis Connected');
  });

  await client.connect();

  return client;
};

module.exports = connectRedis;
