'use client';

import React, { useEffect, useState } from 'react';

interface MswProviderProps {
  children: React.ReactNode;
}

/**
 * Development-Only Mock Service Worker Provider.
 * Gates rendering until MSW service worker is active when NEXT_PUBLIC_USE_MOCK_API=true.
 * In production or when mock mode is disabled, immediately renders children with zero mock overhead.
 */
export function MswProvider({ children }: MswProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isMockEnabled =
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

    if (!isMockEnabled) {
      setIsReady(true);
      return;
    }

    async function startWorker() {
      try {
        const { worker } = await import('@/mocks/browser');
        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        });
      } catch (err) {
        console.error('[MSW] Failed to start Mock Service Worker:', err);
      } finally {
        setIsReady(true);
      }
    }

    startWorker();
  }, []);

  if (!isReady) {
    // Brief bootstrap state while service worker initializes (development only)
    return null;
  }

  return <>{children}</>;
}
