import api from './api';

/**
 * Service for handling content recommendations
 */
class RecommendationService {
  /**
   * Get personalized recommendations based on user history and preferences
   * @param {Object} options - Options for recommendations
   * @param {number} options.limit - Maximum number of recommendations to return
   * @param {string} options.type - Type of content to recommend ('audio', 'podcast', 'source')
   * @param {boolean} options.includeReason - Whether to include reason for recommendation
   * @returns {Promise<Array>} Array of recommended items
   */
  async getRecommendations(options = {}) {
    try {
      const { limit = 10, type = 'audio', includeReason = true } = options;
      const response = await api.get('/recommendations', { 
        params: { limit, type, includeReason } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Get trending content based on overall popularity
   * @param {Object} options - Options for trending content
   * @param {number} options.limit - Maximum number of items to return
   * @param {string} options.type - Type of content ('audio', 'podcast', 'source')
   * @param {string} options.timeframe - Timeframe for trending ('day', 'week', 'month')
   * @returns {Promise<Array>} Array of trending items
   */
  async getTrending(options = {}) {
    try {
      const { 
        limit = 10, 
        type = 'audio', 
        timeframe = 'week' 
      } = options;
      
      const response = await api.get('/trending', { 
        params: { limit, type, timeframe } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw error;
    }
  }

  /**
   * Get similar content to a specific item
   * @param {string} itemId - ID of the item to find similar content for
   * @param {string} itemType - Type of the item ('audio', 'podcast', 'source')
   * @param {number} limit - Maximum number of similar items to return
   * @returns {Promise<Array>} Array of similar items
   */
  async getSimilarContent(itemId, itemType, limit = 5) {
    try {
      const response = await api.get(`/similar/${itemType}/${itemId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching similar content:', error);
      throw error;
    }
  }

  /**
   * Provide feedback on a recommendation to improve future recommendations
   * @param {string} itemId - ID of the recommended item
   * @param {string} feedback - Feedback type ('like', 'dislike', 'not_interested')
   * @returns {Promise<Object>} Response from the server
   */
  async provideFeedback(itemId, feedback) {
    try {
      const response = await api.post('/recommendations/feedback', {
        itemId,
        feedback
      });
      return response.data;
    } catch (error) {
      console.error('Error providing recommendation feedback:', error);
      throw error;
    }
  }

  /**
   * Get content based on user's explicit interests
   * @param {Array} interests - Array of interest tags
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} Array of recommended items based on interests
   */
  async getContentByInterests(interests, limit = 10) {
    try {
      const response = await api.post('/recommendations/interests', {
        interests,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching content by interests:', error);
      throw error;
    }
  }

  /**
   * Get recommendations for new users with limited history (cold start)
   * @param {Object} userProfile - Basic user profile information
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise<Array>} Array of recommended items for new users
   */
  async getColdStartRecommendations(userProfile, limit = 10) {
    try {
      const response = await api.post('/recommendations/cold-start', {
        userProfile,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cold start recommendations:', error);
      throw error;
    }
  }
}

export default new RecommendationService();
