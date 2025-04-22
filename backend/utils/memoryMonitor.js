const os = require('os');
const { EventEmitter } = require('events');
const logger = require('./logger');

/**
 * Memory Monitor for tracking and alerting on memory usage
 * - Monitors memory usage at regular intervals
 * - Detects potential memory leaks
 * - Emits events for warning and critical thresholds
 * - Provides memory usage statistics
 */
class MemoryMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      checkInterval: options.checkInterval || 60000, // 1 minute
      warningThreshold: options.warningThreshold || 80, // 80% of max memory
      criticalThreshold: options.criticalThreshold || 90, // 90% of max memory
      ...options
    };
    
    this.isRunning = false;
    this.intervalId = null;
    this.lastUsage = null;
    this.leakDetectionEnabled = options.leakDetectionEnabled !== false;
    this.leakThreshold = options.leakThreshold || 5; // 5% increase considered a potential leak
    this.memoryHistory = [];
    this.historyLimit = options.historyLimit || 100; // Keep last 100 measurements
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkMemory();
    this.intervalId = setInterval(() => this.checkMemory(), this.options.checkInterval);
    
    logger.info('Memory monitor started');
  }
  
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.intervalId = null;
    
    logger.info('Memory monitor stopped');
  }
  
  checkMemory() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    const memoryInfo = {
      total: this.formatBytes(totalMemory),
      free: this.formatBytes(freeMemory),
      used: this.formatBytes(usedMemory),
      usagePercent: memoryUsagePercent.toFixed(2),
      timestamp: new Date()
    };
    
    // Add to history
    this.memoryHistory.push({
      usagePercent: memoryUsagePercent,
      timestamp: new Date()
    });
    
    // Limit history size
    if (this.memoryHistory.length > this.historyLimit) {
      this.memoryHistory.shift();
    }
    
    // Check for memory leaks
    if (this.leakDetectionEnabled && this.lastUsage) {
      const usageIncrease = memoryUsagePercent - this.lastUsage;
      
      // Check for consistent increase over time
      if (usageIncrease > this.leakThreshold) {
        // Check if this is a trend by looking at history
        const historyLength = this.memoryHistory.length;
        if (historyLength >= 3) {
          const recentMeasurements = this.memoryHistory.slice(-3);
          const isIncreasing = recentMeasurements.every((item, index, array) => {
            return index === 0 || item.usagePercent > array[index - 1].usagePercent;
          });
          
          if (isIncreasing) {
            logger.warn(`Potential memory leak detected: ${usageIncrease.toFixed(2)}% increase`);
            this.emit('leak', { usageIncrease, memoryInfo });
          }
        }
      }
    }
    
    this.lastUsage = memoryUsagePercent;
    
    // Check thresholds
    if (memoryUsagePercent >= this.options.criticalThreshold) {
      logger.error(`Critical memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      this.emit('critical', memoryInfo);
    } else if (memoryUsagePercent >= this.options.warningThreshold) {
      logger.warn(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      this.emit('warning', memoryInfo);
    }
    
    // Emit regular update
    this.emit('update', memoryInfo);
    
    return memoryInfo;
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getMemoryUsage() {
    return this.checkMemory();
  }
  
  getMemoryHistory() {
    return this.memoryHistory;
  }
  
  getMemoryTrend() {
    if (this.memoryHistory.length < 2) {
      return { trend: 'stable', change: 0 };
    }
    
    const first = this.memoryHistory[0].usagePercent;
    const last = this.memoryHistory[this.memoryHistory.length - 1].usagePercent;
    const change = last - first;
    
    let trend;
    if (change > 5) {
      trend = 'increasing';
    } else if (change < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    return { trend, change };
  }
}

// Create singleton instance
const memoryMonitor = new MemoryMonitor();

// Set up event handlers
memoryMonitor.on('warning', (info) => {
  // Send alert to admin dashboard
  try {
    const socketService = require('../services/socketService');
    socketService.emitToAdmins('memory-warning', info);
  } catch (err) {
    logger.error('Failed to emit memory warning:', err);
  }
});

memoryMonitor.on('critical', (info) => {
  // Send alert to admin dashboard
  try {
    const socketService = require('../services/socketService');
    socketService.emitToAdmins('memory-critical', info);
  } catch (err) {
    logger.error('Failed to emit memory critical alert:', err);
  }
  
  // Perform garbage collection if possible
  if (global.gc) {
    logger.info('Forcing garbage collection');
    global.gc();
  }
});

memoryMonitor.on('leak', (info) => {
  // Send alert to admin dashboard
  try {
    const socketService = require('../services/socketService');
    socketService.emitToAdmins('memory-leak', info);
  } catch (err) {
    logger.error('Failed to emit memory leak alert:', err);
  }
});

module.exports = memoryMonitor;
