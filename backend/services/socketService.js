const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://radiox.com'
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    
    // Join user's room for private notifications
    socket.join(`user:${socket.userId}`);
    
    // Send welcome message
    socket.emit('notification', {
      type: 'info',
      message: 'Connected to RadioX real-time notifications',
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  logger.info('Socket.IO server initialized');
};

/**
 * Send notification to a specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 * @param {string} notification.type - Notification type (info, success, warning, error)
 * @param {string} notification.message - Notification message
 * @param {Object} notification.data - Additional data (optional)
 */
const sendToUser = (userId, notification) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('notification', notification);
  logger.debug(`Notification sent to user ${userId}: ${notification.message}`);
};

/**
 * Send notification to all connected users
 * @param {Object} notification - Notification object
 */
const sendToAll = (notification) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }
  
  io.emit('notification', notification);
  logger.debug(`Notification sent to all users: ${notification.message}`);
};

/**
 * Send audio conversion status update to a user
 * @param {string} userId - User ID
 * @param {string} audioClipId - Audio clip ID
 * @param {string} status - Conversion status (processing, completed, failed)
 * @param {Object} data - Additional data (optional)
 */
const sendConversionStatus = (userId, audioClipId, status, data = {}) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('conversionStatus', {
    audioClipId,
    status,
    data,
    timestamp: new Date(),
  });
  
  logger.debug(`Conversion status sent to user ${userId}: ${audioClipId} - ${status}`);
};

/**
 * Send podcast publishing status update to a user
 * @param {string} userId - User ID
 * @param {string} podcastId - Podcast ID
 * @param {string} status - Publishing status (processing, completed, failed)
 * @param {Object} data - Additional data (optional)
 */
const sendPodcastStatus = (userId, podcastId, status, data = {}) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('podcastStatus', {
    podcastId,
    status,
    data,
    timestamp: new Date(),
  });
  
  logger.debug(`Podcast status sent to user ${userId}: ${podcastId} - ${status}`);
};

module.exports = {
  init,
  sendToUser,
  sendToAll,
  sendConversionStatus,
  sendPodcastStatus,
};
