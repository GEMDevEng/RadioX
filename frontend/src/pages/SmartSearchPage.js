import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiChevronDown, FiChevronUp, FiPlay, FiClock, FiTag, FiUser, FiCalendar } from 'react-icons/fi';
import SmartSearchBar from '../components/SmartSearchBar';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { formatDuration, formatDate } from '../utils/formatters';

const SmartSearchPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    duration: null,
    date: null,
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Handle search submission
  const handleSearch = (query, results) => {
    setSearchQuery(query);
    setSearchResults(results);
    setIsLoading(false);
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Update active filters
  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Toggle a tag filter
  const toggleTagFilter = (tag) => {
    setActiveFilters(prev => {
      const currentTags = [...prev.tags];
      const tagIndex = currentTags.indexOf(tag);
      
      if (tagIndex >= 0) {
        currentTags.splice(tagIndex, 1);
      } else {
        currentTags.push(tag);
      }
      
      return {
        ...prev,
        tags: currentTags
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      type: 'all',
      duration: null,
      date: null,
      tags: []
    });
  };

  // Apply filters to search results
  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    let filtered = [...searchResults.items];
    
    // Filter by content type
    if (activeFilters.type !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilters.type);
    }
    
    // Filter by duration
    if (activeFilters.duration) {
      const [min, max] = activeFilters.duration.split('-').map(Number);
      filtered = filtered.filter(item => {
        const durationInMinutes = Math.floor(item.duration / 60);
        return durationInMinutes >= min && (max === 0 || durationInMinutes <= max);
      });
    }
    
    // Filter by date
    if (activeFilters.date) {
      const now = new Date();
      let dateLimit;
      
      switch (activeFilters.date) {
        case 'today':
          dateLimit = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          dateLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateLimit = null;
      }
      
      if (dateLimit) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= dateLimit;
        });
      }
    }
    
    // Filter by tags
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter(item => {
        return activeFilters.tags.some(tag => item.tags.includes(tag));
      });
    }
    
    return filtered;
  };

  // Get all available tags from search results
  const getAllTags = () => {
    if (!searchResults) return [];
    
    const tagSet = new Set();
    searchResults.items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet);
  };

  const filteredResults = searchResults ? getFilteredResults() : [];
  const allTags = searchResults ? getAllTags() : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={t('search.smartSearch')} 
        subtitle={t('search.smartSearchDescription')}
      />
      
      {/* Search Bar */}
      <div className="mb-8">
        <SmartSearchBar 
          onSearch={handleSearch}
          placeholder={t('search.searchPlaceholder')}
          className="max-w-3xl mx-auto"
        />
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Results Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {searchResults ? (
                  <>
                    {t('search.resultsFor')} <span className="font-semibold">"{searchQuery}"</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({filteredResults.length} {t('search.results')})
                    </span>
                  </>
                ) : (
                  t('search.searching')
                )}
              </h2>
              
              {/* Filter Toggle Button */}
              <button
                onClick={toggleFilters}
                className="mt-2 sm:mt-0 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FiFilter className="mr-1" />
                {t('search.filters')}
                {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
              </button>
            </div>
            
            {/* Filters Section */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Content Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('search.contentType')}
                    </label>
                    <select
                      value={activeFilters.type}
                      onChange={(e) => updateFilter('type', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="all">{t('search.allTypes')}</option>
                      <option value="audio">{t('search.audioClips')}</option>
                      <option value="podcast">{t('search.podcasts')}</option>
                      <option value="source">{t('search.sources')}</option>
                    </select>
                  </div>
                  
                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('search.duration')}
                    </label>
                    <select
                      value={activeFilters.duration || ''}
                      onChange={(e) => updateFilter('duration', e.target.value || null)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t('search.anyDuration')}</option>
                      <option value="0-5">{t('search.underFiveMinutes')}</option>
                      <option value="5-15">{t('search.fiveToFifteenMinutes')}</option>
                      <option value="15-30">{t('search.fifteenToThirtyMinutes')}</option>
                      <option value="30-60">{t('search.thirtyToSixtyMinutes')}</option>
                      <option value="60-0">{t('search.overSixtyMinutes')}</option>
                    </select>
                  </div>
                  
                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('search.date')}
                    </label>
                    <select
                      value={activeFilters.date || ''}
                      onChange={(e) => updateFilter('date', e.target.value || null)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t('search.anyTime')}</option>
                      <option value="today">{t('search.today')}</option>
                      <option value="week">{t('search.pastWeek')}</option>
                      <option value="month">{t('search.pastMonth')}</option>
                      <option value="year">{t('search.pastYear')}</option>
                    </select>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {t('search.clearFilters')}
                    </button>
                  </div>
                </div>
                
                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('search.tags')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => toggleTagFilter(tag)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            activeFilters.tags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <FiTag className="mr-1" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Results Content */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : searchResults ? (
              filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="relative w-24 h-24 bg-gray-200 rounded overflow-hidden">
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
                          <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <FiPlay className="text-indigo-600 ml-1" />
                            </div>
                          </button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.type === 'audio' && t('search.audioClip')}
                            {item.type === 'podcast' && t('search.podcast')}
                            {item.type === 'source' && t('search.source')}
                          </span>
                          
                          <div className="ml-2 flex items-center text-xs text-gray-500">
                            <FiClock className="mr-1" />
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {item.title}
                        </h3>
                        
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <FiUser className="mr-1" />
                          <span>{item.author || t('common.unknownAuthor')}</span>
                          
                          <span className="mx-2">•</span>
                          
                          <FiCalendar className="mr-1" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {item.description || t('search.noDescription')}
                        </p>
                        
                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <FiTag className="mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Relevance Score */}
                        {item.relevanceScore && (
                          <div className="mt-2 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-indigo-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, item.relevanceScore * 100)}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">
                              {Math.round(item.relevanceScore * 100)}% {t('search.relevant')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {t('search.noResultsFound')}
                </div>
              )
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('search.enterSearchQuery')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchPage;
