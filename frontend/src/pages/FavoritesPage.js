import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ResponsiveAudioGrid from '../components/ResponsiveAudioGrid';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { FiHeart, FiList, FiGrid } from 'react-icons/fi';
import Card from '../components/Card';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'audio', 'podcasts'

  useEffect(() => {
    fetchFavorites();
  }, [activeTab]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/favorites?type=${activeTab}`);
      setFavorites(response.data);
      setError(null);
    } catch (err) {
      setError(t('favorites.fetchError'));
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(favorites.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  const filteredFavorites = () => {
    if (activeTab === 'all') return favorites;
    return favorites.filter(item => item.type === activeTab);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title={t('favorites.title')} />
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title={t('favorites.title')} />
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md text-red-700 dark:text-red-300 mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={t('favorites.title')} />
      
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('favorites.all')}
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'audio'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('favorites.audioClips')}
          </button>
          <button
            onClick={() => setActiveTab('podcast')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'podcast'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('favorites.podcasts')}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-md ${
              view === 'grid'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            aria-label={t('favorites.gridView')}
          >
            <FiGrid />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${
              view === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            aria-label={t('favorites.listView')}
          >
            <FiList />
          </button>
        </div>
      </div>
      
      {filteredFavorites().length > 0 ? (
        view === 'grid' ? (
          <ResponsiveAudioGrid
            items={filteredFavorites().map(fav => fav.item)}
            onRemoveFavorite={removeFromFavorites}
            showFavoriteButton={true}
          />
        ) : (
          <div className="space-y-4">
            {filteredFavorites().map(favorite => (
              <Card key={favorite.id} className="flex flex-col md:flex-row md:items-center p-4">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {favorite.item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {favorite.item.description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="capitalize mr-2">
                      {favorite.itemType}
                    </span>
                    <span>•</span>
                    <span className="ml-2">
                      {new Date(favorite.item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full"
                    aria-label={t('favorites.remove')}
                  >
                    <FiHeart className="fill-current" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FiHeart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('favorites.noFavorites')}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('favorites.noFavoritesDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
