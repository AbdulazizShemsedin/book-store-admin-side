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
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  /**
   * Switches theme with a full-page circular radial reveal animation
   * expanding from the touch/click origin across the entire viewport.
   */
  const switchThemeWithAnimation = (
    targetTheme: string,
    event?: React.MouseEvent | React.TouchEvent
  ) => {
    // Determine the target resolved theme (dark or light)
    const nextResolvedTheme =
      targetTheme === 'system'
        ? typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : targetTheme;

    // Check if View Transition API is supported and motion is not reduced
    const isViewTransitionSupported =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isViewTransitionSupported) {
      setTheme(targetTheme);
      return;
    }

    // Determine the center origin of the circular wave
    let x = 0;
    let y = 0;

    if (event) {
      if ('clientX' in event && event.clientX) {
        x = event.clientX;
        y = event.clientY;
      } else if ('touches' in event && (event as any).touches?.[0]) {
        x = (event as any).touches[0].clientX;
        y = (event as any).touches[0].clientY;
      }
    }

    if (!x && !y && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    // Fallback if coordinates couldn't be computed
    if (!x && !y && typeof window !== 'undefined') {
      x = window.innerWidth - 100;
      y = 30;
    }

    // Calculate maximum radius to reach the furthest corner of the viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Execute View Transition
    const transition = (document as any).startViewTransition(async () => {
      setTheme(targetTheme);
      // Synchronously sync root dark class so snapshot captures new theme immediately
      if (nextResolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 850,
          easing: 'cubic-bezier(0.2, 0, 0.1, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

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

  const currentIcon =
    resolvedTheme === 'dark' ? (
      <MoonStars
        className="w-4 h-4 text-emerald-400 transition-transform duration-300 active:rotate-12"
        weight="fill"
      />
    ) : (
      <Sun
        className="w-4 h-4 text-amber-500 transition-transform duration-300 active:rotate-45"
        weight="fill"
      />
    );

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center text-left">
      {/* 1-Touch Toggle Button with Circular Wave Fill */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          const next = resolvedTheme === 'dark' ? 'light' : 'dark';
          switchThemeWithAnimation(next, e);
        }}
        aria-label={`Toggle theme: current is ${theme}. Click to switch theme.`}
        title={`Theme: ${resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'} (or click arrow for System)`}
        className={cn(
          'p-2 rounded-l-xl border-y border-l border-slate-200/90 dark:border-slate-800',
          'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300',
          'hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white',
          'shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer',
          className
        )}
      >
        {currentIcon}
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
                onClick={(e) => {
                  switchThemeWithAnimation(value, e);
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
