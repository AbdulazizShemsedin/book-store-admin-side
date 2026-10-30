'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  MagnifyingGlass,
  BookOpen,
  Users,
  TreeStructure,
  Buildings,
  ChartBar,
  Plus,
  Moon,
  Sun,
  Books,
  CreditCard,
  Megaphone,
  ArrowRight,
  House,
  X,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen for Cmd+K or Ctrl+K or /
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} />

      <div className="w-full max-w-xl glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/80 dark:border-white/10 animate-in zoom-in-95 duration-150">
        <Command label="Global Command Menu" className="w-full">
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200/50 dark:border-white/10">
            <MagnifyingGlass className="w-5 h-5 text-emerald-800 dark:text-emerald-400 mr-3 flex-shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command, jump to page, or search catalog..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                ESC
              </kbd>
            </button>
          </div>

          {/* Results List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
            <Command.Empty className="py-8 text-center text-slate-400 text-xs">
              No results found for your search query.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
              <Command.Item
                onSelect={() => navigate('/books/new')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-600" weight="bold" />
                  <span className="font-semibold text-xs">Register New Book Title</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded">
                  ↵
                </kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span className="font-semibold text-xs">Toggle Light / Dark Mode</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded">
                  ⌘T
                </kbd>
              </Command.Item>
            </Command.Group>

            {/* Navigation Pages */}
            <Command.Group heading="Navigation & Catalog" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mt-2">
              <Command.Item
                onSelect={() => navigate('/dashboard')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <House className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Dashboard Overview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/books')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Books Repository</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/authors')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Authors Directory</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/categories')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TreeStructure className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Taxonomy & Categories</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/publishers')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Buildings className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Publishers & Imprints</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/series')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Books className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Series Collections</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/reports')}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ChartBar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Financial Reports & Sales</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
            <span>Navigation: <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">↑↓</kbd> to move</span>
            <span>Select: <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">↵</kbd></span>
          </div>
        </Command>
      </div>
    </div>
  );
}
