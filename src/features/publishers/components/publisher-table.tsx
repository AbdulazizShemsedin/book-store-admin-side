'use client';

import React from 'react';
import { Publisher } from '@/types/domain';
import { Buildings, BookOpen } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils/cn';

interface PublisherTableProps {
  publishers: Publisher[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (pub: Publisher) => void;
  onDelete?: (pub: Publisher) => void;
}

export function PublisherTable({
  publishers,
  isLoading,
  isError,
  error,
  onRetry,
}: PublisherTableProps) {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Loading publishers...</p>
        <p className="mt-1 text-xs text-slate-400">Fetching distribution imprints from directory</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load publishers"
        message={error?.message || 'Unable to retrieve publishers directory.'}
        onRetry={onRetry}
        isBackendGap
      />
    );
  }

  if (publishers.length === 0) {
    return (
      <div className="py-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-center px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-400 flex items-center justify-center mb-3">
          <Buildings className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No publishers found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Register a publisher imprint or distribution house using the form.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Publisher Imprint</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Cataloged Titles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {publishers.map((pub) => {
              return (
                <tr
                  key={pub.id}
                  className="hover:bg-emerald-50/20 transition-colors group"
                >
                  {/* Publisher Name with Monogram Avatar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-100/80 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200/60 uppercase shadow-2xs flex-shrink-0">
                        {pub.monogram}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs group-hover:text-emerald-800 transition-colors">
                          {pub.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Registered Publisher
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>

                  {/* Cataloged Titles */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      <span>{pub.booksCount ?? 0} Titles</span>
                    </span>
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
