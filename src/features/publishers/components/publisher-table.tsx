'use client';

import React from 'react';
import Link from 'next/link';
import { Publisher } from '@/types/domain';
import { Buildings, BookOpen, PencilSimple, Eye, Trash } from '@phosphor-icons/react';
import { ErrorState } from '@/components/ui/error-state';
import { useQueryClient } from '@tanstack/react-query';
import { PUBLISHERS_QUERY_KEY } from '../hooks/use-publishers';
import { publishersApi } from '../api/publishers-api';

interface PublisherTableProps {
  publishers: Publisher[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (pub: Publisher) => void;
  onDelete?: (pub: Publisher) => void;
}

function PublisherTableSkeleton() {
  return (
    <div className="glass-panel rounded-3xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[calc(100vh-320px)] min-h-[380px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 glass-table-th">
              <th className="py-3.5 px-5">Publisher Imprint</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Cataloged Titles</th>
              <th className="py-3.5 px-5 text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200/60 dark:bg-white/[0.06] flex-shrink-0" />
                    <div className="space-y-1.5 w-44">
                      <div className="h-3.5 bg-slate-200/80 dark:bg-white/[0.08] rounded-md w-3/4" />
                      <div className="h-2.5 bg-slate-200/50 dark:bg-white/[0.04] rounded-md w-1/2" />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-5 bg-slate-200/60 dark:bg-white/[0.06] rounded-full w-20" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-5 bg-slate-200/60 dark:bg-white/[0.06] rounded-full w-24" />
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="h-7 bg-slate-200/60 dark:bg-white/[0.06] rounded-xl w-28 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PublisherTable({
  publishers,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: PublisherTableProps) {
  const queryClient = useQueryClient();

  if (isLoading) {
    return <PublisherTableSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load publishers"
        message={error?.message || 'Unable to retrieve publishers directory.'}
        onRetry={onRetry}
      />
    );
  }

  if (publishers.length === 0) {
    return (
      <div className="py-16 glass-panel rounded-3xl shadow-xs text-center px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <Buildings className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No publishers found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Register a publisher imprint or distribution house using the form.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl shadow-xs overflow-hidden transition-colors duration-150">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[380px] relative scroll-smooth overscroll-contain">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 glass-table-th backdrop-blur-2xl">
              <th className="py-3.5 px-5">Publisher Imprint</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Cataloged Titles</th>
              <th className="py-3.5 px-5 text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {publishers.map((pub) => {
              return (
                <tr
                  key={pub.id}
                  className="glass-table-row group relative"
                >
                  {/* Publisher Name with Monogram Avatar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-100/80 dark:from-blue-950/60 dark:to-indigo-900/40 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 uppercase shadow-2xs flex-shrink-0">
                        {pub.monogram}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/publishers/${pub.id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 block text-xs group-hover:text-emerald-800 dark:group-hover:text-emerald-400 group-hover:underline transition-colors truncate"
                        >
                          {pub.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                          ID: {pub.id.length > 8 ? `${pub.id.slice(0, 8)}...` : pub.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-sm">
                      {pub.status || 'Active'}
                    </span>
                  </td>

                  {/* Cataloged Titles */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/books?publisher=${encodeURIComponent(pub.name)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/70 dark:border-white/10 transition-colors shadow-2xs backdrop-blur-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pub.booksCount || 0} books</span>
                    </Link>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/publishers/${pub.id}`}
                        onMouseEnter={() => {
                          queryClient.prefetchQuery({
                            queryKey: [PUBLISHERS_QUERY_KEY, pub.id],
                            queryFn: () => publishersApi.getById(pub.id),
                            staleTime: 60 * 1000,
                          });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View</span>
                      </Link>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(pub)}
                          className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
                          title="Edit publisher"
                        >
                          <PencilSimple className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(pub)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white/70 dark:bg-white/[0.05] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
                          title="Delete publisher"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
