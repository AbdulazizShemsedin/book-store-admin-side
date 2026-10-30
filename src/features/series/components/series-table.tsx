'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSeries } from '../hooks/use-series';
import { CreateSeriesModal } from './create-series-modal';
import { AddBookToSeriesModal } from './add-book-to-series-modal';
import { Pagination } from '@/components/tables/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Books,
  Plus,
  MagnifyingGlass,
  ArrowRight,
  BookOpen,
  CalendarBlank,
} from '@phosphor-icons/react';
import { Series } from '@/types/domain';

export function SeriesTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Quick Add Volume modal state
  const [activeSeriesForAdd, setActiveSeriesForAdd] = useState<Series | null>(null);

  const { data, isLoading, isError, refetch } = useSeries({
    page,
    pageSize,
    search,
  });

  const seriesList = data?.series || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-0">
      {/* Sticky Search and Action Bar */}
      <div className="sticky top-0 z-20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mb-5 bg-[#edf2ef]/85 dark:bg-[#06090e]/85 backdrop-blur-2xl border-b border-white/70 dark:border-white/10 shadow-xs flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between transition-all">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search series by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<MagnifyingGlass className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#1e4634] hover:bg-[#153426] text-white self-start sm:self-auto rounded-xl shadow-xs"
        >
          Create Series
        </Button>
      </div>

      {/* Series Data Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs transition-colors duration-150">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-290px)] min-h-[380px] relative">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="sticky top-0 z-10 glass-table-th backdrop-blur-2xl">
                <th className="py-3.5 px-4">Series Name</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span className="text-xs">Loading series...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-red-600">
                    <p className="font-semibold mb-2">Failed to load series catalog.</p>
                    <Button size="sm" variant="secondary" onClick={() => refetch()}>
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : seriesList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <Books className="w-10 h-10 stroke-1" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No series found
                      </p>
                      <p className="text-xs max-w-sm">
                        {search
                          ? `No series matching "${search}".`
                          : 'Create your first series to organize books into multi-volume sets.'}
                      </p>
                      {!search && (
                        <Button
                          size="sm"
                          onClick={() => setIsCreateModalOpen(true)}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          className="mt-2 bg-[#1e4634] hover:bg-[#153426] text-white"
                        >
                          Create Series
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                seriesList.map((series) => (
                  <tr
                    key={series.id}
                    className="glass-table-row group relative"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                          <Books className="w-5 h-5" weight="bold" />
                        </div>
                        <div>
                          <Link
                            href={`/series/${series.id}`}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#1e4634] dark:hover:text-emerald-400 transition-colors block text-sm"
                          >
                            {series.name}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            {series.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <CalendarBlank className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {series.createdAt
                            ? new Date(series.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveSeriesForAdd(series)}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          className="text-xs h-7 px-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          Add Book
                        </Button>

                        <Link href={`/series/${series.id}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            className="text-xs h-7"
                          >
                            Manage Volumes
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > 0 && (
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            className="mt-0 rounded-t-none border-t border-white/80 dark:border-white/10 shadow-none bg-transparent"
          />
        )}
      </div>

      {/* Create Series Modal */}
      <CreateSeriesModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Add Book to Series Quick Modal */}
      {activeSeriesForAdd && (
        <AddBookToSeriesModal
          isOpen={Boolean(activeSeriesForAdd)}
          onClose={() => setActiveSeriesForAdd(null)}
          seriesId={activeSeriesForAdd.id}
          seriesName={activeSeriesForAdd.name}
          defaultPosition={1}
        />
      )}
    </div>
  );
}
