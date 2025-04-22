const helmet = require('helmet');
const logger = require('../utils/logger');

/**
 * Configure security headers using Helmet
 * @returns {Function} Express middleware
 */
const securityHeaders = () => {
  logger.info('Setting up security headers middleware');
  
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://storage.googleapis.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https://storage.googleapis.com', 'https://*.s3.amazonaws.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'", 'https://api.radiox.com', process.env.FRONTEND_URL || 'http://localhost:3000'],
        mediaSrc: ["'self'", 'https://storage.googleapis.com', 'https://*.s3.amazonaws.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: 'same-site' },
    
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Set to false to allow loading cross-origin resources
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: true },
    
    // Expect-CT
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
    
    // Frameguard
    frameguard: { action: 'deny' },
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    
    // No Sniff
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // XSS Protection
    xssFilter: true,
  });
};

/**
 * Configure CORS headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const corsHeaders = (req, res, next) => {
  // Get allowed origins from environment or use default
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000'];
  
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

/**
 * Add security headers for file downloads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const downloadHeaders = (req, res, next) => {
  // Check if the route is for file downloads
  if (req.path.startsWith('/api/download') || req.path.startsWith('/api/audio/file')) {
    // Set Content-Disposition header to force download
    res.setHeader('Content-Disposition', 'attachment');
    
    // Prevent content type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Disable caching for sensitive files
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  securityHeaders,
  corsHeaders,
  downloadHeaders,
};
