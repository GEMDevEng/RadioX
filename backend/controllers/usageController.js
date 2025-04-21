const asyncHandler = require('express-async-handler');
const ApiUsage = require('../models/ApiUsage');
const AudioClip = require('../models/AudioClip');
const logger = require('../utils/logger');

/**
 * @desc    Get API usage statistics for the current user
 * @route   GET /api/usage/stats
 * @access  Private
 */
const getUsageStats = asyncHandler(async (req, res) => {
  try {
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Get API usage for current month
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

    // Get total audio clips count
    const totalAudioClips = await AudioClip.countDocuments({
      user: req.user._id,
    });

    // Get total podcasts count (from user model)
    const totalPodcasts = req.user.podcastCount || 0;

    // Calculate percentages
    const postsPercentage = (apiUsage.postsUsed / apiUsage.postsLimit) * 100;
    const readRequestsPercentage = (apiUsage.readRequestsUsed / apiUsage.readRequestsLimit) * 100;

    // Format response
    const stats = {
      audioClips: totalAudioClips,
      podcasts: totalPodcasts,
      apiUsage: {
        postsUsed: apiUsage.postsUsed,
        postsLimit: apiUsage.postsLimit,
        postsPercentage: Math.round(postsPercentage),
        readRequestsUsed: apiUsage.readRequestsUsed,
        readRequestsLimit: apiUsage.readRequestsLimit,
        readRequestsPercentage: Math.round(readRequestsPercentage),
        audioClipsCreated: apiUsage.audioClipsCreated,
        totalAudioDuration: apiUsage.totalAudioDuration,
        totalStorageUsed: apiUsage.totalStorageUsed,
      },
      month: currentMonth,
      year: currentYear,
    };

    res.json(stats);
  } catch (error) {
    logger.error(`Error getting usage stats: ${error.message}`);
    res.status(500);
    throw new Error('Error getting usage statistics');
  }
});

/**
 * @desc    Get API usage history for the current user
 * @route   GET /api/usage/history
 * @access  Private
 */
const getUsageHistory = asyncHandler(async (req, res) => {
  try {
    // Get usage history for the last 6 months
    const currentDate = new Date();
    const history = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const month = date.getMonth() + 1; // 1-12
      const year = date.getFullYear();

      const apiUsage = await ApiUsage.findOne({
        user: req.user._id,
        month,
        year,
      });

      if (apiUsage) {
        history.push({
          month,
          year,
          postsUsed: apiUsage.postsUsed,
          postsLimit: apiUsage.postsLimit,
          readRequestsUsed: apiUsage.readRequestsUsed,
          readRequestsLimit: apiUsage.readRequestsLimit,
          audioClipsCreated: apiUsage.audioClipsCreated,
          totalAudioDuration: apiUsage.totalAudioDuration,
          totalStorageUsed: apiUsage.totalStorageUsed,
        });
      } else {
        history.push({
          month,
          year,
          postsUsed: 0,
          postsLimit: 500,
          readRequestsUsed: 0,
          readRequestsLimit: 100,
          audioClipsCreated: 0,
          totalAudioDuration: 0,
          totalStorageUsed: 0,
        });
      }
    }

    res.json(history);
  } catch (error) {
    logger.error(`Error getting usage history: ${error.message}`);
    res.status(500);
    throw new Error('Error getting usage history');
  }
});

/**
 * @desc    Get audio clip statistics
 * @route   GET /api/usage/audio-stats
 * @access  Private
 */
const getAudioStats = asyncHandler(async (req, res) => {
  try {
    // Get total audio clips count
    const totalAudioClips = await AudioClip.countDocuments({
      user: req.user._id,
    });

    // Get total duration of all audio clips
    const audioClips = await AudioClip.find({ user: req.user._id });
    const totalDuration = audioClips.reduce((total, clip) => total + clip.duration, 0);

    // Get most played audio clips
    const mostPlayed = await AudioClip.find({ user: req.user._id })
      .sort({ playCount: -1 })
      .limit(5)
      .select('title playCount');

    // Get most downloaded audio clips
    const mostDownloaded = await AudioClip.find({ user: req.user._id })
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title downloadCount');

    // Get audio clips by source type
    const postClips = await AudioClip.countDocuments({
      user: req.user._id,
      sourceType: 'post',
    });
    
    const threadClips = await AudioClip.countDocuments({
      user: req.user._id,
      sourceType: 'thread',
    });
    
    const customClips = await AudioClip.countDocuments({
      user: req.user._id,
      sourceType: 'custom',
    });

    // Format response
    const stats = {
      totalAudioClips,
      totalDuration,
      averageDuration: totalAudioClips > 0 ? totalDuration / totalAudioClips : 0,
      mostPlayed,
      mostDownloaded,
      sourceTypes: {
        post: postClips,
        thread: threadClips,
        custom: customClips,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error(`Error getting audio stats: ${error.message}`);
    res.status(500);
    throw new Error('Error getting audio statistics');
  }
});

module.exports = {
  getUsageStats,
  getUsageHistory,
  getAudioStats,
};
