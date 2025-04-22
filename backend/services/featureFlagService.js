const mongoose = require('mongoose');
const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Feature Flag Service
 * Handles feature flag management for gradual rollouts and A/B testing
 */
class FeatureFlagService {
  /**
   * Get feature flag status
   * @param {string} flagName - Feature flag name
   * @param {string} userId - User ID (optional)
   * @returns {Promise<boolean>} - Flag status (enabled/disabled)
   */
  async isEnabled(flagName, userId = null) {
    try {
      // Check cache first
      const cacheKey = `feature:${flagName}${userId ? `:${userId}` : ''}`;
      const cachedValue = await redis.get(cacheKey);
      
      if (cachedValue !== null) {
        return cachedValue === 'true';
      }
      
      // Get flag from database
      const FeatureFlag = mongoose.model('FeatureFlag');
      const flag = await FeatureFlag.findOne({ name: flagName });
      
      if (!flag) {
        // Flag doesn't exist, default to disabled
        await redis.set(cacheKey, 'false', 'EX', 300); // Cache for 5 minutes
        return false;
      }
      
      // If flag is globally disabled, return false
      if (!flag.enabled) {
        await redis.set(cacheKey, 'false', 'EX', 300);
        return false;
      }
      
      // If no user ID provided, return global status
      if (!userId) {
        await redis.set(cacheKey, String(flag.enabled), 'EX', 300);
        return flag.enabled;
      }
      
      // Check if user is in the target group
      let isEnabled = false;
      
      // Check user IDs list
      if (flag.userIds && flag.userIds.includes(userId)) {
        isEnabled = true;
      }
      
      // Check percentage rollout
      if (!isEnabled && flag.percentage > 0) {
        // Use userId to determine if user is in the percentage
        // This ensures the same user always gets the same result
        const hash = this._hashString(userId + flagName);
        const userValue = hash % 100;
        isEnabled = userValue < flag.percentage;
      }
      
      // Cache the result
      await redis.set(cacheKey, String(isEnabled), 'EX', 300);
      
      return isEnabled;
    } catch (error) {
      logger.error(`Error checking feature flag ${flagName}: ${error.message}`);
      // Default to disabled on error
      return false;
    }
  }
  
  /**
   * Create or update a feature flag
   * @param {string} flagName - Feature flag name
   * @param {Object} options - Flag options
   * @param {boolean} options.enabled - Global enabled status
   * @param {number} options.percentage - Percentage of users to enable (0-100)
   * @param {Array<string>} options.userIds - List of user IDs to enable
   * @returns {Promise<Object>} - Updated feature flag
   */
  async setFlag(flagName, options) {
    try {
      const FeatureFlag = mongoose.model('FeatureFlag');
      
      // Validate options
      const validOptions = {
        enabled: Boolean(options.enabled),
        percentage: Math.min(Math.max(parseInt(options.percentage) || 0, 0), 100),
        userIds: Array.isArray(options.userIds) ? options.userIds : [],
        description: options.description || '',
        updatedAt: new Date()
      };
      
      // Update or create flag
      const flag = await FeatureFlag.findOneAndUpdate(
        { name: flagName },
        { $set: validOptions },
        { new: true, upsert: true }
      );
      
      // Clear cache for this flag
      await redis.del(`feature:${flagName}`);
      
      // Log the change
      logger.info(`Feature flag ${flagName} updated: ${JSON.stringify(validOptions)}`);
      
      return flag;
    } catch (error) {
      logger.error(`Error setting feature flag ${flagName}: ${error.message}`);
      throw new Error(`Failed to set feature flag: ${error.message}`);
    }
  }
  
  /**
   * Delete a feature flag
   * @param {string} flagName - Feature flag name
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFlag(flagName) {
    try {
      const FeatureFlag = mongoose.model('FeatureFlag');
      
      // Delete the flag
      await FeatureFlag.deleteOne({ name: flagName });
      
      // Clear cache for this flag
      await redis.del(`feature:${flagName}`);
      
      // Log the deletion
      logger.info(`Feature flag ${flagName} deleted`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting feature flag ${flagName}: ${error.message}`);
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }
  
  /**
   * Get all feature flags
   * @returns {Promise<Array>} - List of feature flags
   */
  async getAllFlags() {
    try {
      const FeatureFlag = mongoose.model('FeatureFlag');
      return await FeatureFlag.find().sort({ name: 1 });
    } catch (error) {
      logger.error(`Error getting feature flags: ${error.message}`);
      throw new Error(`Failed to get feature flags: ${error.message}`);
    }
  }
  
  /**
   * Simple string hash function
   * @private
   * @param {string} str - String to hash
   * @returns {number} - Hash value
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

module.exports = new FeatureFlagService();
