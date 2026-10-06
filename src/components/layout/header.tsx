'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass, Plus, List } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/providers/sidebar-provider';

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
    <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Drawer button to expand/contract sidebar */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Contract sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Contract sidebar'}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <List className="w-5 h-5" weight="bold" />
        </button>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="w-96 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <MagnifyingGlass className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, publishers..."
            className="w-full h-9 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {Boolean(
          process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
          process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
        ) && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode (Mock Backend)</span>
          </div>
        )}

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
