const asyncHandler = require('express-async-handler');
const AudioClip = require('../models/AudioClip');
const ApiUsage = require('../models/ApiUsage');
const xApiService = require('../services/xApiService');
const ttsService = require('../services/ttsService');
const s3Service = require('../services/s3Service');
const logger = require('../utils/logger');

/**
 * @desc    Get all audio clips for the current user
 * @route   GET /api/audio/clips
 * @access  Private
 */
const getAudioClips = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  // Build query
  const query = { user: req.user._id };
  
  // Add search if provided
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  try {
    // Get total count for pagination
    const total = await AudioClip.countDocuments(query);
    
    // Get audio clips
    const audioClips = await AudioClip.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    res.json({
      audioClips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Error getting audio clips: ${error.message}`);
    res.status(500);
    throw new Error('Error getting audio clips');
  }
});

/**
 * @desc    Get a single audio clip
 * @route   GET /api/audio/clips/:id
 * @access  Private
 */
const getAudioClip = asyncHandler(async (req, res) => {
  try {
    const audioClip = await AudioClip.findById(req.params.id);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    // Check if the audio clip belongs to the user
    if (audioClip.user.toString() !== req.user._id.toString() && !audioClip.isPublic) {
      res.status(403);
      throw new Error('Not authorized to access this audio clip');
    }
    
    res.json(audioClip);
  } catch (error) {
    logger.error(`Error getting audio clip: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error getting audio clip');
  }
});

/**
 * @desc    Create a new audio clip from X post
 * @route   POST /api/audio/clips/from-post
 * @access  Private
 */
const createAudioFromPost = asyncHandler(async (req, res) => {
  const {
    postId,
    title,
    description,
    voiceId,
    backgroundMusic,
    isPublic,
  } = req.body;

  if (!postId || !voiceId) {
    res.status(400);
    throw new Error('Please provide post ID and voice ID');
  }

  try {
    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

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

    // Check if user has reached the posts limit
    if (apiUsage.postsUsed >= apiUsage.postsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly posts limit');
    }

    // Get post using X API service
    const post = await xApiService.getPost(
      postId,
      req.user.xApiConnection.tokenData
    );

    // Generate audio using TTS service
    const audioResult = await ttsService.generateAudio(
      post.text,
      voiceId,
      backgroundMusic
    );

    // Upload audio to S3
    const s3Result = await s3Service.uploadAudio(
      audioResult.audioBuffer,
      `${req.user._id}/posts/${postId}.${audioResult.format}`,
      audioResult.format
    );

    // Create audio clip in database
    const audioClip = await AudioClip.create({
      title: title || `Post by @${post.user.username}`,
      description: description || post.text.substring(0, 200),
      user: req.user._id,
      duration: audioResult.duration,
      fileUrl: s3Result.fileUrl,
      fileKey: s3Result.fileKey,
      fileSize: audioResult.size,
      format: audioResult.format,
      sourceType: 'post',
      sourceId: postId,
      sourceUrl: post.url,
      sourceAuthor: {
        username: post.user.username,
        name: post.user.name,
        profileImageUrl: post.user.profileImageUrl,
      },
      sourceText: post.text,
      voiceId,
      backgroundMusic: {
        enabled: !!backgroundMusic,
        trackId: backgroundMusic?.trackId,
        volume: backgroundMusic?.volume || 0.1,
      },
      imageUrl: post.user.profileImageUrl,
      isPublic: isPublic || false,
    });

    // Update API usage
    apiUsage.postsUsed += 1;
    apiUsage.audioClipsCreated += 1;
    apiUsage.totalAudioDuration += audioResult.duration;
    apiUsage.totalStorageUsed += audioResult.size;
    await apiUsage.save();

    res.status(201).json(audioClip);
  } catch (error) {
    logger.error(`Error creating audio from post: ${error.message}`);
    res.status(500);
    throw new Error('Error creating audio clip: ' + error.message);
  }
});

/**
 * @desc    Create a new audio clip from X thread
 * @route   POST /api/audio/clips/from-thread
 * @access  Private
 */
const createAudioFromThread = asyncHandler(async (req, res) => {
  const {
    threadId,
    title,
    description,
    voiceId,
    backgroundMusic,
    isPublic,
  } = req.body;

  if (!threadId || !voiceId) {
    res.status(400);
    throw new Error('Please provide thread ID and voice ID');
  }

  try {
    // Check if user has reached the API limit
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

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

    // Check if user has reached the posts limit
    if (apiUsage.postsUsed >= apiUsage.postsLimit) {
      res.status(403);
      throw new Error('You have reached your monthly posts limit');
    }

    // Get thread using X API service
    const thread = await xApiService.getThread(
      threadId,
      req.user.xApiConnection.tokenData
    );

    // Combine all posts in the thread
    const combinedText = thread.posts
      .map((post, index) => `Post ${index + 1}: ${post.text}`)
      .join('\n\n');

    // Generate audio using TTS service
    const audioResult = await ttsService.generateAudio(
      combinedText,
      voiceId,
      backgroundMusic
    );

    // Upload audio to S3
    const s3Result = await s3Service.uploadAudio(
      audioResult.audioBuffer,
      `${req.user._id}/threads/${threadId}.${audioResult.format}`,
      audioResult.format
    );

    // Create audio clip in database
    const audioClip = await AudioClip.create({
      title: title || `Thread by @${thread.author.username}`,
      description: description || combinedText.substring(0, 200),
      user: req.user._id,
      duration: audioResult.duration,
      fileUrl: s3Result.fileUrl,
      fileKey: s3Result.fileKey,
      fileSize: audioResult.size,
      format: audioResult.format,
      sourceType: 'thread',
      sourceId: threadId,
      sourceUrl: thread.url,
      sourceAuthor: {
        username: thread.author.username,
        name: thread.author.name,
        profileImageUrl: thread.author.profileImageUrl,
      },
      sourceText: combinedText,
      voiceId,
      backgroundMusic: {
        enabled: !!backgroundMusic,
        trackId: backgroundMusic?.trackId,
        volume: backgroundMusic?.volume || 0.1,
      },
      imageUrl: thread.author.profileImageUrl,
      isPublic: isPublic || false,
    });

    // Update API usage
    apiUsage.postsUsed += thread.posts.length;
    apiUsage.audioClipsCreated += 1;
    apiUsage.totalAudioDuration += audioResult.duration;
    apiUsage.totalStorageUsed += audioResult.size;
    await apiUsage.save();

    res.status(201).json(audioClip);
  } catch (error) {
    logger.error(`Error creating audio from thread: ${error.message}`);
    res.status(500);
    throw new Error('Error creating audio clip: ' + error.message);
  }
});

/**
 * @desc    Create a new audio clip from custom text
 * @route   POST /api/audio/clips/from-text
 * @access  Private
 */
const createAudioFromText = asyncHandler(async (req, res) => {
  const {
    text,
    title,
    description,
    voiceId,
    backgroundMusic,
    isPublic,
  } = req.body;

  if (!text || !voiceId) {
    res.status(400);
    throw new Error('Please provide text and voice ID');
  }

  try {
    // Generate audio using TTS service
    const audioResult = await ttsService.generateAudio(
      text,
      voiceId,
      backgroundMusic
    );

    // Upload audio to S3
    const s3Result = await s3Service.uploadAudio(
      audioResult.audioBuffer,
      `${req.user._id}/custom/${Date.now()}.${audioResult.format}`,
      audioResult.format
    );

    // Create audio clip in database
    const audioClip = await AudioClip.create({
      title: title || 'Custom Audio',
      description: description || text.substring(0, 200),
      user: req.user._id,
      duration: audioResult.duration,
      fileUrl: s3Result.fileUrl,
      fileKey: s3Result.fileKey,
      fileSize: audioResult.size,
      format: audioResult.format,
      sourceType: 'custom',
      sourceText: text,
      voiceId,
      backgroundMusic: {
        enabled: !!backgroundMusic,
        trackId: backgroundMusic?.trackId,
        volume: backgroundMusic?.volume || 0.1,
      },
      isPublic: isPublic || false,
    });

    // Update API usage
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

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

    apiUsage.audioClipsCreated += 1;
    apiUsage.totalAudioDuration += audioResult.duration;
    apiUsage.totalStorageUsed += audioResult.size;
    await apiUsage.save();

    res.status(201).json(audioClip);
  } catch (error) {
    logger.error(`Error creating audio from text: ${error.message}`);
    res.status(500);
    throw new Error('Error creating audio clip: ' + error.message);
  }
});

/**
 * @desc    Update an audio clip
 * @route   PUT /api/audio/clips/:id
 * @access  Private
 */
const updateAudioClip = asyncHandler(async (req, res) => {
  const { title, description, isPublic } = req.body;

  try {
    const audioClip = await AudioClip.findById(req.params.id);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    // Check if the audio clip belongs to the user
    if (audioClip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this audio clip');
    }
    
    // Update fields
    if (title) audioClip.title = title;
    if (description !== undefined) audioClip.description = description;
    if (isPublic !== undefined) audioClip.isPublic = isPublic;
    
    const updatedAudioClip = await audioClip.save();
    
    res.json(updatedAudioClip);
  } catch (error) {
    logger.error(`Error updating audio clip: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error updating audio clip');
  }
});

/**
 * @desc    Delete an audio clip
 * @route   DELETE /api/audio/clips/:id
 * @access  Private
 */
const deleteAudioClip = asyncHandler(async (req, res) => {
  try {
    const audioClip = await AudioClip.findById(req.params.id);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    // Check if the audio clip belongs to the user
    if (audioClip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this audio clip');
    }
    
    // Delete from S3
    await s3Service.deleteFile(audioClip.fileKey);
    
    // Delete from database
    await audioClip.remove();
    
    // Update API usage
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    const apiUsage = await ApiUsage.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    if (apiUsage) {
      apiUsage.totalStorageUsed -= audioClip.fileSize;
      if (apiUsage.totalStorageUsed < 0) apiUsage.totalStorageUsed = 0;
      await apiUsage.save();
    }
    
    res.json({ message: 'Audio clip removed' });
  } catch (error) {
    logger.error(`Error deleting audio clip: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error deleting audio clip');
  }
});

/**
 * @desc    Increment play count for an audio clip
 * @route   PUT /api/audio/clips/:id/play
 * @access  Private
 */
const incrementPlayCount = asyncHandler(async (req, res) => {
  try {
    const audioClip = await AudioClip.findById(req.params.id);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    // Check if the audio clip belongs to the user or is public
    if (audioClip.user.toString() !== req.user._id.toString() && !audioClip.isPublic) {
      res.status(403);
      throw new Error('Not authorized to access this audio clip');
    }
    
    // Increment play count
    audioClip.playCount += 1;
    await audioClip.save();
    
    res.json({ success: true, playCount: audioClip.playCount });
  } catch (error) {
    logger.error(`Error incrementing play count: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error incrementing play count');
  }
});

/**
 * @desc    Increment download count for an audio clip
 * @route   PUT /api/audio/clips/:id/download
 * @access  Private
 */
const incrementDownloadCount = asyncHandler(async (req, res) => {
  try {
    const audioClip = await AudioClip.findById(req.params.id);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    // Check if the audio clip belongs to the user or is public
    if (audioClip.user.toString() !== req.user._id.toString() && !audioClip.isPublic) {
      res.status(403);
      throw new Error('Not authorized to access this audio clip');
    }
    
    // Increment download count
    audioClip.downloadCount += 1;
    await audioClip.save();
    
    res.json({ success: true, downloadCount: audioClip.downloadCount });
  } catch (error) {
    logger.error(`Error incrementing download count: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error incrementing download count');
  }
});

module.exports = {
  getAudioClips,
  getAudioClip,
  createAudioFromPost,
  createAudioFromThread,
  createAudioFromText,
  updateAudioClip,
  deleteAudioClip,
  incrementPlayCount,
  incrementDownloadCount,
};
