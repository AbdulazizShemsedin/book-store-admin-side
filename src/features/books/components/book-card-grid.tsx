'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/domain';
import {
  BookOpen,
  Headphones,
  FileText,
  Translate,
  Globe,
  EyeSlash,
  Eye,
  PencilSimple,
  Buildings,
  User,
} from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils/cn';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BOOKS_QUERY_KEY } from '../hooks/use-books';
import { booksApi } from '../api/books-api';

interface BookCardGridProps {
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

interface BookCardItemProps {
  book: Book;
  onPrefetch: () => void;
}

function BookCardItem({ book, onPrefetch }: BookCardItemProps) {
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const isPublic =
    book.status?.toLowerCase() === 'public' || book.status?.toLowerCase() === 'published';

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = isPublic ? 'private' : 'public';
    try {
      setIsUpdatingStatus(true);
      await booksApi.update(book.id, { status: nextStatus });
      queryClient.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      toast.success(
        nextStatus === 'public'
          ? `"${book.name}" is now Public on the storefront.`
          : `"${book.name}" is now Private.`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update book publication status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const coverSrc = book.thumbnail || book.coverUrl;
  const langLabel = book.language
    ? LANGUAGE_LABELS[book.language.toLowerCase()] || book.language.toUpperCase()
    : null;

  const publisherName =
    book.publisher && typeof book.publisher === 'object'
      ? (book.publisher as any).name || '—'
      : book.publisher || '—';

  return (
    <div
      onMouseEnter={onPrefetch}
      className="glass-panel glass-card-interactive group rounded-2xl p-2.5 flex flex-col justify-between overflow-hidden relative border border-white/80 dark:border-white/10 hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-2xs hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Top Cover Section - Compact 4:5 Book Ratio */}
      <div>
        <Link
          href={`/books/${book.id}`}
          className="relative block w-full aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/90 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border border-slate-200/70 dark:border-white/10 shadow-2xs group/cover"
        >
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={book.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-1.5 shadow-2xs">
                <BookOpen className="w-4 h-4" weight="duotone" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 line-clamp-2 px-1">
                {book.name}
              </span>
            </div>
          )}

          {/* Compact Top Floating Badges: Format & Status */}
          <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none z-10">
            {/* Format Pill */}
            {book.hasAudiobook ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-950/85 text-indigo-200 border border-indigo-400/30 backdrop-blur-md shadow-xs">
                <Headphones className="w-2.5 h-2.5 text-indigo-300" weight="bold" />
                <span>Audio</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/85 text-emerald-200 border border-emerald-400/30 backdrop-blur-md shadow-xs">
                <FileText className="w-2.5 h-2.5 text-emerald-300" weight="bold" />
                <span>E-Book</span>
              </span>
            )}

            {/* Publication Status Pill */}
            {isPublic ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600/90 text-white border border-emerald-400/40 backdrop-blur-md shadow-xs">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <span>Public</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-600/90 text-white border border-amber-400/40 backdrop-blur-md shadow-xs">
                <span className="w-1 h-1 rounded-full bg-white" />
                <span>Private</span>
              </span>
            )}
          </div>

          {/* Subtle Hover Action Pill */}
          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2">
            <span className="text-[10px] font-bold text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-md">
              View &rarr;
            </span>
          </div>
        </Link>

        {/* Compact Book Info */}
        <div className="mt-2 space-y-1">
          <Link
            href={`/books/${book.id}`}
            className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors line-clamp-1 leading-snug group-hover:underline block"
            title={book.name}
          >
            {book.name}
          </Link>

          {/* Author Name */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
            <User className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="truncate font-medium">{book.author || 'Unknown'}</span>
          </div>

          {/* Metadata Row: Language & Publisher */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
            {langLabel && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-slate-100/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 font-medium">
                <Translate className="w-2.5 h-2.5 text-slate-400" />
                <span>{langLabel}</span>
              </span>
            )}
            {publisherName !== '—' && (
              <span className="truncate" title={`Publisher: ${publisherName}`}>
                {publisherName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compact Action Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-1.5">
        {/* Toggle Publish/Private Button */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isUpdatingStatus}
          className={cn(
            'inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all active:scale-[0.98] flex-1',
            isPublic
              ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
              : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
          )}
          title={isPublic ? 'Make Private' : 'Publish to Storefront'}
        >
          {isUpdatingStatus ? (
            <Spinner size="sm" />
          ) : isPublic ? (
            <>
              <EyeSlash className="w-3 h-3" weight="bold" />
              <span>Private</span>
            </>
          ) : (
            <>
              <Globe className="w-3 h-3" weight="bold" />
              <span>Publish</span>
            </>
          )}
        </button>

        {/* View Details Link */}
        <Link
          href={`/books/${book.id}`}
          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
          title="View full details"
        >
          <Eye className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700" />
          <span>Details</span>
        </Link>

        {/* Direct Edit Link */}
        <Link
          href={`/books/${book.id}/edit`}
          className="inline-flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-white/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 transition-colors shadow-2xs"
          title="Edit Book"
        >
          <PencilSimple className="w-3 h-3" weight="bold" />
        </Link>
      </div>
    </div>
  );
}

function BookCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="glass-panel rounded-2xl p-2.5 flex flex-col justify-between animate-pulse"
        >
          <div>
            <div className="w-full aspect-[4/5] rounded-xl bg-slate-200/70 dark:bg-white/[0.06] mb-2" />
            <div className="h-3.5 bg-slate-200/80 dark:bg-white/[0.08] rounded-md w-3/4 mb-1.5" />
            <div className="h-2.5 bg-slate-200/50 dark:bg-white/[0.04] rounded-md w-1/2 mb-2" />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center gap-1.5">
            <div className="h-6 bg-slate-200/60 dark:bg-white/[0.06] rounded-lg flex-1" />
            <div className="h-6 bg-slate-200/60 dark:bg-white/[0.06] rounded-lg w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookCardGrid({
  books,
  isLoading,
  isError,
  error,
  onRetry,
}: BookCardGridProps) {
  const queryClient = useQueryClient();

  if (isLoading) {
    return <BookCardGridSkeleton />;
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
      <div className="py-16 glass-panel rounded-3xl text-center px-4 transition-colors duration-150">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No books cataloged</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No titles found matching the active search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {books.map((book) => (
        <BookCardItem
          key={book.id}
          book={book}
          onPrefetch={() => {
            queryClient.prefetchQuery({
              queryKey: [BOOKS_QUERY_KEY, book.id],
              queryFn: () => booksApi.getById(book.id),
              staleTime: 60 * 1000,
            });
          }}
        />
      ))}
    </div>
  );
}
