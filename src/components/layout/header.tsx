'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass, Plus, List } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/providers/sidebar-provider';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-8 bg-white/95 dark:bg-[#0d121d]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-20 transition-colors duration-150">
      <div className="flex items-center gap-3">
        {/* Drawer button to expand/contract sidebar */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Contract sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Contract sidebar'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <List className="w-5 h-5" weight="bold" />
        </button>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="w-80 sm:w-96 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <MagnifyingGlass className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, publishers..."
            className="w-full h-9 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {Boolean(
          process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
          process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
        ) && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-medium text-amber-800 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode (Mock Backend)</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Global Primary Action Button */}
        <Link href="/books/new">
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
            className="shadow-sm font-semibold"
          >
            Add Book
          </Button>
        </Link>
      </div>
    </header>
  );
}
