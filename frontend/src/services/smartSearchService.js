import api from './api';

/**
 * Service for smart search capabilities
 */
class SmartSearchService {
  /**
   * Perform a natural language search
   * @param {string} query - Natural language search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Maximum number of results to return
   * @param {string} options.type - Type of content to search ('all', 'audio', 'podcast', 'source')
   * @param {Array} options.filters - Additional filters to apply
   * @returns {Promise<Object>} Search results with metadata
   */
  async naturalLanguageSearch(query, options = {}) {
    try {
      const { limit = 20, type = 'all', filters = [] } = options;
      
      const response = await api.post('/search/natural', {
        query,
        limit,
        type,
        filters
      });
      
      return response.data;
    } catch (error) {
      console.error('Error performing natural language search:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} partialQuery - Partial search query
   * @param {number} limit - Maximum number of suggestions to return
   * @returns {Promise<Array<string>>} Array of search suggestions
   */
  async getSearchSuggestions(partialQuery, limit = 5) {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: partialQuery, limit }
      });
      
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  /**
   * Get related search terms
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of related terms to return
   * @returns {Promise<Array<string>>} Array of related search terms
   */
  async getRelatedSearchTerms(query, limit = 5) {
    try {
      const response = await api.get('/search/related', {
        params: { q: query, limit }
      });
      
      return response.data.relatedTerms;
    } catch (error) {
      console.error('Error getting related search terms:', error);
      throw error;
    }
  }

  /**
   * Search by semantic similarity
   * @param {string} text - Text to find similar content for
   * @param {Object} options - Search options
   * @param {number} options.limit - Maximum number of results to return
   * @param {string} options.type - Type of content to search ('all', 'audio', 'podcast', 'source')
   * @returns {Promise<Array>} Array of semantically similar items
   */
  async semanticSearch(text, options = {}) {
    try {
      const { limit = 10, type = 'all' } = options;
      
      const response = await api.post('/search/semantic', {
        text,
        limit,
        type
      });
      
      return response.data.results;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * Search by voice input
   * @param {Blob} audioBlob - Audio blob from voice recording
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with metadata
   */
  async voiceSearch(audioBlob, options = {}) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      if (options.limit) formData.append('limit', options.limit);
      if (options.type) formData.append('type', options.type);
      
      const response = await api.post('/search/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error performing voice search:', error);
      throw error;
    }
  }

  /**
   * Get search history for the current user
   * @param {number} limit - Maximum number of history items to return
   * @returns {Promise<Array>} Array of search history items
   */
  async getSearchHistory(limit = 10) {
    try {
      const response = await api.get('/search/history', {
        params: { limit }
      });
      
      return response.data.history;
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  /**
   * Clear search history for the current user
   * @returns {Promise<Object>} Response from the server
   */
  async clearSearchHistory() {
    try {
      const response = await api.delete('/search/history');
      return response.data;
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }
}

export default new SmartSearchService();
