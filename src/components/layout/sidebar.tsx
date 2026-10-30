'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  BookOpen,
  SquaresFour,
  Users,
  Buildings,
  TreeStructure,
  Megaphone,
  ChartBar,
  Books,
  CreditCard,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { useSidebar } from '@/providers/sidebar-provider';
import { TewbaLogo } from '@/components/ui/tewba-logo';

interface NavSection {
  title?: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    shortcut?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: SquaresFour, shortcut: '⌘1' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Books', href: '/books', icon: BookOpen, shortcut: '⌘2' },
      { label: 'Series', href: '/series', icon: Books, shortcut: '⌘3' },
      { label: 'Categories', href: '/categories', icon: TreeStructure, shortcut: '⌘4' },
      { label: 'Authors', href: '/authors', icon: Users, shortcut: '⌘5' },
      { label: 'Publishers', href: '/publishers', icon: Buildings, shortcut: '⌘6' },
    ],
  },
  {
    title: 'Subscriptions & Marketing',
    items: [
      { label: 'Plans', href: '/plans', icon: CreditCard, shortcut: '⌘7' },
      { label: 'Advertisements', href: '/advertisements', icon: Megaphone, shortcut: '⌘8' },
      { label: 'Reports', href: '/reports', icon: ChartBar, shortcut: '⌘9' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [hoveredNav, setHoveredNav] = useState<{
    label: string;
    top: number;
    shortcut?: string;
  } | null>(null);

  return (
    <>
      <aside
        className={cn(
          'flex-shrink-0 bg-white/70 dark:bg-[#090d16]/65 backdrop-blur-2xl border-r border-white/80 dark:border-white/10 flex flex-col h-screen sticky top-0 select-none z-20',
          'shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_30px_-4px_rgba(0,0,0,0.4)]',
          'transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width] overflow-hidden',
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 px-4 flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0 transition-opacity hover:opacity-90 overflow-hidden"
          >
            {/* Official Logo Mark in Frosted Acrylic Container */}
            <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-white/10 border border-white/90 dark:border-white/20 flex items-center justify-center shadow-xs flex-shrink-0 p-1.5 backdrop-blur-md">
              <TewbaLogo variant="mark" size="sm" />
            </div>

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
              <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
                Admin Suite
              </span>
            </div>
          </Link>

          {/* Header Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-all duration-300 flex-shrink-0',
              isCollapsed
                ? 'opacity-0 max-w-0 pointer-events-none p-0 overflow-hidden'
                : 'opacity-100 max-w-7'
            )}
          >
            <CaretLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 space-y-4 overflow-y-auto overflow-x-hidden px-3">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              {section.title && (
                <div
                  className={cn(
                    'px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400/90 dark:text-slate-500 uppercase tracking-widest',
                    'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden',
                    isCollapsed ? 'opacity-0 max-h-0 py-0 pointer-events-none' : 'opacity-100 max-h-8'
                  )}
                >
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
                      onMouseEnter={(e) => {
                        if (!isCollapsed) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredNav({
                          label: item.label,
                          shortcut: item.shortcut,
                          top: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseLeave={() => setHoveredNav(null)}
                      className={cn(
                        'flex items-center h-10 rounded-xl text-xs transition-all duration-200 group relative px-3',
                        isActive
                          ? 'glass-dock-active font-bold'
                          : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.07] hover:backdrop-blur-md'
                      )}
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                            isActive
                              ? 'text-white dark:text-emerald-300'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300'
                          )}
                          weight={isActive ? 'fill' : 'regular'}
                        />
                      </div>

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

                      {/* Active LED Edge Indicator */}
                      {isActive && (
                        <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Dock Expand Toggle Bar (Visible when collapsed) */}
        <div className="p-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-center flex-shrink-0 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md">
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? (
              <CaretRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <CaretLeft className="w-3.5 h-3.5" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Floating High-Precision Glass Tooltip on Hover (Collapsed Dock Mode Only) */}
      {hoveredNav && isCollapsed && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-950 shadow-xl border border-white/20 dark:border-black/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2 select-none"
          style={{
            top: `${hoveredNav.top}px`,
            left: '80px',
            transform: 'translateY(-50%)',
          }}
        >
          <span>{hoveredNav.label}</span>
          {hoveredNav.shortcut && (
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20 dark:bg-black/15 text-white/90 dark:text-slate-800">
              {hoveredNav.shortcut}
            </kbd>
          )}
          {/* Arrow pointing left */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-slate-900/90 dark:border-r-white/95" />
        </div>
      )}
    </>
  );
}
