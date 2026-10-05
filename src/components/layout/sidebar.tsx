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
  User,
  CaretLeft,
  CaretRight,
  CaretDown,
} from '@phosphor-icons/react';
import { useSidebar } from '@/providers/sidebar-provider';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: SquaresFour },
  { label: 'Books', href: '/books', icon: BookOpen },
  { label: 'Authors', href: '/authors', icon: Users },
  { label: 'Publishers', href: '/publishers', icon: Buildings },
  { label: 'Categories', href: '/categories', icon: TreeStructure },
  { label: 'Advertisements', href: '/advertisements', icon: Megaphone },
  { label: 'Reports', href: '/reports', icon: ChartBar },
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

  return (
    <aside
      className={cn(
        'flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-60'
      )}
    >
      {/* Top Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-slate-100 transition-all',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1e4634] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <BookOpen className="w-4 h-4" weight="fill" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold tracking-widest text-[#1e4634] uppercase leading-none">
                TEWBA
              </span>
              <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
                ADMIN PORTAL
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Contract sidebar"
            aria-label="Contract sidebar"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={cn('flex-1 py-4 space-y-1 overflow-y-auto', isCollapsed ? 'px-2' : 'px-3')}>
        {NAV_ITEMS.map((item) => {
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
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto'
                  : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-[#1e4634] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn(
                  isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                  'flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400'
                )}
                weight={isActive ? 'fill' : 'regular'}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card (Clickable to reveal Sign Out) */}
      <div
        ref={userMenuRef}
        className={cn(
          'border-t border-slate-100 relative',
          isCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-2'
        )}
      >
        {/* Sign Out Popover Menu */}
        {isUserMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 transition-all',
              isCollapsed ? 'left-2 w-44' : 'left-3 right-3'
            )}
          >
            {isCollapsed && (
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || 'Ahmad Hassan'}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                signout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <SignOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#1e4634]/10 text-[#1e4634] flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-[#1e4634]/30 transition-all"
              title={`${user?.name || 'Ahmad Hassan'} (Click to Sign Out)`}
              aria-label="User account menu"
            >
              <User className="w-4 h-4" weight="bold" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors mt-1"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left group"
            title="User account menu"
            aria-label="User account menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1e4634]/10 text-[#1e4634] flex items-center justify-center font-bold text-xs flex-shrink-0">
                <User className="w-4 h-4" weight="bold" />
              </div>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'Ahmad Hassan'}
              </p>
            </div>
            <CaretDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 flex-shrink-0 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>
    </aside>
  );
}
