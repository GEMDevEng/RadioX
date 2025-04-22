import React, { useState } from 'react';
import { FiGrid, FiList, FiFilter } from 'react-icons/fi';
import useDeviceDetect from '../hooks/useDeviceDetect';
import MobileAudioPlayer from './MobileAudioPlayer';

const ResponsiveAudioGrid = ({ 
  audioClips, 
  onPlay, 
  onDownload, 
  onShare, 
  onDelete,
  isLoading,
  emptyMessage = 'No audio clips found'
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  
  const { isMobile, isTablet } = useDeviceDetect();
  
  // Handle play button click
  const handlePlay = (index) => {
    setCurrentAudioIndex(index);
    
    if (isMobile || isTablet) {
      setShowMobilePlayer(true);
    }
    
    if (onPlay) {
      onPlay(audioClips[index]);
    }
  };
  
  // Handle next track
  const handleNext = () => {
    if (currentAudioIndex !== null && currentAudioIndex < audioClips.length - 1) {
      const nextIndex = currentAudioIndex + 1;
      setCurrentAudioIndex(nextIndex);
      
      if (onPlay) {
        onPlay(audioClips[nextIndex]);
      }
    }
  };
  
  // Handle previous track
  const handlePrevious = () => {
    if (currentAudioIndex !== null && currentAudioIndex > 0) {
      const prevIndex = currentAudioIndex - 1;
      setCurrentAudioIndex(prevIndex);
      
      if (onPlay) {
        onPlay(audioClips[prevIndex]);
      }
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (currentAudioIndex !== null && onDownload) {
      onDownload(audioClips[currentAudioIndex]);
    }
  };
  
  // Handle share
  const handleShare = () => {
    if (currentAudioIndex !== null && onShare) {
      onShare(audioClips[currentAudioIndex]);
    }
  };
  
  // Handle close mobile player
  const handleCloseMobilePlayer = () => {
    setShowMobilePlayer(false);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render empty state
  if (!audioClips || audioClips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* View Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center p-2 text-gray-700 hover:text-indigo-600"
        >
          <FiFilter className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Type
              </label>
              <select className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="">All Sources</option>
                <option value="post">Posts</option>
                <option value="thread">Threads</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="">Any Duration</option>
                <option value="short">Short (< 1 min)</option>
                <option value="medium">Medium (1-3 min)</option>
                <option value="long">Long (> 3 min)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration_asc">Duration (Shortest)</option>
                <option value="duration_desc">Duration (Longest)</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioClips.map((clip, index) => (
            <div
              key={clip.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40 bg-gray-200">
                {clip.imageUrl ? (
                  <img
                    src={clip.imageUrl}
                    alt={clip.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    🎵
                  </div>
                )}
                <button
                  onClick={() => handlePlay(index)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-600"
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
                  </div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{clip.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {clip.sourceAuthor?.name || 'Unknown Author'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{clip.duration}s</span>
                  <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {audioClips.map((clip, index) => (
            <div
              key={clip.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-32 sm:h-auto bg-gray-200 relative flex-shrink-0">
                  {clip.imageUrl ? (
                    <img
                      src={clip.imageUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      🎵
                    </div>
                  )}
                  <button
                    onClick={() => handlePlay(index)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600"
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
                    </div>
                  </button>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-semibold text-lg mb-1">{clip.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {clip.sourceAuthor?.name || 'Unknown Author'}
                  </p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {clip.description || clip.sourceText || 'No description available'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>{clip.duration}s</span>
                      <span>{clip.sourceType}</span>
                      <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      {onDownload && (
                        <button
                          onClick={() => onDownload(clip)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Download
                        </button>
                      )}
                      {onShare && (
                        <button
                          onClick={() => onShare(clip)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Share
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(clip)}
                          className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile Audio Player */}
      {showMobilePlayer && currentAudioIndex !== null && (
        <MobileAudioPlayer
          audioClip={audioClips[currentAudioIndex]}
          onClose={handleCloseMobilePlayer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={currentAudioIndex < audioClips.length - 1}
          hasPrevious={currentAudioIndex > 0}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default ResponsiveAudioGrid;
