import api from './api';

/**
 * Service for AI-powered features
 */
class AIService {
  /**
   * Generate a description for a podcast based on its content
   * @param {Array} audioClips - Array of audio clips to include in the podcast
   * @param {string} podcastTitle - Title of the podcast
   * @param {string} style - Style of the description ('professional', 'casual', 'engaging')
   * @returns {Promise<string>} Generated description
   */
  async generatePodcastDescription(audioClips, podcastTitle, style = 'professional') {
    try {
      const response = await api.post('/ai/generate-description', {
        audioClips,
        podcastTitle,
        style
      });
      return response.data.description;
    } catch (error) {
      console.error('Error generating podcast description:', error);
      throw error;
    }
  }

  /**
   * Generate episode titles based on content
   * @param {string} content - Content of the episode
   * @param {number} count - Number of title suggestions to generate
   * @returns {Promise<Array<string>>} Array of generated titles
   */
  async generateTitleSuggestions(content, count = 3) {
    try {
      const response = await api.post('/ai/generate-titles', {
        content,
        count
      });
      return response.data.titles;
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      throw error;
    }
  }

  /**
   * Generate show notes for a podcast episode
   * @param {Object} audioClip - Audio clip data
   * @param {string} format - Format of show notes ('bullet', 'paragraph', 'detailed')
   * @returns {Promise<string>} Generated show notes
   */
  async generateShowNotes(audioClip, format = 'bullet') {
    try {
      const response = await api.post('/ai/generate-show-notes', {
        audioClip,
        format
      });
      return response.data.showNotes;
    } catch (error) {
      console.error('Error generating show notes:', error);
      throw error;
    }
  }

  /**
   * Generate tags for content based on its text
   * @param {string} content - Content to generate tags for
   * @param {number} count - Maximum number of tags to generate
   * @returns {Promise<Array<string>>} Array of generated tags
   */
  async generateTags(content, count = 5) {
    try {
      const response = await api.post('/ai/generate-tags', {
        content,
        count
      });
      return response.data.tags;
    } catch (error) {
      console.error('Error generating tags:', error);
      throw error;
    }
  }

  /**
   * Summarize content to a specified length
   * @param {string} content - Content to summarize
   * @param {number} maxLength - Maximum length of summary in characters
   * @returns {Promise<string>} Generated summary
   */
  async summarizeContent(content, maxLength = 280) {
    try {
      const response = await api.post('/ai/summarize', {
        content,
        maxLength
      });
      return response.data.summary;
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw error;
    }
  }

  /**
   * Generate a podcast schedule based on user preferences and content availability
   * @param {Object} preferences - User preferences for podcast schedule
   * @returns {Promise<Array>} Array of scheduled episodes
   */
  async generatePodcastSchedule(preferences) {
    try {
      const response = await api.post('/ai/generate-schedule', {
        preferences
      });
      return response.data.schedule;
    } catch (error) {
      console.error('Error generating podcast schedule:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment and topics in content
   * @param {string} content - Content to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeContent(content) {
    try {
      const response = await api.post('/ai/analyze-content', {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }
}

export default new AIService();
