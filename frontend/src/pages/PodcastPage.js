import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import AIPodcastCreator from '../components/AIPodcastCreator';

const PodcastPage = () => {
  const { t } = useTranslation();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEpisodesModal, setShowEpisodesModal] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [availableAudio, setAvailableAudio] = useState([]);

  // Form state for creating a new podcast
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    category: 'Technology',
    language: 'en',
    explicit: false,
    author: '',
    email: '',
    imageFile: null,
    imagePreview: null,
  });

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);

        // In a real implementation, we would fetch from the API
        // const { data } = await api.get('/podcast');
        // setPodcasts(data);

        // Mock data for demonstration
        setTimeout(() => {
          const mockPodcasts = [
            {
              id: '1',
              title: 'Tech Insights',
              description: 'The latest insights and analysis on technology trends',
              category: 'Technology',
              language: 'en',
              explicit: false,
              author: 'Tech Enthusiast',
              email: 'tech@example.com',
              imageUrl: 'https://via.placeholder.com/300',
              rssUrl: 'https://example.com/podcasts/tech-insights.xml',
              episodeCount: 8,
              createdAt: '2023-04-15T10:30:00Z',
              lastUpdated: '2023-05-10T14:20:00Z',
            },
            {
              id: '2',
              title: 'Future Finance',
              description: 'Exploring the future of money, investing, and financial technology',
              category: 'Business',
              language: 'en',
              explicit: false,
              author: 'Finance Expert',
              email: 'finance@example.com',
              imageUrl: 'https://via.placeholder.com/300',
              rssUrl: 'https://example.com/podcasts/future-finance.xml',
              episodeCount: 5,
              createdAt: '2023-03-20T09:15:00Z',
              lastUpdated: '2023-05-05T11:30:00Z',
            },
          ];

          setPodcasts(mockPodcasts);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Failed to load podcasts');
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const handleCreatePodcast = async (e) => {
    e.preventDefault();

    // Validate form
    if (!newPodcast.title || !newPodcast.description || !newPodcast.author || !newPodcast.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // In a real implementation, we would submit to the API
      // const formData = new FormData();
      // Object.keys(newPodcast).forEach(key => {
      //   formData.append(key, newPodcast[key]);
      // });
      // const { data } = await api.post('/podcast', formData);
      // setPodcasts([...podcasts, data]);

      // Mock response for demonstration
      const mockNewPodcast = {
        id: Date.now().toString(),
        ...newPodcast,
        imageUrl: newPodcast.imagePreview || 'https://via.placeholder.com/300',
        rssUrl: `https://example.com/podcasts/${newPodcast.title.toLowerCase().replace(/\s+/g, '-')}.xml`,
        episodeCount: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      setPodcasts([...podcasts, mockNewPodcast]);

      // Reset form and close modal
      setNewPodcast({
        title: '',
        description: '',
        category: 'Technology',
        language: 'en',
        explicit: false,
        author: '',
        email: '',
        imageFile: null,
        imagePreview: null,
      });
      setShowCreateModal(false);

    } catch (err) {
      setError('Failed to create podcast');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPodcast({
        ...newPodcast,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleDeletePodcast = async (podcastId) => {
    if (window.confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      try {
        // In a real implementation, we would call the API
        // await api.delete(`/podcast/${podcastId}`);

        // Update state to remove the deleted podcast
        setPodcasts(podcasts.filter((podcast) => podcast.id !== podcastId));
      } catch (err) {
        setError('Failed to delete podcast');
      }
    }
  };

  const handleOpenEpisodesModal = async (podcast) => {
    setSelectedPodcast(podcast);

    try {
      // In a real implementation, we would fetch available audio clips
      // const { data } = await api.get('/audio/clips');
      // setAvailableAudio(data);

      // Mock data for demonstration
      const mockAudioClips = [
        {
          id: '1',
          title: 'Latest Tech Trends 2023',
          duration: '2:34',
          createdAt: '2023-05-15T10:30:00Z',
          imageUrl: 'https://via.placeholder.com/150',
          isInPodcast: true,
        },
        {
          id: '2',
          title: 'AI Developments in Healthcare',
          duration: '3:12',
          createdAt: '2023-05-14T14:45:00Z',
          imageUrl: 'https://via.placeholder.com/150',
          isInPodcast: true,
        },
        {
          id: '3',
          title: 'Sustainable Energy Solutions',
          duration: '4:05',
          createdAt: '2023-05-12T09:15:00Z',
          imageUrl: 'https://via.placeholder.com/150',
          isInPodcast: false,
        },
        {
          id: '4',
          title: 'The Future of Remote Work',
          duration: '5:18',
          createdAt: '2023-05-10T11:20:00Z',
          imageUrl: 'https://via.placeholder.com/150',
          isInPodcast: false,
        },
        {
          id: '5',
          title: 'Cybersecurity Best Practices',
          duration: '3:45',
          createdAt: '2023-05-08T16:30:00Z',
          imageUrl: 'https://via.placeholder.com/150',
          isInPodcast: false,
        },
      ];

      setAvailableAudio(mockAudioClips);
      setShowEpisodesModal(true);

    } catch (err) {
      setError('Failed to load audio clips');
    }
  };

  const handleToggleEpisode = async (audioId) => {
    try {
      // In a real implementation, we would call the API
      // await api.post(`/podcast/${selectedPodcast.id}/episodes/toggle`, { audioId });

      // Update state to toggle the episode
      setAvailableAudio(
        availableAudio.map((audio) =>
          audio.id === audioId
            ? { ...audio, isInPodcast: !audio.isInPodcast }
            : audio
        )
      );

      // Update episode count in the selected podcast
      const updatedCount = availableAudio.find(audio => audio.id === audioId).isInPodcast
        ? selectedPodcast.episodeCount - 1
        : selectedPodcast.episodeCount + 1;

      setSelectedPodcast({
        ...selectedPodcast,
        episodeCount: updatedCount,
      });

      // Update the podcast in the podcasts list
      setPodcasts(
        podcasts.map((podcast) =>
          podcast.id === selectedPodcast.id
            ? { ...podcast, episodeCount: updatedCount }
            : podcast
        )
      );

    } catch (err) {
      setError('Failed to update episode');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('podcast.yourPodcasts')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('podcast.managePodcastsDescription')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            className="btn-outline flex items-center"
            onClick={() => setShowAICreator(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            {t('ai.createWithAI')}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            {t('podcast.createManually')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Podcasts List */}
      {podcasts.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('podcast.noPodcasts')}
          </p>
          <div className="flex space-x-3 justify-center mt-4">
            <button
              className="btn-outline flex items-center"
              onClick={() => setShowAICreator(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              {t('ai.createWithAI')}
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              {t('podcast.createManually')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="card p-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.title}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="md:w-3/4">
                  <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {podcast.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Category:</span> {podcast.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Language:</span> {podcast.language}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Author:</span> {podcast.author}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Episodes:</span> {podcast.episodeCount}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(podcast.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Last Updated:</span>{' '}
                        {new Date(podcast.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn-primary"
                      onClick={() => handleOpenEpisodesModal(podcast)}
                    >
                      Manage Episodes
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        navigator.clipboard.writeText(podcast.rssUrl);
                        alert('RSS URL copied to clipboard!');
                      }}
                    >
                      Copy RSS URL
                    </button>
                    <a
                      href={podcast.rssUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      View RSS Feed
                    </a>
                    <button
                      className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDeletePodcast(podcast.id)}
                    >
                      Delete Podcast
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Podcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Podcast</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCreateModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreatePodcast}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="form-label">
                      Podcast Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="form-input"
                      value={newPodcast.title}
                      onChange={(e) =>
                        setNewPodcast({ ...newPodcast, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="form-label">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      className="form-input"
                      value={newPodcast.description}
                      onChange={(e) =>
                        setNewPodcast({
                          ...newPodcast,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      id="category"
                      className="form-input"
                      value={newPodcast.category}
                      onChange={(e) =>
                        setNewPodcast({
                          ...newPodcast,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Science">Science</option>
                      <option value="Health">Health & Fitness</option>
                      <option value="Arts">Arts</option>
                      <option value="News">News & Politics</option>
                      <option value="Society">Society & Culture</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="form-label">
                      Language
                    </label>
                    <select
                      id="language"
                      className="form-input"
                      value={newPodcast.language}
                      onChange={(e) =>
                        setNewPodcast({
                          ...newPodcast,
                          language: e.target.value,
                        })
                      }
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="author" className="form-label">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      id="author"
                      className="form-input"
                      value={newPodcast.author}
                      onChange={(e) =>
                        setNewPodcast({ ...newPodcast, author: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      value={newPodcast.email}
                      onChange={(e) =>
                        setNewPodcast({ ...newPodcast, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox mr-2"
                        checked={newPodcast.explicit}
                        onChange={(e) =>
                          setNewPodcast({
                            ...newPodcast,
                            explicit: e.target.checked,
                          })
                        }
                      />
                      Contains explicit content
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="image" className="form-label">
                      Podcast Artwork
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {newPodcast.imagePreview ? (
                          <img
                            src={newPodcast.imagePreview}
                            alt="Podcast artwork preview"
                            className="w-24 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="image"
                          className="btn-outline inline-block cursor-pointer"
                        >
                          Choose Image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 3000x3000px square JPG or PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Podcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Podcast Creator Modal */}
      {showAICreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('ai.createPodcastWithAI')}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAICreator(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <AIPodcastCreator
                selectedAudioClips={availableAudio.filter(audio => !audio.isInPodcast)}
                onComplete={(newPodcast) => {
                  // Add the new podcast to the list
                  setPodcasts([...podcasts, newPodcast]);
                  // Close the modal
                  setShowAICreator(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manage Episodes Modal */}
      {showEpisodesModal && selectedPodcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Manage Episodes - {selectedPodcast.title}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowEpisodesModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Select audio clips to include in your podcast. The order below will be the order in your podcast feed.
                </p>
              </div>

              <div className="space-y-4">
                {availableAudio.map((audio) => (
                  <div
                    key={audio.id}
                    className={`border rounded-lg p-4 ${
                      audio.isInPodcast
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={audio.imageUrl}
                          alt={audio.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{audio.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {audio.duration} • Created:{' '}
                          {new Date(audio.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <button
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            audio.isInPodcast
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                          onClick={() => handleToggleEpisode(audio.id)}
                        >
                          {audio.isInPodcast ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="btn-primary"
                  onClick={() => setShowEpisodesModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastPage;
