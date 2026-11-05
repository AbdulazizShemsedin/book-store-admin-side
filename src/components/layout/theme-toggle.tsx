'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, MoonStars, Desktop, Check, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!mounted) {
    // Clean placeholder during SSR to prevent layout shift
    return (
      <div
        className={cn(
          'w-16 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 animate-pulse',
          className
        )}
      />
    );
  }

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: MoonStars },
    { value: 'system', label: 'System', icon: Desktop },
  ] as const;

  const isDark = resolvedTheme === 'dark';

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center text-left">
      {/* 1-Touch Toggle Button: Instant 60fps switch with icon morph */}
      <button
        type="button"
        onClick={() => {
          setTheme(isDark ? 'light' : 'dark');
        }}
        aria-label={`Toggle theme: current is ${theme}. Click to switch theme.`}
        title={`Theme: ${isDark ? 'Switch to Light' : 'Switch to Dark'} (or click arrow for System)`}
        className={cn(
          'p-2 rounded-l-xl border-y border-l border-slate-200/90 dark:border-slate-800',
          'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300',
          'hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
          'shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer group',
          className
        )}
      >
        <span className="relative flex items-center justify-center w-4 h-4">
          <Sun
            className={cn(
              'w-4 h-4 text-amber-500 absolute transition-all duration-200 ease-out',
              isDark
                ? 'opacity-0 -rotate-90 scale-50 pointer-events-none'
                : 'opacity-100 rotate-0 scale-100 group-hover:rotate-45'
            )}
            weight="fill"
          />
          <MoonStars
            className={cn(
              'w-4 h-4 text-emerald-400 absolute transition-all duration-200 ease-out',
              isDark
                ? 'opacity-100 rotate-0 scale-100 group-hover:-rotate-12'
                : 'opacity-0 rotate-90 scale-50 pointer-events-none'
            )}
            weight="fill"
          />
        </span>
      </button>

      {/* Menu Caret to Access System Mode */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Theme options"
        title="Theme options (Light, Dark, System)"
        className={cn(
          'p-2 rounded-r-xl border border-slate-200/90 dark:border-slate-800 border-l-slate-200/50 dark:border-l-slate-800/60',
          'bg-white/90 dark:bg-slate-900/90 text-slate-400 dark:text-slate-500',
          'hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200',
          'shadow-2xs transition-colors flex items-center justify-center cursor-pointer'
        )}
      >
        <CaretDown
          className={cn('w-3 h-3 transition-transform duration-150', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-scale-in">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Appearance
          </div>
          {options.map(({ value, label, icon: Icon }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" weight={isSelected ? 'fill' : 'regular'} />
                  <span>{label}</span>
                </div>
                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                    weight="bold"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
