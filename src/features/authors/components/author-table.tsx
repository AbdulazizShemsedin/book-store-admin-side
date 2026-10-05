'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Author } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { PencilSimple, BookOpen, Trash } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { AuthorDetailModal } from './author-detail-modal';

interface AuthorTableProps {
  authors: Author[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);

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
    <>
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Author</th>
              <th className="py-3.5 px-6">Works</th>
              <th className="py-3.5 px-6">Nationality</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {authors.map((author) => {
              return (
                <tr
                  key={author.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Author Name & Profile Photo */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {author.photoUrl ? (
                        <Image
                          src={author.photoUrl}
                          alt={author.name}
                          width={36}
                          height={36}
                          unoptimized
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#1e4634] border border-emerald-200/80 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                          {getInitials(author.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{author.name}</div>
                        {author.bio ? (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                            {author.bio}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">No biography added</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Works */}
                  <td className="py-4 px-6">
                    <Badge variant="default" size="sm" className="font-medium bg-slate-100 text-slate-700">
                      {author.worksCount ?? 1} Books
                    </Badge>
                  </td>

                  {/* Nationality */}
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {author.nationality || 'Yemeni'}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-slate-600">
                      <button
                        type="button"
                        onClick={() => onEdit?.(author)}
                        className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit author"
                        aria-label="Edit author"
                      >
                        <PencilSimple className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewingAuthor(author)}
                        className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="View author profile & books"
                        aria-label="View author profile & books"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(author)}
                        className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete author"
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

      {/* Author Details & Books Modal Popup */}
      <AuthorDetailModal
        author={viewingAuthor}
        isOpen={Boolean(viewingAuthor)}
        onClose={() => setViewingAuthor(null)}
      />
    </>
  );
}
