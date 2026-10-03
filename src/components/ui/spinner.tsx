import React from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <CircleNotch
      className={cn('animate-spin text-[#1e4634]', sizeClasses[size], className)}
    />
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Spinner size="lg" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}
