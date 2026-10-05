'use client';

import React from 'react';
import { Publisher } from '@/types/domain';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

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
  onEdit,
  onDelete,
}: PublisherTableProps) {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading publishers...</p>
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
      <EmptyState
        title="No publishers found"
        description="Register a publisher imprint or distribution house."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-6">Publisher</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {publishers.map((pub) => {
            return (
              <tr
                key={pub.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Publisher name with Monogram Avatar */}
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200/60 uppercase">
                    {pub.monogram}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{pub.name}</span>
                    {pub.booksCount !== undefined && (
                      <span className="text-[11px] text-slate-400">
                        {pub.booksCount} published titles
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400 group-hover:text-slate-600">
                    <button
                      type="button"
                      onClick={() => onEdit?.(pub)}
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="Edit publisher"
                      title="Edit publisher"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(pub)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete publisher"
                      title="Delete publisher"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
