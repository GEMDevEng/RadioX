import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import TrendingHashtags from '../components/TrendingHashtags';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('hashtag'); // hashtag, user, or url
  const [filters, setFilters] = useState({
    textOnly: false,
    minLikes: 0,
    maxResults: 10,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // In a real implementation, we would call the API
      // const { data } = await api.get('/search/posts', {
      //   params: {
      //     term: searchTerm,
      //     type: searchType,
      //     textOnly: filters.textOnly,
      //     minLikes: filters.minLikes,
      //     maxResults: filters.maxResults,
      //   },
      // });
      // setSearchResults(data);

      // Mock data for demonstration
      setTimeout(() => {
        const mockResults = [
          {
            id: '1',
            text: 'Just published a new article on #AI and its implications for the future of work. Check it out at example.com/ai-future-work',
            user: {
              username: 'techguru',
              name: 'Tech Guru',
              profileImageUrl: 'https://via.placeholder.com/50',
            },
            likes: 245,
            reposts: 89,
            createdAt: '2023-05-14T10:30:00Z',
          },
          {
            id: '2',
            text: 'The latest developments in #AI are truly mind-blowing. Neural networks are now capable of generating realistic images from text descriptions.',
            user: {
              username: 'airesearcher',
              name: 'AI Researcher',
              profileImageUrl: 'https://via.placeholder.com/50',
            },
            likes: 178,
            reposts: 42,
            createdAt: '2023-05-13T15:45:00Z',
          },
          {
            id: '3',
            text: 'Thread: 1/5 Let\'s talk about #AI ethics. As AI systems become more powerful, we need to ensure they align with human values and priorities.',
            user: {
              username: 'ethicist',
              name: 'Tech Ethicist',
              profileImageUrl: 'https://via.placeholder.com/50',
            },
            likes: 312,
            reposts: 156,
            createdAt: '2023-05-12T09:15:00Z',
            isThread: true,
          },
          {
            id: '4',
            text: 'Just attended an amazing conference on #AI and machine learning. So many brilliant minds working on solving complex problems!',
            user: {
              username: 'devadvocate',
              name: 'Developer Advocate',
              profileImageUrl: 'https://via.placeholder.com/50',
            },
            likes: 98,
            reposts: 23,
            createdAt: '2023-05-11T14:20:00Z',
          },
          {
            id: '5',
            text: '#AI tools for content creation are getting better every day. I\'ve been experimenting with several for my podcast production workflow.',
            user: {
              username: 'contentcreator',
              name: 'Content Creator',
              profileImageUrl: 'https://via.placeholder.com/50',
            },
            likes: 156,
            reposts: 34,
            createdAt: '2023-05-10T11:05:00Z',
          },
        ];

        setSearchResults(mockResults);
        setSearched(true);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to search posts. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts((prevSelected) => {
      if (prevSelected.includes(postId)) {
        return prevSelected.filter((id) => id !== postId);
      } else {
        return [...prevSelected, postId];
      }
    });
  };

  const handleConvertSelected = () => {
    if (selectedPosts.length === 0) {
      setError('Please select at least one post to convert');
      return;
    }

    // In a real implementation, we would navigate to a conversion page
    // or open a modal with conversion options
    alert(`Converting posts: ${selectedPosts.join(', ')}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search X Posts</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find posts to convert to audio using hashtags, usernames, or direct URLs
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Form */}
      <div className="card p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-3">
              <label htmlFor="searchTerm" className="form-label">
                Search Term
              </label>
              <div className="flex">
                <div className="relative flex-grow">
                  {searchType === 'hashtag' && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">#</span>
                    </div>
                  )}
                  {searchType === 'user' && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">@</span>
                    </div>
                  )}
                  <input
                    type="text"
                    id="searchTerm"
                    className={`form-input ${
                      searchType !== 'url' ? 'pl-7' : ''
                    }`}
                    placeholder={
                      searchType === 'hashtag'
                        ? 'Enter hashtag (without #)'
                        : searchType === 'user'
                        ? 'Enter username (without @)'
                        : 'Enter post URL'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary ml-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="searchType" className="form-label">
                Search Type
              </label>
              <select
                id="searchType"
                className="form-input"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="hashtag">Hashtag</option>
                <option value="user">User</option>
                <option value="url">Direct URL</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={filters.textOnly}
                    onChange={(e) =>
                      setFilters({ ...filters, textOnly: e.target.checked })
                    }
                  />
                  <span className="ml-2">Text-only posts</span>
                </label>
              </div>

              <div>
                <label htmlFor="minLikes" className="form-label">
                  Minimum Likes
                </label>
                <input
                  type="number"
                  id="minLikes"
                  className="form-input"
                  min="0"
                  value={filters.minLikes}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minLikes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label htmlFor="maxResults" className="form-label">
                  Max Results
                </label>
                <select
                  id="maxResults"
                  className="form-input"
                  value={filters.maxResults}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxResults: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Trending Hashtags */}
      {!searched && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('trending.title')}</h2>
          <TrendingHashtags limit={10} />
        </div>
      )}

      {/* Search Results */}
      {searched && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Search Results ({searchResults.length})
            </h2>
            {selectedPosts.length > 0 && (
              <button
                className="btn-primary"
                onClick={handleConvertSelected}
              >
                Convert Selected ({selectedPosts.length})
              </button>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No posts found matching your search criteria.
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Try adjusting your search term or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((post) => (
                <div
                  key={post.id}
                  className={`card p-4 transition-shadow ${
                    selectedPosts.includes(post.id)
                      ? 'ring-2 ring-primary-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <img
                        src={post.user.profileImageUrl}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{post.user.name}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            @{post.user.username}
                          </p>
                        </div>
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox text-primary-600"
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => handleSelectPost(post.id)}
                            />
                            <span className="ml-2 text-sm">Select</span>
                          </label>
                        </div>
                      </div>
                      <p className="mt-2">{post.text}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-4">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="mr-4 flex items-center">
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
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {post.likes}
                        </span>
                        <span className="flex items-center">
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
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                          {post.reposts}
                        </span>
                      </div>
                      {post.isThread && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Thread
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      className="text-primary-600 hover:text-primary-500 text-sm flex items-center mr-3"
                      onClick={() => handleSelectPost(post.id)}
                    >
                      {selectedPosts.includes(post.id) ? (
                        <>
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Deselect
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Select
                        </>
                      )}
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-500 text-sm flex items-center"
                      onClick={() => {
                        setSelectedPosts([post.id]);
                        handleConvertSelected();
                      }}
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
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      Convert to Audio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
