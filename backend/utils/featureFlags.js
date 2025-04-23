const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Feature Flag Schema
 */
const FeatureFlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  userPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  userIds: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
FeatureFlagSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model
const FeatureFlag = mongoose.model('FeatureFlag', FeatureFlagSchema);

// In-memory cache for feature flags
let featureFlagsCache = {};
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Initialize feature flags
 * @param {Array} defaultFlags - Default feature flags
 */
const initializeFeatureFlags = async (defaultFlags = []) => {
  try {
    // Create default feature flags if they don't exist
    for (const flag of defaultFlags) {
      await FeatureFlag.findOneAndUpdate(
        { name: flag.name },
        { $setOnInsert: flag },
        { upsert: true, new: true }
      );
    }
    
    // Load all feature flags into cache
    await refreshCache();
    
    logger.info('Feature flags initialized');
  } catch (error) {
    logger.error('Error initializing feature flags:', error);
  }
};

/**
 * Refresh the feature flags cache
 */
const refreshCache = async () => {
  try {
    const flags = await FeatureFlag.find();
    
    // Update cache
    featureFlagsCache = {};
    flags.forEach(flag => {
      featureFlagsCache[flag.name] = {
        enabled: flag.enabled,
        userPercentage: flag.userPercentage,
        userIds: flag.userIds.map(id => id.toString())
      };
    });
    
    lastCacheUpdate = Date.now();
    logger.debug('Feature flags cache refreshed');
  } catch (error) {
    logger.error('Error refreshing feature flags cache:', error);
  }
};

/**
 * Check if a feature flag is enabled
 * @param {String} flagName - Feature flag name
 * @param {Object} user - User object (optional)
 * @returns {Boolean} - Whether the feature is enabled
 */
const isFeatureEnabled = async (flagName, user = null) => {
  try {
    // Refresh cache if needed
    if (Date.now() - lastCacheUpdate > CACHE_TTL) {
      await refreshCache();
    }
    
    // Check if flag exists in cache
    const flag = featureFlagsCache[flagName];
    if (!flag) {
      logger.warn(`Feature flag "${flagName}" not found`);
      return false;
    }
    
    // If flag is disabled, return false
    if (!flag.enabled) {
      return false;
    }
    
    // If no user, return true (flag is globally enabled)
    if (!user) {
      return true;
    }
    
    // Check if user is in the userIds list
    const userId = user._id.toString();
    if (flag.userIds.includes(userId)) {
      return true;
    }
    
    // Check if user is in the percentage rollout
    if (flag.userPercentage > 0) {
      // Use a deterministic hash of the user ID and flag name
      const hash = hashString(`${userId}-${flagName}`);
      const percentage = hash % 100;
      
      return percentage < flag.userPercentage;
    }
    
    // Default to true if flag is enabled globally
    return true;
  } catch (error) {
    logger.error(`Error checking feature flag "${flagName}":`, error);
    return false;
  }
};

/**
 * Create a simple hash from a string
 * @param {String} str - String to hash
 * @returns {Number} - Hash value
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Feature flag middleware
 * @param {String} flagName - Feature flag name
 * @param {Boolean} redirectOnDisabled - Whether to redirect on disabled
 * @param {String} redirectUrl - URL to redirect to if feature is disabled
 * @returns {Function} - Express middleware
 */
const featureFlagMiddleware = (flagName, redirectOnDisabled = false, redirectUrl = '/') => {
  return async (req, res, next) => {
    const isEnabled = await isFeatureEnabled(flagName, req.user);
    
    if (isEnabled) {
      // Add feature flag to request
      req.featureFlags = req.featureFlags || {};
      req.featureFlags[flagName] = true;
      return next();
    }
    
    if (redirectOnDisabled) {
      return res.redirect(redirectUrl);
    }
    
    return res.status(404).json({
      message: 'Feature not available'
    });
  };
};

module.exports = {
  FeatureFlag,
  initializeFeatureFlags,
  isFeatureEnabled,
  featureFlagMiddleware,
  refreshCache
};
