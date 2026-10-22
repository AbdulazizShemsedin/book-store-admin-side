'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/providers/auth-provider';
import {
  BookOpen,
  SquaresFour,
  Users,
  Buildings,
  TreeStructure,
  Megaphone,
  ChartBar,
  SignOut,
  CaretLeft,
  CaretRight,
  CaretDown,
  Books,
} from '@phosphor-icons/react';
import { useSidebar } from '@/providers/sidebar-provider';

interface NavSection {
  title?: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: SquaresFour },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Books', href: '/books', icon: BookOpen },
      { label: 'Series', href: '/series', icon: Books },
      { label: 'Categories', href: '/categories', icon: TreeStructure },
      { label: 'Authors', href: '/authors', icon: Users },
      { label: 'Publishers', href: '/publishers', icon: Buildings },
    ],
  },
  {
    title: 'Marketing & Reports',
    items: [
      { label: 'Advertisements', href: '/advertisements', icon: Megaphone },
      { label: 'Reports', href: '/reports', icon: ChartBar },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

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
    <aside
      className={cn(
        'flex-shrink-0 bg-white dark:bg-[#0d121d] border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30',
        'transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width] overflow-hidden',
        isCollapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-3.5 flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90 overflow-hidden"
        >
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-lg bg-[#1e4634] dark:bg-[#1b4332] flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" weight="bold" />
          </div>

          {/* Logo Text - Smoothly fades and slides */}
          <div
            className={cn(
              'flex flex-col min-w-0 leading-tight transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden',
              isCollapsed
                ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                : 'opacity-100 max-w-[130px] translate-x-0'
            )}
          >
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              TEWBA
            </span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
              Bookstore Admin
            </span>
          </div>
        </Link>

        {/* Collapse Button (in header) - Smoothly fades out when collapsed */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className={cn(
            'p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-md transition-all duration-300 flex-shrink-0',
            isCollapsed
              ? 'opacity-0 max-w-0 pointer-events-none p-0 overflow-hidden'
              : 'opacity-100 max-w-6'
          )}
        >
          <CaretLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 space-y-4 overflow-y-auto overflow-x-hidden px-2.5">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {/* Section Header */}
            {section.title && (
              <div
                className={cn(
                  'px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider',
                  'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden',
                  isCollapsed ? 'opacity-0 max-h-0 py-0 pointer-events-none' : 'opacity-100 max-h-8'
                )}
              >
                {section.title}
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center h-10 rounded-lg text-xs transition-colors duration-150 group relative',
                      'px-2.5',
                      isActive
                        ? 'bg-[#1e4634] dark:bg-[#1b4332] text-white font-semibold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    {/* Fixed Icon container to avoid position jumping */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        )}
                        weight={isActive ? 'fill' : 'regular'}
                      />
                    </div>

                    {/* Animated Label */}
                    <span
                      className={cn(
                        'ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
                        isCollapsed
                          ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                          : 'opacity-100 max-w-[150px] translate-x-0'
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Area */}
      <div
        ref={userMenuRef}
        className="border-t border-slate-200 dark:border-slate-800/80 relative bg-slate-50/60 dark:bg-slate-900/40 p-2 transition-colors flex-shrink-0"
      >
        {/* User Popover Menu */}
        {isUserMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-50',
              isCollapsed ? 'left-2 w-48' : 'left-2 right-2'
            )}
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsUserMenuOpen(false);
                await signout();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left"
            >
              <SignOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* User Trigger Button - Always single consistent button structure */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={cn(
              'flex items-center rounded-lg transition-colors text-left',
              'hover:bg-slate-100 dark:hover:bg-slate-800/80',
              isCollapsed
                ? 'w-10 h-10 justify-center mx-auto'
                : 'w-full p-1.5 gap-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs'
            )}
            title={`${userName} (Click for menu)`}
            aria-label="User account menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#1e4634] dark:bg-[#1b4332] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <span>{userInitial}</span>
            </div>

            <div
              className={cn(
                'min-w-0 flex-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden',
                isCollapsed
                  ? 'opacity-0 max-w-0 pointer-events-none'
                  : 'opacity-100 max-w-[120px]'
              )}
            >
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            </div>

            <CaretDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-all duration-300 flex-shrink-0',
                isCollapsed
                  ? 'opacity-0 max-w-0 pointer-events-none'
                  : 'opacity-100 max-w-4',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Expand toggle when collapsed */}
        <div
          className={cn(
            'flex justify-center transition-all duration-300 overflow-hidden',
            isCollapsed ? 'max-h-8 opacity-100 mt-1.5' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
          )}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="w-7 h-7 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded transition-colors"
          >
            <CaretRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
