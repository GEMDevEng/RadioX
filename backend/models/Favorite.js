const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType'
    },
    itemType: {
      type: String,
      required: true,
      enum: ['AudioClip', 'Podcast'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user + item + itemType to ensure uniqueness
favoriteSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
