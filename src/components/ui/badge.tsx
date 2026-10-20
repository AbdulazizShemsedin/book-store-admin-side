import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
        success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
        warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60',
        danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60',
        info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60',
        primary: 'bg-emerald-100/60 dark:bg-emerald-950/60 text-[#1e4634] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60',
        outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2 mr-0.5 items-center justify-center">
          {variant === 'success' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full w-1.5 h-1.5',
              variant === 'success' && 'bg-emerald-600 dark:bg-emerald-400',
              variant === 'warning' && 'bg-amber-500 dark:bg-amber-400',
              variant === 'danger' && 'bg-red-500 dark:bg-red-400',
              variant === 'info' && 'bg-blue-500 dark:bg-blue-400',
              (!variant || variant === 'default') && 'bg-slate-400 dark:bg-slate-500'
            )}
          />
        </span>
      )}
      {children}
    </div>
  );
}
