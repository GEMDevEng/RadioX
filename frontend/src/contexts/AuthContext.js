import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Set auth token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setCurrentUser(data);
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('token');
      api.defaults.headers.common['Authorization'] = '';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      
      // Save token to local storage
      localStorage.setItem('token', data.token);
      
      // Set auth token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user data
      setCurrentUser({
        userId: data.userId,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'An error occurred during registration'
      );
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Save token to local storage
      localStorage.setItem('token', data.token);
      
      // Set auth token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user data
      setCurrentUser({
        userId: data.userId,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Invalid email or password'
      );
      throw error;
    }
  };

  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove auth token from axios headers
    api.defaults.headers.common['Authorization'] = '';
    
    // Clear user data
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await api.put('/auth/profile', userData);
      
      // Update user data
      setCurrentUser(prevUser => ({
        ...prevUser,
        name: data.name,
        email: data.email,
        settings: data.settings,
      }));
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'An error occurred while updating profile'
      );
      throw error;
    }
  };

  const connectXAccount = async (username, tokenData) => {
    try {
      const { data } = await api.post('/auth/connect-x', {
        username,
        tokenData,
      });
      
      // Update user data
      setCurrentUser(prevUser => ({
        ...prevUser,
        xApiConnection: data.xApiConnection,
      }));
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'An error occurred while connecting X account'
      );
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    connectXAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
