'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  Plus,
  SignOut,
  CaretDown,
  List,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import { useSidebar } from '@/providers/sidebar-provider';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { user, signout } = useAuth();
  const { toggleSidebar, isCollapsed } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Admin');
  const userEmail = user?.email || 'owner@system.local';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 px-6 sm:px-8 bg-white/70 dark:bg-[#090d16]/65 backdrop-blur-2xl border-b border-white/80 dark:border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-colors backdrop-blur-md"
        >
          <List className="w-5 h-5" weight="bold" />
        </button>

        {/* Search Input with Command Palette Shortcut */}
        <form onSubmit={handleSearch} className="w-72 sm:w-96 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <MagnifyingGlass className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, publishers..."
            className="w-full h-9 pl-10 pr-14 text-xs bg-white/60 dark:bg-white/[0.04] backdrop-blur-md border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0d121d] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 shadow-2xs transition-all"
          />
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
              );
            }}
            title="Open Command Palette (⌘K or Ctrl+K)"
            className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white/70 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 shadow-2xs transition-colors"
          >
            <span>⌘</span>
            <span>K</span>
          </button>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {Boolean(
          process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
          process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
        ) && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-800 dark:text-amber-300 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode</span>
          </div>
        )}

        {/* Global Primary Action Button */}
        <Link href="/books/new">
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
            className="shadow-sm font-semibold rounded-xl"
          >
            Add Book
          </Button>
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200/80 dark:bg-white/10 mx-0.5" />

        {/* User Account Popover Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
            title={`${userName} (${userEmail})`}
            aria-label="User account menu"
            aria-expanded={isUserMenuOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
              <span>{userInitial}</span>
            </div>

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>

            <CaretDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 dark:bg-[#0d121d]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 animate-scale-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/10 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {userEmail}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await signout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
              >
                <SignOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
