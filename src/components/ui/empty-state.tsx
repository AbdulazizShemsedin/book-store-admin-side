import React from 'react';
import { Tray } from '@phosphor-icons/react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0d121d] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="w-12 h-12 mb-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        {icon || <Tray className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="max-w-sm mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
