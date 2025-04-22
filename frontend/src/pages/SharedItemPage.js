import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import AudioPlayer from '../components/AudioPlayer';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';

const SharedItemPage = () => {
  const { token } = useParams();
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedItem = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/shared/${token}`);
        setItem(response.data.item);
        setItemType(response.data.type);
        setError(null);
      } catch (err) {
        console.error('Error fetching shared item:', err);
        setError(err.response?.data?.message || 'Failed to load shared item');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItem();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg text-center p-8">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t('share.errorDescription')}
          </p>
          <Link to="/" className="btn-primary">
            {t('common.goHome')}
          </Link>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg text-center p-8">
          <div className="text-xl mb-4">{t('share.itemNotFound')}</div>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t('share.itemNotFoundDescription')}
          </p>
          <Link to="/" className="btn-primary">
            {t('common.goHome')}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
            <FiArrowLeft className="mr-2" />
            {t('common.backToHome')}
          </Link>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-1/3">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {item.coverImage ? (
                  <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-gray-400 dark:text-gray-500">
                    {itemType === 'audio' ? '🎵' : '🎙️'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              
              {item.author && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('share.by')} {item.author}
                </p>
              )}
              
              <div className="mb-4">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 mr-2">
                  {itemType === 'audio' ? t('common.audioClip') : t('common.podcast')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {item.description || t('common.noDescription')}
              </p>
              
              <div className="mb-6">
                <AudioPlayer 
                  audioUrl={item.audioUrl || ''}
                  title={item.title}
                  author={item.author}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/${itemType === 'audio' ? 'library' : 'podcast'}`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  <FiExternalLink className="mr-2" />
                  {itemType === 'audio' 
                    ? t('share.exploreAudioLibrary') 
                    : t('share.explorePodcasts')}
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharedItemPage;
