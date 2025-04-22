import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { Pie, Bar } from 'react-chartjs-2';
import advancedAnalyticsService from '../services/advancedAnalyticsService';
import Spinner from './Spinner';

const UserSegmentation = () => {
  const { t } = useTranslation();
  const [segmentationData, setSegmentationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentBy, setSegmentBy] = useState('engagement');
  const [timeframe, setTimeframe] = useState('month');
  const [filters, setFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSegmentationData();
  }, [segmentBy, timeframe, filters]);

  const fetchSegmentationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await advancedAnalyticsService.getUserSegmentation({
        segmentBy,
        timeframe,
        filters
      });
      
      setSegmentationData(data);
    } catch (err) {
      console.error('Failed to fetch segmentation data:', err);
      setError(t('analytics.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await advancedAnalyticsService.exportAnalyticsData({
        format: 'csv',
        reportType: 'user_segmentation',
        filters: {
          segmentBy,
          timeframe,
          customFilters: filters
        }
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `user_segmentation_${segmentBy}_${timeframe}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const addFilter = (filter) => {
    setFilters([...filters, filter]);
  };

  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // Mock data for demonstration
  const getPieChartData = () => {
    if (!segmentationData) return null;
    
    return {
      labels: segmentationData.segments.map(segment => segment.name),
      datasets: [
        {
          data: segmentationData.segments.map(segment => segment.count),
          backgroundColor: [
            '#4F46E5', // Indigo
            '#7C3AED', // Purple
            '#EC4899', // Pink
            '#F59E0B', // Amber
            '#10B981', // Emerald
            '#3B82F6', // Blue
            '#6366F1', // Indigo
            '#8B5CF6', // Violet
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (!segmentationData) return null;
    
    return {
      labels: segmentationData.segments.map(segment => segment.name),
      datasets: [
        {
          label: t('analytics.userCount'),
          data: segmentationData.segments.map(segment => segment.count),
          backgroundColor: '#4F46E5',
        },
        {
          label: t('analytics.engagementScore'),
          data: segmentationData.segments.map(segment => segment.metrics.engagement),
          backgroundColor: '#10B981',
        },
      ],
    };
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchSegmentationData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          <FiRefreshCw className="inline mr-2" />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FiUsers className="text-indigo-600 dark:text-indigo-400 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.userSegmentation')}
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleFilters}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <FiFilter className="mr-1" />
              {t('common.filters')}
            </button>
            
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FiDownload className="mr-1" />
              {t('common.export')}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('analytics.segmentBy')}
                </label>
                <select
                  value={segmentBy}
                  onChange={(e) => setSegmentBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="engagement">{t('analytics.engagement')}</option>
                  <option value="location">{t('analytics.location')}</option>
                  <option value="device">{t('analytics.device')}</option>
                  <option value="retention">{t('analytics.retention')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('analytics.timeframe')}
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="day">{t('analytics.day')}</option>
                  <option value="week">{t('analytics.week')}</option>
                  <option value="month">{t('analytics.month')}</option>
                  <option value="quarter">{t('analytics.quarter')}</option>
                  <option value="year">{t('analytics.year')}</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters([])}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {t('common.clearFilters')}
                </button>
              </div>
            </div>
            
            {filters.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.activeFilters')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm flex items-center"
                    >
                      <span>{filter.name}: {filter.value}</span>
                      <button
                        onClick={() => removeFilter(index)}
                        className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => addFilter({ name: 'Min Engagement', value: '50%' })}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + {t('analytics.addFilter')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {segmentationData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                {t('analytics.segmentDistribution')}
              </h3>
              <div className="h-80">
                <Pie data={getPieChartData()} options={pieChartOptions} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                {t('analytics.segmentMetrics')}
              </h3>
              <div className="h-80">
                <Bar data={getBarChartData()} options={barChartOptions} />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                {t('analytics.segmentDetails')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('analytics.segment')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('analytics.users')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('analytics.percentage')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('analytics.engagement')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('analytics.retention')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {segmentationData.segments.map((segment, index) => {
                      const total = segmentationData.segments.reduce((sum, s) => sum + s.count, 0);
                      const percentage = ((segment.count / total) * 100).toFixed(1);
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {segment.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {segment.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full"
                                  style={{ width: `${segment.metrics.engagement}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{segment.metrics.engagement}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-green-500 h-2.5 rounded-full"
                                  style={{ width: `${segment.metrics.retention}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{segment.metrics.retention}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('analytics.noData')}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSegmentation;
