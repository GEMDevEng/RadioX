const compression = require('compression');

/**
 * Compression middleware for optimizing API responses
 * - Compresses responses larger than 1KB
 * - Uses level 6 compression (balance between speed and compression ratio)
 * - Skips compression for clients that don't support it
 */
const compressionMiddleware = compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses for older browsers without proper support
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other requests
    return compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;
