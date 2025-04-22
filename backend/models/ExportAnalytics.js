const mongoose = require('mongoose');

const exportAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType',
      index: true
    },
    itemType: {
      type: String,
      required: true,
      enum: ['AudioClip', 'Podcast'],
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: ['export', 'share'],
      index: true
    },
    format: {
      type: String,
      enum: ['mp3', 'wav', 'ogg', null],
      default: null
    },
    platform: {
      type: String,
      enum: ['link', 'twitter', 'facebook', 'linkedin', null],
      default: null
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const ExportAnalytics = mongoose.model('ExportAnalytics', exportAnalyticsSchema);

module.exports = ExportAnalytics;
