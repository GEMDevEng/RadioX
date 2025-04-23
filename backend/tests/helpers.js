const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Object} - Created user
 */
const createUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };
  
  const user = new User({
    ...defaultUser,
    ...userData
  });
  
  await user.save();
  return user;
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Create a test audio clip
 * @param {Object} audioData - Audio clip data
 * @param {Object} user - User who created the clip
 * @returns {Object} - Created audio clip
 */
const createAudioClip = async (audioData = {}, user) => {
  const AudioClip = require('../models/AudioClip');
  
  const defaultAudio = {
    title: 'Test Audio Clip',
    description: 'This is a test audio clip',
    audioUrl: 'https://example.com/test-audio.mp3',
    duration: 120, // 2 minutes
    sourceUrl: 'https://x.com/test/status/123456789',
    sourceType: 'post',
    user: user._id
  };
  
  const audioClip = new AudioClip({
    ...defaultAudio,
    ...audioData
  });
  
  await audioClip.save();
  return audioClip;
};

/**
 * Create a test podcast
 * @param {Object} podcastData - Podcast data
 * @param {Object} user - User who created the podcast
 * @returns {Object} - Created podcast
 */
const createPodcast = async (podcastData = {}, user) => {
  const Podcast = require('../models/Podcast');
  
  const defaultPodcast = {
    title: 'Test Podcast',
    description: 'This is a test podcast',
    audioUrl: 'https://example.com/test-podcast.mp3',
    duration: 1800, // 30 minutes
    coverImage: 'https://example.com/test-cover.jpg',
    episodes: [],
    user: user._id
  };
  
  const podcast = new Podcast({
    ...defaultPodcast,
    ...podcastData
  });
  
  await podcast.save();
  return podcast;
};

/**
 * Create a test favorite
 * @param {Object} user - User who created the favorite
 * @param {Object} item - Item to favorite
 * @param {String} itemType - Type of item ('audio' or 'podcast')
 * @returns {Object} - Created favorite
 */
const createFavorite = async (user, item, itemType = 'audio') => {
  const Favorite = require('../models/Favorite');
  
  const favorite = new Favorite({
    user: user._id,
    item: item._id,
    itemType
  });
  
  await favorite.save();
  return favorite;
};

/**
 * Generate a random MongoDB ObjectId
 * @returns {ObjectId} - Random ObjectId
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};

module.exports = {
  createUser,
  generateToken,
  createAudioClip,
  createPodcast,
  createFavorite,
  generateObjectId
};
