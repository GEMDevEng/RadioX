import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrendingUp, FiDownload, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import advancedAnalyticsService from '../services/advancedAnalyticsService';
import Spinner from './Spinner';

const PredictiveAnalytics = () => {
  const { t } = useTranslation();
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('engagement');
  const [horizon, setHorizon] = useState('week');
  const [periods, setPeriods] = useState(4);

  useEffect(() => {
    fetchPredictionData();
  }, [metric, horizon, periods]);

  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await advancedAnalyticsService.getPredictiveAnalytics({
        metric,
        horizon,
        periods
      });
      
      setPredictionData(data);
    } catch (err) {
      console.error('Failed to fetch prediction data:', err);
      setError(t('analytics.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await advancedAnalyticsService.exportAnalyticsData({
        format: 'csv',
        reportType: 'predictive_analytics',
        filters: {
          metric,
          horizon,
          periods
        }
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `predictive_analytics_${metric}_${horizon}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  // Mock data for demonstration
  const getChartData = () => {
    if (!predictionData) return null;
    
    const historicalColor = 'rgba(79, 70, 229, 1)'; // Indigo
    const predictionColor = 'rgba(236, 72, 153, 1)'; // Pink
    const confidenceColor = 'rgba(236, 72, 153, 0.1)'; // Pink with low opacity
    
    return {
      labels: [
        ...predictionData.historical.map(point => point.label),
        ...predictionData.predictions.map(point => point.label)
      ],
      datasets: [
        {
          label: t('analytics.historical'),
          data: [
            ...predictionData.historical.map(point => point.value),
            ...Array(predictionData.predictions.length).fill(null)
          ],
          borderColor: historicalColor,
          backgroundColor: historicalColor,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.1,
        },
        {
          label: t('analytics.predicted'),
          data: [
            ...Array(predictionData.historical.length).fill(null),
            ...predictionData.predictions.map(point => point.value)
          ],
          borderColor: predictionColor,
          backgroundColor: predictionColor,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          tension: 0.1,
        },
        {
          label: t('analytics.upperBound'),
          data: [
            ...Array(predictionData.historical.length).fill(null),
            ...predictionData.predictions.map(point => point.upperBound)
          ],
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: t('analytics.lowerBound'),
          data: [
            ...Array(predictionData.historical.length).fill(null),
            ...predictionData.predictions.map(point => point.lowerBound)
          ],
          borderColor: 'transparent',
          backgroundColor: confidenceColor,
          pointRadius: 0,
          tension: 0.1,
          fill: {
            target: 2,
            above: confidenceColor,
          },
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: (item) => {
            // Only show historical and predicted in the legend
            return item.text === t('analytics.historical') || item.text === t('analytics.predicted');
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label === t('analytics.upperBound') || label === t('analytics.lowerBound')) {
              return null;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
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
          onClick={fetchPredictionData}
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
            <FiTrendingUp className="text-pink-600 dark:text-pink-400 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.predictiveAnalytics')}
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors flex items-center"
            >
              <FiDownload className="mr-1" />
              {t('common.export')}
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('analytics.metric')}
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="engagement">{t('analytics.engagement')}</option>
              <option value="retention">{t('analytics.retention')}</option>
              <option value="growth">{t('analytics.growth')}</option>
              <option value="conversion">{t('analytics.conversion')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('analytics.horizon')}
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="day">{t('analytics.daily')}</option>
              <option value="week">{t('analytics.weekly')}</option>
              <option value="month">{t('analytics.monthly')}</option>
              <option value="quarter">{t('analytics.quarterly')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('analytics.periods')}
            </label>
            <select
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="12">12</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {predictionData ? (
          <div>
            <div className="h-96">
              <Line data={getChartData()} options={chartOptions} />
            </div>
            
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start">
                <FiInfo className="text-gray-500 dark:text-gray-400 mt-1 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('analytics.predictionInsights')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {predictionData.insights.summary}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('analytics.trend')}
                      </div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {predictionData.insights.trend > 0 ? (
                          <span className="text-green-500">+{predictionData.insights.trend}%</span>
                        ) : (
                          <span className="text-red-500">{predictionData.insights.trend}%</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('analytics.confidence')}
                      </div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {predictionData.insights.confidence}%
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('analytics.seasonality')}
                      </div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {predictionData.insights.seasonality ? t('common.yes') : t('common.no')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('analytics.recommendations')}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {predictionData.insights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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

export default PredictiveAnalytics;
