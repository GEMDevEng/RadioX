import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw } from 'react-icons/fi';

const UpdateNotification = () => {
  const { t } = useTranslation();
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showReload, setShowReload] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Skip if service worker is not supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Handle new service worker waiting
    const onServiceWorkerUpdate = (registration) => {
      setWaitingWorker(registration.waiting);
      setShowReload(true);
    };

    // Register event listener for new service worker updates
    const onServiceWorkerSuccess = (registration) => {
      console.log('Service Worker registered successfully');
    };

    // Set up event listeners for service worker updates
    window.addEventListener('sw-waiting', (event) => {
      onServiceWorkerUpdate(event.detail);
    });

    // Check if there's already a waiting service worker
    if (window.navigator.serviceWorker.controller) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          onServiceWorkerUpdate(registration);
        }
      });
    }

    return () => {
      window.removeEventListener('sw-waiting', onServiceWorkerUpdate);
    };
  }, []);

  // Update the app by telling the service worker to skip waiting
  const updateServiceWorker = () => {
    if (!waitingWorker) {
      return;
    }

    setIsUpdating(true);

    // Send skip-waiting message to the waiting service worker
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to activate the new service worker
    waitingWorker.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        window.location.reload();
      }
    });

    // Fallback: reload after 3 seconds if the statechange event doesn't fire
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  if (!showReload) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-indigo-600 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiRefreshCw className="h-6 w-6 text-indigo-300" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {t('updates.newVersionAvailable')}
          </p>
          <div className="mt-2 flex">
            <button
              onClick={updateServiceWorker}
              disabled={isUpdating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600"
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
                  {t('updates.updating')}
                </>
              ) : (
                t('updates.updateNow')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
