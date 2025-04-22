const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { csrfProtection, handleCsrfError, setCsrfToken } = require('./middleware/csrfMiddleware');
const { apiLimiter, authLimiter, searchLimiter, audioCreationLimiter } = require('./middleware/rateLimitMiddleware');
const { swaggerUi, swaggerDocs } = require('./config/swagger');
const { metricsMiddleware, getMetrics } = require('./utils/metrics');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const audioRoutes = require('./routes/audioRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const usageRoutes = require('./routes/usageRoutes');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://via.placeholder.com"],
      connectSrc: ["'self'", "https://api.x.com"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable CORS with secure options
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://radiox.com'
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 600, // 10 minutes
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

// Metrics middleware
app.use(metricsMiddleware);

// Apply CSRF protection to all routes except API docs and health check
app.use(/^(?!\/api-docs|\/health).+/, csrfProtection, handleCsrfError, setCsrfToken);

// Apply rate limiting to different routes
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/search', searchLimiter);
app.use('/api/audio/clips/from-post', audioCreationLimiter);
app.use('/api/audio/clips/from-thread', audioCreationLimiter);
app.use('/api/audio/clips/from-text', audioCreationLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/usage', usageRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    res.end(await getMetrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
