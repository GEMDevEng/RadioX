const mongoose = require('mongoose');

const FeatureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Feature flag name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    userIds: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for faster queries
FeatureFlagSchema.index({ name: 1 });

module.exports = mongoose.model('FeatureFlag', FeatureFlagSchema);
