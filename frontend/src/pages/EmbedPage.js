import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Spinner from '../components/Spinner';
import AudioPlayer from '../components/AudioPlayer';

const EmbedPage = () => {
  const { type, id } = useParams();
  const { t } = useTranslation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        let response;
        
        if (type === 'audio') {
          response = await api.get(`/audio/clips/${id}`);
        } else if (type === 'podcast') {
          response = await api.get(`/podcast/${id}`);
        } else {
          throw new Error('Invalid embed type');
        }
        
        setItem(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching item for embed:', err);
        setError(err.response?.data?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-4 text-center">
        <div>
          <div className="text-red-500 mb-2">{error}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('embed.errorDescription')}
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center h-full p-4 text-center">
        <div>
          <div className="mb-2">{t('embed.itemNotFound')}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('embed.itemNotFoundDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 bg-white dark:bg-gray-800 rounded-md overflow-hidden">
      <div className="flex items-center mb-2">
        {item.coverImage ? (
          <img 
            src={item.coverImage} 
            alt={item.title} 
            className="w-10 h-10 rounded-md mr-3 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {type === 'audio' ? '🎵' : '🎙️'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium truncate">{item.title}</h1>
          {item.author && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.author}
            </p>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          <span className="inline-block px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            RadioX
          </span>
        </div>
      </div>
      
      <div className="flex-1">
        <AudioPlayer 
          audioUrl={item.audioUrl || ''}
          title={item.title}
          author={item.author}
          minimal={true}
        />
      </div>
    </div>
  );
};

export default EmbedPage;
