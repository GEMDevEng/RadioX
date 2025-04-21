import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginPage from '../LoginPage';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: () => ({
      login: jest.fn().mockImplementation((email, password) => {
        if (email === 'test@example.com' && password === 'password123') {
          return Promise.resolve();
        } else {
          return Promise.reject({ response: { data: { message: 'Invalid credentials' } } });
        }
      }),
    }),
  };
});

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check if form elements are rendered
    expect(screen.getByText('Sign In to RadioX')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('handles form submission correctly with valid credentials', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in the form
    userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/Password/i), 'password123');

    // Submit the form
    userEvent.click(screen.getByText('Sign In'));

    // Check if loading state is shown
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    // Wait for form submission to complete
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });

    // No error message should be displayed
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  it('handles form submission correctly with invalid credentials', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in the form with invalid credentials
    userEvent.type(screen.getByLabelText(/Email Address/i), 'wrong@example.com');
    userEvent.type(screen.getByLabelText(/Password/i), 'wrongpassword');

    // Submit the form
    userEvent.click(screen.getByText('Sign In'));

    // Wait for form submission to complete
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });

    // Error message should be displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Submit the form without filling in any fields
    userEvent.click(screen.getByText('Sign In'));

    // Check if validation messages are displayed
    expect(screen.getByLabelText(/Email Address/i)).toBeInvalid();
    expect(screen.getByLabelText(/Password/i)).toBeInvalid();
  });

  it('navigates to forgot password page when link is clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click the forgot password link
    userEvent.click(screen.getByText('Forgot password?'));

    // Check if the URL has changed
    expect(window.location.pathname).toBe('/forgot-password');
  });

  it('navigates to register page when link is clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click the sign up link
    userEvent.click(screen.getByText('Sign up'));

    // Check if the URL has changed
    expect(window.location.pathname).toBe('/register');
  });
});
