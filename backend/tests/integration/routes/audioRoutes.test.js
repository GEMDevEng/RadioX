const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const User = require('../../../models/User');
const AudioClip = require('../../../models/AudioClip');
const xApiService = require('../../../services/xApiService');
const ttsService = require('../../../services/ttsService');
const s3Service = require('../../../services/s3Service');

// Mock services
jest.mock('../../../services/xApiService');
jest.mock('../../../services/ttsService');
jest.mock('../../../services/s3Service');

describe('Audio Routes', () => {
  let token;
  let userId;
  let audioClipId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      xApiConnection: {
        connected: true,
        username: 'testuser',
        tokenData: { token: 'test-token' }
      }
    });

    // Get token and user ID
    token = user.getSignedJwtToken();
    userId = user._id;

    // Create a test audio clip
    const audioClip = await AudioClip.create({
      title: 'Test Audio Clip',
      description: 'This is a test audio clip',
      user: userId,
      duration: 120,
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'test-file-key',
      fileSize: 240000,
      format: 'mp3',
      sourceType: 'post',
      sourceId: '123456789',
      sourceUrl: 'https://x.com/testuser/status/123456789',
      sourceAuthor: {
        username: 'testuser',
        name: 'Test User',
        profileImageUrl: 'https://example.com/profile.jpg'
      },
      sourceText: 'This is a test post',
      voiceId: 'en-US-Standard-D',
      isPublic: false,
      playCount: 0,
      downloadCount: 0
    });

    audioClipId = audioClip._id;

    // Mock service responses
    xApiService.getPost.mockResolvedValue({
      id: '123456789',
      text: 'This is a test post',
      user: {
        username: 'testuser',
        name: 'Test User',
        profileImageUrl: 'https://example.com/profile.jpg'
      },
      url: 'https://x.com/testuser/status/123456789'
    });

    ttsService.generateAudio.mockResolvedValue({
      audioBuffer: Buffer.from('mock audio data'),
      duration: 30,
      size: 60000,
      format: 'mp3'
    });

    s3Service.uploadAudio.mockResolvedValue({
      fileUrl: 'https://example.com/audio.mp3',
      fileKey: 'test-file-key'
    });

    s3Service.deleteFile.mockResolvedValue(true);
  });

  describe('GET /api/audio/clips', () => {
    it('should get all audio clips for the current user', async () => {
      const res = await request(app)
        .get('/api/audio/clips')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('audioClips');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.audioClips).toHaveLength(1);
      expect(res.body.audioClips[0].title).toBe('Test Audio Clip');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/audio/clips');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should handle search query', async () => {
      const res = await request(app)
        .get('/api/audio/clips?search=test')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('audioClips');
      // The actual search functionality is tested in the controller tests
    });

    it('should handle pagination and sorting', async () => {
      const res = await request(app)
        .get('/api/audio/clips?page=1&limit=10&sortBy=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('audioClips');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/audio/clips/:id', () => {
    it('should get a single audio clip by ID', async () => {
      const res = await request(app)
        .get(`/api/audio/clips/${audioClipId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', audioClipId.toString());
      expect(res.body).toHaveProperty('title', 'Test Audio Clip');
      expect(res.body).toHaveProperty('user', userId.toString());
    });

    it('should return 404 if audio clip not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/audio/clips/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Audio clip not found');
    });

    it('should return 403 if user is not authorized to access the audio clip', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      // Create an audio clip for the other user
      const otherAudioClip = await AudioClip.create({
        title: 'Other User Audio Clip',
        description: 'This belongs to another user',
        user: otherUser._id,
        duration: 60,
        fileUrl: 'https://example.com/other-audio.mp3',
        fileKey: 'other-file-key',
        fileSize: 120000,
        format: 'mp3',
        sourceType: 'post',
        sourceId: '987654321',
        voiceId: 'en-US-Standard-D',
        isPublic: false // Not public
      });

      const res = await request(app)
        .get(`/api/audio/clips/${otherAudioClip._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to access this audio clip');
    });

    it('should allow access to public audio clips even if user is different', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      // Create a public audio clip for the other user
      const publicAudioClip = await AudioClip.create({
        title: 'Public Audio Clip',
        description: 'This is a public audio clip',
        user: otherUser._id,
        duration: 60,
        fileUrl: 'https://example.com/public-audio.mp3',
        fileKey: 'public-file-key',
        fileSize: 120000,
        format: 'mp3',
        sourceType: 'post',
        sourceId: '987654321',
        voiceId: 'en-US-Standard-D',
        isPublic: true // Public
      });

      const res = await request(app)
        .get(`/api/audio/clips/${publicAudioClip._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', publicAudioClip._id.toString());
      expect(res.body).toHaveProperty('title', 'Public Audio Clip');
    });
  });

  describe('POST /api/audio/clips/from-post', () => {
    it('should create a new audio clip from a post', async () => {
      const res = await request(app)
        .post('/api/audio/clips/from-post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          postId: '123456789',
          title: 'New Audio from Post',
          voiceId: 'en-US-Standard-D'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', 'New Audio from Post');
      expect(res.body).toHaveProperty('sourceType', 'post');
      expect(res.body).toHaveProperty('sourceId', '123456789');
      expect(res.body).toHaveProperty('user');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/audio/clips/from-post')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing postId
          title: 'New Audio from Post',
          // Missing voiceId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide post ID and voice ID');
    });
  });

  describe('PUT /api/audio/clips/:id', () => {
    it('should update an audio clip', async () => {
      const res = await request(app)
        .put(`/api/audio/clips/${audioClipId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Audio Clip',
          description: 'This is an updated description',
          isPublic: true
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Audio Clip');
      expect(res.body).toHaveProperty('description', 'This is an updated description');
      expect(res.body).toHaveProperty('isPublic', true);
    });

    it('should return 404 if audio clip not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/audio/clips/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Audio Clip'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Audio clip not found');
    });

    it('should return 403 if user is not authorized to update the audio clip', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      // Create an audio clip for the other user
      const otherAudioClip = await AudioClip.create({
        title: 'Other User Audio Clip',
        description: 'This belongs to another user',
        user: otherUser._id,
        duration: 60,
        fileUrl: 'https://example.com/other-audio.mp3',
        fileKey: 'other-file-key',
        fileSize: 120000,
        format: 'mp3',
        sourceType: 'post',
        sourceId: '987654321',
        voiceId: 'en-US-Standard-D'
      });

      const res = await request(app)
        .put(`/api/audio/clips/${otherAudioClip._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Trying to Update Other User Audio Clip'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to update this audio clip');
    });
  });

  describe('DELETE /api/audio/clips/:id', () => {
    it('should delete an audio clip', async () => {
      const res = await request(app)
        .delete(`/api/audio/clips/${audioClipId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Audio clip removed');

      // Verify the audio clip was deleted
      const deletedAudioClip = await AudioClip.findById(audioClipId);
      expect(deletedAudioClip).toBeNull();
    });

    it('should return 404 if audio clip not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/audio/clips/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Audio clip not found');
    });

    it('should return 403 if user is not authorized to delete the audio clip', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      // Create an audio clip for the other user
      const otherAudioClip = await AudioClip.create({
        title: 'Other User Audio Clip',
        description: 'This belongs to another user',
        user: otherUser._id,
        duration: 60,
        fileUrl: 'https://example.com/other-audio.mp3',
        fileKey: 'other-file-key',
        fileSize: 120000,
        format: 'mp3',
        sourceType: 'post',
        sourceId: '987654321',
        voiceId: 'en-US-Standard-D'
      });

      const res = await request(app)
        .delete(`/api/audio/clips/${otherAudioClip._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to delete this audio clip');
    });
  });

  describe('PUT /api/audio/clips/:id/play', () => {
    it('should increment play count for an audio clip', async () => {
      const res = await request(app)
        .put(`/api/audio/clips/${audioClipId}/play`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('playCount', 1);

      // Verify the play count was incremented
      const updatedAudioClip = await AudioClip.findById(audioClipId);
      expect(updatedAudioClip.playCount).toBe(1);
    });
  });

  describe('PUT /api/audio/clips/:id/download', () => {
    it('should increment download count for an audio clip', async () => {
      const res = await request(app)
        .put(`/api/audio/clips/${audioClipId}/download`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('downloadCount', 1);

      // Verify the download count was incremented
      const updatedAudioClip = await AudioClip.findById(audioClipId);
      expect(updatedAudioClip.downloadCount).toBe(1);
    });
  });
});
