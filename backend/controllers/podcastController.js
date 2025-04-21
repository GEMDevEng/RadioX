const asyncHandler = require('express-async-handler');
const Podcast = require('../models/Podcast');
const AudioClip = require('../models/AudioClip');
const s3Service = require('../services/s3Service');
const rssService = require('../services/rssService');
const logger = require('../utils/logger');

/**
 * @desc    Get all podcasts for the current user
 * @route   GET /api/podcast
 * @access  Private
 */
const getPodcasts = asyncHandler(async (req, res) => {
  try {
    const podcasts = await Podcast.find({ user: req.user._id });
    res.json(podcasts);
  } catch (error) {
    logger.error(`Error getting podcasts: ${error.message}`);
    res.status(500);
    throw new Error('Error getting podcasts');
  }
});

/**
 * @desc    Get a single podcast
 * @route   GET /api/podcast/:id
 * @access  Private
 */
const getPodcast = asyncHandler(async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString() && !podcast.isPublic) {
      res.status(403);
      throw new Error('Not authorized to access this podcast');
    }
    
    res.json(podcast);
  } catch (error) {
    logger.error(`Error getting podcast: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error getting podcast');
  }
});

/**
 * @desc    Create a new podcast
 * @route   POST /api/podcast
 * @access  Private
 */
const createPodcast = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    language,
    author,
    email,
    explicit,
    isPublic,
  } = req.body;

  // Validate required fields
  if (!title || !description || !author || !email) {
    res.status(400);
    throw new Error('Please provide title, description, author, and email');
  }

  try {
    // Handle image upload if provided
    let imageUrl = null;
    let imageKey = null;
    
    if (req.file) {
      const s3Result = await s3Service.uploadImage(
        req.file.buffer,
        `${req.user._id}/podcasts/${Date.now()}-${req.file.originalname}`,
        req.file.mimetype
      );
      
      imageUrl = s3Result.fileUrl;
      imageKey = s3Result.fileKey;
    }
    
    // Create podcast in database
    const podcast = await Podcast.create({
      title,
      description,
      user: req.user._id,
      category: category || 'Technology',
      language: language || 'en',
      author,
      email,
      explicit: explicit === 'true' || explicit === true,
      imageUrl,
      imageKey,
      isPublic: isPublic === 'true' || isPublic === true,
    });
    
    // Generate RSS feed URL
    const rssUrl = `${process.env.API_URL}/api/podcast/${podcast._id}/rss`;
    podcast.rssUrl = rssUrl;
    await podcast.save();
    
    res.status(201).json(podcast);
  } catch (error) {
    logger.error(`Error creating podcast: ${error.message}`);
    res.status(500);
    throw new Error('Error creating podcast: ' + error.message);
  }
});

/**
 * @desc    Update a podcast
 * @route   PUT /api/podcast/:id
 * @access  Private
 */
const updatePodcast = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    language,
    author,
    email,
    explicit,
    isPublic,
  } = req.body;

  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this podcast');
    }
    
    // Handle image upload if provided
    let imageUrl = podcast.imageUrl;
    let imageKey = podcast.imageKey;
    
    if (req.file) {
      // Delete old image if exists
      if (podcast.imageKey) {
        await s3Service.deleteFile(podcast.imageKey);
      }
      
      // Upload new image
      const s3Result = await s3Service.uploadImage(
        req.file.buffer,
        `${req.user._id}/podcasts/${Date.now()}-${req.file.originalname}`,
        req.file.mimetype
      );
      
      imageUrl = s3Result.fileUrl;
      imageKey = s3Result.fileKey;
    }
    
    // Update podcast
    podcast.title = title || podcast.title;
    podcast.description = description || podcast.description;
    podcast.category = category || podcast.category;
    podcast.language = language || podcast.language;
    podcast.author = author || podcast.author;
    podcast.email = email || podcast.email;
    podcast.explicit = explicit === 'true' || explicit === true || podcast.explicit;
    podcast.imageUrl = imageUrl;
    podcast.imageKey = imageKey;
    podcast.isPublic = isPublic === 'true' || isPublic === true || podcast.isPublic;
    podcast.lastBuildDate = Date.now();
    
    const updatedPodcast = await podcast.save();
    
    // Update RSS feed
    await rssService.generateRssFeed(updatedPodcast);
    
    res.json(updatedPodcast);
  } catch (error) {
    logger.error(`Error updating podcast: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error updating podcast');
  }
});

/**
 * @desc    Delete a podcast
 * @route   DELETE /api/podcast/:id
 * @access  Private
 */
const deletePodcast = asyncHandler(async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this podcast');
    }
    
    // Delete image from S3 if exists
    if (podcast.imageKey) {
      await s3Service.deleteFile(podcast.imageKey);
    }
    
    // Remove podcast from audio clips
    for (const episode of podcast.episodes) {
      await AudioClip.findByIdAndUpdate(
        episode.audioClip,
        { $pull: { podcasts: podcast._id } }
      );
    }
    
    // Delete podcast
    await podcast.remove();
    
    res.json({ message: 'Podcast removed' });
  } catch (error) {
    logger.error(`Error deleting podcast: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error deleting podcast');
  }
});

/**
 * @desc    Add an episode to a podcast
 * @route   POST /api/podcast/:id/episodes
 * @access  Private
 */
const addEpisode = asyncHandler(async (req, res) => {
  const { audioClipId, order } = req.body;

  if (!audioClipId) {
    res.status(400);
    throw new Error('Please provide an audio clip ID');
  }

  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this podcast');
    }
    
    // Check if audio clip exists and belongs to the user
    const audioClip = await AudioClip.findById(audioClipId);
    
    if (!audioClip) {
      res.status(404);
      throw new Error('Audio clip not found');
    }
    
    if (audioClip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to use this audio clip');
    }
    
    // Check if episode already exists
    const episodeExists = podcast.episodes.some(
      (episode) => episode.audioClip.toString() === audioClipId
    );
    
    if (episodeExists) {
      res.status(400);
      throw new Error('Audio clip is already in this podcast');
    }
    
    // Add episode to podcast
    const newOrder = order || podcast.episodes.length + 1;
    
    podcast.episodes.push({
      audioClip: audioClipId,
      order: newOrder,
      publishedAt: Date.now(),
    });
    
    // Sort episodes by order
    podcast.episodes.sort((a, b) => a.order - b.order);
    
    // Update last build date
    podcast.lastBuildDate = Date.now();
    
    await podcast.save();
    
    // Add podcast to audio clip
    audioClip.podcasts.push(podcast._id);
    await audioClip.save();
    
    // Update RSS feed
    await rssService.generateRssFeed(podcast);
    
    res.json(podcast);
  } catch (error) {
    logger.error(`Error adding episode: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error adding episode');
  }
});

/**
 * @desc    Remove an episode from a podcast
 * @route   DELETE /api/podcast/:id/episodes/:episodeId
 * @access  Private
 */
const removeEpisode = asyncHandler(async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this podcast');
    }
    
    // Find episode
    const episodeIndex = podcast.episodes.findIndex(
      (episode) => episode._id.toString() === req.params.episodeId
    );
    
    if (episodeIndex === -1) {
      res.status(404);
      throw new Error('Episode not found');
    }
    
    // Get audio clip ID before removing episode
    const audioClipId = podcast.episodes[episodeIndex].audioClip;
    
    // Remove episode from podcast
    podcast.episodes.splice(episodeIndex, 1);
    
    // Update order of remaining episodes
    podcast.episodes.forEach((episode, index) => {
      episode.order = index + 1;
    });
    
    // Update last build date
    podcast.lastBuildDate = Date.now();
    
    await podcast.save();
    
    // Remove podcast from audio clip
    await AudioClip.findByIdAndUpdate(
      audioClipId,
      { $pull: { podcasts: podcast._id } }
    );
    
    // Update RSS feed
    await rssService.generateRssFeed(podcast);
    
    res.json(podcast);
  } catch (error) {
    logger.error(`Error removing episode: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error removing episode');
  }
});

/**
 * @desc    Reorder episodes in a podcast
 * @route   PUT /api/podcast/:id/episodes/reorder
 * @access  Private
 */
const reorderEpisodes = asyncHandler(async (req, res) => {
  const { episodes } = req.body;

  if (!episodes || !Array.isArray(episodes)) {
    res.status(400);
    throw new Error('Please provide an array of episodes');
  }

  try {
    const podcast = await Podcast.findById(req.params.id);
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if the podcast belongs to the user
    if (podcast.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this podcast');
    }
    
    // Validate episodes
    for (const episode of episodes) {
      if (!episode.id || !episode.order) {
        res.status(400);
        throw new Error('Each episode must have an id and order');
      }
      
      const episodeExists = podcast.episodes.some(
        (e) => e._id.toString() === episode.id
      );
      
      if (!episodeExists) {
        res.status(400);
        throw new Error(`Episode with id ${episode.id} not found`);
      }
    }
    
    // Update episode orders
    for (const episode of episodes) {
      const podcastEpisode = podcast.episodes.find(
        (e) => e._id.toString() === episode.id
      );
      
      if (podcastEpisode) {
        podcastEpisode.order = episode.order;
      }
    }
    
    // Sort episodes by order
    podcast.episodes.sort((a, b) => a.order - b.order);
    
    // Update last build date
    podcast.lastBuildDate = Date.now();
    
    await podcast.save();
    
    // Update RSS feed
    await rssService.generateRssFeed(podcast);
    
    res.json(podcast);
  } catch (error) {
    logger.error(`Error reordering episodes: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error reordering episodes');
  }
});

/**
 * @desc    Get RSS feed for a podcast
 * @route   GET /api/podcast/:id/rss
 * @access  Public
 */
const getRssFeed = asyncHandler(async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id)
      .populate({
        path: 'episodes.audioClip',
        select: 'title description duration fileUrl createdAt',
      });
    
    if (!podcast) {
      res.status(404);
      throw new Error('Podcast not found');
    }
    
    // Check if podcast is public
    if (!podcast.isPublic) {
      res.status(403);
      throw new Error('This podcast is not public');
    }
    
    // Generate RSS feed
    const rssFeed = await rssService.generateRssFeed(podcast);
    
    // Set content type and send response
    res.set('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    logger.error(`Error getting RSS feed: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error getting RSS feed');
  }
});

module.exports = {
  getPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
  addEpisode,
  removeEpisode,
  reorderEpisodes,
  getRssFeed,
};
