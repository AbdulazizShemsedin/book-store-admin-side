import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden',
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
      className={cn('px-6 py-5 border-b border-slate-100 flex items-center justify-between', className)}
      {...props}
    >
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
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
      className={cn('px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between', className)}
      {...props}
    />
  );
}
