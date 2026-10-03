'use client';

import React from 'react';
import { Author } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { PencilSimple, BookOpen, Trash } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

interface AuthorTableProps {
  authors: Author[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

export function AuthorTable({
  authors,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: AuthorTableProps) {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading authors directory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load authors"
        message={error?.message || 'Unable to retrieve authors from the backend service.'}
        onRetry={onRetry}
      />
    );
  }

  if (authors.length === 0) {
    return (
      <EmptyState
        title="No authors found"
        description="Get started by registering your first author into the directory."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-6">ID</th>
            <th className="py-3.5 px-6">Name</th>
            <th className="py-3.5 px-6">Works</th>
            <th className="py-3.5 px-6">Nationality</th>
            <th className="py-3.5 px-6">Status</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {authors.map((author, index) => {
            const displayId = author.id.startsWith('AUT-')
              ? author.id
              : `AUT-${String(index + 1).padStart(3, '0')}`;

            return (
              <tr
                key={author.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* ID */}
                <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                  {displayId}
                </td>

                {/* Name */}
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900">{author.name}</div>
                  {author.bio && (
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {author.bio}
                    </div>
                  )}
                </td>

                {/* Works */}
                <td className="py-4 px-6">
                  <Badge variant="default" size="sm" className="font-medium bg-slate-100 text-slate-700">
                    {author.worksCount ?? 1} Books
                  </Badge>
                </td>

                {/* Nationality (PM Requirement) */}
                <td className="py-4 px-6 text-slate-600 font-medium">
                  {author.nationality || 'Yemeni'}
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <StatusBadge status={author.status || 'Active'} />
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-slate-600">
                    <button
                      type="button"
                      onClick={() => onEdit?.(author)}
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="Edit author"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="View books by author"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(author)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete author"
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
