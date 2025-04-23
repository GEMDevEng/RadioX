import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Create context
const FeatureFlagContext = createContext();

// Feature flag provider
export const FeatureFlagProvider = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  // Fetch feature flags when authenticated
  useEffect(() => {
    const fetchFeatureFlags = async () => {
      if (!isAuthenticated) {
        setFeatureFlags({});
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data } = await api.get('/api/feature-flags');
        setFeatureFlags(data);
      } catch (error) {
        console.error('Error fetching feature flags:', error);
        setFeatureFlags({});
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatureFlags();
  }, [isAuthenticated]);
  
  // Check if a feature is enabled
  const isFeatureEnabled = (featureName) => {
    return !!featureFlags[featureName];
  };
  
  // Feature flag component
  const FeatureFlag = ({ name, fallback = null, children }) => {
    if (isFeatureEnabled(name)) {
      return children;
    }
    
    return fallback;
  };
  
  return (
    <FeatureFlagContext.Provider
      value={{
        featureFlags,
        loading,
        isFeatureEnabled,
        FeatureFlag
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hook to use feature flags
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  
  return context;
};

export default FeatureFlagContext;
