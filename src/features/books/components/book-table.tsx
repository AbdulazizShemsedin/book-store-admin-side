'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '@/types/domain';
import { FormatBadge } from '@/components/ui/status-badge';
import { PencilSimple, Eye, DotsThreeVertical, Book as BookIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

interface BookTableProps {
  books: Book[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onDelete?: (book: Book) => void;
}

export function BookTable({
  books,
  isLoading,
  isError,
  error,
  onRetry,
}: BookTableProps) {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading books catalog...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load catalog"
        message={error?.message || 'Unable to retrieve books from the server.'}
        onRetry={onRetry}
      />
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        title="No books cataloged"
        description="Begin building your bookstore by registering your first book title."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4 w-10 text-center">
              <input
                type="checkbox"
                aria-label="Select all books"
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700/20"
              />
            </th>
            <th className="py-3.5 px-4 w-16">Cover</th>
            <th className="py-3.5 px-6">Book Title</th>
            <th className="py-3.5 px-6">Author</th>
            <th className="py-3.5 px-6">Publisher</th>
            <th className="py-3.5 px-6">Format</th>
            <th className="py-3.5 px-6">Created</th>
            <th className="py-3.5 px-6">Updated</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {books.map((book) => {
            const createdFormatted = new Date(book.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });
            const updatedFormatted = new Date(book.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });

            return (
              <tr
                key={book.id}
                className="hover:bg-slate-50/70 transition-colors group select-none"
              >
                {/* Checkbox */}
                <td className="py-4 px-4 text-center">
                  <input
                    type="checkbox"
                    aria-label={`Select ${book.name}`}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700/20"
                  />
                </td>

                {/* Cover Placeholder / Thumbnail */}
                <td className="py-4 px-4">
                  <div className="w-10 h-14 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 overflow-hidden shadow-xs">
                    <BookIcon className="w-5 h-5" weight="duotone" />
                  </div>
                </td>

                {/* Book Title */}
                <td className="py-4 px-6">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-semibold text-slate-900 hover:text-[#1e4634] transition-colors"
                  >
                    {book.name}
                  </Link>
                </td>

                {/* Author */}
                <td className="py-4 px-6 text-slate-700 font-medium">
                  {book.author || 'Author Name'}
                </td>

                {/* Publisher */}
                <td className="py-4 px-6 text-slate-600">
                  {book.publisher || 'Publisher Name'}
                </td>

                {/* Format (has Audiobook vs text-only) */}
                <td className="py-4 px-6">
                  <FormatBadge hasAudiobook={book.hasAudiobook} />
                </td>

                {/* Created Date */}
                <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                  {createdFormatted}
                </td>

                {/* Updated Date */}
                <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                  {updatedFormatted}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-slate-600">
                    <Link
                      href={`/books/${book.id}`}
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="View book details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/books/${book.id}`}
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="Edit book"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="More options"
                    >
                      <DotsThreeVertical className="w-4 h-4" />
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
