import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiThumbsUp, FiThumbsDown, FiX, FiInfo, FiPlay, FiClock } from 'react-icons/fi';
import recommendationService from '../services/recommendationService';
import Spinner from './Spinner';
import { formatDuration } from '../utils/formatters';

const RecommendedContent = ({ type = 'audio', limit = 4, onPlay }) => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await recommendationService.getRecommendations({
          type,
          limit,
          includeReason: true
        });
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError(t('recommendations.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, limit, t]);

  const handleFeedback = async (itemId, feedback) => {
    try {
      await recommendationService.provideFeedback(itemId, feedback);
      
      // Update UI to reflect feedback
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === itemId 
            ? { ...rec, userFeedback: feedback } 
            : rec
        )
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleDismiss = (itemId) => {
    setRecommendations(prevRecs => 
      prevRecs.filter(rec => rec.id !== itemId)
    );
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        {t('recommendations.noRecommendations')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {recommendations.map(item => (
        <div 
          key={item.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
        >
          {/* Dismiss button */}
          <button 
            onClick={() => handleDismiss(item.id)}
            className="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
            aria-label={t('common.dismiss')}
          >
            <FiX size={16} />
          </button>
          
          {/* Content thumbnail */}
          <div className="relative h-32 bg-gray-200">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                🎵
              </div>
            )}
            
            {/* Play button overlay */}
            <button
              onClick={() => onPlay && onPlay(item)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <FiPlay className="text-indigo-600 ml-1" />
              </div>
            </button>
          </div>
          
          {/* Content details */}
          <div className="p-3">
            <h3 className="font-medium text-sm mb-1 truncate" title={item.title}>
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2 truncate">
              {item.author || t('common.unknownAuthor')}
            </p>
            
            {/* Duration and type */}
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <FiClock className="mr-1" />
              <span>{formatDuration(item.duration)}</span>
            </div>
            
            {/* Recommendation reason */}
            {item.reason && (
              <div className="flex items-start text-xs text-gray-600 mb-2">
                <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{item.reason}</span>
              </div>
            )}
            
            {/* Feedback buttons */}
            <div className="flex justify-between mt-2">
              <button 
                onClick={() => handleFeedback(item.id, 'like')}
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  item.userFeedback === 'like' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FiThumbsUp className="mr-1" />
                {t('common.like')}
              </button>
              
              <button 
                onClick={() => handleFeedback(item.id, 'dislike')}
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  item.userFeedback === 'dislike' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FiThumbsDown className="mr-1" />
                {t('common.dislike')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedContent;
