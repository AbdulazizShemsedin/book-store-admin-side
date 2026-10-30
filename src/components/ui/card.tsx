import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl shadow-xs transition-colors duration-150',
        className
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn('px-6 py-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between', className)}
      {...props}
    >
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 rounded-b-xl flex items-center justify-between',
        className
      )}
      {...props}
    />
  );
}
