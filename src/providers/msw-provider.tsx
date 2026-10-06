'use client';

import React, { useEffect, useState } from 'react';

interface MswProviderProps {
  children: React.ReactNode;
}

let mswInitPromise: Promise<void> | null = null;

async function startMswWorker(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!mswInitPromise) {
    mswInitPromise = (async () => {
      try {
        const { worker } = await import('@/mocks/browser');
        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        });
      } catch (err) {
        console.error('[MSW] Failed to initialize Mock Service Worker:', err);
      }
    })();
  }

  return mswInitPromise;
}

/**
 * Environment-controlled Mock Service Worker Provider.
 * Activates when NEXT_PUBLIC_DEMO_MODE=true (local dev and Vercel demo preview).
 * In production or when demo mode is false, immediately renders children with zero mock overhead.
 */
export function MswProvider({ children }: MswProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isDemoMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    if (!isDemoMode) {
      setIsReady(true);
      return;
    }

    startMswWorker().finally(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    // Clean bootstrap placeholder while MSW activates at the network boundary
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 rounded-xl bg-[#1e4634] flex items-center justify-center text-white mb-3 shadow-md animate-pulse">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-600 tracking-wide">
          Loading Environment...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
