import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversionStatus, setConversionStatus] = useState({});
  const [podcastStatus, setPodcastStatus] = useState({});
  const [connected, setConnected] = useState(false);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    let socketInstance = null;

    if (currentUser && currentUser.token) {
      // Create socket connection
      socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: currentUser.token,
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setConnected(false);
      });

      socketInstance.on('notification', (notification) => {
        console.log('Received notification:', notification);
        
        // Show toast notification
        switch (notification.type) {
          case 'success':
            toast.success(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'warning':
            toast.warning(notification.message);
            break;
          default:
            toast.info(notification.message);
        }
      });

      socketInstance.on('conversionStatus', (status) => {
        console.log('Received conversion status:', status);
        
        // Update conversion status state
        setConversionStatus((prev) => ({
          ...prev,
          [status.audioClipId]: status,
        }));
        
        // Show toast notification
        switch (status.status) {
          case 'processing':
            toast.info(`Converting audio: ${status.data.sourceType}`);
            break;
          case 'completed':
            toast.success(`Audio conversion complete: ${status.data.title}`);
            break;
          case 'failed':
            toast.error(`Audio conversion failed: ${status.data.error}`);
            break;
          default:
            break;
        }
      });

      socketInstance.on('podcastStatus', (status) => {
        console.log('Received podcast status:', status);
        
        // Update podcast status state
        setPodcastStatus((prev) => ({
          ...prev,
          [status.podcastId]: status,
        }));
        
        // Show toast notification
        switch (status.status) {
          case 'processing':
            toast.info(`Processing podcast: ${status.data.title}`);
            break;
          case 'completed':
            toast.success(`Podcast processing complete: ${status.data.title}`);
            break;
          case 'failed':
            toast.error(`Podcast processing failed: ${status.data.error}`);
            break;
          default:
            break;
        }
      });

      // Save socket instance
      setSocket(socketInstance);
    }

    // Cleanup on unmount or when user changes
    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket');
        socketInstance.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, [currentUser]);

  // Clear status when user logs out
  useEffect(() => {
    if (!currentUser) {
      setConversionStatus({});
      setPodcastStatus({});
    }
  }, [currentUser]);

  // Value to be provided to consumers
  const value = {
    socket,
    connected,
    conversionStatus,
    podcastStatus,
    // Helper functions
    getConversionStatus: (audioClipId) => conversionStatus[audioClipId] || null,
    getPodcastStatus: (podcastId) => podcastStatus[podcastId] || null,
    clearConversionStatus: (audioClipId) => {
      setConversionStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[audioClipId];
        return newStatus;
      });
    },
    clearPodcastStatus: (podcastId) => {
      setPodcastStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[podcastId];
        return newStatus;
      });
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
