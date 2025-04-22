import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ExportOptions from '../components/ExportOptions';

const AudioLibraryPage = () => {
  const { t } = useTranslation();
  const [audioClips, setAudioClips] = useState([]);
  const [filteredClips, setFilteredClips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const clipsPerPage = 9;

  useEffect(() => {
    const fetchAudioClips = async () => {
      try {
        setLoading(true);

        // In a real implementation, we would fetch from the API
        // const { data } = await api.get('/audio/clips');
        // setAudioClips(data);

        // Mock data for demonstration
        setTimeout(() => {
          const mockClips = [
            {
              id: '1',
              title: 'Latest Tech Trends 2023',
              description: 'A discussion about emerging technologies in 2023',
              duration: '2:34',
              createdAt: '2023-05-15T10:30:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio1.mp3',
              sourceUrl: 'https://x.com/techguru/status/123456789',
              user: {
                username: 'techguru',
                name: 'Tech Guru',
              },
            },
            {
              id: '2',
              title: 'AI Developments in Healthcare',
              description: 'How AI is transforming the healthcare industry',
              duration: '3:12',
              createdAt: '2023-05-14T14:45:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio2.mp3',
              sourceUrl: 'https://x.com/airesearcher/status/123456790',
              user: {
                username: 'airesearcher',
                name: 'AI Researcher',
              },
            },
            {
              id: '3',
              title: 'Sustainable Energy Solutions',
              description: 'Exploring renewable energy technologies',
              duration: '4:05',
              createdAt: '2023-05-12T09:15:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio3.mp3',
              sourceUrl: 'https://x.com/energyexpert/status/123456791',
              user: {
                username: 'energyexpert',
                name: 'Energy Expert',
              },
            },
            {
              id: '4',
              title: 'The Future of Remote Work',
              description: 'Trends and predictions for remote work',
              duration: '5:18',
              createdAt: '2023-05-10T11:20:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio4.mp3',
              sourceUrl: 'https://x.com/workfuturist/status/123456792',
              user: {
                username: 'workfuturist',
                name: 'Work Futurist',
              },
            },
            {
              id: '5',
              title: 'Cybersecurity Best Practices',
              description: 'Essential security tips for individuals and businesses',
              duration: '3:45',
              createdAt: '2023-05-08T16:30:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio5.mp3',
              sourceUrl: 'https://x.com/securityexpert/status/123456793',
              user: {
                username: 'securityexpert',
                name: 'Security Expert',
              },
            },
            {
              id: '6',
              title: 'Digital Marketing Strategies',
              description: 'Effective marketing approaches for the digital age',
              duration: '4:22',
              createdAt: '2023-05-06T13:10:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio6.mp3',
              sourceUrl: 'https://x.com/marketingguru/status/123456794',
              user: {
                username: 'marketingguru',
                name: 'Marketing Guru',
              },
            },
            {
              id: '7',
              title: 'Blockchain Applications',
              description: 'Real-world use cases for blockchain technology',
              duration: '6:15',
              createdAt: '2023-05-04T09:45:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio7.mp3',
              sourceUrl: 'https://x.com/cryptoexpert/status/123456795',
              user: {
                username: 'cryptoexpert',
                name: 'Crypto Expert',
              },
            },
            {
              id: '8',
              title: 'Mental Health in the Digital Age',
              description: 'Maintaining wellbeing in a connected world',
              duration: '5:30',
              createdAt: '2023-05-02T15:20:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio8.mp3',
              sourceUrl: 'https://x.com/wellnesscoach/status/123456796',
              user: {
                username: 'wellnesscoach',
                name: 'Wellness Coach',
              },
            },
            {
              id: '9',
              title: 'Future of Transportation',
              description: 'Innovations in mobility and transportation',
              duration: '4:48',
              createdAt: '2023-04-30T10:15:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio9.mp3',
              sourceUrl: 'https://x.com/futurist/status/123456797',
              user: {
                username: 'futurist',
                name: 'Futurist',
              },
            },
            {
              id: '10',
              title: 'Space Exploration Updates',
              description: 'Recent developments in space technology and missions',
              duration: '7:12',
              createdAt: '2023-04-28T14:30:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio10.mp3',
              sourceUrl: 'https://x.com/spacenthusiast/status/123456798',
              user: {
                username: 'spacenthusiast',
                name: 'Space Enthusiast',
              },
            },
            {
              id: '11',
              title: 'Nutrition Science Myths',
              description: 'Debunking common misconceptions about nutrition',
              duration: '5:55',
              createdAt: '2023-04-26T11:40:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio11.mp3',
              sourceUrl: 'https://x.com/nutritionist/status/123456799',
              user: {
                username: 'nutritionist',
                name: 'Nutritionist',
              },
            },
            {
              id: '12',
              title: 'Financial Independence Tips',
              description: 'Strategies for achieving financial freedom',
              duration: '6:30',
              createdAt: '2023-04-24T09:20:00Z',
              imageUrl: 'https://via.placeholder.com/300',
              audioUrl: 'https://example.com/audio12.mp3',
              sourceUrl: 'https://x.com/financialadvisor/status/123456800',
              user: {
                username: 'financialadvisor',
                name: 'Financial Advisor',
              },
            },
          ];

          setAudioClips(mockClips);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Failed to load audio clips');
        setLoading(false);
      }
    };

    fetchAudioClips();
  }, []);

  // Filter and sort clips when dependencies change
  useEffect(() => {
    let result = [...audioClips];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (clip) =>
          clip.title.toLowerCase().includes(lowerCaseSearch) ||
          clip.description.toLowerCase().includes(lowerCaseSearch) ||
          clip.user.name.toLowerCase().includes(lowerCaseSearch) ||
          clip.user.username.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'longest':
        result.sort((a, b) => {
          const aMinutes = parseInt(a.duration.split(':')[0]);
          const aSeconds = parseInt(a.duration.split(':')[1]);
          const bMinutes = parseInt(b.duration.split(':')[0]);
          const bSeconds = parseInt(b.duration.split(':')[1]);

          return bMinutes * 60 + bSeconds - (aMinutes * 60 + aSeconds);
        });
        break;
      case 'shortest':
        result.sort((a, b) => {
          const aMinutes = parseInt(a.duration.split(':')[0]);
          const aSeconds = parseInt(a.duration.split(':')[1]);
          const bMinutes = parseInt(b.duration.split(':')[0]);
          const bSeconds = parseInt(b.duration.split(':')[1]);

          return aMinutes * 60 + aSeconds - (bMinutes * 60 + bSeconds);
        });
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredClips(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [audioClips, searchTerm, sortBy]);

  // Get current clips for pagination
  const indexOfLastClip = currentPage * clipsPerPage;
  const indexOfFirstClip = indexOfLastClip - clipsPerPage;
  const currentClips = filteredClips.slice(indexOfFirstClip, indexOfLastClip);
  const totalPages = Math.ceil(filteredClips.length / clipsPerPage);

  const handlePlayAudio = (clipId) => {
    setCurrentlyPlaying(currentlyPlaying === clipId ? null : clipId);
    // In a real implementation, we would play the audio file
  };

  const handleDeleteClip = async (clipId) => {
    if (window.confirm('Are you sure you want to delete this audio clip?')) {
      try {
        // In a real implementation, we would call the API
        // await api.delete(`/audio/clips/${clipId}`);

        // Update state to remove the deleted clip
        setAudioClips(audioClips.filter((clip) => clip.id !== clipId));
      } catch (err) {
        setError('Failed to delete audio clip');
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('library.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('library.description')}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="form-input pl-10"
                placeholder="Search by title, description, or creator"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <label htmlFor="sortBy" className="sr-only">
              Sort by
            </label>
            <select
              id="sortBy"
              name="sortBy"
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="longest">Longest First</option>
              <option value="shortest">Shortest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audio Clips Grid */}
      {filteredClips.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No audio clips found.
          </p>
          {searchTerm && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search term.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentClips.map((clip) => (
            <div key={clip.id} className="card overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                <img
                  src={clip.imageUrl}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {clip.duration}
                </div>
                <button
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                  onClick={() => handlePlayAudio(clip.id)}
                >
                  <div className="rounded-full bg-white p-3">
                    {currentlyPlaying === clip.id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary-600"
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
                    )}
                  </div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{clip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {clip.description}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    @{clip.user.username}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(clip.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="mb-3">
                    <ExportOptions item={clip} type="audio" />
                  </div>
                  <div className="flex justify-between">
                    <a
                      href={clip.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {t('common.viewSource')}
                    </a>
                    <button
                      className="text-red-600 hover:text-red-500 text-sm flex items-center"
                      onClick={() => handleDeleteClip(clip.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AudioLibraryPage;
