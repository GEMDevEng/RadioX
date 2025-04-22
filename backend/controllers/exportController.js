const AudioClip = require('../models/AudioClip');
const Podcast = require('../models/Podcast');
const ShareableLink = require('../models/ShareableLink');
const ExportAnalytics = require('../models/ExportAnalytics');
const s3Service = require('../services/s3Service');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Export audio in different formats
const exportAudio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'mp3' } = req.query;
  const { type } = req.params; // 'audio' or 'podcast'
  
  let item;
  if (type === 'audio') {
    item = await AudioClip.findById(id);
  } else if (type === 'podcast') {
    item = await Podcast.findById(id);
  } else {
    return res.status(400).json({ message: 'Invalid export type' });
  }
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Check if user has access to this item
  if (item.user.toString() !== req.user.id && !item.isPublic) {
    return res.status(403).json({ message: 'Not authorized to access this item' });
  }
  
  // Get the audio file from S3
  const audioUrl = await s3Service.getSignedUrl(item.audioKey);
  const tempInputPath = path.join(__dirname, '../temp', `${uuidv4()}.mp3`);
  const tempOutputPath = path.join(__dirname, '../temp', `${uuidv4()}.${format}`);
  
  try {
    // Download the file
    const response = await fetch(audioUrl);
    const fileStream = fs.createWriteStream(tempInputPath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    // Convert to requested format if needed
    if (format !== 'mp3') {
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .output(tempOutputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      
      // Clean up input file
      await unlinkAsync(tempInputPath);
      
      // Send the converted file
      res.sendFile(tempOutputPath, {}, async (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up output file
        await unlinkAsync(tempOutputPath);
      });
    } else {
      // Send the original file
      res.sendFile(tempInputPath, {}, async (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up input file
        await unlinkAsync(tempInputPath);
      });
    }
    
    // Track export
    await trackExport(req.user.id, id, type, format);
    
  } catch (err) {
    console.error('Export error:', err);
    // Clean up any temporary files
    try {
      if (fs.existsSync(tempInputPath)) await unlinkAsync(tempInputPath);
      if (fs.existsSync(tempOutputPath)) await unlinkAsync(tempOutputPath);
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
    res.status(500).json({ message: 'Error exporting file' });
  }
});

// Create shareable link
const createShareableLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.params; // 'audio' or 'podcast'
  
  let item;
  if (type === 'audio') {
    item = await AudioClip.findById(id);
  } else if (type === 'podcast') {
    item = await Podcast.findById(id);
  } else {
    return res.status(400).json({ message: 'Invalid share type' });
  }
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Check if user has access to this item
  if (item.user.toString() !== req.user.id && !item.isPublic) {
    return res.status(403).json({ message: 'Not authorized to share this item' });
  }
  
  // Check if a shareable link already exists
  let shareableLink = await ShareableLink.findOne({
    itemId: id,
    itemType: type === 'audio' ? 'AudioClip' : 'Podcast'
  });
  
  // Create a new link if one doesn't exist
  if (!shareableLink) {
    const token = uuidv4();
    shareableLink = await ShareableLink.create({
      itemId: id,
      itemType: type === 'audio' ? 'AudioClip' : 'Podcast',
      token,
      createdBy: req.user.id
    });
  }
  
  // Generate the shareable URL
  const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${shareableLink.token}`;
  
  // Track share
  await trackShare(req.user.id, id, type);
  
  res.json({ shareUrl });
});

// Get shared item by token
const getSharedItem = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const shareableLink = await ShareableLink.findOne({ token });
  
  if (!shareableLink) {
    return res.status(404).json({ message: 'Shared item not found or link has expired' });
  }
  
  // Check if link has expired
  if (shareableLink.expiresAt && new Date() > shareableLink.expiresAt) {
    return res.status(410).json({ message: 'This shared link has expired' });
  }
  
  // Increment click count
  shareableLink.clicks += 1;
  shareableLink.lastClickedAt = new Date();
  await shareableLink.save();
  
  // Get the item
  let item;
  if (shareableLink.itemType === 'AudioClip') {
    item = await AudioClip.findById(shareableLink.itemId);
  } else if (shareableLink.itemType === 'Podcast') {
    item = await Podcast.findById(shareableLink.itemId);
  }
  
  if (!item) {
    return res.status(404).json({ message: 'Shared item not found' });
  }
  
  res.json({
    item,
    type: shareableLink.itemType === 'AudioClip' ? 'audio' : 'podcast'
  });
});

// Track export analytics
const trackExport = async (userId, itemId, itemType, format) => {
  try {
    await ExportAnalytics.create({
      user: userId,
      itemId,
      itemType: itemType === 'audio' ? 'AudioClip' : 'Podcast',
      action: 'export',
      format,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error tracking export:', err);
  }
};

// Track share analytics
const trackShare = async (userId, itemId, itemType, platform = 'link') => {
  try {
    await ExportAnalytics.create({
      user: userId,
      itemId,
      itemType: itemType === 'audio' ? 'AudioClip' : 'Podcast',
      action: 'share',
      platform,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error tracking share:', err);
  }
};

module.exports = {
  exportAudio,
  createShareableLink,
  getSharedItem
};
