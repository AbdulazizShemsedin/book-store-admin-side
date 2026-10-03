import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: ToggleProps) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-medium text-slate-800 cursor-pointer select-none',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2',
          checked ? 'bg-[#1e4634]' : 'bg-slate-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
