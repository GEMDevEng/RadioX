import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiMic, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import smartSearchService from '../services/smartSearchService';

const SmartSearchBar = ({ onSearch, placeholder, className = '' }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch search history on component mount
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const history = await smartSearchService.getSearchHistory(5);
        setSearchHistory(history);
      } catch (err) {
        console.error('Failed to fetch search history:', err);
      }
    };

    fetchSearchHistory();
  }, []);

  // Handle click outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get search suggestions as user types
  useEffect(() => {
    const getSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const newSuggestions = await smartSearchService.getSearchSuggestions(query);
        setSuggestions(newSuggestions);
      } catch (err) {
        console.error('Failed to get search suggestions:', err);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle search submission
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Perform natural language search
      const results = await smartSearchService.naturalLanguageSearch(searchQuery);
      
      // Get related search terms
      const related = await smartSearchService.getRelatedSearchTerms(searchQuery);
      setRelatedTerms(related);
      
      // Pass results to parent component
      if (onSearch) {
        onSearch(searchQuery, results);
      }
      
      // Update search history
      const updatedHistory = await smartSearchService.getSearchHistory(5);
      setSearchHistory(updatedHistory);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice search
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        try {
          setIsLoading(true);
          const results = await smartSearchService.voiceSearch(audioBlob);
          
          // Set the transcribed query
          setQuery(results.transcription || '');
          
          // Perform search with transcribed query
          if (results.transcription) {
            handleSearch(results.transcription);
          }
        } catch (err) {
          console.error('Voice search failed:', err);
        } finally {
          setIsLoading(false);
          setIsRecording(false);
          
          // Stop all tracks on the stream to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Automatically stop recording after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (err) {
      console.error('Failed to start voice recording:', err);
      alert(t('search.microphoneAccessDenied'));
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setRelatedTerms([]);
    searchInputRef.current.focus();
  };

  // Clear search history
  const handleClearHistory = async () => {
    try {
      await smartSearchService.clearSearchHistory();
      setSearchHistory([]);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder || t('search.placeholder')}
          disabled={isLoading || isRecording}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
          
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`ml-2 focus:outline-none ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-500'
            }`}
            title={isRecording ? t('search.stopRecording') : t('search.startVoiceSearch')}
          >
            <FiMic className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length > 0 || searchHistory.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t('search.suggestions')}
              </h3>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`}>
                    <button
                      className="flex items-center w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                    >
                      <FiSearch className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{suggestion}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('search.recentSearches')}
                </h3>
                <button
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                  onClick={handleClearHistory}
                >
                  {t('search.clearAll')}
                </button>
              </div>
              <ul>
                {searchHistory.map((item, index) => (
                  <li key={`history-${index}`}>
                    <button
                      className="flex items-center w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setQuery(item.query);
                        handleSearch(item.query);
                      }}
                    >
                      <FiClock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{item.query}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Related Search Terms */}
          {relatedTerms.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {t('search.relatedSearches')}
              </h3>
              <ul>
                {relatedTerms.map((term, index) => (
                  <li key={`related-${index}`}>
                    <button
                      className="flex items-center w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                    >
                      <FiTrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Loading or Recording Indicator */}
      {(isLoading || isRecording) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
          <div className={`flex items-center ${isRecording ? 'text-red-500' : 'text-indigo-500'}`}>
            <div className="animate-pulse mr-2">
              {isRecording ? (
                <FiMic className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 border-t-2 border-b-2 border-current rounded-full animate-spin" />
              )}
            </div>
            <span className="text-sm font-medium">
              {isRecording ? t('search.listening') : t('search.searching')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
