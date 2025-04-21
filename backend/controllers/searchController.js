const asyncHandler = require('express-async-handler');
const ApiUsage = require('../models/ApiUsage');
const xApiService = require('../services/xApiService');
const logger = require('../utils/logger');

/**
 * @desc    Search X posts by hashtag
 * @route   GET /api/search/hashtag
 * @access  Private
 */
const searchByHashtag = asyncHandler(async (req, res) => {
  const { term, textOnly, minLikes, maxResults = 10 } = req.query;

  if (!term) {
    res.status(400);
    throw new Error('Please provide a search term');
  }

  try {
    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    let apiUsage = await ApiUsage.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    if (!apiUsage) {
      // Create new usage record for this month
      apiUsage = await ApiUsage.create({
        user: req.user._id,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Check if user has reached the read requests limit
    if (apiUsage.readRequestsUsed >= apiUsage.readRequestsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly read requests limit');
    }

    // Search posts using X API service
    const posts = await xApiService.searchHashtag(
      term,
      {
        textOnly: textOnly === 'true',
        minLikes: parseInt(minLikes) || 0,
        maxResults: parseInt(maxResults) || 10,
      },
      req.user.xApiConnection.tokenData
    );

    // Update API usage
    apiUsage.readRequestsUsed += 1;
    await apiUsage.save();

    res.json(posts);
  } catch (error) {
    logger.error(`Error searching hashtag: ${error.message}`);
    res.status(500);
    throw new Error('Error searching X posts: ' + error.message);
  }
});

/**
 * @desc    Search X posts by user
 * @route   GET /api/search/user
 * @access  Private
 */
const searchByUser = asyncHandler(async (req, res) => {
  const { username, textOnly, minLikes, maxResults = 10 } = req.query;

  if (!username) {
    res.status(400);
    throw new Error('Please provide a username');
  }

  try {
    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    let apiUsage = await ApiUsage.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    if (!apiUsage) {
      // Create new usage record for this month
      apiUsage = await ApiUsage.create({
        user: req.user._id,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Check if user has reached the read requests limit
    if (apiUsage.readRequestsUsed >= apiUsage.readRequestsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly read requests limit');
    }

    // Search posts using X API service
    const posts = await xApiService.searchUser(
      username,
      {
        textOnly: textOnly === 'true',
        minLikes: parseInt(minLikes) || 0,
        maxResults: parseInt(maxResults) || 10,
      },
      req.user.xApiConnection.tokenData
    );

    // Update API usage
    apiUsage.readRequestsUsed += 1;
    await apiUsage.save();

    res.json(posts);
  } catch (error) {
    logger.error(`Error searching user posts: ${error.message}`);
    res.status(500);
    throw new Error('Error searching X posts: ' + error.message);
  }
});

/**
 * @desc    Get X post by URL
 * @route   GET /api/search/url
 * @access  Private
 */
const getPostByUrl = asyncHandler(async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400);
    throw new Error('Please provide a post URL');
  }

  try {
    // Extract post ID from URL
    const postId = xApiService.extractPostIdFromUrl(url);
    
    if (!postId) {
      res.status(400);
      throw new Error('Invalid X post URL');
    }

    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    let apiUsage = await ApiUsage.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    if (!apiUsage) {
      // Create new usage record for this month
      apiUsage = await ApiUsage.create({
        user: req.user._id,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Check if user has reached the read requests limit
    if (apiUsage.readRequestsUsed >= apiUsage.readRequestsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly read requests limit');
    }

    // Get post using X API service
    const post = await xApiService.getPost(
      postId,
      req.user.xApiConnection.tokenData
    );

    // Update API usage
    apiUsage.readRequestsUsed += 1;
    await apiUsage.save();

    res.json(post);
  } catch (error) {
    logger.error(`Error getting post by URL: ${error.message}`);
    res.status(500);
    throw new Error('Error getting X post: ' + error.message);
  }
});

/**
 * @desc    Get thread by URL
 * @route   GET /api/search/thread
 * @access  Private
 */
const getThreadByUrl = asyncHandler(async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400);
    throw new Error('Please provide a thread URL');
  }

  try {
    // Extract post ID from URL
    const postId = xApiService.extractPostIdFromUrl(url);
    
    if (!postId) {
      res.status(400);
      throw new Error('Invalid X post URL');
    }

    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    let apiUsage = await ApiUsage.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    if (!apiUsage) {
      // Create new usage record for this month
      apiUsage = await ApiUsage.create({
        user: req.user._id,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Check if user has reached the read requests limit
    if (apiUsage.readRequestsUsed >= apiUsage.readRequestsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly read requests limit');
    }

    // Get thread using X API service
    const thread = await xApiService.getThread(
      postId,
      req.user.xApiConnection.tokenData
    );

    // Update API usage
    apiUsage.readRequestsUsed += 1;
    await apiUsage.save();

    res.json(thread);
  } catch (error) {
    logger.error(`Error getting thread by URL: ${error.message}`);
    res.status(500);
    throw new Error('Error getting X thread: ' + error.message);
  }
});

module.exports = {
  searchByHashtag,
  searchByUser,
  getPostByUrl,
  getThreadByUrl,
};
