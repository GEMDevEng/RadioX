import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import DashboardPage from '../DashboardPage';
import api from '../../services/api';

// Mock the API module
jest.mock('../../services/api', () => ({
  get: jest.fn(),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: () => ({
      currentUser: {
        name: 'Test User',
        email: 'test@example.com',
        xApiConnection: {
          connected: true,
          username: 'testuser',
        },
      },
      loading: false,
    }),
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/usage/stats') {
        return Promise.resolve({
          data: {
            audioClips: 10,
            podcasts: 2,
            apiUsage: {
              postsUsed: 50,
              postsLimit: 500,
              postsPercentage: 10,
              readRequestsUsed: 25,
              readRequestsLimit: 100,
              readRequestsPercentage: 25,
              audioClipsCreated: 10,
              totalAudioDuration: 1200,
              totalStorageUsed: 24000000,
            },
            month: 5,
            year: 2023,
          },
        });
      } else if (url === '/audio/clips') {
        return Promise.resolve({
          data: {
            audioClips: [
              {
                _id: '1',
                title: 'Recent Audio Clip 1',
                duration: 120,
                createdAt: new Date().toISOString(),
                sourceType: 'post',
                playCount: 5,
              },
              {
                _id: '2',
                title: 'Recent Audio Clip 2',
                duration: 180,
                createdAt: new Date().toISOString(),
                sourceType: 'thread',
                playCount: 10,
              },
            ],
            pagination: {
              page: 1,
              limit: 5,
              total: 2,
              pages: 1,
            },
          },
        });
      }
      
      return Promise.resolve({ data: {} });
    });
  });

  it('renders dashboard page correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check if loading state is shown initially
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Check if welcome message is displayed
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();

    // Check if usage statistics are displayed
    expect(screen.getByText('10')).toBeInTheDocument(); // Audio clips count
    expect(screen.getByText('2')).toBeInTheDocument(); // Podcasts count
    
    // Check if API usage is displayed
    expect(screen.getByText('50 / 500')).toBeInTheDocument(); // Posts usage
    expect(screen.getByText('25 / 100')).toBeInTheDocument(); // Read requests usage
    
    // Check if recent audio clips are displayed
    expect(screen.getByText('Recent Audio Clip 1')).toBeInTheDocument();
    expect(screen.getByText('Recent Audio Clip 2')).toBeInTheDocument();
    
    // Check if quick actions are displayed
    expect(screen.getByText('Search X Posts')).toBeInTheDocument();
    expect(screen.getByText('Create Audio Clip')).toBeInTheDocument();
    expect(screen.getByText('Manage Podcasts')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API to return an error
    api.get.mockRejectedValue(new Error('Failed to fetch data'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Check if error message is displayed
    expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
  });

  it('navigates to correct pages when quick action buttons are clicked', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Click on "Search X Posts" button
    userEvent.click(screen.getByText('Search X Posts'));
    expect(navigateMock).toHaveBeenCalledWith('/search');

    // Click on "Create Audio Clip" button
    userEvent.click(screen.getByText('Create Audio Clip'));
    expect(navigateMock).toHaveBeenCalledWith('/create');

    // Click on "Manage Podcasts" button
    userEvent.click(screen.getByText('Manage Podcasts'));
    expect(navigateMock).toHaveBeenCalledWith('/podcasts');
  });

  it('formats duration correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Check if durations are formatted correctly
    expect(screen.getByText('2:00')).toBeInTheDocument(); // 120 seconds = 2:00
    expect(screen.getByText('3:00')).toBeInTheDocument(); // 180 seconds = 3:00
  });

  it('displays source type icons correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    // Check if source type icons are displayed
    const postIcons = screen.getAllByTitle('Post');
    const threadIcons = screen.getAllByTitle('Thread');
    
    expect(postIcons.length).toBeGreaterThan(0);
    expect(threadIcons.length).toBeGreaterThan(0);
  });
});
