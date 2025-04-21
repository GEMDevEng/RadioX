const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  searchByHashtag,
  searchByUser,
  getPostByUrl,
  getThreadByUrl,
} = require('../controllers/searchController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Search routes
router.get('/hashtag', searchByHashtag);
router.get('/user', searchByUser);
router.get('/url', getPostByUrl);
router.get('/thread', getThreadByUrl);

module.exports = router;
