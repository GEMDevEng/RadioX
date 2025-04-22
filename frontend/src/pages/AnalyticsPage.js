import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiDownload, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../services/api';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usageHistory, setUsageHistory] = useState([]);
  const [audioStats, setAudioStats] = useState(null);
  const [dateRange, setDateRange] = useState('6months'); // '1month', '3months', '6months', '1year'
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv', 'json', 'pdf'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch usage history
        const usageRes = await api.get('/usage/history');
        setUsageHistory(usageRes.data);

        // Fetch audio statistics
        const audioRes = await api.get('/usage/audio-stats');
        setAudioStats(audioRes.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Filter data based on date range
  const getFilteredData = () => {
    let months = 6; // Default

    switch (dateRange) {
      case '1month':
        months = 1;
        break;
      case '3months':
        months = 3;
        break;
      case '1year':
        months = 12;
        break;
      default:
        months = 6;
    }

    return usageHistory.slice(0, months).reverse();
  };

  // Prepare data for usage history chart
  const prepareUsageHistoryData = () => {
    const filteredData = getFilteredData();
    
    return {
      labels: filteredData.map(item => `${item.month}/${item.year}`),
      datasets: [
        {
          label: 'Audio Clips Created',
          data: filteredData.map(item => item.audioClipsCreated),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'X Posts Used',
          data: filteredData.map(item => item.postsUsed),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  // Prepare data for audio duration chart
  const prepareAudioDurationData = () => {
    const filteredData = getFilteredData();
    
    return {
      labels: filteredData.map(item => `${item.month}/${item.year}`),
      datasets: [
        {
          label: 'Total Audio Duration (minutes)',
          data: filteredData.map(item => Math.round(item.totalAudioDuration / 60)),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for source type pie chart
  const prepareSourceTypeData = () => {
    if (!audioStats) return null;
    
    return {
      labels: ['Post', 'Thread', 'Custom'],
      datasets: [
        {
          label: 'Audio Clips by Source',
          data: [
            audioStats.sourceTypes.post,
            audioStats.sourceTypes.thread,
            audioStats.sourceTypes.custom,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Export analytics data
  const exportData = () => {
    const data = {
      usageHistory: getFilteredData(),
      audioStats,
      exportDate: format(new Date(), 'yyyy-MM-dd'),
    };

    let content;
    let filename;
    let mimeType;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `radiox-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        // Create CSV content
        const csvRows = [];
        
        // Header
        csvRows.push(['Month', 'Year', 'Audio Clips Created', 'Posts Used', 'Total Duration (min)', 'Storage Used (MB)']);
        
        // Data rows
        data.usageHistory.forEach(item => {
          csvRows.push([
            item.month,
            item.year,
            item.audioClipsCreated,
            item.postsUsed,
            Math.round(item.totalAudioDuration / 60),
            Math.round(item.totalStorageUsed / (1024 * 1024)),
          ]);
        });
        
        content = csvRows.map(row => row.join(',')).join('\n');
        filename = `radiox-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Analytics Dashboard" />
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Analytics Dashboard" />
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Analytics Dashboard" />
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-500" />
          <select
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <button
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={exportData}
          >
            <FiDownload />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Audio Clips</h3>
            <p className="text-3xl font-bold text-indigo-600">{audioStats?.totalAudioClips || 0}</p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Duration</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {audioStats ? Math.round(audioStats.totalDuration / 60) : 0} min
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Avg. Duration</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {audioStats ? Math.round(audioStats.averageDuration) : 0} sec
            </p>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Audio Clips Created</h3>
          <div className="h-80">
            <Line 
              data={prepareUsageHistoryData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Audio Duration (minutes)</h3>
          <div className="h-80">
            <Bar 
              data={prepareAudioDurationData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Audio Clips by Source</h3>
          <div className="h-80 flex justify-center items-center">
            {audioStats && (
              <div className="w-3/4">
                <Pie 
                  data={prepareSourceTypeData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Most Played Audio Clips</h3>
          {audioStats?.mostPlayed?.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Plays</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {audioStats.mostPlayed.map((clip) => (
                    <tr key={clip._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                        {clip.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {clip.playCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </Card>
      </div>
      
      {/* API Usage */}
      <Card>
        <h3 className="text-lg font-medium text-gray-700 mb-4">API Usage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Posts Used</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Posts Limit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Read Requests</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Used</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredData().map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}/{item.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.postsUsed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.postsLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.readRequestsUsed} / {item.readRequestsLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {Math.round(item.totalStorageUsed / (1024 * 1024))} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
