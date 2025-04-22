const s3Service = require('../../../services/s3Service');
const logger = require('../../../utils/logger');

// Mock the logger
jest.mock('../../../utils/logger');

describe('S3 Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('uploadAudio', () => {
    it('should upload audio file and return file URL and key', async () => {
      // Arrange
      const buffer = Buffer.from('test audio data');
      const key = 'user123/audio/test.mp3';
      const format = 'mp3';
      
      // Act
      const result = await s3Service.uploadAudio(buffer, key, format);
      
      // Assert
      expect(result).toHaveProperty('fileUrl');
      expect(result).toHaveProperty('fileKey');
      expect(result.fileUrl).toContain(key);
      expect(result.fileKey).toBe(key);
    });

    it('should handle errors during upload', async () => {
      // Arrange
      const buffer = Buffer.from('test audio data');
      const key = 'user123/audio/test.mp3';
      const format = 'mp3';
      
      // Mock implementation to throw an error
      const originalUploadAudio = s3Service.uploadAudio;
      s3Service.uploadAudio = jest.fn().mockImplementation(() => {
        throw new Error('Upload failed');
      });
      
      // Act & Assert
      await expect(s3Service.uploadAudio(buffer, key, format)).rejects.toThrow('Failed to upload audio');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      s3Service.uploadAudio = originalUploadAudio;
    });
  });

  describe('uploadImage', () => {
    it('should upload image file and return file URL and key', async () => {
      // Arrange
      const buffer = Buffer.from('test image data');
      const key = 'user123/images/test.jpg';
      const contentType = 'image/jpeg';
      
      // Act
      const result = await s3Service.uploadImage(buffer, key, contentType);
      
      // Assert
      expect(result).toHaveProperty('fileUrl');
      expect(result).toHaveProperty('fileKey');
      expect(result.fileUrl).toContain(key);
      expect(result.fileKey).toBe(key);
    });

    it('should handle errors during image upload', async () => {
      // Arrange
      const buffer = Buffer.from('test image data');
      const key = 'user123/images/test.jpg';
      const contentType = 'image/jpeg';
      
      // Mock implementation to throw an error
      const originalUploadImage = s3Service.uploadImage;
      s3Service.uploadImage = jest.fn().mockImplementation(() => {
        throw new Error('Upload failed');
      });
      
      // Act & Assert
      await expect(s3Service.uploadImage(buffer, key, contentType)).rejects.toThrow('Failed to upload image');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      s3Service.uploadImage = originalUploadImage;
    });
  });

  describe('deleteFile', () => {
    it('should delete file and return success', async () => {
      // Arrange
      const key = 'user123/audio/test.mp3';
      
      // Act
      const result = await s3Service.deleteFile(key);
      
      // Assert
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('key');
      expect(result.success).toBe(true);
      expect(result.key).toBe(key);
    });

    it('should handle errors during file deletion', async () => {
      // Arrange
      const key = 'user123/audio/test.mp3';
      
      // Mock implementation to throw an error
      const originalDeleteFile = s3Service.deleteFile;
      s3Service.deleteFile = jest.fn().mockImplementation(() => {
        throw new Error('Delete failed');
      });
      
      // Act & Assert
      await expect(s3Service.deleteFile(key)).rejects.toThrow('Failed to delete file');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      s3Service.deleteFile = originalDeleteFile;
    });
  });
});
