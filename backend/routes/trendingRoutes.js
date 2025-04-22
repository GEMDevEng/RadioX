const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTrendingHashtags,
  getHashtagSuggestions
} = require('../controllers/trendingController');

// Get trending hashtags
router.get('/', getTrendingHashtags);

// Get hashtag suggestions based on user history
router.get('/suggestions', protect, getHashtagSuggestions);

module.exports = router;
