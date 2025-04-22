import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { FiArrowLeft, FiDownload, FiShare2, FiCalendar } from 'react-icons/fi';
import { format, subDays } from 'date-fns';
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

const PodcastAnalyticsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [podcast, setPodcast] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30days'); // '7days', '30days', '90days', 'alltime'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch podcast details
        const podcastRes = await api.get(`/podcasts/${id}`);
        setPodcast(podcastRes.data);

        // Fetch podcast analytics
        // In a real implementation, this would be a separate API endpoint
        // For now, we'll generate mock data
        const mockAnalytics = generateMockAnalytics();
        setAnalytics(mockAnalytics);

        setLoading(false);
      } catch (err) {
        setError('Failed to load podcast analytics');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // Generate mock analytics data
  const generateMockAnalytics = () => {
    const today = new Date();
    const listeners = [];
    const downloads = [];
    const completionRates = [];
    const dates = [];

    // Generate data for the last 90 days
    for (let i = 90; i >= 0; i--) {
      const date = subDays(today, i);
      dates.push(format(date, 'MM/dd'));

      // Generate random data with an upward trend
      const baseListeners = 50 + Math.floor(i / 3);
      const baseDownloads = 30 + Math.floor(i / 4);
      
      listeners.push(baseListeners + Math.floor(Math.random() * 20));
      downloads.push(baseDownloads + Math.floor(Math.random() * 15));
      completionRates.push(60 + Math.floor(Math.random() * 30));
    }

    return {
      dates,
      listeners,
      downloads,
      completionRates,
      platforms: {
        'Apple Podcasts': 45,
        'Spotify': 30,
        'Google Podcasts': 15,
        'Other': 10,
      },
      demographics: {
        '18-24': 15,
        '25-34': 35,
        '35-44': 25,
        '45-54': 15,
        '55+': 10,
      },
      countries: {
        'United States': 60,
        'United Kingdom': 15,
        'Canada': 10,
        'Australia': 5,
        'Other': 10,
      },
      devices: {
        'Mobile': 65,
        'Desktop': 25,
        'Tablet': 8,
        'Smart Speaker': 2,
      },
      totalListeners: 2547,
      totalDownloads: 1823,
      averageCompletionRate: 78,
      subscriberCount: 342,
    };
  };

  // Filter data based on date range
  const getFilteredData = () => {
    if (!analytics) return null;

    let days = 30; // Default

    switch (dateRange) {
      case '7days':
        days = 7;
        break;
      case '90days':
        days = 90;
        break;
      case 'alltime':
        days = analytics.dates.length;
        break;
      default:
        days = 30;
    }

    return {
      dates: analytics.dates.slice(-days),
      listeners: analytics.listeners.slice(-days),
      downloads: analytics.downloads.slice(-days),
      completionRates: analytics.completionRates.slice(-days),
    };
  };

  // Prepare data for listeners chart
  const prepareListenersData = () => {
    const filteredData = getFilteredData();
    if (!filteredData) return null;
    
    return {
      labels: filteredData.dates,
      datasets: [
        {
          label: 'Listeners',
          data: filteredData.listeners,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Downloads',
          data: filteredData.downloads,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  // Prepare data for completion rate chart
  const prepareCompletionRateData = () => {
    const filteredData = getFilteredData();
    if (!filteredData) return null;
    
    return {
      labels: filteredData.dates,
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: filteredData.completionRates,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for platforms chart
  const preparePlatformsData = () => {
    if (!analytics) return null;
    
    return {
      labels: Object.keys(analytics.platforms),
      datasets: [
        {
          label: 'Platforms',
          data: Object.values(analytics.platforms),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for demographics chart
  const prepareDemographicsData = () => {
    if (!analytics) return null;
    
    return {
      labels: Object.keys(analytics.demographics),
      datasets: [
        {
          label: 'Age Groups',
          data: Object.values(analytics.demographics),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Export analytics data
  const exportData = () => {
    if (!podcast || !analytics) return;

    const data = {
      podcast: {
        title: podcast.title,
        author: podcast.author,
        category: podcast.category,
      },
      analytics: {
        dateRange,
        ...analytics,
      },
      exportDate: format(new Date(), 'yyyy-MM-dd'),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${podcast.title.replace(/\s+/g, '-').toLowerCase()}-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Podcast Analytics" />
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Podcast Analytics" />
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to={`/podcast/${id}`} className="mr-4 text-indigo-600 hover:text-indigo-800">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title={`Analytics: ${podcast?.title}`} className="mb-0" />
      </div>
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-500" />
          <select
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={exportData}
          >
            <FiDownload />
            <span>Export Data</span>
          </button>
          
          <button
            className="flex items-center space-x-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <FiShare2 />
            <span>Share Report</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Listeners</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics?.totalListeners.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Downloads</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics?.totalDownloads.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics?.averageCompletionRate}%</p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Subscribers</h3>
            <p className="text-3xl font-bold text-indigo-600">{analytics?.subscriberCount.toLocaleString()}</p>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Listeners & Downloads</h3>
          <div className="h-80">
            <Line 
              data={prepareListenersData()} 
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
          <h3 className="text-lg font-medium text-gray-700 mb-4">Completion Rate</h3>
          <div className="h-80">
            <Bar 
              data={prepareCompletionRateData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
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
          <h3 className="text-lg font-medium text-gray-700 mb-4">Listening Platforms</h3>
          <div className="h-80 flex justify-center items-center">
            <div className="w-3/4">
              <Doughnut 
                data={preparePlatformsData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value}%`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Listener Demographics</h3>
          <div className="h-80 flex justify-center items-center">
            <div className="w-3/4">
              <Doughnut 
                data={prepareDemographicsData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value}%`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Distribution */}
      <Card>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Podcast Distribution</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listeners</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src="https://via.placeholder.com/40" alt="Apple Podcasts" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Apple Podcasts</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.round(analytics?.totalListeners * 0.45).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">View</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src="https://via.placeholder.com/40" alt="Spotify" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Spotify</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.round(analytics?.totalListeners * 0.3).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">View</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src="https://via.placeholder.com/40" alt="Google Podcasts" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Google Podcasts</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.round(analytics?.totalListeners * 0.15).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">View</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src="https://via.placeholder.com/40" alt="Amazon Music" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Amazon Music</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">Submit</a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src="https://via.placeholder.com/40" alt="Stitcher" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Stitcher</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Not Submitted
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">Submit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PodcastAnalyticsPage;
