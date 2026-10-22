'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Books, CalendarBlank } from '@phosphor-icons/react';
import { Series } from '@/types/domain';

interface SeriesDetailHeaderProps {
  series: Series;
  totalBooks?: number;
  onAddBookClick: () => void;
}

export function SeriesDetailHeader({
  series,
  totalBooks = 0,
  onAddBookClick,
}: SeriesDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb / Back button */}
      <div>
        <Link href="/series">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-2"
          >
            Back to Series List
          </Button>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121d] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <Books className="w-6 h-6" weight="bold" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {series.name}
              </h1>
              <Badge variant="default">
                {totalBooks} {totalBooks === 1 ? 'Volume' : 'Volumes'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                ID: {series.id}
              </span>
              {series.createdAt && (
                <span className="flex items-center gap-1">
                  <CalendarBlank className="w-3.5 h-3.5 text-slate-400" />
                  Created{' '}
                  {new Date(series.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onAddBookClick}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#1e4634] hover:bg-[#153426] text-white self-start sm:self-auto"
        >
          Add Volume to Series
        </Button>
      </div>
    </div>
  );
}
