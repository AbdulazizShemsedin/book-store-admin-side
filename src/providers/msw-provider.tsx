'use client';

import React, { useEffect, useState } from 'react';
import { TewbaLogo } from '@/components/ui/tewba-logo';

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
    // Luxury Glassmorphic Brand Bootstrapper
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#edf2ef] dark:bg-[#06090e] text-slate-900 dark:text-slate-100 overflow-hidden font-sans antialiased">
        {/* Optical Ambient Aurora Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] transform-gpu animate-pulse [animation-duration:5s]" />
          <div className="absolute inset-0 bg-noise-overlay opacity-50" />
        </div>

        {/* Floating Frosted Glass Card */}
        <div className="relative z-10 glass-panel p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4 backdrop-blur-2xl transition-all">
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-md mb-4 flex items-center justify-center">
            <TewbaLogo variant="full" size="md" priority />
          </div>

          <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-800 dark:text-emerald-400 uppercase">
            TEWBA Admin Portal
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Initializing digital bookstore environment...
          </p>

          {/* Luxury Hairline Shimmer Progress Track */}
          <div className="w-full h-1.5 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
