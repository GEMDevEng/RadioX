const mongoose = require('mongoose');

const audioClipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    duration: {
      type: Number, // Duration in seconds
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: {
      type: String, // S3 key for the file
      required: true,
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
    },
    format: {
      type: String, // mp3, wav, etc.
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['post', 'thread', 'custom'],
      required: true,
    },
    sourceId: {
      type: String, // X post ID or thread ID
    },
    sourceUrl: {
      type: String, // URL to the original X post
    },
    sourceAuthor: {
      username: String,
      name: String,
      profileImageUrl: String,
    },
    sourceText: {
      type: String, // Original text content
    },
    voiceId: {
      type: String, // ID of the voice used for TTS
      required: true,
    },
    backgroundMusic: {
      enabled: {
        type: Boolean,
        default: false,
      },
      trackId: String,
      volume: {
        type: Number,
        default: 0.1,
      },
    },
    imageUrl: {
      type: String, // Cover image URL
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    podcasts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Podcast',
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
    },
    playCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
audioClipSchema.index({ title: 'text', description: 'text', sourceText: 'text' });

module.exports = mongoose.model('AudioClip', audioClipSchema);
