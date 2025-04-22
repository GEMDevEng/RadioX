const rssService = require('../../../services/rssService');
const logger = require('../../../utils/logger');
const mongoose = require('mongoose');

// Mock the logger
jest.mock('../../../utils/logger');

describe('RSS Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateRssFeed', () => {
    it('should generate a valid RSS feed XML for a podcast', async () => {
      // Arrange
      const podcast = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Podcast',
        description: 'A test podcast description',
        rssUrl: 'https://example.com/podcast/feed.xml',
        language: 'en-us',
        lastBuildDate: new Date(),
        createdAt: new Date(),
        author: 'Test Author',
        email: 'author@example.com',
        explicit: false,
        category: 'Technology',
        imageUrl: 'https://example.com/podcast/image.jpg',
        episodes: [
          {
            _id: new mongoose.Types.ObjectId(),
            order: 1,
            publishedAt: new Date(),
            audioClip: {
              _id: new mongoose.Types.ObjectId(),
              title: 'Episode 1',
              description: 'First episode description',
              fileUrl: 'https://example.com/podcast/episode1.mp3',
              fileSize: 1048576, // 1MB
              format: 'mp3',
              duration: 120 // 2 minutes
            }
          },
          {
            _id: new mongoose.Types.ObjectId(),
            order: 2,
            publishedAt: new Date(),
            audioClip: {
              _id: new mongoose.Types.ObjectId(),
              title: 'Episode 2',
              description: 'Second episode description',
              fileUrl: 'https://example.com/podcast/episode2.mp3',
              fileSize: 2097152, // 2MB
              format: 'mp3',
              duration: 180, // 3 minutes
              imageUrl: 'https://example.com/podcast/episode2-image.jpg'
            }
          }
        ]
      };
      
      // Act
      const result = await rssService.generateRssFeed(podcast);
      
      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<rss version="2.0"');
      expect(result).toContain(`<title>${podcast.title}</title>`);
      expect(result).toContain(`<description>${podcast.description}</description>`);
      expect(result).toContain(`<itunes:author>${podcast.author}</itunes:author>`);
      expect(result).toContain(`<itunes:category text="${podcast.category}">`);
      
      // Check for episodes
      expect(result).toContain('Episode 1');
      expect(result).toContain('Episode 2');
      expect(result).toContain('https://example.com/podcast/episode1.mp3');
      expect(result).toContain('https://example.com/podcast/episode2.mp3');
    });

    it('should handle podcasts with no episodes', async () => {
      // Arrange
      const podcast = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Empty Podcast',
        description: 'A podcast with no episodes',
        rssUrl: 'https://example.com/podcast/feed.xml',
        language: 'en-us',
        lastBuildDate: new Date(),
        createdAt: new Date(),
        author: 'Test Author',
        email: 'author@example.com',
        explicit: false,
        category: 'Technology',
        episodes: []
      };
      
      // Act
      const result = await rssService.generateRssFeed(podcast);
      
      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<rss version="2.0"');
      expect(result).toContain(`<title>${podcast.title}</title>`);
      // Should not contain any item elements
      expect(result).not.toContain('<item>');
    });

    it('should handle episodes with missing audioClip', async () => {
      // Arrange
      const podcast = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Podcast',
        description: 'A test podcast description',
        rssUrl: 'https://example.com/podcast/feed.xml',
        language: 'en-us',
        lastBuildDate: new Date(),
        createdAt: new Date(),
        author: 'Test Author',
        email: 'author@example.com',
        explicit: false,
        category: 'Technology',
        episodes: [
          {
            _id: new mongoose.Types.ObjectId(),
            order: 1,
            publishedAt: new Date(),
            // Missing audioClip
          },
          {
            _id: new mongoose.Types.ObjectId(),
            order: 2,
            publishedAt: new Date(),
            audioClip: {
              _id: new mongoose.Types.ObjectId(),
              title: 'Valid Episode',
              description: 'Valid episode description',
              fileUrl: 'https://example.com/podcast/valid-episode.mp3',
              fileSize: 1048576,
              format: 'mp3',
              duration: 120
            }
          }
        ]
      };
      
      // Act
      const result = await rssService.generateRssFeed(podcast);
      
      // Assert
      expect(typeof result).toBe('string');
      // Should only contain the valid episode
      expect(result).toContain('Valid Episode');
      expect(result).toContain('https://example.com/podcast/valid-episode.mp3');
      // Should not contain any reference to the invalid episode
    });

    it('should handle errors during RSS generation', async () => {
      // Arrange
      const podcast = {
        // Invalid podcast object missing required fields
      };
      
      // Mock implementation to throw an error
      const originalGenerateRssFeed = rssService.generateRssFeed;
      rssService.generateRssFeed = jest.fn().mockImplementation(() => {
        throw new Error('XML generation error');
      });
      
      // Act & Assert
      await expect(rssService.generateRssFeed(podcast)).rejects.toThrow('Failed to generate RSS feed');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      rssService.generateRssFeed = originalGenerateRssFeed;
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds to MM:SS format when less than an hour', () => {
      // Arrange
      const seconds = 125; // 2:05
      
      // Act
      const result = rssService.formatDuration(seconds);
      
      // Assert
      expect(result).toBe('2:05');
    });

    it('should format duration in seconds to HH:MM:SS format when more than an hour', () => {
      // Arrange
      const seconds = 3725; // 1:02:05
      
      // Act
      const result = rssService.formatDuration(seconds);
      
      // Assert
      expect(result).toBe('1:02:05');
    });

    it('should handle zero seconds', () => {
      // Arrange
      const seconds = 0;
      
      // Act
      const result = rssService.formatDuration(seconds);
      
      // Assert
      expect(result).toBe('0:00');
    });
  });
});
