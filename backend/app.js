const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { csrfProtection, handleCsrfError, setCsrfToken } = require('./middleware/csrfMiddleware');
const { apiLimiter, authLimiter, searchLimiter, audioCreationLimiter, userLimiter, podcastLimiter, adminLimiter } = require('./middleware/rateLimitMiddleware');
const { securityHeaders, corsHeaders, downloadHeaders } = require('./middleware/securityHeadersMiddleware');
const { swaggerUi, swaggerDocs } = require('./config/swagger');
const { metricsMiddleware, getMetrics } = require('./utils/metrics');
const compressionMiddleware = require('./middleware/compressionMiddleware');
const queryMiddleware = require('./middleware/queryMiddleware');
const { sessionMiddleware, sessionTrackingMiddleware } = require('./middleware/sessionMiddleware');
const { cacheMiddleware } = require('./config/redis');
const memoryMonitor = require('./utils/memoryMonitor');
const dbOptimizer = require('./utils/dbOptimizer');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const audioRoutes = require('./routes/audioRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const usageRoutes = require('./routes/usageRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const exportRoutes = require('./routes/exportRoutes');
const featureFlagRoutes = require('./routes/featureFlagRoutes');

// Initialize Express app
const app = express();

// Security headers middleware
app.use(securityHeaders());

// CORS headers middleware
app.use(corsHeaders);

// Download headers middleware for file downloads
app.use(downloadHeaders);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  // Replace prohibited characters with '_'
  replaceWith: '_',
  // Also sanitize request body, query parameters, and headers
  onSanitize: ({ req, key }) => {
    logger.warn(`Attempted NoSQL injection: ${key} from ${req.ip}`);
  }
}));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  // Whitelist parameters that can be duplicated
  whitelist: [
    'sort', 'fields', 'tags', 'categories', 'ids'
  ]
}));

// Parse cookies
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: false }));

// Compression middleware
app.use(compressionMiddleware);

// Session middleware
app.use(sessionMiddleware);
app.use(sessionTrackingMiddleware);

// Metrics middleware
app.use(metricsMiddleware);

// Query middleware for API routes
app.use('/api', queryMiddleware);

// Cache middleware for public API routes
app.use('/api/search', cacheMiddleware(300)); // Cache search results for 5 minutes
app.use('/api/trending', cacheMiddleware(600)); // Cache trending data for 10 minutes

// Apply CSRF protection to all routes except API docs and health check
app.use(/^(?!\/api-docs|\/health).+/, csrfProtection, handleCsrfError, setCsrfToken);

// Apply rate limiting to different routes
app.use('/api', apiLimiter);

// Auth routes rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// User routes rate limiting
app.use('/api/auth/profile', userLimiter);
app.use('/api/auth/update-profile', userLimiter);
app.use('/api/auth/change-password', userLimiter);

// Search routes rate limiting
app.use('/api/search', searchLimiter);

// Audio creation routes rate limiting
app.use('/api/audio/clips/from-post', audioCreationLimiter);
app.use('/api/audio/clips/from-thread', audioCreationLimiter);
app.use('/api/audio/clips/from-text', audioCreationLimiter);

// Podcast routes rate limiting
app.use('/api/podcast', podcastLimiter);

// Admin routes rate limiting
app.use('/api/admin', adminLimiter);
app.use('/admin', adminLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/feature-flags', featureFlagRoutes);
app.use('/api', exportRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', async (_, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    res.end(await getMetrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Memory usage endpoint (admin only)
app.get('/admin/memory', (_, res) => {
  // In a real app, this would be protected by admin authentication
  const memoryUsage = memoryMonitor.getMemoryUsage();
  const memoryHistory = memoryMonitor.getMemoryHistory();
  const memoryTrend = memoryMonitor.getMemoryTrend();

  res.json({
    current: memoryUsage,
    trend: memoryTrend,
    history: memoryHistory.slice(-20) // Return last 20 measurements
  });
});

// Database performance endpoint (admin only)
app.get('/admin/database/performance', (_, res) => {
  // In a real app, this would be protected by admin authentication
  const slowQueries = dbOptimizer.getSlowQueries();

  res.json({
    slowQueries: slowQueries.slice(-20) // Return last 20 slow queries
  });
});

// Active sessions endpoint (admin only)
app.get('/admin/sessions', async (_, res) => {
  // In a real app, this would be protected by admin authentication
  const { getActiveSessionCount } = require('./middleware/sessionMiddleware');
  const activeSessionCount = await getActiveSessionCount();

  res.json({
    activeSessions: activeSessionCount
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
