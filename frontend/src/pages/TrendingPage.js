import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiRefreshCw, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

const TrendingPage = () => {
  const { t } = useTranslation();
  const [trends, setTrends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [timeframe, setTimeframe] = useState('daily');

  useEffect(() => {
    fetchTrends();
    fetchSuggestions();
  }, [timeframe]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trending?timeframe=${timeframe}&limit=20`);
      setTrends(response.data);
      setError(null);
    } catch (err) {
      setError(t('trending.fetchError'));
      console.error('Error fetching trending hashtags:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const response = await api.get('/trending/suggestions?limit=10');
      setSuggestions(response.data);
      setSuggestionsError(null);
    } catch (err) {
      setSuggestionsError(t('trending.fetchError'));
      console.error('Error fetching hashtag suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('trending.title')} />
      
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-4 py-2 rounded-md ${
              timeframe === 'daily'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('trending.daily')}
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-2 rounded-md ${
              timeframe === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('trending.weekly')}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-2 rounded-md ${
              timeframe === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('trending.monthly')}
          </button>
        </div>
        
        <button
          onClick={fetchTrends}
          className="text-indigo-600 dark:text-indigo-400 flex items-center"
        >
          <FiRefreshCw className="mr-1" />
          {t('common.refresh')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Hashtags */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-indigo-600 dark:text-indigo-400" />
              {t('trending.title')}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={fetchTrends}
                  className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto"
                >
                  <FiRefreshCw className="mr-1" />
                  {t('common.retry')}
                </button>
              </div>
            ) : trends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trends.map((trend, index) => (
                  <div 
                    key={trend.hashtag} 
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold mr-3">
                      {index + 1}
                    </span>
                    <div className="flex-grow">
                      <Link
                        to={`/search?q=${encodeURIComponent(trend.hashtag)}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        #{trend.hashtag}
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trend.count} {t('trending.posts')}
                      </div>
                    </div>
                    <Link
                      to={`/search?q=${encodeURIComponent(trend.hashtag)}`}
                      className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      aria-label={t('trending.explore')}
                    >
                      <FiSearch />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                {t('trending.noTrends')}
              </p>
            )}
          </Card>
        </div>
        
        {/* Suggested Hashtags */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {t('trending.suggestions')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('trending.suggestionsDescription')}
            </p>
            
            {suggestionsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Spinner size="md" />
              </div>
            ) : suggestionsError ? (
              <div className="text-center py-6">
                <p className="text-red-500 mb-2">{suggestionsError}</p>
                <button
                  onClick={fetchSuggestions}
                  className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto"
                >
                  <FiRefreshCw className="mr-1" />
                  {t('common.retry')}
                </button>
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.hashtag} className="flex items-center justify-between">
                    <Link
                      to={`/search?q=${encodeURIComponent(suggestion.hashtag)}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      #{suggestion.hashtag}
                    </Link>
                    <Link
                      to={`/search?q=${encodeURIComponent(suggestion.hashtag)}`}
                      className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    >
                      {t('trending.explore')}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                {t('trending.noTrends')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
