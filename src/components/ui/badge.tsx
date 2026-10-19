import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-800 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-800 border border-amber-200',
        danger: 'bg-red-50 text-red-700 border border-red-200',
        info: 'bg-blue-50 text-blue-800 border border-blue-200',
        primary: 'bg-emerald-100/60 text-[#1e4634] border border-emerald-300',
        outline: 'border border-slate-300 text-slate-700 bg-white',
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
              variant === 'success' && 'bg-emerald-600',
              variant === 'warning' && 'bg-amber-500',
              variant === 'danger' && 'bg-red-500',
              variant === 'info' && 'bg-blue-500',
              (!variant || variant === 'default') && 'bg-slate-400'
            )}
          />
        </span>
      )}
      {children}
    </div>
  );
}
