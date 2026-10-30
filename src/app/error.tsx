'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WarningCircle, ArrowClockwise, House } from '@phosphor-icons/react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unhandled error for observability
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
          <WarningCircle className="w-8 h-8" weight="fill" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Application Error
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            An unexpected error occurred. The application state has been preserved.
          </p>
        </div>

        {error.message && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 text-left truncate">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ArrowClockwise className="w-4 h-4" />}
            onClick={() => reset()}
          >
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button
              size="sm"
              leftIcon={<House className="w-4 h-4" />}
              className="bg-[#1e4634] hover:bg-[#153426]"
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
