import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          required={required}
          className={cn(
            'w-full min-h-[90px] px-3.5 py-2.5 text-sm text-slate-900 bg-[#f8fafc] border border-slate-200 rounded-lg transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 disabled:opacity-50 disabled:bg-slate-100',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
