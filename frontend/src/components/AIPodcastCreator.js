import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit, FiRefreshCw, FiCheck, FiX, FiCalendar, FiTag, FiFileText } from 'react-icons/fi';
import aiService from '../services/aiService';
import api from '../services/api';
import Spinner from './Spinner';

const AIPodcastCreator = ({ selectedAudioClips = [], onComplete }) => {
  const { t } = useTranslation();
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastDescription, setPodcastDescription] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [generatedTags, setGeneratedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [descriptionStyle, setDescriptionStyle] = useState('professional');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState('');
  const [isGeneratingShowNotes, setIsGeneratingShowNotes] = useState(false);
  const [publishSchedule, setPublishSchedule] = useState(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Generate title suggestions when component mounts
  useEffect(() => {
    if (selectedAudioClips.length > 0) {
      handleGenerateTitles();
    }
  }, [selectedAudioClips]);

  // Generate title suggestions
  const handleGenerateTitles = async () => {
    if (selectedAudioClips.length === 0) return;
    
    try {
      setIsGeneratingTitle(true);
      setError(null);
      
      // Combine content from all selected clips for better context
      const combinedContent = selectedAudioClips
        .map(clip => clip.title + ': ' + (clip.sourceText || clip.description || ''))
        .join(' ');
      
      const titles = await aiService.generateTitleSuggestions(combinedContent, 3);
      setGeneratedTitles(titles);
      
      // Set the first title as default
      if (titles.length > 0 && !podcastTitle) {
        setPodcastTitle(titles[0]);
      }
    } catch (err) {
      console.error('Failed to generate titles:', err);
      setError(t('ai.titleGenerationError'));
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Generate podcast description
  const handleGenerateDescription = async () => {
    if (selectedAudioClips.length === 0 || !podcastTitle) return;
    
    try {
      setIsGeneratingDescription(true);
      setError(null);
      
      const description = await aiService.generatePodcastDescription(
        selectedAudioClips,
        podcastTitle,
        descriptionStyle
      );
      
      setPodcastDescription(description);
    } catch (err) {
      console.error('Failed to generate description:', err);
      setError(t('ai.descriptionGenerationError'));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Generate tags
  const handleGenerateTags = async () => {
    if (selectedAudioClips.length === 0 || !podcastTitle) return;
    
    try {
      setIsGeneratingTags(true);
      setError(null);
      
      // Combine content for better context
      const combinedContent = 
        podcastTitle + ' ' + 
        podcastDescription + ' ' + 
        selectedAudioClips
          .map(clip => clip.title + ': ' + (clip.sourceText || clip.description || ''))
          .join(' ');
      
      const tags = await aiService.generateTags(combinedContent, 8);
      setGeneratedTags(tags);
      setSelectedTags(tags.slice(0, 5)); // Select first 5 tags by default
    } catch (err) {
      console.error('Failed to generate tags:', err);
      setError(t('ai.tagGenerationError'));
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // Generate show notes
  const handleGenerateShowNotes = async () => {
    if (selectedAudioClips.length === 0) return;
    
    try {
      setIsGeneratingShowNotes(true);
      setError(null);
      
      // Generate show notes for each clip and combine them
      const notesPromises = selectedAudioClips.map(clip => 
        aiService.generateShowNotes(clip, 'bullet')
      );
      
      const allNotes = await Promise.all(notesPromises);
      const combinedNotes = allNotes.join('\n\n');
      
      setShowNotes(combinedNotes);
    } catch (err) {
      console.error('Failed to generate show notes:', err);
      setError(t('ai.showNotesGenerationError'));
    } finally {
      setIsGeneratingShowNotes(false);
    }
  };

  // Generate publishing schedule
  const handleGenerateSchedule = async () => {
    try {
      setIsGeneratingSchedule(true);
      setError(null);
      
      const preferences = {
        frequency: 'weekly',
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        timeOfDay: 'morning',
        episodeCount: selectedAudioClips.length
      };
      
      const schedule = await aiService.generatePodcastSchedule(preferences);
      setPublishSchedule(schedule);
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      setError(t('ai.scheduleGenerationError'));
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Create podcast with generated content
  const handleCreatePodcast = async () => {
    if (selectedAudioClips.length === 0 || !podcastTitle || !podcastDescription) {
      setError(t('ai.missingRequiredFields'));
      return;
    }
    
    try {
      setIsCreatingPodcast(true);
      setError(null);
      
      const podcastData = {
        title: podcastTitle,
        description: podcastDescription,
        audioClips: selectedAudioClips.map(clip => clip.id),
        tags: selectedTags,
        showNotes: showNotes,
        publishSchedule: publishSchedule
      };
      
      const response = await api.post('/podcasts', podcastData);
      
      if (onComplete) {
        onComplete(response.data);
      }
    } catch (err) {
      console.error('Failed to create podcast:', err);
      setError(t('ai.podcastCreationError'));
    } finally {
      setIsCreatingPodcast(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{t('ai.createPodcast')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Title Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('podcast.podcastTitle')}
        </label>
        
        <div className="flex mb-2">
          <input
            type="text"
            value={podcastTitle}
            onChange={(e) => setPodcastTitle(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('ai.enterPodcastTitle')}
          />
          <button
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitle || selectedAudioClips.length === 0}
            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isGeneratingTitle ? (
              <Spinner size="sm" />
            ) : (
              <FiRefreshCw className="mr-2" />
            )}
            {t('ai.generateTitles')}
          </button>
        </div>
        
        {/* Title Suggestions */}
        {generatedTitles.length > 0 && (
          <div className="mb-2">
            <p className="text-sm text-gray-500 mb-2">{t('ai.suggestedTitles')}:</p>
            <div className="flex flex-wrap gap-2">
              {generatedTitles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => setPodcastTitle(title)}
                  className={`text-sm px-3 py-1 rounded-full ${
                    podcastTitle === title
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Description Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('podcast.description')}
          </label>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">{t('ai.style')}:</span>
            <select
              value={descriptionStyle}
              onChange={(e) => setDescriptionStyle(e.target.value)}
              className="text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="professional">{t('ai.styleProfessional')}</option>
              <option value="casual">{t('ai.styleCasual')}</option>
              <option value="engaging">{t('ai.styleEngaging')}</option>
            </select>
          </div>
        </div>
        
        <div className="flex mb-2">
          <textarea
            value={podcastDescription}
            onChange={(e) => setPodcastDescription(e.target.value)}
            rows={4}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('ai.enterPodcastDescription')}
          />
        </div>
        
        <button
          onClick={handleGenerateDescription}
          disabled={isGeneratingDescription || selectedAudioClips.length === 0 || !podcastTitle}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGeneratingDescription ? (
            <Spinner size="sm" />
          ) : (
            <FiEdit className="mr-2" />
          )}
          {t('ai.generateDescription')}
        </button>
      </div>
      
      {/* Tags Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('podcast.tags')}
        </label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {generatedTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => toggleTag(tag)}
              className={`text-sm px-3 py-1 rounded-full flex items-center ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {selectedTags.includes(tag) && <FiCheck className="mr-1" />}
              {tag}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleGenerateTags}
          disabled={isGeneratingTags || !podcastTitle}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGeneratingTags ? (
            <Spinner size="sm" />
          ) : (
            <FiTag className="mr-2" />
          )}
          {t('ai.generateTags')}
        </button>
      </div>
      
      {/* Show Notes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('podcast.showNotes')}
        </label>
        
        <div className="flex mb-2">
          <textarea
            value={showNotes}
            onChange={(e) => setShowNotes(e.target.value)}
            rows={4}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('ai.enterShowNotes')}
          />
        </div>
        
        <button
          onClick={handleGenerateShowNotes}
          disabled={isGeneratingShowNotes || selectedAudioClips.length === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGeneratingShowNotes ? (
            <Spinner size="sm" />
          ) : (
            <FiFileText className="mr-2" />
          )}
          {t('ai.generateShowNotes')}
        </button>
      </div>
      
      {/* Publishing Schedule Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('podcast.publishingSchedule')}
        </label>
        
        {publishSchedule ? (
          <div className="bg-gray-50 p-3 rounded-md mb-3">
            <h4 className="font-medium text-sm mb-2">{t('ai.recommendedSchedule')}:</h4>
            <ul className="text-sm space-y-1">
              {publishSchedule.map((item, index) => (
                <li key={index} className="flex items-center">
                  <FiCalendar className="mr-2 text-indigo-500" />
                  <span>
                    {item.title} - {item.publishDate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3">
            {t('ai.noScheduleGenerated')}
          </p>
        )}
        
        <button
          onClick={handleGenerateSchedule}
          disabled={isGeneratingSchedule || selectedAudioClips.length === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGeneratingSchedule ? (
            <Spinner size="sm" />
          ) : (
            <FiCalendar className="mr-2" />
          )}
          {t('ai.generateSchedule')}
        </button>
      </div>
      
      {/* Create Podcast Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreatePodcast}
          disabled={
            isCreatingPodcast || 
            !podcastTitle || 
            !podcastDescription || 
            selectedAudioClips.length === 0
          }
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isCreatingPodcast ? (
            <Spinner size="sm" />
          ) : (
            <FiCheck className="mr-2" />
          )}
          {t('ai.createPodcast')}
        </button>
      </div>
    </div>
  );
};

export default AIPodcastCreator;
