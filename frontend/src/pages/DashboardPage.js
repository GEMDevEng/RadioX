import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import RecommendedContent from '../components/RecommendedContent';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    audioClips: 0,
    podcasts: 0,
    apiUsage: {
      postsUsed: 0,
      postsLimit: 500,
      readRequestsUsed: 0,
      readRequestsLimit: 100,
    },
  });
  const [recentAudio, setRecentAudio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // In a real implementation, we would fetch this data from the API
        // For now, we'll use mock data

        // Mock API call for stats
        // const { data: statsData } = await api.get('/usage/stats');
        // setStats(statsData);

        // Mock API call for recent audio
        // const { data: audioData } = await api.get('/audio/recent');
        // setRecentAudio(audioData);

        // Mock data for demonstration
        setStats({
          audioClips: 12,
          podcasts: 2,
          apiUsage: {
            postsUsed: 127,
            postsLimit: 500,
            readRequestsUsed: 43,
            readRequestsLimit: 100,
          },
        });

        setRecentAudio([
          {
            id: '1',
            title: 'Latest Tech Trends 2023',
            duration: '2:34',
            createdAt: '2023-05-15T10:30:00Z',
            imageUrl: 'https://via.placeholder.com/150',
          },
          {
            id: '2',
            title: 'AI Developments in Healthcare',
            duration: '3:12',
            createdAt: '2023-05-14T14:45:00Z',
            imageUrl: 'https://via.placeholder.com/150',
          },
          {
            id: '3',
            title: 'Sustainable Energy Solutions',
            duration: '4:05',
            createdAt: '2023-05-12T09:15:00Z',
            imageUrl: 'https://via.placeholder.com/150',
          },
        ]);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {currentUser.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your RadioX activity
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Audio Clips</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.audioClips}</p>
          <Link
            to="/library"
            className="text-sm text-primary-600 hover:text-primary-500 mt-2 inline-block"
          >
            View all clips →
          </Link>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Podcasts</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.podcasts}</p>
          <Link
            to="/podcast"
            className="text-sm text-primary-600 hover:text-primary-500 mt-2 inline-block"
          >
            Manage podcasts →
          </Link>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Posts Used</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-primary-600">
              {stats.apiUsage.postsUsed}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              / {stats.apiUsage.postsLimit}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{
                width: `${(stats.apiUsage.postsUsed / stats.apiUsage.postsLimit) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Read Requests</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-primary-600">
              {stats.apiUsage.readRequestsUsed}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              / {stats.apiUsage.readRequestsLimit}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{
                width: `${
                  (stats.apiUsage.readRequestsUsed / stats.apiUsage.readRequestsLimit) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/search"
            className="card p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Search X Posts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find posts to convert to audio
              </p>
            </div>
          </Link>

          <Link
            to="/library"
            className="card p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Audio Library</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your audio clips
              </p>
            </div>
          </Link>

          <Link
            to="/podcast"
            className="card p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Create Podcast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Publish your audio as podcasts
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recommended Content */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('recommendations.title')}</h2>
          <Link
            to="/smart-search"
            className="text-primary-600 hover:text-primary-500"
          >
            {t('recommendations.viewAll')}
          </Link>
        </div>
        <RecommendedContent
          type="audio"
          limit={4}
          onPlay={(item) => console.log('Play item:', item)}
        />
      </div>

      {/* Recent Audio */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('dashboard.recentAudio')}</h2>
          <Link
            to="/library"
            className="text-primary-600 hover:text-primary-500"
          >
            {t('common.viewAll')}
          </Link>
        </div>

        {recentAudio.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              You haven't created any audio clips yet.
            </p>
            <Link
              to="/search"
              className="btn-primary inline-block mt-4"
            >
              Create Your First Audio Clip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAudio.map((audio) => (
              <div key={audio.id} className="card overflow-hidden">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                  <img
                    src={audio.imageUrl}
                    alt={audio.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {audio.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{audio.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created on{' '}
                    {new Date(audio.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between mt-3">
                    <button className="text-primary-600 hover:text-primary-500 text-sm flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Play
                    </button>
                    <button className="text-primary-600 hover:text-primary-500 text-sm flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
