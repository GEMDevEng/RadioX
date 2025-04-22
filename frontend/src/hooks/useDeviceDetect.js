import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @returns {Object} Object containing isMobile flag and device type
 */
export default function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [orientation, setOrientation] = useState('landscape');

  useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      
      // Regular expressions for mobile and tablet detection
      const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|Kindle|Silk/i;
      
      // Check viewport width
      const width = window.innerWidth;
      
      // Set device type based on user agent and viewport width
      const isMobileDevice = mobileRegex.test(userAgent) || width < 768;
      const isTabletDevice = tabletRegex.test(userAgent) || (width >= 768 && width < 1024);
      const isDesktopDevice = !isMobileDevice && !isTabletDevice;
      
      // Set orientation
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
      setIsDesktop(isDesktopDevice);
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Add event listener for orientation change
    window.addEventListener('orientationchange', checkMobile);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { 
    isMobile, 
    isTablet, 
    isDesktop, 
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    // Helper for responsive design
    isSmallScreen: isMobile || isTablet,
  };
}
