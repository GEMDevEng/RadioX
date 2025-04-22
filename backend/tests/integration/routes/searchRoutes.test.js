const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const User = require('../../../models/User');
const xApiService = require('../../../services/xApiService');

// Mock services
jest.mock('../../../services/xApiService');

describe('Search Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      xApiConnection: {
        connected: true,
        username: 'testuser',
        tokenData: {
          token: 'test-token'
        }
      }
    });

    userId = user._id;
    token = user.getSignedJwtToken();

    // Mock xApiService responses
    xApiService.searchHashtag.mockResolvedValue([
      {
        id: '1',
        text: 'This is a post about #AI and machine learning',
        user: {
          username: 'airesearcher',
          name: 'AI Researcher',
          profileImageUrl: 'https://example.com/profile.jpg'
        },
        likes: 150,
        reposts: 50,
        createdAt: new Date().toISOString(),
        url: 'https://x.com/airesearcher/status/1'
      },
      {
        id: '2',
        text: 'Another post about #AI technologies',
        user: {
          username: 'techguru',
          name: 'Tech Guru',
          profileImageUrl: 'https://example.com/profile2.jpg'
        },
        likes: 200,
        reposts: 75,
        createdAt: new Date().toISOString(),
        url: 'https://x.com/techguru/status/2'
      }
    ]);

    xApiService.searchUser.mockResolvedValue([
      {
        id: '3',
        text: 'Just posted a new article about AI',
        user: {
          username: 'airesearcher',
          name: 'AI Researcher',
          profileImageUrl: 'https://example.com/profile.jpg'
        },
        likes: 120,
        reposts: 40,
        createdAt: new Date().toISOString(),
        url: 'https://x.com/airesearcher/status/3'
      },
      {
        id: '4',
        text: 'Working on a new machine learning project',
        user: {
          username: 'airesearcher',
          name: 'AI Researcher',
          profileImageUrl: 'https://example.com/profile.jpg'
        },
        likes: 180,
        reposts: 60,
        createdAt: new Date().toISOString(),
        url: 'https://x.com/airesearcher/status/4'
      }
    ]);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/search/hashtag/:hashtag', () => {
    it('should search posts by hashtag', async () => {
      const res = await request(app)
        .get('/api/search/hashtag/AI')
        .set('Authorization', `Bearer ${token}`)
        .query({
          textOnly: 'false',
          minLikes: '0',
          maxResults: '10'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.posts[0].text).toContain('#AI');
      expect(xApiService.searchHashtag).toHaveBeenCalledWith(
        'AI',
        {
          textOnly: false,
          minLikes: 0,
          maxResults: 10
        },
        { token: 'test-token' }
      );
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/search/hashtag/AI');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should handle query parameters correctly', async () => {
      const res = await request(app)
        .get('/api/search/hashtag/AI')
        .set('Authorization', `Bearer ${token}`)
        .query({
          textOnly: 'true',
          minLikes: '100',
          maxResults: '5'
        });

      expect(res.statusCode).toBe(200);
      expect(xApiService.searchHashtag).toHaveBeenCalledWith(
        'AI',
        {
          textOnly: true,
          minLikes: 100,
          maxResults: 5
        },
        { token: 'test-token' }
      );
    });

    it('should handle errors from X API service', async () => {
      // Mock service to throw an error
      xApiService.searchHashtag.mockRejectedValueOnce(new Error('X API error'));

      const res = await request(app)
        .get('/api/search/hashtag/AI')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Error searching hashtag');
    });
  });

  describe('GET /api/search/user/:username', () => {
    it('should search posts by username', async () => {
      const res = await request(app)
        .get('/api/search/user/airesearcher')
        .set('Authorization', `Bearer ${token}`)
        .query({
          textOnly: 'false',
          minLikes: '0',
          maxResults: '10'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.posts[0].user.username).toBe('airesearcher');
      expect(xApiService.searchUser).toHaveBeenCalledWith(
        'airesearcher',
        {
          textOnly: false,
          minLikes: 0,
          maxResults: 10
        },
        { token: 'test-token' }
      );
    });

    it('should handle query parameters correctly for user search', async () => {
      const res = await request(app)
        .get('/api/search/user/airesearcher')
        .set('Authorization', `Bearer ${token}`)
        .query({
          textOnly: 'true',
          minLikes: '150',
          maxResults: '5'
        });

      expect(res.statusCode).toBe(200);
      expect(xApiService.searchUser).toHaveBeenCalledWith(
        'airesearcher',
        {
          textOnly: true,
          minLikes: 150,
          maxResults: 5
        },
        { token: 'test-token' }
      );
    });

    it('should handle errors from X API service for user search', async () => {
      // Mock service to throw an error
      xApiService.searchUser.mockRejectedValueOnce(new Error('X API error'));

      const res = await request(app)
        .get('/api/search/user/airesearcher')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Error searching user');
    });

    it('should return 401 if user is not connected to X API', async () => {
      // Update user to remove X API connection
      await User.findByIdAndUpdate(userId, {
        xApiConnection: {
          connected: false
        }
      });

      const res = await request(app)
        .get('/api/search/user/airesearcher')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Not connected to X API');
    });
  });
});
