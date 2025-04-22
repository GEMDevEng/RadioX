const xApiService = require('../../../services/xApiService');
const logger = require('../../../utils/logger');

// Mock the logger
jest.mock('../../../utils/logger');

describe('X API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('searchHashtag', () => {
    it('should return posts matching the hashtag', async () => {
      // Arrange
      const hashtag = 'AI';
      const options = {
        textOnly: false,
        minLikes: 0,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchHashtag(hashtag, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('user');
      expect(result[0]).toHaveProperty('likes');
      expect(result[0].text.toLowerCase()).toContain(hashtag.toLowerCase());
    });

    it('should filter text-only posts when specified', async () => {
      // Arrange
      const hashtag = 'AI';
      const options = {
        textOnly: true,
        minLikes: 0,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchHashtag(hashtag, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      // All posts should not contain URLs
      result.forEach(post => {
        expect(post.text).not.toContain('http');
      });
    });

    it('should filter posts by minimum likes', async () => {
      // Arrange
      const hashtag = 'AI';
      const options = {
        textOnly: false,
        minLikes: 100,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchHashtag(hashtag, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      // All posts should have at least the minimum likes
      result.forEach(post => {
        expect(post.likes).toBeGreaterThanOrEqual(100);
      });
    });

    it('should limit the number of results', async () => {
      // Arrange
      const hashtag = 'AI';
      const options = {
        textOnly: false,
        minLikes: 0,
        maxResults: 2
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchHashtag(hashtag, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should handle errors during hashtag search', async () => {
      // Arrange
      const hashtag = 'AI';
      const options = {
        textOnly: false,
        minLikes: 0,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Mock implementation to throw an error
      const originalSearchHashtag = xApiService.searchHashtag;
      xApiService.searchHashtag = jest.fn().mockImplementation(() => {
        throw new Error('X API error');
      });
      
      // Act & Assert
      await expect(xApiService.searchHashtag(hashtag, options, tokenData)).rejects.toThrow('Failed to search hashtag');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      xApiService.searchHashtag = originalSearchHashtag;
    });
  });

  describe('searchUser', () => {
    it('should return posts from the specified user', async () => {
      // Arrange
      const username = 'airesearcher';
      const options = {
        textOnly: false,
        minLikes: 0,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchUser(username, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('user');
      expect(result[0].user.username).toBe(username);
    });

    it('should filter by minimum likes for user posts', async () => {
      // Arrange
      const username = 'airesearcher';
      const options = {
        textOnly: false,
        minLikes: 100,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.searchUser(username, options, tokenData);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      // All posts should have at least the minimum likes
      result.forEach(post => {
        expect(post.likes).toBeGreaterThanOrEqual(100);
      });
    });

    it('should handle errors during user search', async () => {
      // Arrange
      const username = 'airesearcher';
      const options = {
        textOnly: false,
        minLikes: 0,
        maxResults: 10
      };
      const tokenData = { token: 'mock-token' };
      
      // Mock implementation to throw an error
      const originalSearchUser = xApiService.searchUser;
      xApiService.searchUser = jest.fn().mockImplementation(() => {
        throw new Error('X API error');
      });
      
      // Act & Assert
      await expect(xApiService.searchUser(username, options, tokenData)).rejects.toThrow('Failed to search user posts');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      xApiService.searchUser = originalSearchUser;
    });
  });

  describe('getPost', () => {
    it('should return a single post by ID', async () => {
      // Arrange
      const postId = '123456789';
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.getPost(postId, tokenData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('user');
      expect(result.id).toBe(postId);
    });

    it('should handle errors when getting a post', async () => {
      // Arrange
      const postId = '123456789';
      const tokenData = { token: 'mock-token' };
      
      // Mock implementation to throw an error
      const originalGetPost = xApiService.getPost;
      xApiService.getPost = jest.fn().mockImplementation(() => {
        throw new Error('X API error');
      });
      
      // Act & Assert
      await expect(xApiService.getPost(postId, tokenData)).rejects.toThrow('Failed to get post');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      xApiService.getPost = originalGetPost;
    });
  });

  describe('getThread', () => {
    it('should return a thread with multiple posts', async () => {
      // Arrange
      const postId = '123456789';
      const tokenData = { token: 'mock-token' };
      
      // Act
      const result = await xApiService.getThread(postId, tokenData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('posts');
      expect(Array.isArray(result.posts)).toBe(true);
      expect(result.posts.length).toBeGreaterThan(0);
    });

    it('should handle errors when getting a thread', async () => {
      // Arrange
      const postId = '123456789';
      const tokenData = { token: 'mock-token' };
      
      // Mock implementation to throw an error
      const originalGetThread = xApiService.getThread;
      xApiService.getThread = jest.fn().mockImplementation(() => {
        throw new Error('X API error');
      });
      
      // Act & Assert
      await expect(xApiService.getThread(postId, tokenData)).rejects.toThrow('Failed to get thread');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      xApiService.getThread = originalGetThread;
    });
  });
});
