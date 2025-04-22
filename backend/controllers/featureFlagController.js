const asyncHandler = require('express-async-handler');
const featureFlagService = require('../services/featureFlagService');
const logger = require('../utils/logger');

/**
 * @desc    Get all feature flags
 * @route   GET /api/feature-flags
 * @access  Private/Admin
 */
const getAllFeatureFlags = asyncHandler(async (req, res) => {
  try {
    const flags = await featureFlagService.getAllFlags();
    res.json(flags);
  } catch (error) {
    logger.error(`Error getting feature flags: ${error.message}`);
    res.status(500);
    throw new Error('Error getting feature flags');
  }
});

/**
 * @desc    Check if a feature flag is enabled
 * @route   GET /api/feature-flags/:name
 * @access  Private
 */
const checkFeatureFlag = asyncHandler(async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.user ? req.user._id : null;
    
    const isEnabled = await featureFlagService.isEnabled(name, userId);
    
    res.json({
      name,
      enabled: isEnabled,
    });
  } catch (error) {
    logger.error(`Error checking feature flag: ${error.message}`);
    res.status(500);
    throw new Error('Error checking feature flag');
  }
});

/**
 * @desc    Create or update a feature flag
 * @route   POST /api/feature-flags
 * @access  Private/Admin
 */
const createOrUpdateFeatureFlag = asyncHandler(async (req, res) => {
  try {
    const { name, enabled, percentage, userIds, description } = req.body;
    
    if (!name) {
      res.status(400);
      throw new Error('Feature flag name is required');
    }
    
    const flag = await featureFlagService.setFlag(name, {
      enabled,
      percentage,
      userIds,
      description,
    });
    
    res.status(201).json(flag);
  } catch (error) {
    logger.error(`Error creating/updating feature flag: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error creating/updating feature flag');
  }
});

/**
 * @desc    Delete a feature flag
 * @route   DELETE /api/feature-flags/:name
 * @access  Private/Admin
 */
const deleteFeatureFlag = asyncHandler(async (req, res) => {
  try {
    const { name } = req.params;
    
    await featureFlagService.deleteFlag(name);
    
    res.json({
      message: `Feature flag '${name}' deleted successfully`,
    });
  } catch (error) {
    logger.error(`Error deleting feature flag: ${error.message}`);
    res.status(500);
    throw new Error('Error deleting feature flag');
  }
});

module.exports = {
  getAllFeatureFlags,
  checkFeatureFlag,
  createOrUpdateFeatureFlag,
  deleteFeatureFlag,
};
