import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

const AudioPlayer = ({ audioUrl, title, author, minimal = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    // Reset player state when audio URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    setVolume(value);
    audioRef.current.volume = value;
    if (value === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarClick = (e) => {
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    audioRef.current.currentTime = pos * duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (minimal) {
    return (
      <div className="audio-player-minimal bg-gray-100 dark:bg-gray-800 rounded-md p-2">
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="flex items-center">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full mr-3"
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          <div className="flex-grow">
            <div 
              ref={progressBarRef}
              className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div 
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1 text-gray-600 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-player bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <audio 
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {title && (
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          {author && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{author}</p>
          )}
        </div>
      )}
      
      <div className="flex items-center mb-2">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full mr-4"
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        
        <div className="flex-grow">
          <div 
            ref={progressBarRef}
            className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs mt-1 text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={toggleMute}
          className="text-gray-600 dark:text-gray-400 mr-2"
        >
          {isMuted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
