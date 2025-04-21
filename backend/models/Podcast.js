const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Business',
        'Education',
        'Science',
        'Health',
        'Arts',
        'News',
        'Society',
        'Sports',
        'Comedy',
        'Other',
      ],
      default: 'Technology',
    },
    language: {
      type: String,
      required: true,
      default: 'en',
    },
    author: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    explicit: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
    },
    imageKey: {
      type: String, // S3 key for the image
    },
    rssUrl: {
      type: String,
    },
    episodes: [
      {
        audioClip: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'AudioClip',
        },
        order: {
          type: Number,
          required: true,
        },
        publishedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    subscriptionCount: {
      type: Number,
      default: 0,
    },
    totalPlays: {
      type: Number,
      default: 0,
    },
    lastBuildDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
podcastSchema.index({ title: 'text', description: 'text', author: 'text' });

// Virtual for episode count
podcastSchema.virtual('episodeCount').get(function () {
  return this.episodes.length;
});

// Set toJSON option to include virtuals
podcastSchema.set('toJSON', { virtuals: true });
podcastSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Podcast', podcastSchema);
