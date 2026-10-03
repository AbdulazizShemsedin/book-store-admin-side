'use client';

import React from 'react';
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
} from '@phosphor-icons/react';

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

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Top Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#1e4634] flex items-center justify-center text-white shadow-sm">
          <BookOpen className="w-4 h-4" weight="fill" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[#1e4634] uppercase leading-none">
            TEWBA
          </span>
          <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
            ADMIN PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#1e4634] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')}
                weight={isActive ? 'fill' : 'regular'}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card & Sign Out */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#1e4634]/10 text-[#1e4634] flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || 'Ahmad Hassan'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.role || 'Content Manager'}
            </p>
          </div>
        </div>

        <button
          onClick={signout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <SignOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
