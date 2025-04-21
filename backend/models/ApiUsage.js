const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number, // e.g., 2023
      required: true,
    },
    postsUsed: {
      type: Number,
      default: 0,
    },
    postsLimit: {
      type: Number,
      default: 500, // Free tier limit
    },
    readRequestsUsed: {
      type: Number,
      default: 0,
    },
    readRequestsLimit: {
      type: Number,
      default: 100, // Free tier limit
    },
    audioClipsCreated: {
      type: Number,
      default: 0,
    },
    totalAudioDuration: {
      type: Number, // Total duration in seconds
      default: 0,
    },
    totalStorageUsed: {
      type: Number, // Total storage in bytes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user, month, and year
apiUsageSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ApiUsage', apiUsageSchema);
