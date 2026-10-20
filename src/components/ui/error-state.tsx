import React from 'react';
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isBackendGap?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  isBackendGap = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/30 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40">
      <div className="w-10 h-10 mb-3 rounded-full bg-red-100/70 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
        <WarningCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="max-w-md mt-1 text-xs text-slate-600 dark:text-slate-400">{message}</p>
      {isBackendGap && (
        <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-md">
          Awaiting backend API endpoint (documented in docs/backend-gaps.md)
        </span>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ArrowClockwise className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
