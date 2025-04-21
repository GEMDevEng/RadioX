const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile 
} = require('../../../controllers/authController');

// Mock express request and response
const mockRequest = (body = {}, user = null) => ({
  body,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  describe('registerUser', () => {
    it('should register a new user and return token', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock User.create to return a new user
      User.create = jest.fn().mockResolvedValue({
        _id: mongoose.Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        getSignedJwtToken: () => 'test-token'
      });

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token'
      }));
    });

    it('should return 400 if user already exists', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      // Mock User.findOne to return a user (user exists)
      User.findOne = jest.fn().mockResolvedValue({
        email: 'test@example.com'
      });

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User already exists'
      }));
    });
  });

  describe('loginUser', () => {
    it('should login user and return token', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      // Mock User.findOne to return a user
      const mockUser = {
        _id: mongoose.Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: () => 'test-token',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token'
      }));
    });

    it('should return 401 if user not found', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      // Mock User.findOne to return null (user not found)
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null)
      }));

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });

    it('should return 401 if password is incorrect', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      // Mock User.findOne to return a user
      const mockUser = {
        _id: mongoose.Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const userId = mongoose.Types.ObjectId();
      const req = mockRequest({}, { _id: userId });
      const res = mockResponse();

      // Mock User.findById to return a user
      User.findById = jest.fn().mockResolvedValue({
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        xApiConnection: { connected: false },
        settings: { defaultVoice: 'en-US-Standard-D' }
      });

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        xApiConnection: { connected: false },
        settings: { defaultVoice: 'en-US-Standard-D' }
      }));
    });

    it('should return 404 if user not found', async () => {
      const userId = mongoose.Types.ObjectId();
      const req = mockRequest({}, { _id: userId });
      const res = mockResponse();

      // Mock User.findById to return null (user not found)
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const userId = mongoose.Types.ObjectId();
      const req = mockRequest({
        name: 'Updated User',
        email: 'updated@example.com',
        settings: { defaultVoice: 'en-US-Standard-F' }
      }, { _id: userId });
      const res = mockResponse();

      // Mock User.findById to return a user
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        settings: { defaultVoice: 'en-US-Standard-D' },
        save: jest.fn().mockImplementation(function() {
          return this;
        }),
        getSignedJwtToken: () => 'test-token'
      };
      
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.name).toBe('Updated User');
      expect(mockUser.email).toBe('updated@example.com');
      expect(mockUser.settings.defaultVoice).toBe('en-US-Standard-F');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated User',
        email: 'updated@example.com',
        settings: { defaultVoice: 'en-US-Standard-F' },
        token: 'test-token'
      }));
    });

    it('should update password if provided', async () => {
      const userId = mongoose.Types.ObjectId();
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'newpassword123'
      }, { _id: userId });
      const res = mockResponse();

      // Mock User.findById to return a user
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword123',
        save: jest.fn().mockImplementation(function() {
          return this;
        }),
        getSignedJwtToken: () => 'test-token'
      };
      
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token'
      }));
    });

    it('should return 404 if user not found', async () => {
      const userId = mongoose.Types.ObjectId();
      const req = mockRequest({
        name: 'Updated User',
        email: 'updated@example.com'
      }, { _id: userId });
      const res = mockResponse();

      // Mock User.findById to return null (user not found)
      User.findById = jest.fn().mockResolvedValue(null);

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
  });
});
