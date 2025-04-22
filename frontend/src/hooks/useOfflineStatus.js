import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is offline
 * @returns {Object} Object containing offline status and related functions
 */
export default function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(
    navigator.onLine ? new Date() : null
  );
  const [offlineDuration, setOfflineDuration] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);

  // Update offline status when online/offline events fire
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate offline duration
  useEffect(() => {
    let interval;

    if (isOffline && lastOnlineTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now - lastOnlineTime) / 1000); // in seconds
        setOfflineDuration(duration);
      }, 1000);
    } else {
      setOfflineDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOffline, lastOnlineTime]);

  // Format offline duration for display
  const formatOfflineDuration = () => {
    if (offlineDuration < 60) {
      return `${offlineDuration} seconds`;
    } else if (offlineDuration < 3600) {
      const minutes = Math.floor(offlineDuration / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(offlineDuration / 3600);
      const minutes = Math.floor((offlineDuration % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  // Enable offline mode manually
  const enableOfflineMode = () => {
    setOfflineMode(true);
  };

  // Disable offline mode manually
  const disableOfflineMode = () => {
    if (navigator.onLine) {
      setOfflineMode(false);
    }
  };

  return {
    isOffline,
    offlineDuration,
    formatOfflineDuration,
    lastOnlineTime,
    // If either the network is offline or user has enabled offline mode
    isOfflineMode: isOffline || offlineMode,
    enableOfflineMode,
    disableOfflineMode,
    // Whether offline mode was manually enabled
    isManualOfflineMode: offlineMode,
  };
}
