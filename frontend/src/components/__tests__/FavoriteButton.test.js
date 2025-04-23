import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import FavoriteButton from '../FavoriteButton';

// Mock the api service
jest.mock('../../services/api', () => ({
  get: jest.fn().mockImplementation((url) => {
    if (url.includes('/favorites/check')) {
      return Promise.resolve({ data: { isFavorited: false } });
    }
    return Promise.resolve({ data: {} });
  }),
  post: jest.fn().mockResolvedValue({ data: { _id: '1', item: '1', itemType: 'audio' } }),
  delete: jest.fn().mockResolvedValue({ data: { message: 'Favorite removed successfully' } })
}));

describe('FavoriteButton', () => {
  const mockItem = {
    _id: '1',
    title: 'Test Item'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render correctly when not favorited', async () => {
    render(
      <AuthProvider>
        <FavoriteButton item={mockItem} itemType="audio" />
      </AuthProvider>
    );
    
    // Wait for the component to check if the item is favorited
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    // Check that the button has the correct aria-label
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Add to favorites');
  });
  
  it('should add an item to favorites when clicked', async () => {
    const api = require('../../services/api');
    
    render(
      <AuthProvider>
        <FavoriteButton item={mockItem} itemType="audio" />
      </AuthProvider>
    );
    
    // Wait for the component to check if the item is favorited
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    // Click the button to add to favorites
    await act(async () => {
      userEvent.click(screen.getByRole('button'));
    });
    
    // Check that the API was called with the correct parameters
    expect(api.post).toHaveBeenCalledWith('/favorites', {
      item: mockItem._id,
      itemType: 'audio'
    });
    
    // Check that the button now shows as favorited
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove from favorites');
    });
  });
  
  it('should remove an item from favorites when clicked if already favorited', async () => {
    const api = require('../../services/api');
    
    // Mock the API to return that the item is favorited
    api.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: { isFavorited: true, favoriteId: '1' } });
    });
    
    render(
      <AuthProvider>
        <FavoriteButton item={mockItem} itemType="audio" />
      </AuthProvider>
    );
    
    // Wait for the component to check if the item is favorited
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove from favorites');
    });
    
    // Click the button to remove from favorites
    await act(async () => {
      userEvent.click(screen.getByRole('button'));
    });
    
    // Check that the API was called with the correct parameters
    expect(api.delete).toHaveBeenCalledWith('/favorites/1');
    
    // Check that the button now shows as not favorited
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Add to favorites');
    });
  });
  
  it('should show a disabled button when not authenticated', async () => {
    // Mock the auth context to return not authenticated
    jest.mock('../../contexts/AuthContext', () => ({
      ...jest.requireActual('../../contexts/AuthContext'),
      useAuth: () => ({
        isAuthenticated: false,
        loading: false
      })
    }));
    
    render(
      <AuthProvider>
        <FavoriteButton item={mockItem} itemType="audio" />
      </AuthProvider>
    );
    
    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    // Check that the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
