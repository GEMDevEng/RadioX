import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import Card from './Card';
import Spinner from './Spinner';

const TrendingHashtags = ({ limit = 5, timeframe = 'daily' }) => {
  const { t } = useTranslation();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    fetchTrends();
  }, [selectedTimeframe]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search/trending?timeframe=${selectedTimeframe}&limit=${limit}`);
      setTrends(response.data);
      setError(null);
    } catch (err) {
      setError(t('trending.fetchError'));
      console.error('Error fetching trending hashtags:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex justify-center items-center">
        <Spinner size="md" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchTrends}
            className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto"
          >
            <FiRefreshCw className="mr-1" />
            {t('common.retry')}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
          <FiTrendingUp className="mr-2 text-indigo-600 dark:text-indigo-400" />
          {t('trending.title')}
        </h3>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="text-sm bg-gray-100 dark:bg-gray-700 border-none rounded-md"
        >
          <option value="daily">{t('trending.daily')}</option>
          <option value="weekly">{t('trending.weekly')}</option>
          <option value="monthly">{t('trending.monthly')}</option>
        </select>
      </div>
      
      {trends.length > 0 ? (
        <ul className="space-y-3">
          {trends.map((trend, index) => (
            <li key={trend.hashtag} className="flex items-center">
              <span className="w-6 text-gray-500 dark:text-gray-400 font-semibold">
                {index + 1}.
              </span>
              <Link
                to={`/search?q=${encodeURIComponent(trend.hashtag)}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex-grow"
              >
                #{trend.hashtag}
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trend.count} {t('trending.posts')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {t('trending.noTrends')}
        </p>
      )}
      
      <div className="mt-4 text-right">
        <Link
          to="/trending"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {t('trending.viewAll')}
        </Link>
      </div>
    </Card>
  );
};

export default TrendingHashtags;
