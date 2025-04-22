import React, { useState, useRef, useEffect } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2, 
  FiVolumeX,
  FiDownload,
  FiShare2,
  FiX,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import { formatDuration } from '../utils/formatters';

const MobileAudioPlayer = ({ 
  audioClip, 
  onClose, 
  onNext, 
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onDownload,
  onShare
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  // Initialize audio player
  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      // Set up event listeners
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      // Clean up event listeners
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioClip]);
  
  // Update duration when audio is loaded
  const updateDuration = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Update progress as audio plays
  const updateProgress = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Auto-play next track if available
    if (hasNext) {
      onNext();
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  // Handle playback rate change
  const handlePlaybackRateChange = (rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  // Handle progress bar click/touch
  const handleProgressClick = (e) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / progressRef.current.offsetWidth;
      audioRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };
  
  // Handle progress bar drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle progress bar drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Handle progress bar drag
  const handleDrag = (e) => {
    if (isDragging && progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / progressRef.current.offsetWidth;
      const newTime = Math.max(0, Math.min(pos * duration, duration));
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    }
  };
  
  // Add touch event handlers
  const handleTouchStart = (e) => {
    handleDragStart();
    handleTouchMove(e);
  };
  
  const handleTouchMove = (e) => {
    if (isDragging && progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.touches[0].clientX - rect.left) / progressRef.current.offsetWidth;
      const newTime = Math.max(0, Math.min(pos * duration, duration));
      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-all duration-300 z-50 ${
        isExpanded ? 'h-full' : 'h-24'
      }`}
    >
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioClip?.fileUrl} 
        preload="metadata"
      />
      
      {/* Collapsed Player */}
      <div className={`h-24 px-4 py-3 flex flex-col ${isExpanded ? 'hidden' : 'block'}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="truncate flex-1">
            <h3 className="text-sm font-medium truncate">{audioClip?.title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {audioClip?.sourceAuthor?.name || 'Unknown Author'}
            </p>
          </div>
          <button 
            onClick={() => setIsExpanded(true)}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
          >
            <FiChevronUp className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center">
          {/* Previous Button */}
          <button 
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`p-2 ${hasPrevious ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300'}`}
          >
            <FiSkipBack className="w-5 h-5" />
          </button>
          
          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="p-2 bg-indigo-600 text-white rounded-full mx-2 hover:bg-indigo-700"
          >
            {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
          
          {/* Next Button */}
          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 ${hasNext ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300'}`}
          >
            <FiSkipForward className="w-5 h-5" />
          </button>
          
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="flex-1 h-2 bg-gray-200 rounded-full mx-2 cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onMouseMove={handleDrag}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleDragEnd}
            onTouchMove={handleTouchMove}
          >
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="text-xs text-gray-500 w-16 text-right">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </div>
        </div>
      </div>
      
      {/* Expanded Player */}
      <div className={`h-full flex flex-col p-4 ${isExpanded ? 'block' : 'hidden'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiChevronDown className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Now Playing</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Cover Art */}
        <div className="flex-1 flex justify-center items-center mb-6">
          <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {audioClip?.sourceAuthor?.profileImageUrl ? (
              <img 
                src={audioClip.sourceAuthor.profileImageUrl} 
                alt={audioClip.sourceAuthor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl text-gray-400">🎵</div>
            )}
          </div>
        </div>
        
        {/* Track Info */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold mb-1">{audioClip?.title}</h3>
          <p className="text-gray-500">{audioClip?.sourceAuthor?.name || 'Unknown Author'}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div 
            ref={progressRef}
            className="h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onMouseMove={handleDrag}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleDragEnd}
            onTouchMove={handleTouchMove}
          >
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-sm text-gray-500 mb-6">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center items-center mb-8">
          {/* Previous Button */}
          <button 
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`p-4 ${hasPrevious ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300'}`}
          >
            <FiSkipBack className="w-6 h-6" />
          </button>
          
          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="p-6 bg-indigo-600 text-white rounded-full mx-6 hover:bg-indigo-700"
          >
            {isPlaying ? <FiPause className="w-8 h-8" /> : <FiPlay className="w-8 h-8 ml-1" />}
          </button>
          
          {/* Next Button */}
          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`p-4 ${hasNext ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-300'}`}
          >
            <FiSkipForward className="w-6 h-6" />
          </button>
        </div>
        
        {/* Volume Control */}
        <div className="flex items-center mb-6">
          <button 
            onClick={toggleMute}
            className="p-2 text-gray-700"
          >
            {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 mx-2 h-2 bg-gray-200 rounded-full appearance-none"
          />
        </div>
        
        {/* Playback Speed */}
        <div className="flex justify-center mb-8">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => handlePlaybackRateChange(rate)}
              className={`px-3 py-1 mx-1 text-sm rounded-full ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={onDownload}
            className="flex items-center px-4 py-2 mx-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
          >
            <FiDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={onShare}
            className="flex items-center px-4 py-2 mx-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
          >
            <FiShare2 className="mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAudioPlayer;
