'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '@/types/domain';
import {
  Eye,
  Book as BookIcon,
  Headphones,
  FileText,
  Translate,
  Tag,
} from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils/cn';

interface BookTableProps {
  books: Book[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  ar: 'Arabic',
  am: 'Amharic',
  en: 'English',
  om: 'Oromo',
  ti: 'Tigrinya',
  so: 'Somali',
};

export function BookTable({
  books,
  isLoading,
  isError,
  error,
  onRetry,
}: BookTableProps) {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none transition-colors duration-150">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Loading catalog books...</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Retrieving book metadata from live repository</p>
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
      <div className="py-16 bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none text-center px-4 transition-colors duration-150">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <BookIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No books cataloged</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Begin building the digital bookstore by registering your first book title.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none overflow-hidden transition-colors duration-150">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Cover</th>
              <th className="py-3 px-5">Book Title</th>
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">Categories / Tags</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Publisher</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Registered</th>
              <th className="py-3 px-5 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {books.map((book) => {
              const createdDate = book.createdAt
                ? new Date(book.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                : '—';

              const langLabel = book.language
                ? LANGUAGE_LABELS[book.language.toLowerCase()] || book.language.toUpperCase()
                : null;

              const bookCover = book.thumbnail || book.coverUrl;

              return (
                <tr
                  key={book.id}
                  className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Cover Thumbnail */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-10 h-14 mx-auto rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden shadow-2xs relative">
                      {bookCover ? (
                        <img
                          src={bookCover}
                          alt={book.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <BookIcon className="w-5 h-5 text-slate-300 dark:text-slate-600" weight="duotone" />
                      )}
                    </div>
                  </td>

                  {/* Book Title */}
                  <td className="py-3 px-5">
                    <Link
                      href={`/books/${book.id}`}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors block text-xs leading-snug group-hover:underline"
                    >
                      {book.name}
                    </Link>
                    {book.description && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 max-w-xs font-normal">
                        {book.description}
                      </p>
                    )}
                  </td>

                  {/* Language */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {langLabel ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                        <Translate className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span>{langLabel}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Categories / Tags */}
                  <td className="py-3 px-4">
                    {book.tags && book.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {book.tags.slice(0, 2).map((t, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                          >
                            <Tag className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate max-w-[80px]">{t}</span>
                          </span>
                        ))}
                        {book.tags.length > 2 && (
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 self-center">
                            +{book.tags.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Author */}
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {book.author ? (
                      <span className="truncate block max-w-[140px]">{book.author}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Publisher */}
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {book.publisher ? (
                      <span className="truncate block max-w-[140px]">{book.publisher}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Format */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      {book.hasAudiobook ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                          <Headphones className="w-3 h-3 text-indigo-600 dark:text-indigo-400" weight="bold" />
                          <span>Audiobook</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                          <FileText className="w-3 h-3 text-emerald-700 dark:text-emerald-400" weight="bold" />
                          <span>E-Book</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                    {createdDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    <Link
                      href={`/books/${book.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all active:scale-[0.98]"
                      title="View book details"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                      <span>Details</span>
                    </Link>
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
