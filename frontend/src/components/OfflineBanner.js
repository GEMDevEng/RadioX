import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiWifi, FiWifiOff, FiX } from 'react-icons/fi';
import useOfflineStatus from '../hooks/useOfflineStatus';

const OfflineBanner = () => {
  const { t } = useTranslation();
  const {
    isOffline,
    isOfflineMode,
    isManualOfflineMode,
    formatOfflineDuration,
    enableOfflineMode,
    disableOfflineMode
  } = useOfflineStatus();

  if (!isOfflineMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white z-50 shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          {isOffline ? (
            <FiWifiOff className="mr-2" />
          ) : (
            <FiWifi className="mr-2" />
          )}
          <span className="text-sm font-medium">
            {isOffline
              ? t('offline.youAreOffline', { duration: formatOfflineDuration() })
              : t('offline.offlineModeEnabled')}
          </span>
        </div>

        <div className="flex items-center">
          {!isOffline && isManualOfflineMode && (
            <button
              onClick={disableOfflineMode}
              className="text-xs bg-white text-yellow-700 px-2 py-1 rounded mr-2 hover:bg-yellow-100"
            >
              {t('offline.goOnline')}
            </button>
          )}

          {!isOffline && !isManualOfflineMode && (
            <button
              onClick={enableOfflineMode}
              className="text-xs bg-white text-yellow-700 px-2 py-1 rounded mr-2 hover:bg-yellow-100"
            >
              {t('offline.stayInOfflineMode')}
            </button>
          )}

          {!isOffline && (
            <button
              onClick={disableOfflineMode}
              className="text-white hover:text-yellow-200"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
