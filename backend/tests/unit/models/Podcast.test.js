const mongoose = require('mongoose');
const Podcast = require('../../../models/Podcast');

describe('Podcast Model', () => {
  it('should create a new podcast with required fields', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const podcastData = {
      title: 'Test Podcast',
      description: 'This is a test podcast',
      user: userId,
      category: 'Technology',
      language: 'en',
      author: 'Test Author',
      email: 'test@example.com',
    };

    const podcast = await Podcast.create(podcastData);

    // Check if podcast was created successfully
    expect(podcast).toBeDefined();
    expect(podcast.title).toBe(podcastData.title);
    expect(podcast.description).toBe(podcastData.description);
    expect(podcast.user.toString()).toBe(userId.toString());
    expect(podcast.category).toBe(podcastData.category);
    expect(podcast.language).toBe(podcastData.language);
    expect(podcast.author).toBe(podcastData.author);
    expect(podcast.email).toBe(podcastData.email);
    
    // Default values
    expect(podcast.isPublic).toBe(true);
    expect(podcast.explicit).toBe(false);
    expect(podcast.subscriptionCount).toBe(0);
    expect(podcast.totalPlays).toBe(0);
    expect(podcast.episodes).toHaveLength(0);
  });

  it('should not save podcast without required fields', async () => {
    const podcast = new Podcast({
      title: 'Test Podcast',
      // Missing required fields
    });

    let error;
    try {
      await podcast.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.author).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should validate category enum values', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const podcastData = {
      title: 'Test Podcast',
      description: 'This is a test podcast',
      user: userId,
      category: 'InvalidCategory', // Invalid category
      language: 'en',
      author: 'Test Author',
      email: 'test@example.com',
    };

    let error;
    try {
      await Podcast.create(podcastData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
  });

  it('should add episodes to a podcast', async () => {
    const userId = new mongoose.Types.ObjectId();
    const audioClipId1 = new mongoose.Types.ObjectId();
    const audioClipId2 = new mongoose.Types.ObjectId();
    
    const podcastData = {
      title: 'Test Podcast with Episodes',
      description: 'This is a test podcast with episodes',
      user: userId,
      category: 'Technology',
      language: 'en',
      author: 'Test Author',
      email: 'test@example.com',
      episodes: [
        {
          audioClip: audioClipId1,
          order: 1,
          publishedAt: new Date(),
        },
        {
          audioClip: audioClipId2,
          order: 2,
          publishedAt: new Date(),
        },
      ],
    };

    const podcast = await Podcast.create(podcastData);

    expect(podcast.episodes).toHaveLength(2);
    expect(podcast.episodes[0].audioClip.toString()).toBe(audioClipId1.toString());
    expect(podcast.episodes[0].order).toBe(1);
    expect(podcast.episodes[1].audioClip.toString()).toBe(audioClipId2.toString());
    expect(podcast.episodes[1].order).toBe(2);
  });

  it('should calculate episodeCount virtual', async () => {
    const userId = new mongoose.Types.ObjectId();
    const audioClipId1 = new mongoose.Types.ObjectId();
    const audioClipId2 = new mongoose.Types.ObjectId();
    const audioClipId3 = new mongoose.Types.ObjectId();
    
    const podcastData = {
      title: 'Test Podcast for Virtual',
      description: 'This is a test podcast for virtual property',
      user: userId,
      category: 'Technology',
      language: 'en',
      author: 'Test Author',
      email: 'test@example.com',
      episodes: [
        {
          audioClip: audioClipId1,
          order: 1,
          publishedAt: new Date(),
        },
        {
          audioClip: audioClipId2,
          order: 2,
          publishedAt: new Date(),
        },
        {
          audioClip: audioClipId3,
          order: 3,
          publishedAt: new Date(),
        },
      ],
    };

    const podcast = await Podcast.create(podcastData);
    
    // Convert to JSON to include virtuals
    const podcastJSON = podcast.toJSON();
    
    expect(podcastJSON.episodeCount).toBe(3);
  });
});
