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
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react';
import { useSidebar } from '@/providers/sidebar-provider';

interface NavSection {
  title?: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: SquaresFour },
    ],
  },
  {
    title: 'Catalog Management',
    items: [
      { label: 'Books', href: '/books', icon: BookOpen },
      { label: 'Categories', href: '/categories', icon: TreeStructure, badge: 'Taxonomy' },
      { label: 'Authors', href: '/authors', icon: Users },
      { label: 'Publishers', href: '/publishers', icon: Buildings },
    ],
  },
  {
    title: 'Growth & Analytics',
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
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        'flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-300 ease-in-out shadow-[1px_0_10px_rgba(0,0,0,0.02)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-slate-100 transition-all px-4',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 min-w-0 group transition-transform active:scale-[0.98]',
            isCollapsed && 'justify-center'
          )}
        >
          {/* Logo Icon Mark */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b4332] via-[#245842] to-[#2d6a4f] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 ring-1 ring-emerald-600/20 flex-shrink-0 group-hover:shadow-emerald-900/20 transition-all">
            <BookOpen className="w-4 h-4 text-emerald-200" weight="fill" />
            <Sparkle className="w-2.5 h-2.5 text-amber-300 absolute -top-0.5 -right-0.5" weight="fill" />
          </div>

          {/* Logo Text */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-[0.2em] text-[#1b4332] leading-none">
                  TEWBA
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase">
                  Live
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                Admin Console
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
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className={cn('flex-1 py-4 space-y-5 overflow-y-auto overflow-x-hidden', isCollapsed ? 'px-2' : 'px-3')}>
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Header */}
            {section.title && !isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                {section.title}
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-1">
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
                      'group relative flex items-center rounded-xl text-xs font-medium transition-all duration-150',
                      isCollapsed
                        ? 'justify-center w-11 h-11 mx-auto'
                        : 'gap-3 px-3.5 py-2.5',
                      isActive
                        ? 'bg-gradient-to-r from-[#1b4332] to-[#245842] text-white shadow-sm shadow-emerald-950/15 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/60'
                    )}
                  >
                    {/* Active Accent Bar on Left Edge */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400" />
                    )}

                    <Icon
                      className={cn(
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        'flex-shrink-0 transition-transform group-hover:scale-105',
                        isActive
                          ? 'text-emerald-200'
                          : 'text-slate-400 group-hover:text-slate-700'
                      )}
                      weight={isActive ? 'fill' : 'regular'}
                    />

                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase',
                              isActive
                                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/30'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
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
          'border-t border-slate-100 relative bg-slate-50/50',
          isCollapsed ? 'p-2' : 'p-3'
        )}
      >
        {/* User Dropdown Menu Popover */}
        {isUserMenuOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150',
              isCollapsed ? 'left-2 w-52' : 'left-3 right-3'
            )}
          >
            {/* Account Info Details */}
            <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" weight="bold" />
                  System Owner
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'owner@system.local'}
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={async () => {
                setIsUserMenuOpen(false);
                await signout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left group"
            >
              <SignOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" weight="bold" />
              <span>Sign Out of Portal</span>
            </button>
          </div>
        )}

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-50 to-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-emerald-700/30 transition-all shadow-2xs border border-emerald-200/50"
              title={`${userName} (Click for Menu)`}
              aria-label="User account menu"
            >
              <span>{userInitial}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200/80 shadow-2xs transition-all text-left group hover:border-slate-300"
            title="User account menu"
            aria-label="User account menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* User Avatar with status dot */}
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-50 to-emerald-100/90 text-emerald-800 border border-emerald-200/60 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                <span>{userInitial}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate leading-snug">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-none">
                  Owner Admin
                </p>
              </div>
            </div>

            <CaretDown
              className={cn(
                'w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 flex-shrink-0',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
    </aside>
  );
}
