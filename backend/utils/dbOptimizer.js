const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Database Optimizer for improving MongoDB query performance
 * - Provides query analysis
 * - Implements query caching
 * - Optimizes aggregate queries
 * - Monitors slow queries
 */
class DbOptimizer {
  constructor(options = {}) {
    this.options = {
      slowQueryThreshold: options.slowQueryThreshold || 100, // ms
      cacheEnabled: options.cacheEnabled !== false,
      cacheExpiration: options.cacheExpiration || 60000, // 1 minute
      ...options
    };
    
    this.queryCache = new Map();
    this.slowQueries = [];
    this.isMonitoring = false;
  }
  
  /**
   * Start monitoring database operations
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    // Set up mongoose debug mode to log all queries
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug(`MongoDB: ${collectionName}.${method}`, {
        query,
        doc: typeof doc === 'object' ? JSON.stringify(doc) : doc
      });
    });
    
    this.isMonitoring = true;
    logger.info('Database monitoring started');
  }
  
  /**
   * Stop monitoring database operations
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    mongoose.set('debug', false);
    this.isMonitoring = false;
    logger.info('Database monitoring stopped');
  }
  
  /**
   * Execute a query with performance monitoring
   * @param {Object} model - Mongoose model
   * @param {String} operation - Operation name (find, findOne, etc.)
   * @param {Object} query - Query object
   * @param {Object} options - Query options
   * @returns {Promise} - Query result
   */
  async executeQuery(model, operation, query, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(model.modelName, operation, query, options);
    
    // Check cache if enabled
    if (this.options.cacheEnabled && !options.skipCache) {
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        logger.debug(`Cache hit for ${model.modelName}.${operation}`);
        return cachedResult;
      }
    }
    
    try {
      // Execute the query
      const result = await model[operation](query, options.projection, options);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Check if it's a slow query
      if (executionTime > this.options.slowQueryThreshold) {
        this.recordSlowQuery(model.modelName, operation, query, executionTime);
      }
      
      // Cache the result if enabled
      if (this.options.cacheEnabled && !options.skipCache) {
        this.addToCache(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error executing ${model.modelName}.${operation}:`, error);
      throw error;
    }
  }
  
  /**
   * Execute an aggregate query with performance monitoring
   * @param {Object} model - Mongoose model
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} options - Aggregation options
   * @returns {Promise} - Aggregation result
   */
  async executeAggregate(model, pipeline, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(model.modelName, 'aggregate', pipeline, options);
    
    // Check cache if enabled
    if (this.options.cacheEnabled && !options.skipCache) {
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        logger.debug(`Cache hit for ${model.modelName}.aggregate`);
        return cachedResult;
      }
    }
    
    try {
      // Execute the aggregation
      const result = await model.aggregate(pipeline).option(options);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Check if it's a slow query
      if (executionTime > this.options.slowQueryThreshold) {
        this.recordSlowQuery(model.modelName, 'aggregate', pipeline, executionTime);
      }
      
      // Cache the result if enabled
      if (this.options.cacheEnabled && !options.skipCache) {
        this.addToCache(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error executing ${model.modelName}.aggregate:`, error);
      throw error;
    }
  }
  
  /**
   * Generate a cache key for a query
   * @param {String} modelName - Model name
   * @param {String} operation - Operation name
   * @param {Object} query - Query object
   * @param {Object} options - Query options
   * @returns {String} - Cache key
   */
  getCacheKey(modelName, operation, query, options) {
    return `${modelName}:${operation}:${JSON.stringify(query)}:${JSON.stringify(options)}`;
  }
  
  /**
   * Get a value from the cache
   * @param {String} key - Cache key
   * @returns {*} - Cached value or undefined
   */
  getFromCache(key) {
    const cached = this.queryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.queryCache.delete(key);
    }
    
    return undefined;
  }
  
  /**
   * Add a value to the cache
   * @param {String} key - Cache key
   * @param {*} value - Value to cache
   */
  addToCache(key, value) {
    this.queryCache.set(key, {
      value,
      expires: Date.now() + this.options.cacheExpiration
    });
  }
  
  /**
   * Clear the entire cache
   */
  clearCache() {
    this.queryCache.clear();
    logger.info('Query cache cleared');
  }
  
  /**
   * Record a slow query
   * @param {String} modelName - Model name
   * @param {String} operation - Operation name
   * @param {Object} query - Query object
   * @param {Number} executionTime - Execution time in ms
   */
  recordSlowQuery(modelName, operation, query, executionTime) {
    const slowQuery = {
      modelName,
      operation,
      query: JSON.stringify(query),
      executionTime,
      timestamp: new Date()
    };
    
    this.slowQueries.push(slowQuery);
    
    // Limit the number of slow queries we store
    if (this.slowQueries.length > 100) {
      this.slowQueries.shift();
    }
    
    logger.warn(`Slow query detected: ${modelName}.${operation} (${executionTime}ms)`);
  }
  
  /**
   * Get the list of slow queries
   * @returns {Array} - List of slow queries
   */
  getSlowQueries() {
    return this.slowQueries;
  }
  
  /**
   * Analyze a query for potential optimizations
   * @param {Object} model - Mongoose model
   * @param {Object} query - Query object
   * @returns {Object} - Analysis results
   */
  analyzeQuery(model, query) {
    const analysis = {
      modelName: model.modelName,
      query,
      issues: [],
      suggestions: []
    };
    
    // Check for missing indexes
    const schema = model.schema;
    const queryFields = Object.keys(query);
    
    queryFields.forEach(field => {
      if (field !== '_id' && !schema.path(field)?.options?.index) {
        analysis.issues.push(`Field '${field}' is not indexed`);
        analysis.suggestions.push(`Add an index to '${field}' to improve query performance`);
      }
    });
    
    // Check for inefficient operators
    for (const field in query) {
      if (query[field] && typeof query[field] === 'object') {
        if (query[field].$regex && !query[field].$regex.startsWith('^')) {
          analysis.issues.push(`Non-anchored regex on field '${field}'`);
          analysis.suggestions.push(`Use an anchored regex (starting with ^) for better performance`);
        }
        
        if (query[field].$ne !== undefined || query[field].$nin !== undefined) {
          analysis.issues.push(`Inefficient operator ($ne or $nin) on field '${field}'`);
          analysis.suggestions.push(`Avoid using $ne and $nin operators as they require full collection scans`);
        }
      }
    }
    
    return analysis;
  }
}

// Create singleton instance
const dbOptimizer = new DbOptimizer();

module.exports = dbOptimizer;
