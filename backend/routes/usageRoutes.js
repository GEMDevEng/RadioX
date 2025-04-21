const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getUsageStats,
  getUsageHistory,
  getAudioStats,
} = require('../controllers/usageController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Usage routes
router.get('/stats', getUsageStats);
router.get('/history', getUsageHistory);
router.get('/audio-stats', getAudioStats);

module.exports = router;
