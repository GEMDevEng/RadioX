const express = require('express');
const router = express.Router();
const {
  getAllFeatureFlags,
  checkFeatureFlag,
  createOrUpdateFeatureFlag,
  deleteFeatureFlag,
} = require('../controllers/featureFlagController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/:name/public', checkFeatureFlag);

// Protected routes (require authentication)
router.get('/:name', protect, checkFeatureFlag);

// Admin routes (require admin privileges)
router.get('/', protect, admin, getAllFeatureFlags);
router.post('/', protect, admin, createOrUpdateFeatureFlag);
router.delete('/:name', protect, admin, deleteFeatureFlag);

module.exports = router;
