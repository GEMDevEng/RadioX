const mongoose = require('mongoose');
const AudioClip = require('../../../models/AudioClip');
const ApiUsage = require('../../../models/ApiUsage');
const xApiService = require('../../../services/xApiService');
const ttsService = require('../../../services/ttsService');
const s3Service = require('../../../services/s3Service');
const { 
  getAudioClips,
  getAudioClip,
  createAudioFromPost,
  updateAudioClip,
  deleteAudioClip,
  incrementPlayCount,
  incrementDownloadCount
} = require('../../../controllers/audioController');

// Mock services
jest.mock('../../../services/xApiService');
jest.mock('../../../services/ttsService');
jest.mock('../../../services/s3Service');

// Mock express request and response
const mockRequest = (body = {}, params = {}, query = {}, user = null) => ({
  body,
  params,
  query,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Audio Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAudioClips', () => {
    it('should get audio clips for the current user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, {}, {}, { _id: userId });
      const res = mockResponse();

      const mockAudioClips = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Audio Clip 1',
          user: userId,
          duration: 120,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Audio Clip 2',
          user: userId,
          duration: 180,
        }
      ];

      // Mock AudioClip.find
      AudioClip.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockAudioClips)
          })
        })
      });

      // Mock AudioClip.countDocuments
      AudioClip.countDocuments = jest.fn().mockResolvedValue(2);

      await getAudioClips(req, res);

      expect(AudioClip.find).toHaveBeenCalledWith({ user: userId });
      expect(res.json).toHaveBeenCalledWith({
        audioClips: mockAudioClips,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('should handle search query', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, {}, { search: 'test' }, { _id: userId });
      const res = mockResponse();

      // Mock AudioClip.find
      AudioClip.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      // Mock AudioClip.countDocuments
      AudioClip.countDocuments = jest.fn().mockResolvedValue(0);

      await getAudioClips(req, res);

      expect(AudioClip.find).toHaveBeenCalledWith({
        user: userId,
        $text: { $search: 'test' }
      });
    });

    it('should handle pagination and sorting', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        {}, 
        {}, 
        { page: '2', limit: '5', sortBy: 'title', sortOrder: 'asc' }, 
        { _id: userId }
      );
      const res = mockResponse();

      // Mock AudioClip.find
      AudioClip.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      // Mock AudioClip.countDocuments
      AudioClip.countDocuments = jest.fn().mockResolvedValue(10);

      await getAudioClips(req, res);

      // Check if sort was called with correct parameters
      const sortMock = AudioClip.find().sort;
      expect(sortMock).toHaveBeenCalledWith({ title: 1 });

      // Check if skip was called with correct parameters (page - 1) * limit
      const skipMock = sortMock().skip;
      expect(skipMock).toHaveBeenCalledWith(5);

      // Check if limit was called with correct parameter
      const limitMock = skipMock().limit;
      expect(limitMock).toHaveBeenCalledWith(5);

      // Check pagination in response
      expect(res.json).toHaveBeenCalledWith({
        audioClips: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          pages: 2,
        },
      });
    });
  });

  describe('getAudioClip', () => {
    it('should get a single audio clip by ID', async () => {
      const userId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: userId,
        duration: 120,
        isPublic: false,
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await getAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.json).toHaveBeenCalledWith(mockAudioClip);
    });

    it('should return 404 if audio clip not found', async () => {
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: new mongoose.Types.ObjectId() });
      const res = mockResponse();

      // Mock AudioClip.findById to return null
      AudioClip.findById = jest.fn().mockResolvedValue(null);

      await getAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Audio clip not found'
      }));
    });

    it('should return 403 if user is not authorized to access the audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: otherUserId, // Different user
        duration: 120,
        isPublic: false, // Not public
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await getAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not authorized to access this audio clip'
      }));
    });

    it('should allow access to public audio clips even if user is different', async () => {
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: otherUserId, // Different user
        duration: 120,
        isPublic: true, // Public
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await getAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.json).toHaveBeenCalledWith(mockAudioClip);
    });
  });

  describe('createAudioFromPost', () => {
    it('should create a new audio clip from a post', async () => {
      const userId = new mongoose.Types.ObjectId();
      const postId = '123456789';
      const req = mockRequest(
        {
          postId,
          title: 'Test Audio from Post',
          voiceId: 'en-US-Standard-D',
        },
        {},
        {},
        { 
          _id: userId,
          xApiConnection: { tokenData: { token: 'test-token' } }
        }
      );
      const res = mockResponse();

      // Mock ApiUsage.findOne
      ApiUsage.findOne = jest.fn().mockResolvedValue({
        postsUsed: 0,
        postsLimit: 500,
        save: jest.fn().mockResolvedValue(true)
      });

      // Mock ApiUsage.create
      ApiUsage.create = jest.fn().mockResolvedValue({
        postsUsed: 0,
        postsLimit: 500,
        save: jest.fn().mockResolvedValue(true)
      });

      // Mock xApiService.getPost
      xApiService.getPost.mockResolvedValue({
        id: postId,
        text: 'This is a test post',
        user: {
          username: 'testuser',
          name: 'Test User',
          profileImageUrl: 'https://example.com/profile.jpg'
        },
        url: `https://x.com/testuser/status/${postId}`
      });

      // Mock ttsService.generateAudio
      ttsService.generateAudio.mockResolvedValue({
        audioBuffer: Buffer.from('mock audio data'),
        duration: 30,
        size: 60000,
        format: 'mp3'
      });

      // Mock s3Service.uploadAudio
      s3Service.uploadAudio.mockResolvedValue({
        fileUrl: 'https://example.com/audio.mp3',
        fileKey: `${userId}/posts/${postId}.mp3`
      });

      // Mock AudioClip.create
      const mockAudioClip = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Audio from Post',
        user: userId,
        duration: 30,
        fileUrl: 'https://example.com/audio.mp3',
        fileKey: `${userId}/posts/${postId}.mp3`,
        sourceType: 'post',
        sourceId: postId
      };
      AudioClip.create = jest.fn().mockResolvedValue(mockAudioClip);

      await createAudioFromPost(req, res);

      expect(xApiService.getPost).toHaveBeenCalledWith(postId, { token: 'test-token' });
      expect(ttsService.generateAudio).toHaveBeenCalledWith(
        'This is a test post',
        'en-US-Standard-D',
        undefined
      );
      expect(s3Service.uploadAudio).toHaveBeenCalled();
      expect(AudioClip.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAudioClip);
    });

    it('should return 400 if required fields are missing', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        {
          // Missing postId
          title: 'Test Audio from Post',
          // Missing voiceId
        },
        {},
        {},
        { _id: userId }
      );
      const res = mockResponse();

      await createAudioFromPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Please provide post ID and voice ID'
      }));
    });

    it('should return 403 if user has reached the posts limit', async () => {
      const userId = new mongoose.Types.ObjectId();
      const postId = '123456789';
      const req = mockRequest(
        {
          postId,
          title: 'Test Audio from Post',
          voiceId: 'en-US-Standard-D',
        },
        {},
        {},
        { 
          _id: userId,
          xApiConnection: { tokenData: { token: 'test-token' } }
        }
      );
      const res = mockResponse();

      // Mock ApiUsage.findOne to return a user who has reached the limit
      ApiUsage.findOne = jest.fn().mockResolvedValue({
        postsUsed: 500, // Reached the limit
        postsLimit: 500
      });

      await createAudioFromPost(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'You have reached your monthly posts limit'
      }));
    });
  });

  describe('updateAudioClip', () => {
    it('should update an audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        {
          title: 'Updated Title',
          description: 'Updated description',
          isPublic: true
        },
        { id: audioClipId },
        {},
        { _id: userId }
      );
      const res = mockResponse();

      // Mock audio clip
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Original Title',
        description: 'Original description',
        isPublic: false,
        user: userId,
        save: jest.fn().mockImplementation(function() {
          return this;
        })
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await updateAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(mockAudioClip.title).toBe('Updated Title');
      expect(mockAudioClip.description).toBe('Updated description');
      expect(mockAudioClip.isPublic).toBe(true);
      expect(mockAudioClip.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAudioClip);
    });

    it('should return 404 if audio clip not found', async () => {
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        { title: 'Updated Title' },
        { id: audioClipId },
        {},
        { _id: new mongoose.Types.ObjectId() }
      );
      const res = mockResponse();

      // Mock AudioClip.findById to return null
      AudioClip.findById = jest.fn().mockResolvedValue(null);

      await updateAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Audio clip not found'
      }));
    });

    it('should return 403 if user is not authorized to update the audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest(
        { title: 'Updated Title' },
        { id: audioClipId },
        {},
        { _id: userId }
      );
      const res = mockResponse();

      // Mock audio clip with different user
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Original Title',
        user: otherUserId // Different user
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await updateAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not authorized to update this audio clip'
      }));
    });
  });

  describe('deleteAudioClip', () => {
    it('should delete an audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      // Mock audio clip
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: userId,
        fileKey: 'test-file-key',
        fileSize: 100000,
        remove: jest.fn().mockResolvedValue(true)
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      // Mock s3Service.deleteFile
      s3Service.deleteFile.mockResolvedValue(true);

      // Mock ApiUsage.findOne
      ApiUsage.findOne = jest.fn().mockResolvedValue({
        totalStorageUsed: 500000,
        save: jest.fn().mockResolvedValue(true)
      });

      await deleteAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(s3Service.deleteFile).toHaveBeenCalledWith('test-file-key');
      expect(mockAudioClip.remove).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Audio clip removed'
      }));
    });

    it('should return 404 if audio clip not found', async () => {
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: new mongoose.Types.ObjectId() });
      const res = mockResponse();

      // Mock AudioClip.findById to return null
      AudioClip.findById = jest.fn().mockResolvedValue(null);

      await deleteAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Audio clip not found'
      }));
    });

    it('should return 403 if user is not authorized to delete the audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      // Mock audio clip with different user
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: otherUserId // Different user
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await deleteAudioClip(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Not authorized to delete this audio clip'
      }));
    });
  });

  describe('incrementPlayCount', () => {
    it('should increment play count for an audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      // Mock audio clip
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: userId,
        playCount: 5,
        isPublic: true,
        save: jest.fn().mockImplementation(function() {
          return this;
        })
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await incrementPlayCount(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(mockAudioClip.playCount).toBe(6); // Incremented
      expect(mockAudioClip.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        playCount: 6
      });
    });
  });

  describe('incrementDownloadCount', () => {
    it('should increment download count for an audio clip', async () => {
      const userId = new mongoose.Types.ObjectId();
      const audioClipId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: audioClipId }, {}, { _id: userId });
      const res = mockResponse();

      // Mock audio clip
      const mockAudioClip = {
        _id: audioClipId,
        title: 'Test Audio Clip',
        user: userId,
        downloadCount: 3,
        isPublic: true,
        save: jest.fn().mockImplementation(function() {
          return this;
        })
      };

      // Mock AudioClip.findById
      AudioClip.findById = jest.fn().mockResolvedValue(mockAudioClip);

      await incrementDownloadCount(req, res);

      expect(AudioClip.findById).toHaveBeenCalledWith(audioClipId);
      expect(mockAudioClip.downloadCount).toBe(4); // Incremented
      expect(mockAudioClip.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        downloadCount: 4
      });
    });
  });
});
