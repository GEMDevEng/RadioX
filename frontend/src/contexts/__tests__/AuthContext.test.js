import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

// Mock the API module
jest.mock('../../services/api', () => ({
  defaults: { headers: { common: {} } },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { currentUser, loading, login, logout, register } = useAuth();

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {currentUser ? (
            <>
              <p>Logged in as: {currentUser.name}</p>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <p>Not logged in</p>
              <button onClick={() => login('test@example.com', 'password123')}>
                Login
              </button>
              <button onClick={() => register('Test User', 'test@example.com', 'password123')}>
                Register
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
  });

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show not logged in state when no token is found', async () => {
    // Mock API call to return null (no user found)
    api.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should login user successfully', async () => {
    // Mock API call to return user data
    api.post.mockResolvedValue({
      data: {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click login button
    userEvent.click(screen.getByText('Login'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });

    // Check if API was called with correct parameters
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    // Check if token was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');

    // Check if token was set in API headers
    expect(api.defaults.headers.common['Authorization']).toBe('Bearer test-token');
  });

  it('should register user successfully', async () => {
    // Mock API call to return user data
    api.post.mockResolvedValue({
      data: {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        token: 'test-token',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click register button
    userEvent.click(screen.getByText('Register'));

    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });

    // Check if API was called with correct parameters
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    // Check if token was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');

    // Check if token was set in API headers
    expect(api.defaults.headers.common['Authorization']).toBe('Bearer test-token');
  });

  it('should logout user successfully', async () => {
    // Mock initial state with logged in user
    localStorage.getItem.mockReturnValue('test-token');
    api.get.mockResolvedValue({
      data: {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish and user to be logged in
    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });

    // Click logout button
    userEvent.click(screen.getByText('Logout'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });

    // Check if token was removed from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');

    // Check if token was removed from API headers
    expect(api.defaults.headers.common['Authorization']).toBe('');
  });
});
