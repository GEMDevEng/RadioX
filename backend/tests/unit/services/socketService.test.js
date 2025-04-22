const socketService = require('../../../services/socketService');
const logger = require('../../../utils/logger');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('jsonwebtoken');
jest.mock('socket.io');

describe('Socket Service', () => {
  let mockServer;
  let mockIo;
  let mockSocket;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock Socket.IO server
    mockSocket = {
      join: jest.fn(),
      emit: jest.fn()
    };

    mockIo = {
      use: jest.fn((middleware) => middleware(mockSocket, jest.fn())),
      on: jest.fn((event, callback) => callback(mockSocket)),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };

    socketIo.mockReturnValue(mockIo);

    // Mock HTTP server
    mockServer = {};

    // Mock JWT verify
    jwt.verify.mockImplementation((token, secret) => {
      if (token === 'valid-token') {
        return { id: 'user123' };
      } else {
        throw new Error('Invalid token');
      }
    });

    // Set environment variable for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.JWT_SECRET;
  });

  describe('init', () => {
    it('should initialize Socket.IO server with correct configuration', () => {
      // Arrange
      process.env.NODE_ENV = 'development';

      // Act
      socketService.init(mockServer);

      // Assert
      expect(socketIo).toHaveBeenCalledWith(mockServer, {
        cors: {
          origin: 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });
      expect(mockIo.use).toHaveBeenCalled();
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should use production origin in production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.FRONTEND_URL = 'https://radiox.com';

      // Act
      socketService.init(mockServer);

      // Assert
      expect(socketIo).toHaveBeenCalledWith(mockServer, {
        cors: {
          origin: 'https://radiox.com',
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });
    });

    it('should authenticate socket connections with valid tokens', () => {
      // Arrange
      mockSocket.handshake = {
        auth: { token: 'valid-token' }
      };

      // Act
      socketService.init(mockServer);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockSocket.userId).toBe('user123');
    });

    it('should reject socket connections with invalid tokens', () => {
      // Arrange
      const next = jest.fn();
      mockSocket.handshake = {
        auth: { token: 'invalid-token' }
      };
      mockIo.use.mockImplementation((middleware) => middleware(mockSocket, next));

      // Act
      socketService.init(mockServer);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(logger.error).toHaveBeenCalled();
    });

    it('should reject socket connections with missing tokens', () => {
      // Arrange
      const next = jest.fn();
      mockSocket.handshake = {
        auth: {}
      };
      mockIo.use.mockImplementation((middleware) => middleware(mockSocket, next));

      // Act
      socketService.init(mockServer);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('Token missing');
    });
  });

  describe('sendToUser', () => {
    it('should send a message to a specific user', () => {
      // Arrange
      const userId = 'user123';
      const event = 'notification';
      const data = { message: 'Test notification' };
      
      // Mock io instance
      socketService.init(mockServer);
      
      // Act
      socketService.sendToUser(userId, event, data);
      
      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });

    it('should log an error if Socket.IO is not initialized', () => {
      // Arrange
      const userId = 'user123';
      const event = 'notification';
      const data = { message: 'Test notification' };
      
      // Act
      socketService.sendToUser(userId, event, data);
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith('Socket.IO not initialized');
      expect(mockIo.to).not.toHaveBeenCalled();
    });
  });

  describe('sendToAll', () => {
    it('should send a message to all connected users', () => {
      // Arrange
      const event = 'broadcast';
      const data = { message: 'Broadcast message' };
      
      // Mock io instance
      socketService.init(mockServer);
      
      // Act
      socketService.sendToAll(event, data);
      
      // Assert
      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });

    it('should log an error if Socket.IO is not initialized', () => {
      // Arrange
      const event = 'broadcast';
      const data = { message: 'Broadcast message' };
      
      // Act
      socketService.sendToAll(event, data);
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith('Socket.IO not initialized');
      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendConversionStatus', () => {
    it('should send conversion status to a specific user', () => {
      // Arrange
      const userId = 'user123';
      const audioClipId = 'audio123';
      const status = 'completed';
      const data = { fileUrl: 'https://example.com/audio.mp3' };
      
      // Mock io instance
      socketService.init(mockServer);
      
      // Act
      socketService.sendConversionStatus(userId, audioClipId, status, data);
      
      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('conversionStatus', {
        audioClipId,
        status,
        data,
        timestamp: expect.any(Date)
      });
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe('sendPodcastStatus', () => {
    it('should send podcast status to a specific user', () => {
      // Arrange
      const userId = 'user123';
      const podcastId = 'podcast123';
      const status = 'processing';
      const data = { progress: 50 };
      
      // Mock io instance
      socketService.init(mockServer);
      
      // Act
      socketService.sendPodcastStatus(userId, podcastId, status, data);
      
      // Assert
      expect(mockIo.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('podcastStatus', {
        podcastId,
        status,
        data,
        timestamp: expect.any(Date)
      });
      expect(logger.debug).toHaveBeenCalled();
    });
  });
});
