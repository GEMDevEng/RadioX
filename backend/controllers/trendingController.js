const TrendingHashtag = require('../models/TrendingHashtag');
const Post = require('../models/AudioClip'); // Using AudioClip as a proxy for posts
const asyncHandler = require('express-async-handler');
const { startOfDay, startOfWeek, startOfMonth, subDays } = require('date-fns');

// Get trending hashtags
const getTrendingHashtags = asyncHandler(async (req, res) => {
  const { timeframe = 'daily', limit = 10 } = req.query;
  
  // Validate timeframe
  if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
    return res.status(400).json({ message: 'Invalid timeframe' });
  }
  
  // Get trending hashtags from our pre-calculated collection
  const trendingHashtags = await TrendingHashtag.find({ timeframe })
    .sort({ score: -1 })
    .limit(parseInt(limit));
  
  res.json(trendingHashtags);
});

// Get hashtag suggestions based on user history
const getHashtagSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 5 } = req.query;
  
  // Get user's recent searches or interactions
  const userAudioClips = await Post.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);
  
  // Extract hashtags from user's content
  const userHashtags = new Set();
  userAudioClips.forEach(clip => {
    if (clip.hashtags && Array.isArray(clip.hashtags)) {
      clip.hashtags.forEach(tag => userHashtags.add(tag));
    }
  });
  
  // If user has no hashtags, return trending instead
  if (userHashtags.size === 0) {
    const trending = await TrendingHashtag.find({ timeframe: 'daily' })
      .sort({ score: -1 })
      .limit(parseInt(limit));
    
    return res.json(trending);
  }
  
  // Find related hashtags that appear together with user's hashtags
  const relatedHashtags = await Post.aggregate([
    { $match: { hashtags: { $in: Array.from(userHashtags) } } },
    { $unwind: '$hashtags' },
    { $match: { hashtags: { $nin: Array.from(userHashtags) } } },
    { $group: {
        _id: '$hashtags',
        count: { $sum: 1 },
        engagementScore: { $sum: '$engagementScore' }
      }
    },
    { $project: {
        hashtag: '$_id',
        count: 1,
        engagementScore: 1,
        score: { $add: [
          { $multiply: ['$count', 1] },
          { $multiply: ['$engagementScore', 0.5] }
        ]}
      }
    },
    { $sort: { score: -1 } },
    { $limit: parseInt(limit) }
  ]);
  
  res.json(relatedHashtags);
});

// Update trending hashtags (called by scheduled job)
const updateTrendingHashtags = asyncHandler(async () => {
  const timeframes = ['daily', 'weekly', 'monthly'];
  
  for (const timeframe of timeframes) {
    let startDate;
    const now = new Date();
    
    switch (timeframe) {
      case 'daily':
        startDate = startOfDay(subDays(now, 1));
        break;
      case 'weekly':
        startDate = startOfWeek(subDays(now, 7));
        break;
      case 'monthly':
        startDate = startOfMonth(subDays(now, 30));
        break;
    }
    
    // Aggregate posts to find trending hashtags
    const hashtagAggregation = await Post.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$hashtags' },
      { $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          engagementSum: { $sum: '$engagementScore' }
        }
      },
      { $project: {
          hashtag: '$_id',
          count: 1,
          engagementScore: '$engagementSum',
          score: { $add: [
            { $multiply: ['$count', 1] },
            { $multiply: ['$engagementSum', 0.5] }
          ]}
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);
    
    // Update trending hashtags collection
    for (const item of hashtagAggregation) {
      await TrendingHashtag.findOneAndUpdate(
        { hashtag: item.hashtag, timeframe },
        {
          hashtag: item.hashtag,
          count: item.count,
          engagementScore: item.engagementScore,
          score: item.score,
          timeframe
        },
        { upsert: true, new: true }
      );
    }
  }
  
  console.log('Trending hashtags updated successfully');
});

module.exports = {
  getTrendingHashtags,
  getHashtagSuggestions,
  updateTrendingHashtags
};
