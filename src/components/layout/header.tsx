'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass, Bell, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
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

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell with red dot */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

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
