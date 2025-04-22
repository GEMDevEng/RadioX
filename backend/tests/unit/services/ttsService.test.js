const ttsService = require('../../../services/ttsService');
const logger = require('../../../utils/logger');

// Mock the logger
jest.mock('../../../utils/logger');

describe('TTS Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateAudio', () => {
    it('should generate audio from text with default settings', async () => {
      // Arrange
      const text = 'This is a test text for speech synthesis.';
      const voiceId = 'en-US-Standard-D';
      
      // Act
      const result = await ttsService.generateAudio(text, voiceId);
      
      // Assert
      expect(result).toHaveProperty('audioBuffer');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('format');
      expect(result.format).toBe('mp3');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.size).toBeGreaterThan(0);
      expect(Buffer.isBuffer(result.audioBuffer)).toBe(true);
    });

    it('should generate audio with background music when specified', async () => {
      // Arrange
      const text = 'This is a test text with background music.';
      const voiceId = 'en-US-Standard-D';
      const backgroundMusic = {
        enabled: true,
        trackId: 'ambient-1',
        volume: 0.3
      };
      
      // Act
      const result = await ttsService.generateAudio(text, voiceId, backgroundMusic);
      
      // Assert
      expect(result).toHaveProperty('audioBuffer');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('format');
      expect(result.format).toBe('mp3');
    });

    it('should handle longer text with appropriate duration', async () => {
      // Arrange
      const longText = 'This is a much longer text that should result in a longer audio duration. '.repeat(10);
      const voiceId = 'en-US-Standard-D';
      
      // Act
      const result = await ttsService.generateAudio(longText, voiceId);
      
      // Assert
      expect(result.duration).toBeGreaterThan(10); // Should be significantly longer than short text
      expect(result.size).toBeGreaterThan(10000); // Should be larger file size
    });

    it('should handle errors during audio generation', async () => {
      // Arrange
      const text = 'This is a test text.';
      const voiceId = 'en-US-Standard-D';
      
      // Mock implementation to throw an error
      const originalGenerateAudio = ttsService.generateAudio;
      ttsService.generateAudio = jest.fn().mockImplementation(() => {
        throw new Error('TTS API error');
      });
      
      // Act & Assert
      await expect(ttsService.generateAudio(text, voiceId)).rejects.toThrow('Error generating audio');
      expect(logger.error).toHaveBeenCalled();
      
      // Restore original implementation
      ttsService.generateAudio = originalGenerateAudio;
    });
  });
});
