'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Author } from '@/types/domain';
import { BookOpen, User, Eye, GlobeHemisphereWest, PencilSimple, ArrowRight, Trash } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils/cn';
import { AuthorDetailModal } from './author-detail-modal';
import { AuthorEditModal } from './author-edit-modal';
import { useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AUTHORS_QUERY_KEY } from '../hooks/use-authors';
import { authorsApi } from '../api/authors-api';

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

interface AuthorTableRowProps {
  author: Author;
  measureRef?: (node: HTMLElement | null) => void;
  onPrefetch?: () => void;
  onEdit: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

function AuthorTableRow({
  author,
  measureRef,
  onPrefetch,
  onEdit,
  onDelete,
}: AuthorTableRowProps) {
  return (
    <tr
      key={author.id}
      ref={measureRef}
      onMouseEnter={onPrefetch}
      className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/30 transition-colors group"
    >
      {/* Author Name & Profile Photo */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3.5">
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={author.name}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 ease-out"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-50 to-emerald-100/90 dark:from-emerald-950/70 dark:to-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 ease-out">
              {getInitials(author.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/authors/${author.id}`}
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors block text-xs group-hover:underline text-left truncate"
              >
                {author.name}
              </Link>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                {author.id.length > 8 ? `${author.id.slice(0, 8)}...` : author.id}
              </span>
            </div>
            {author.bio ? (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 max-w-md font-normal">
                {author.bio}
              </p>
            ) : (
              <p className="text-[11px] text-slate-300 dark:text-slate-600 italic">No biography added</p>
            )}
          </div>
        </div>
      </td>

      {/* Nationality */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {author.nationality ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
            <GlobeHemisphereWest className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{author.nationality}</span>
          </span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">—</span>
        )}
      </td>

      {/* Catalog Works & Direct Link to Books */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <Link
          href={`/books?author_id=${encodeURIComponent(author.id)}&author_name=${encodeURIComponent(author.name)}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors shadow-2xs group/link"
          title={`View catalog books by ${author.name}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>
            {author.worksCount !== undefined && author.worksCount > 0
              ? `${author.worksCount} Works`
              : 'View Books'}
          </span>
          <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/authors/${author.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 shadow-2xs transition-all active:scale-[0.98]"
            title="View author profile & books"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700" />
            <span>View</span>
          </Link>
          <button
            type="button"
            onClick={() => onEdit(author)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#1e4634] dark:text-emerald-300 hover:text-white dark:hover:text-white bg-emerald-50 dark:bg-emerald-950/50 hover:bg-[#1e4634] dark:hover:bg-emerald-700 border border-emerald-200 dark:border-emerald-800/70 shadow-2xs transition-all active:scale-[0.98]"
            title="Edit author profile & photo"
          >
            <PencilSimple className="w-3.5 h-3.5" weight="bold" />
            <span>Edit</span>
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(author)}
              className="inline-flex items-center p-1 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
              title="Delete author"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AuthorTable({
  authors,
  isLoading,
  isError,
  error,
  onRetry,
  onDelete,
}: AuthorTableProps) {
  const queryClient = useQueryClient();
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const isVirtualized = authors.length > 25;

  const rowVirtualizer = useVirtualizer({
    count: isVirtualized ? authors.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 8,
  });

  const virtualRows = isVirtualized ? rowVirtualizer.getVirtualItems() : [];
  const totalSize = isVirtualized ? rowVirtualizer.getTotalSize() : 0;
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Loading authors directory...</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Retrieving registered authors from backend</p>
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
      <div className="py-16 bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm text-center px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No authors found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Get started by registering your first author into the directory.
        </p>
      </div>
    );
  }

  const handlePrefetch = (authorId: string) => {
    queryClient.prefetchQuery({
      queryKey: [AUTHORS_QUERY_KEY, authorId],
      queryFn: () => authorsApi.getById(authorId),
      staleTime: 60 * 1000,
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div
          ref={parentRef}
          className={cn('overflow-x-auto', isVirtualized && 'max-h-[750px] overflow-y-auto')}
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#070a10]/95 backdrop-blur-xs text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Author</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">Catalog Works</th>
                <th className="py-3 px-5 text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isVirtualized ? (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td colSpan={4} style={{ height: `${paddingTop}px` }} />
                    </tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const author = authors[virtualRow.index];
                    if (!author) return null;
                    return (
                      <AuthorTableRow
                        key={author.id}
                        author={author}
                        measureRef={rowVirtualizer.measureElement}
                        onPrefetch={() => handlePrefetch(author.id)}
                        onEdit={(a) => setEditingAuthor(a)}
                        onDelete={onDelete}
                      />
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td colSpan={4} style={{ height: `${paddingBottom}px` }} />
                    </tr>
                  )}
                </>
              ) : (
                authors.map((author) => (
                  <AuthorTableRow
                    key={author.id}
                    author={author}
                    onPrefetch={() => handlePrefetch(author.id)}
                    onEdit={(a) => setEditingAuthor(a)}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Edit Modal */}
      <AuthorEditModal
        author={editingAuthor}
        isOpen={Boolean(editingAuthor)}
        onClose={() => setEditingAuthor(null)}
      />
    </>
  );
}
