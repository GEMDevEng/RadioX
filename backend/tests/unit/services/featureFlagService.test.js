const mongoose = require('mongoose');
const featureFlagService = require('../../../services/featureFlagService');
const redis = require('../../../config/redis');
const logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../config/redis');
jest.mock('../../../utils/logger');

describe('Feature Flag Service', () => {
  let mockFeatureFlag;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock FeatureFlag model
    mockFeatureFlag = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };
    
    // Mock mongoose.model to return our mock
    mongoose.model = jest.fn().mockReturnValue(mockFeatureFlag);
    
    // Mock redis methods
    redis.get = jest.fn().mockResolvedValue(null);
    redis.set = jest.fn().mockResolvedValue('OK');
    redis.del = jest.fn().mockResolvedValue(1);
  });
  
  describe('isEnabled', () => {
    it('should return cached value if available', async () => {
      // Arrange
      redis.get = jest.fn().mockResolvedValue('true');
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag');
      
      // Assert
      expect(redis.get).toHaveBeenCalledWith('feature:test-flag');
      expect(result).toBe(true);
      expect(mockFeatureFlag.findOne).not.toHaveBeenCalled();
    });
    
    it('should return false if flag does not exist', async () => {
      // Arrange
      mockFeatureFlag.findOne.mockResolvedValue(null);
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag');
      
      // Assert
      expect(redis.get).toHaveBeenCalledWith('feature:test-flag');
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(redis.set).toHaveBeenCalledWith('feature:test-flag', 'false', 'EX', 300);
      expect(result).toBe(false);
    });
    
    it('should return false if flag is globally disabled', async () => {
      // Arrange
      mockFeatureFlag.findOne.mockResolvedValue({
        name: 'test-flag',
        enabled: false,
      });
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag');
      
      // Assert
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(redis.set).toHaveBeenCalledWith('feature:test-flag', 'false', 'EX', 300);
      expect(result).toBe(false);
    });
    
    it('should return true if flag is globally enabled and no user ID is provided', async () => {
      // Arrange
      mockFeatureFlag.findOne.mockResolvedValue({
        name: 'test-flag',
        enabled: true,
      });
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag');
      
      // Assert
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(redis.set).toHaveBeenCalledWith('feature:test-flag', 'true', 'EX', 300);
      expect(result).toBe(true);
    });
    
    it('should return true if user is in the userIds list', async () => {
      // Arrange
      const userId = 'user123';
      mockFeatureFlag.findOne.mockResolvedValue({
        name: 'test-flag',
        enabled: true,
        userIds: ['user123', 'user456'],
      });
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag', userId);
      
      // Assert
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(redis.set).toHaveBeenCalledWith(`feature:test-flag:${userId}`, 'true', 'EX', 300);
      expect(result).toBe(true);
    });
    
    it('should handle percentage rollout correctly', async () => {
      // Arrange
      const userId = 'user123';
      mockFeatureFlag.findOne.mockResolvedValue({
        name: 'test-flag',
        enabled: true,
        percentage: 50,
        userIds: [],
      });
      
      // Mock the hash function to return a predictable value
      const originalHashFn = featureFlagService._hashString;
      featureFlagService._hashString = jest.fn().mockReturnValue(25); // 25 < 50, so should be enabled
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag', userId);
      
      // Assert
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(featureFlagService._hashString).toHaveBeenCalledWith(userId + 'test-flag');
      expect(redis.set).toHaveBeenCalledWith(`feature:test-flag:${userId}`, 'true', 'EX', 300);
      expect(result).toBe(true);
      
      // Restore original hash function
      featureFlagService._hashString = originalHashFn;
    });
    
    it('should handle errors gracefully and return false', async () => {
      // Arrange
      mockFeatureFlag.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await featureFlagService.isEnabled('test-flag');
      
      // Assert
      expect(mockFeatureFlag.findOne).toHaveBeenCalledWith({ name: 'test-flag' });
      expect(logger.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
  
  describe('setFlag', () => {
    it('should create a new feature flag if it does not exist', async () => {
      // Arrange
      const flagName = 'new-flag';
      const options = {
        enabled: true,
        percentage: 25,
        userIds: ['user1', 'user2'],
        description: 'A new feature flag',
      };
      
      mockFeatureFlag.findOneAndUpdate.mockResolvedValue({
        name: flagName,
        ...options,
      });
      
      // Act
      const result = await featureFlagService.setFlag(flagName, options);
      
      // Assert
      expect(mockFeatureFlag.findOneAndUpdate).toHaveBeenCalledWith(
        { name: flagName },
        {
          $set: expect.objectContaining({
            enabled: true,
            percentage: 25,
            userIds: ['user1', 'user2'],
            description: 'A new feature flag',
            updatedAt: expect.any(Date),
          }),
        },
        { new: true, upsert: true }
      );
      expect(redis.del).toHaveBeenCalledWith(`feature:${flagName}`);
      expect(logger.info).toHaveBeenCalled();
      expect(result).toEqual({
        name: flagName,
        ...options,
      });
    });
    
    it('should validate and sanitize input options', async () => {
      // Arrange
      const flagName = 'test-flag';
      const options = {
        enabled: 'yes', // Non-boolean value
        percentage: 150, // Out of range
        userIds: 'user1', // Not an array
      };
      
      mockFeatureFlag.findOneAndUpdate.mockResolvedValue({
        name: flagName,
        enabled: true,
        percentage: 100,
        userIds: [],
      });
      
      // Act
      const result = await featureFlagService.setFlag(flagName, options);
      
      // Assert
      expect(mockFeatureFlag.findOneAndUpdate).toHaveBeenCalledWith(
        { name: flagName },
        {
          $set: expect.objectContaining({
            enabled: true, // Converted to boolean
            percentage: 100, // Capped at 100
            userIds: [], // Converted to empty array
            description: '',
            updatedAt: expect.any(Date),
          }),
        },
        { new: true, upsert: true }
      );
      expect(result).toBeDefined();
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      mockFeatureFlag.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
      
      // Act & Assert
      await expect(featureFlagService.setFlag('test-flag', {})).rejects.toThrow('Failed to set feature flag');
      expect(logger.error).toHaveBeenCalled();
    });
  });
  
  describe('deleteFlag', () => {
    it('should delete a feature flag', async () => {
      // Arrange
      const flagName = 'test-flag';
      mockFeatureFlag.deleteOne.mockResolvedValue({ deletedCount: 1 });
      
      // Act
      const result = await featureFlagService.deleteFlag(flagName);
      
      // Assert
      expect(mockFeatureFlag.deleteOne).toHaveBeenCalledWith({ name: flagName });
      expect(redis.del).toHaveBeenCalledWith(`feature:${flagName}`);
      expect(logger.info).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      mockFeatureFlag.deleteOne.mockRejectedValue(new Error('Database error'));
      
      // Act & Assert
      await expect(featureFlagService.deleteFlag('test-flag')).rejects.toThrow('Failed to delete feature flag');
      expect(logger.error).toHaveBeenCalled();
    });
  });
  
  describe('getAllFlags', () => {
    it('should return all feature flags sorted by name', async () => {
      // Arrange
      const mockFlags = [
        { name: 'flag-a', enabled: true },
        { name: 'flag-b', enabled: false },
      ];
      mockFeatureFlag.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockFlags),
      });
      
      // Act
      const result = await featureFlagService.getAllFlags();
      
      // Assert
      expect(mockFeatureFlag.find).toHaveBeenCalled();
      expect(result).toEqual(mockFlags);
    });
    
    it('should handle errors gracefully', async () => {
      // Arrange
      mockFeatureFlag.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });
      
      // Act & Assert
      await expect(featureFlagService.getAllFlags()).rejects.toThrow('Failed to get feature flags');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
