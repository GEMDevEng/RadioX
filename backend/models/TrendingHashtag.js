const mongoose = require('mongoose');

const trendingHashtagSchema = new mongoose.Schema(
  {
    hashtag: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      required: true,
      default: 0,
      index: true
    },
    timeframe: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for hashtag + timeframe to ensure uniqueness
trendingHashtagSchema.index({ hashtag: 1, timeframe: 1 }, { unique: true });

const TrendingHashtag = mongoose.model('TrendingHashtag', trendingHashtagSchema);

module.exports = TrendingHashtag;
