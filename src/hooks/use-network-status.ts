'use client';

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Enterprise hook to detect browser network connectivity transitions.
 * Used to protect large uploads, form mutations, and warn admins if internet drops.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Auto-clear wasOffline after 3.5 seconds
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
