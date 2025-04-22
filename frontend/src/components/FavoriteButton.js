import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { toast } from 'react-toastify';

const FavoriteButton = ({ itemId, itemType, initialIsFavorite = false, onToggle }) => {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if item is already in favorites
    const checkFavoriteStatus = async () => {
      try {
        const response = await api.get(`/favorites/check?itemId=${itemId}&itemType=${itemType}`);
        setIsFavorite(response.data.isFavorite);
        setFavoriteId(response.data.favoriteId);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkFavoriteStatus();
  }, [itemId, itemType]);

  const toggleFavorite = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await api.delete(`/favorites/${favoriteId}`);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success(t('favorites.removedFromFavorites'));
      } else {
        // Add to favorites
        const response = await api.post('/favorites', {
          itemId,
          itemType
        });
        setIsFavorite(true);
        setFavoriteId(response.data._id);
        toast.success(t('favorites.addedToFavorites'));
      }

      // Call onToggle callback if provided
      if (onToggle) {
        onToggle(isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error(err.response?.data?.message || 'Error updating favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full focus:outline-none transition-colors duration-200 ${
        isFavorite
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900'
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-label={isFavorite ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
    >
      <FiHeart className={isFavorite ? 'fill-current' : ''} />
    </button>
  );
};

export default FavoriteButton;
