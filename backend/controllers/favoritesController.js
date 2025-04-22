const Favorite = require('../models/Favorite');
const AudioClip = require('../models/AudioClip');
const Podcast = require('../models/Podcast');
const asyncHandler = require('express-async-handler');

// Get all favorites for a user
const getFavorites = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const userId = req.user.id;
  
  let query = { user: userId };
  if (type && type !== 'all') {
    query.itemType = type === 'audio' ? 'AudioClip' : 'Podcast';
  }
  
  const favorites = await Favorite.find(query)
    .populate('item')
    .sort({ createdAt: -1 });
    
  res.json(favorites);
});

// Add to favorites
const addToFavorites = asyncHandler(async (req, res) => {
  const { itemId, itemType } = req.body;
  const userId = req.user.id;
  
  // Validate itemType
  if (!['AudioClip', 'Podcast'].includes(itemType)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }
  
  // Check if already in favorites
  const existingFavorite = await Favorite.findOne({
    user: userId,
    item: itemId,
    itemType
  });
  
  if (existingFavorite) {
    return res.status(400).json({ message: 'Item already in favorites' });
  }
  
  // Verify item exists
  let itemExists = false;
  if (itemType === 'AudioClip') {
    itemExists = await AudioClip.exists({ _id: itemId });
  } else if (itemType === 'Podcast') {
    itemExists = await Podcast.exists({ _id: itemId });
  }
  
  if (!itemExists) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Create favorite
  const favorite = await Favorite.create({
    user: userId,
    item: itemId,
    itemType
  });
  
  res.status(201).json(favorite);
});

// Remove from favorites
const removeFromFavorites = asyncHandler(async (req, res) => {
  const favoriteId = req.params.id;
  const userId = req.user.id;
  
  const favorite = await Favorite.findOne({
    _id: favoriteId,
    user: userId
  });
  
  if (!favorite) {
    return res.status(404).json({ message: 'Favorite not found' });
  }
  
  await favorite.remove();
  res.json({ message: 'Removed from favorites' });
});

// Check if item is in favorites
const checkFavorite = asyncHandler(async (req, res) => {
  const { itemId, itemType } = req.query;
  const userId = req.user.id;
  
  const favorite = await Favorite.findOne({
    user: userId,
    item: itemId,
    itemType
  });
  
  res.json({ isFavorite: !!favorite, favoriteId: favorite ? favorite._id : null });
});

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
};
