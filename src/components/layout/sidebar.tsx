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
        'flex-shrink-0 bg-white dark:bg-[#0d121d] border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-200 ease-in-out',
        isCollapsed ? 'w-18' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-slate-100 dark:border-slate-800/80 transition-all px-4',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90',
            isCollapsed && 'justify-center'
          )}
        >
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-lg bg-[#1e4634] dark:bg-[#1b4332] flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" weight="bold" />
          </div>

          {/* Logo Text */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                TEWBA
              </span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Bookstore Admin
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Button */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-md transition-colors"
          >
            <CaretLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={cn('flex-1 py-3 space-y-4 overflow-y-auto', isCollapsed ? 'px-2' : 'px-3')}>
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {/* Section Header */}
            {section.title && !isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                      'flex items-center rounded-lg text-xs transition-colors',
                      isCollapsed
                        ? 'justify-center w-10 h-10 mx-auto'
                        : 'gap-3 px-3 py-2',
                      isActive
                        ? 'bg-[#1e4634] dark:bg-[#1b4332] text-white font-semibold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <Icon
                      className={cn(
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        'flex-shrink-0',
                        isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      )}
                      weight={isActive ? 'fill' : 'regular'}
                    />

                    {!isCollapsed && <span className="truncate">{item.label}</span>}
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
        className={cn(
          'border-t border-slate-200 dark:border-slate-800/80 relative bg-slate-50/60 dark:bg-slate-900/40',
          isCollapsed ? 'p-2' : 'p-3'
        )}
      >
        {/* User Popover Menu */}
        {isUserMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-50',
              isCollapsed ? 'left-2 w-48' : 'left-3 right-3'
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

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#1e4634] dark:bg-[#1b4332] text-white flex items-center justify-center font-semibold text-xs hover:opacity-90 transition-opacity"
              title={`${userName} (Click for Menu)`}
              aria-label="User account menu"
            >
              <span>{userInitial}</span>
            </button>
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
        ) : (
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors text-left"
            title="User account menu"
            aria-label="User account menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1e4634] dark:bg-[#1b4332] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <span>{userInitial}</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <CaretDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150 flex-shrink-0',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
    </aside>
  );
}
