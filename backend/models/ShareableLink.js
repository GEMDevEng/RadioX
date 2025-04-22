const mongoose = require('mongoose');

const shareableLinkSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType'
    },
    itemType: {
      type: String,
      required: true,
      enum: ['AudioClip', 'Podcast']
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default expiration is 1 year from creation
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return oneYearFromNow;
      }
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastClickedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index for itemId + itemType to ensure uniqueness
shareableLinkSchema.index({ itemId: 1, itemType: 1 }, { unique: true });

const ShareableLink = mongoose.model('ShareableLink', shareableLinkSchema);

module.exports = ShareableLink;
