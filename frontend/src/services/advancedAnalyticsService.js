import api from './api';

/**
 * Service for advanced analytics features
 */
class AdvancedAnalyticsService {
  /**
   * Get user segmentation data
   * @param {Object} options - Segmentation options
   * @param {string} options.segmentBy - Segment by property ('location', 'device', 'engagement', 'retention')
   * @param {string} options.timeframe - Timeframe for data ('day', 'week', 'month', 'quarter', 'year')
   * @param {Array} options.filters - Additional filters to apply
   * @returns {Promise<Object>} Segmentation data
   */
  async getUserSegmentation(options = {}) {
    try {
      const { segmentBy = 'engagement', timeframe = 'month', filters = [] } = options;
      
      const response = await api.get('/analytics/segmentation', {
        params: { segmentBy, timeframe, filters: JSON.stringify(filters) }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user segmentation data:', error);
      throw error;
    }
  }

  /**
   * Get predictive analytics data
   * @param {Object} options - Prediction options
   * @param {string} options.metric - Metric to predict ('engagement', 'retention', 'growth', 'conversion')
   * @param {string} options.horizon - Prediction horizon ('day', 'week', 'month', 'quarter')
   * @param {number} options.periods - Number of periods to predict
   * @returns {Promise<Object>} Prediction data
   */
  async getPredictiveAnalytics(options = {}) {
    try {
      const { metric = 'engagement', horizon = 'week', periods = 4 } = options;
      
      const response = await api.get('/analytics/predictions', {
        params: { metric, horizon, periods }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching predictive analytics data:', error);
      throw error;
    }
  }

  /**
   * Get custom report data
   * @param {Object} reportConfig - Report configuration
   * @param {Array} reportConfig.metrics - Metrics to include in the report
   * @param {Array} reportConfig.dimensions - Dimensions to include in the report
   * @param {string} reportConfig.timeframe - Timeframe for the report
   * @param {Array} reportConfig.filters - Filters to apply to the report
   * @param {string} reportConfig.visualization - Visualization type
   * @returns {Promise<Object>} Report data
   */
  async getCustomReport(reportConfig) {
    try {
      const response = await api.post('/analytics/custom-reports', reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Save a custom report configuration
   * @param {Object} reportConfig - Report configuration to save
   * @param {string} reportConfig.name - Name of the report
   * @param {string} reportConfig.description - Description of the report
   * @returns {Promise<Object>} Saved report configuration
   */
  async saveCustomReport(reportConfig) {
    try {
      const response = await api.post('/analytics/custom-reports/save', reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error saving custom report:', error);
      throw error;
    }
  }

  /**
   * Get saved custom report configurations
   * @returns {Promise<Array>} List of saved report configurations
   */
  async getSavedReports() {
    try {
      const response = await api.get('/analytics/custom-reports/saved');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved reports:', error);
      throw error;
    }
  }

  /**
   * Get content performance analytics
   * @param {Object} options - Options for content performance
   * @param {string} options.contentType - Type of content ('audio', 'podcast')
   * @param {string} options.timeframe - Timeframe for data
   * @param {Array} options.metrics - Metrics to include
   * @returns {Promise<Object>} Content performance data
   */
  async getContentPerformance(options = {}) {
    try {
      const { contentType = 'all', timeframe = 'month', metrics = ['plays', 'completion', 'shares'] } = options;
      
      const response = await api.get('/analytics/content-performance', {
        params: { contentType, timeframe, metrics: metrics.join(',') }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching content performance data:', error);
      throw error;
    }
  }

  /**
   * Get audience insights
   * @param {Object} options - Options for audience insights
   * @param {string} options.segment - Audience segment
   * @param {string} options.timeframe - Timeframe for data
   * @returns {Promise<Object>} Audience insights data
   */
  async getAudienceInsights(options = {}) {
    try {
      const { segment = 'all', timeframe = 'month' } = options;
      
      const response = await api.get('/analytics/audience-insights', {
        params: { segment, timeframe }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching audience insights:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   * @param {Object} options - Export options
   * @param {string} options.format - Export format ('csv', 'json', 'xlsx')
   * @param {string} options.reportType - Type of report to export
   * @param {Object} options.filters - Filters to apply to the export
   * @returns {Promise<Blob>} Exported data as a blob
   */
  async exportAnalyticsData(options = {}) {
    try {
      const { format = 'csv', reportType, filters = {} } = options;
      
      const response = await api.post('/analytics/export', {
        format,
        reportType,
        filters
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
}

const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;
