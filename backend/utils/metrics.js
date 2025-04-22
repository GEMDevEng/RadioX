const promClient = require('prom-client');
const logger = require('./logger');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (memory usage, event loop lag, etc.)
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const audioClipsCreatedTotal = new promClient.Counter({
  name: 'audio_clips_created_total',
  help: 'Total number of audio clips created',
  labelNames: ['source_type'],
  registers: [register],
});

const audioClipsDurationTotal = new promClient.Counter({
  name: 'audio_clips_duration_total',
  help: 'Total duration of audio clips in seconds',
  registers: [register],
});

const podcastsCreatedTotal = new promClient.Counter({
  name: 'podcasts_created_total',
  help: 'Total number of podcasts created',
  registers: [register],
});

const apiUsageCounter = new promClient.Counter({
  name: 'api_usage_total',
  help: 'Total API usage by type',
  labelNames: ['type'],
  registers: [register],
});

const activeUsersGauge = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register],
});

/**
 * Setup metrics middleware for Express
 */
const setupMetrics = () => {
  logger.info('Setting up Prometheus metrics');
};

/**
 * Middleware to track HTTP request duration and count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Record end time and calculate duration on response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    
    // Get route pattern (replace params with :param)
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

/**
 * Get metrics in Prometheus format
 * @returns {Promise<string>} - Metrics in Prometheus format
 */
const getMetrics = async () => {
  return await register.metrics();
};

/**
 * Increment audio clips created counter
 * @param {string} sourceType - Source type (post, thread, custom)
 */
const incrementAudioClipsCreated = (sourceType) => {
  audioClipsCreatedTotal.labels(sourceType).inc();
};

/**
 * Increment audio clips duration counter
 * @param {number} duration - Duration in seconds
 */
const incrementAudioClipsDuration = (duration) => {
  audioClipsDurationTotal.inc(duration);
};

/**
 * Increment podcasts created counter
 */
const incrementPodcastsCreated = () => {
  podcastsCreatedTotal.inc();
};

/**
 * Increment API usage counter
 * @param {string} type - API usage type (posts, read_requests)
 */
const incrementApiUsage = (type) => {
  apiUsageCounter.labels(type).inc();
};

/**
 * Set active users gauge
 * @param {number} count - Number of active users
 */
const setActiveUsers = (count) => {
  activeUsersGauge.set(count);
};

module.exports = {
  setupMetrics,
  metricsMiddleware,
  getMetrics,
  incrementAudioClipsCreated,
  incrementAudioClipsDuration,
  incrementPodcastsCreated,
  incrementApiUsage,
  setActiveUsers,
};
