const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  exportAudio,
  createShareableLink,
  getSharedItem
} = require('../controllers/exportController');

// Export audio in different formats
router.get('/export/:type/:id', protect, exportAudio);

// Create shareable link
router.get('/share/:type/:id', protect, createShareableLink);

// Get shared item by token
router.get('/shared/:token', getSharedItem);

module.exports = router;
