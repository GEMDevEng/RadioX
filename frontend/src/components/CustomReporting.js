import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFileText, FiSave, FiDownload, FiPlus, FiTrash2, FiEye, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { Bar, Pie, Line } from 'react-chartjs-2';
import advancedAnalyticsService from '../services/advancedAnalyticsService';
import Spinner from './Spinner';

const CustomReporting = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [error, setError] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    metrics: ['plays', 'uniqueListeners'],
    dimensions: ['date'],
    timeframe: 'month',
    filters: [],
    visualization: 'bar'
  });
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const reports = await advancedAnalyticsService.getSavedReports();
      setSavedReports(reports);
    } catch (err) {
      console.error('Failed to fetch saved reports:', err);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await advancedAnalyticsService.getCustomReport(reportConfig);
      setReportData(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(t('analytics.reportGenerationError'));
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!reportConfig.name) {
      setError(t('analytics.reportNameRequired'));
      return;
    }
    
    try {
      await advancedAnalyticsService.saveCustomReport(reportConfig);
      setShowSaveModal(false);
      fetchSavedReports();
    } catch (err) {
      console.error('Failed to save report:', err);
      setError(t('analytics.reportSaveError'));
    }
  };

  const loadReport = (report) => {
    setReportConfig(report);
    generateReport();
  };

  const handleExport = async () => {
    try {
      const blob = await advancedAnalyticsService.exportAnalyticsData({
        format: 'csv',
        reportType: 'custom_report',
        filters: reportConfig
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `custom_report_${reportConfig.name || 'untitled'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const toggleMetric = (metric) => {
    const metrics = [...reportConfig.metrics];
    const index = metrics.indexOf(metric);
    
    if (index >= 0) {
      metrics.splice(index, 1);
    } else {
      metrics.push(metric);
    }
    
    setReportConfig({ ...reportConfig, metrics });
  };

  const toggleDimension = (dimension) => {
    const dimensions = [...reportConfig.dimensions];
    const index = dimensions.indexOf(dimension);
    
    if (index >= 0) {
      dimensions.splice(index, 1);
    } else {
      dimensions.push(dimension);
    }
    
    setReportConfig({ ...reportConfig, dimensions });
  };

  const addFilter = (filter) => {
    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, filter]
    });
  };

  const removeFilter = (index) => {
    const filters = [...reportConfig.filters];
    filters.splice(index, 1);
    setReportConfig({ ...reportConfig, filters });
  };

  // Mock data for demonstration
  const getChartData = () => {
    if (!reportData) return null;
    
    const labels = reportData.data.map(item => item.label);
    const datasets = reportData.metrics.map((metric, index) => {
      const colors = [
        '#4F46E5', // Indigo
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EC4899', // Pink
        '#3B82F6', // Blue
      ];
      
      return {
        label: metric.label,
        data: reportData.data.map(item => item[metric.key]),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1,
      };
    });
    
    return { labels, datasets };
  };

  const renderChart = () => {
    if (!reportData) return null;
    
    const chartData = getChartData();
    
    switch (reportConfig.visualization) {
      case 'bar':
        return (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        );
      case 'pie':
        // For pie charts, we'll use the first metric only
        const pieData = {
          labels: chartData.labels,
          datasets: [{
            data: chartData.datasets[0].data,
            backgroundColor: [
              '#4F46E5', // Indigo
              '#10B981', // Emerald
              '#F59E0B', // Amber
              '#EC4899', // Pink
              '#3B82F6', // Blue
              '#8B5CF6', // Violet
              '#F97316', // Orange
            ],
            borderWidth: 1,
          }],
        };
        
        return (
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        );
      case 'line':
        return (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FiFileText className="text-green-600 dark:text-green-400 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.customReporting')}
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {reportData && (
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <FiDownload className="mr-1" />
                {t('common.export')}
              </button>
            )}
            
            {reportData && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
              >
                <FiSave className="mr-1" />
                {t('common.save')}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            {t('analytics.reportConfiguration')}
          </h3>
          
          {/* Saved Reports */}
          {savedReports.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('analytics.savedReports')}
              </h4>
              <div className="space-y-2">
                {savedReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="truncate">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {report.description}
                      </div>
                    </div>
                    <button
                      onClick={() => loadReport(report)}
                      className="ml-2 p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                      title={t('common.load')}
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Metrics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.metrics')}
            </h4>
            <div className="space-y-2">
              {[
                { key: 'plays', label: t('analytics.plays') },
                { key: 'uniqueListeners', label: t('analytics.uniqueListeners') },
                { key: 'completionRate', label: t('analytics.completionRate') },
                { key: 'averageDuration', label: t('analytics.averageDuration') },
                { key: 'shares', label: t('analytics.shares') }
              ].map((metric) => (
                <div key={metric.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`metric-${metric.key}`}
                    checked={reportConfig.metrics.includes(metric.key)}
                    onChange={() => toggleMetric(metric.key)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`metric-${metric.key}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {metric.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dimensions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.dimensions')}
            </h4>
            <div className="space-y-2">
              {[
                { key: 'date', label: t('analytics.date') },
                { key: 'device', label: t('analytics.device') },
                { key: 'location', label: t('analytics.location') },
                { key: 'contentType', label: t('analytics.contentType') }
              ].map((dimension) => (
                <div key={dimension.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`dimension-${dimension.key}`}
                    checked={reportConfig.dimensions.includes(dimension.key)}
                    onChange={() => toggleDimension(dimension.key)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`dimension-${dimension.key}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {dimension.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeframe */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.timeframe')}
            </h4>
            <select
              value={reportConfig.timeframe}
              onChange={(e) => setReportConfig({ ...reportConfig, timeframe: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="day">{t('analytics.today')}</option>
              <option value="week">{t('analytics.thisWeek')}</option>
              <option value="month">{t('analytics.thisMonth')}</option>
              <option value="quarter">{t('analytics.thisQuarter')}</option>
              <option value="year">{t('analytics.thisYear')}</option>
              <option value="custom">{t('analytics.customRange')}</option>
            </select>
          </div>
          
          {/* Visualization */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.visualization')}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setReportConfig({ ...reportConfig, visualization: 'bar' })}
                className={`p-2 rounded-md flex items-center justify-center ${
                  reportConfig.visualization === 'bar'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiBarChart2 size={20} />
              </button>
              <button
                onClick={() => setReportConfig({ ...reportConfig, visualization: 'pie' })}
                className={`p-2 rounded-md flex items-center justify-center ${
                  reportConfig.visualization === 'pie'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiPieChart size={20} />
              </button>
              <button
                onClick={() => setReportConfig({ ...reportConfig, visualization: 'line' })}
                className={`p-2 rounded-md flex items-center justify-center ${
                  reportConfig.visualization === 'line'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiTrendingUp size={20} />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('analytics.filters')}
              </h4>
              <button
                onClick={() => addFilter({ field: 'contentType', operator: 'equals', value: 'podcast' })}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center"
              >
                <FiPlus size={14} className="mr-1" />
                {t('analytics.addFilter')}
              </button>
            </div>
            
            {reportConfig.filters.length > 0 ? (
              <div className="space-y-2">
                {reportConfig.filters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="text-sm">
                      {filter.field} {filter.operator} {filter.value}
                    </div>
                    <button
                      onClick={() => removeFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('analytics.noFilters')}
              </div>
            )}
          </div>
          
          <button
            onClick={generateReport}
            disabled={loading || reportConfig.metrics.length === 0}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" />
                <span className="ml-2">{t('common.generating')}</span>
              </span>
            ) : (
              t('analytics.generateReport')
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Report Visualization */}
        <div className="lg:col-span-2">
          {reportData ? (
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                {reportData.title || t('analytics.reportResults')}
              </h3>
              
              <div className="h-96 mb-6">
                {renderChart()}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {reportData.dimensions.map((dimension) => (
                        <th
                          key={dimension.key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {dimension.label}
                        </th>
                      ))}
                      {reportData.metrics.map((metric) => (
                        <th
                          key={metric.key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {metric.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {reportData.dimensions.map((dimension) => (
                          <td
                            key={dimension.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                          >
                            {row[dimension.key]}
                          </td>
                        ))}
                        {reportData.metrics.map((metric) => (
                          <td
                            key={metric.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                          >
                            {row[metric.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FiFileText className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">{t('analytics.noReportGenerated')}</h3>
                <p className="mt-2">{t('analytics.configureAndGenerate')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('analytics.saveReport')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('analytics.reportName')}
                </label>
                <input
                  type="text"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('analytics.enterReportName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('analytics.reportDescription')}
                </label>
                <textarea
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={t('analytics.enterReportDescription')}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveReport}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReporting;
