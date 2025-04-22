const mongoose = require('mongoose');
const AudioClip = require('../../../models/AudioClip');

describe('AudioClip Model', () => {
  it('should create a new audio clip with required fields', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const audioClipData = {
      title: 'Test Audio Clip',
      user: userId,
      duration: 120, // 2 minutes
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'user123/posts/123456.mp3',
      fileSize: 2048000, // 2MB
      format: 'mp3',
      sourceType: 'post',
      voiceId: 'en-US-Standard-D',
    };

    const audioClip = await AudioClip.create(audioClipData);

    // Check if audio clip was created successfully
    expect(audioClip).toBeDefined();
    expect(audioClip.title).toBe(audioClipData.title);
    expect(audioClip.user.toString()).toBe(userId.toString());
    expect(audioClip.duration).toBe(audioClipData.duration);
    expect(audioClip.fileUrl).toBe(audioClipData.fileUrl);
    expect(audioClip.fileKey).toBe(audioClipData.fileKey);
    expect(audioClip.fileSize).toBe(audioClipData.fileSize);
    expect(audioClip.format).toBe(audioClipData.format);
    expect(audioClip.sourceType).toBe(audioClipData.sourceType);
    expect(audioClip.voiceId).toBe(audioClipData.voiceId);
    
    // Default values
    expect(audioClip.isPublic).toBe(false);
    expect(audioClip.downloadCount).toBe(0);
    expect(audioClip.playCount).toBe(0);
    expect(audioClip.backgroundMusic.enabled).toBe(false);
  });

  it('should not save audio clip without required fields', async () => {
    const audioClip = new AudioClip({
      title: 'Test Audio Clip',
      // Missing required fields
    });

    let error;
    try {
      await audioClip.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.duration).toBeDefined();
    expect(error.errors.fileUrl).toBeDefined();
    expect(error.errors.fileKey).toBeDefined();
    expect(error.errors.fileSize).toBeDefined();
    expect(error.errors.format).toBeDefined();
    expect(error.errors.sourceType).toBeDefined();
    expect(error.errors.voiceId).toBeDefined();
  });

  it('should validate sourceType enum values', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const audioClipData = {
      title: 'Test Audio Clip',
      user: userId,
      duration: 120,
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'user123/posts/123456.mp3',
      fileSize: 2048000,
      format: 'mp3',
      sourceType: 'invalid', // Invalid source type
      voiceId: 'en-US-Standard-D',
    };

    let error;
    try {
      await AudioClip.create(audioClipData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.sourceType).toBeDefined();
  });

  it('should create an audio clip with background music', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const audioClipData = {
      title: 'Test Audio Clip with Music',
      user: userId,
      duration: 120,
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'user123/posts/123456.mp3',
      fileSize: 2048000,
      format: 'mp3',
      sourceType: 'post',
      voiceId: 'en-US-Standard-D',
      backgroundMusic: {
        enabled: true,
        trackId: 'ambient-1',
        volume: 0.2,
      },
    };

    const audioClip = await AudioClip.create(audioClipData);

    expect(audioClip.backgroundMusic.enabled).toBe(true);
    expect(audioClip.backgroundMusic.trackId).toBe('ambient-1');
    expect(audioClip.backgroundMusic.volume).toBe(0.2);
  });

  it('should create an audio clip with source information', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const audioClipData = {
      title: 'Test Audio Clip from X Post',
      user: userId,
      duration: 120,
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'user123/posts/123456.mp3',
      fileSize: 2048000,
      format: 'mp3',
      sourceType: 'post',
      sourceId: '123456789',
      sourceUrl: 'https://x.com/user/status/123456789',
      sourceAuthor: {
        username: 'testuser',
        name: 'Test User',
        profileImageUrl: 'https://example.com/profile.jpg',
      },
      sourceText: 'This is a test post from X',
      voiceId: 'en-US-Standard-D',
    };

    const audioClip = await AudioClip.create(audioClipData);

    expect(audioClip.sourceId).toBe('123456789');
    expect(audioClip.sourceUrl).toBe('https://x.com/user/status/123456789');
    expect(audioClip.sourceAuthor.username).toBe('testuser');
    expect(audioClip.sourceAuthor.name).toBe('Test User');
    expect(audioClip.sourceAuthor.profileImageUrl).toBe('https://example.com/profile.jpg');
    expect(audioClip.sourceText).toBe('This is a test post from X');
  });
});
