const http = require('http');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');
const socketService = require('./services/socketService');
const { setupMetrics } = require('./utils/metrics');
const memoryMonitor = require('./utils/memoryMonitor');
const dbOptimizer = require('./utils/dbOptimizer');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Setup Prometheus metrics
setupMetrics();

// Start memory monitoring
memoryMonitor.start();

// Start database monitoring in development mode
if (process.env.NODE_ENV === 'development') {
  dbOptimizer.startMonitoring();
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.init(server);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Stop monitoring and close server
  memoryMonitor.stop();
  if (process.env.NODE_ENV === 'development') {
    dbOptimizer.stopMonitoring();
  }
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Stop monitoring and close server
  memoryMonitor.stop();
  if (process.env.NODE_ENV === 'development') {
    dbOptimizer.stopMonitoring();
  }
  server.close(() => process.exit(1));
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  memoryMonitor.stop();
  if (process.env.NODE_ENV === 'development') {
    dbOptimizer.stopMonitoring();
  }
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
