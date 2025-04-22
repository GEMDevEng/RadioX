const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT token and set req.user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'], // Explicitly specify the algorithm
        maxAge: '7d', // Token should not be older than 7 days
      });

      // Get user from the token (exclude password and sensitive fields)
      req.user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');

      if (!req.user) {
        logger.warn(`Authentication failed: User not found for token ID ${decoded.id}`);
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user is active
      if (!req.user.isActive) {
        logger.warn(`Authentication failed: Inactive user ${req.user._id} attempted to access ${req.originalUrl}`);
        res.status(403);
        throw new Error('Account is inactive');
      }

      // Add user ID to request for logging purposes
      req.userId = req.user._id;

      // Log successful authentication for sensitive operations
      if (req.method !== 'GET') {
        logger.info(`User ${req.user._id} authenticated for ${req.method} ${req.originalUrl}`);
      }

      next();
    } catch (error) {
      logger.warn(`Authentication failed: ${error.message} for ${req.ip} at ${req.originalUrl}`);

      // Return different error messages based on the error type
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Authentication expired, please login again');
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Invalid authentication token');
      } else {
        res.status(401);
        throw new Error('Authentication failed');
      }
    }
  } else if (req.cookies && req.cookies.token) {
    // Also check for token in cookies as fallback
    try {
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        maxAge: '7d',
      });

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user is active
      if (!req.user.isActive) {
        res.status(403);
        throw new Error('Account is inactive');
      }

      req.userId = req.user._id;
      next();
    } catch (error) {
      // Clear the invalid cookie
      res.clearCookie('token');

      logger.warn(`Cookie authentication failed: ${error.message} for ${req.ip} at ${req.originalUrl}`);
      res.status(401);
      throw new Error('Authentication failed');
    }
  }

  if (!token) {
    logger.warn(`Authentication failed: No token provided for ${req.ip} at ${req.originalUrl}`);
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Admin middleware - Check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    // Log admin access for auditing
    logger.info(`Admin user ${req.user._id} accessed ${req.method} ${req.originalUrl}`);
    next();
  } else {
    logger.warn(`Unauthorized admin access attempt by user ${req.user ? req.user._id : 'unknown'} for ${req.originalUrl}`);
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

/**
 * Optional auth middleware - Verify JWT token if present, but don't require it
 * Useful for routes that can work with or without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        maxAge: '7d',
      });

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
      req.userId = req.user ? req.user._id : null;
    } catch (error) {
      // Don't throw an error, just don't set req.user
      logger.debug(`Optional auth: Invalid token - ${error.message}`);
    }
  } else if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        maxAge: '7d',
      });

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
      req.userId = req.user ? req.user._id : null;
    } catch (error) {
      // Don't throw an error, just don't set req.user
      logger.debug(`Optional auth: Invalid cookie token - ${error.message}`);
    }
  }

  // Continue regardless of authentication result
  next();
});

module.exports = { protect, admin, optionalAuth };
