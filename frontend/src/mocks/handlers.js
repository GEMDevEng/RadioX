import { rest } from 'msw';

// Mock user data
const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

// Mock audio clips
const mockAudioClips = [
  {
    _id: '1',
    title: 'Test Audio Clip 1',
    description: 'This is a test audio clip',
    audioUrl: 'https://example.com/test-audio-1.mp3',
    duration: 120,
    sourceUrl: 'https://x.com/test/status/123456789',
    createdAt: '2023-01-01T00:00:00.000Z',
    user: {
      _id: '1',
      name: 'Test User',
      username: 'testuser'
    }
  },
  {
    _id: '2',
    title: 'Test Audio Clip 2',
    description: 'This is another test audio clip',
    audioUrl: 'https://example.com/test-audio-2.mp3',
    duration: 180,
    sourceUrl: 'https://x.com/test/status/987654321',
    createdAt: '2023-01-02T00:00:00.000Z',
    user: {
      _id: '1',
      name: 'Test User',
      username: 'testuser'
    }
  }
];

// Mock podcasts
const mockPodcasts = [
  {
    _id: '1',
    title: 'Test Podcast 1',
    description: 'This is a test podcast',
    audioUrl: 'https://example.com/test-podcast-1.mp3',
    duration: 1800,
    coverImage: 'https://example.com/test-cover-1.jpg',
    createdAt: '2023-01-01T00:00:00.000Z',
    user: {
      _id: '1',
      name: 'Test User',
      username: 'testuser'
    }
  },
  {
    _id: '2',
    title: 'Test Podcast 2',
    description: 'This is another test podcast',
    audioUrl: 'https://example.com/test-podcast-2.mp3',
    duration: 2400,
    coverImage: 'https://example.com/test-cover-2.jpg',
    createdAt: '2023-01-02T00:00:00.000Z',
    user: {
      _id: '1',
      name: 'Test User',
      username: 'testuser'
    }
  }
];

// Mock favorites
const mockFavorites = [
  {
    _id: '1',
    item: mockAudioClips[0],
    itemType: 'audio',
    createdAt: '2023-01-03T00:00:00.000Z'
  },
  {
    _id: '2',
    item: mockPodcasts[0],
    itemType: 'podcast',
    createdAt: '2023-01-04T00:00:00.000Z'
  }
];

// Mock trending hashtags
const mockTrendingHashtags = [
  {
    _id: '1',
    tag: 'technology',
    count: 100,
    period: 'daily'
  },
  {
    _id: '2',
    tag: 'ai',
    count: 80,
    period: 'daily'
  },
  {
    _id: '3',
    tag: 'programming',
    count: 60,
    period: 'daily'
  }
];

// Define handlers
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-token',
          user: mockUser
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        message: 'Invalid credentials'
      })
    );
  }),
  
  rest.post('/api/auth/register', (req, res, ctx) => {
    const { email } = req.body;
    
    if (email === 'test@example.com') {
      return res(
        ctx.status(400),
        ctx.json({
          message: 'User already exists'
        })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        token: 'mock-token',
        user: {
          ...mockUser,
          email: req.body.email,
          name: req.body.name
        }
      })
    );
  }),
  
  rest.get('/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'Not authenticated'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(mockUser)
    );
  }),
  
  // Audio clips endpoints
  rest.get('/api/audio/clips', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockAudioClips)
    );
  }),
  
  rest.get('/api/audio/clips/:id', (req, res, ctx) => {
    const { id } = req.params;
    const audioClip = mockAudioClips.find(clip => clip._id === id);
    
    if (!audioClip) {
      return res(
        ctx.status(404),
        ctx.json({
          message: 'Audio clip not found'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(audioClip)
    );
  }),
  
  // Podcast endpoints
  rest.get('/api/podcast', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockPodcasts)
    );
  }),
  
  rest.get('/api/podcast/:id', (req, res, ctx) => {
    const { id } = req.params;
    const podcast = mockPodcasts.find(p => p._id === id);
    
    if (!podcast) {
      return res(
        ctx.status(404),
        ctx.json({
          message: 'Podcast not found'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(podcast)
    );
  }),
  
  // Favorites endpoints
  rest.get('/api/favorites', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'Not authenticated'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(mockFavorites)
    );
  }),
  
  rest.post('/api/favorites', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'Not authenticated'
        })
      );
    }
    
    const { item, itemType } = req.body;
    
    // Check if already favorited
    const existingFavorite = mockFavorites.find(
      f => f.item._id === item && f.itemType === itemType
    );
    
    if (existingFavorite) {
      return res(
        ctx.status(400),
        ctx.json({
          message: 'Item already favorited'
        })
      );
    }
    
    // Create new favorite
    const newFavorite = {
      _id: String(mockFavorites.length + 1),
      item: itemType === 'audio'
        ? mockAudioClips.find(clip => clip._id === item)
        : mockPodcasts.find(p => p._id === item),
      itemType,
      createdAt: new Date().toISOString()
    };
    
    mockFavorites.push(newFavorite);
    
    return res(
      ctx.status(201),
      ctx.json(newFavorite)
    );
  }),
  
  rest.delete('/api/favorites/:id', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          message: 'Not authenticated'
        })
      );
    }
    
    const { id } = req.params;
    const favoriteIndex = mockFavorites.findIndex(f => f._id === id);
    
    if (favoriteIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          message: 'Favorite not found'
        })
      );
    }
    
    mockFavorites.splice(favoriteIndex, 1);
    
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Favorite removed successfully'
      })
    );
  }),
  
  // Trending endpoints
  rest.get('/api/trending', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || 'daily';
    
    const filteredHashtags = mockTrendingHashtags.filter(
      tag => tag.period === period
    );
    
    return res(
      ctx.status(200),
      ctx.json(filteredHashtags)
    );
  }),
  
  // Search endpoints
  rest.get('/api/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q') || '';
    
    if (!query) {
      return res(
        ctx.status(200),
        ctx.json({
          audio: [],
          podcasts: []
        })
      );
    }
    
    const filteredAudio = mockAudioClips.filter(
      clip => clip.title.toLowerCase().includes(query.toLowerCase()) ||
              clip.description.toLowerCase().includes(query.toLowerCase())
    );
    
    const filteredPodcasts = mockPodcasts.filter(
      podcast => podcast.title.toLowerCase().includes(query.toLowerCase()) ||
                 podcast.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return res(
      ctx.status(200),
      ctx.json({
        audio: filteredAudio,
        podcasts: filteredPodcasts
      })
    );
  })
];
