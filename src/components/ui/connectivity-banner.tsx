'use client';

import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiSlash, CheckCircle, Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

/**
 * Subtle, non-intrusive floating network status indicator.
 * Warns administrators if internet drops before submitting large uploads or changes,
 * and confirms reconnection seamlessly.
 */
export function ConnectivityBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR hydration safety
  if (!mounted) return null;

  // Nothing to display if always online and was never offline in this session
  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-3 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out',
        'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md',
        'animate-in fade-in slide-in-from-top-2',
        !isOnline
          ? 'bg-amber-950/90 dark:bg-amber-950/95 text-amber-200 border border-amber-600/80 shadow-amber-950/20'
          : 'bg-emerald-950/90 dark:bg-emerald-950/95 text-emerald-200 border border-emerald-600/80 shadow-emerald-950/20'
      )}
    >
      {!isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <WifiSlash className="w-3.5 h-3.5 text-amber-300" weight="bold" />
          <span>You are currently offline. Uploads and mutations are paused.</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-300" weight="fill" />
          <span>Connection restored. Back online.</span>
        </>
      )}
    </div>
  );
}
