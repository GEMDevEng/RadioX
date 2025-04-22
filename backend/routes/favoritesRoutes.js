const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
} = require('../controllers/favoritesController');

// Get all favorites for the current user
router.get('/', protect, getFavorites);

// Add an item to favorites
router.post('/', protect, addToFavorites);

// Remove an item from favorites
router.delete('/:id', protect, removeFromFavorites);

// Check if an item is in favorites
router.get('/check', protect, checkFavorite);

module.exports = router;
