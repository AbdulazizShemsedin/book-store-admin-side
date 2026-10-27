'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Author } from '@/types/domain';
import { useBooks } from '@/features/books/hooks/use-books';
import {
  BookOpen,
  ArrowSquareOut,
  Headphones,
  User,
  Books,
  Sparkle,
  GlobeHemisphereWest,
  PencilSimple,
} from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';

interface AuthorDetailModalProps {
  author: Author | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (author: Author) => void;
}

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthorDetailModal({ author, isOpen, onClose, onEdit }: AuthorDetailModalProps) {
  // Lazily query books catalog only when modal is open, filtering by authorId
  const { data: booksData, isLoading: isLoadingBooks } = useBooks(
    {
      authorId: author?.id,
      pageSize: 8,
    },
    {
      enabled: isOpen && Boolean(author?.id),
    }
  );

  const authorBooks = useMemo(() => {
    if (!author || !booksData?.books) return [];
    const targetName = author.name.trim().toLowerCase();

    return booksData.books.filter((b) => {
      if (b.authorId && b.authorId === author.id) return true;
      if (b.author && b.author.trim().toLowerCase() === targetName) return true;
      return false;
    });
  }, [author, booksData?.books]);

  if (!author) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Author Profile & Publications"
      subtitle="Overview of biography, notable works, and catalog books"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Author Header Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          {/* Profile Photo / Avatar */}
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={author.name}
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1e4634] dark:text-emerald-300 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center font-bold text-lg flex-shrink-0">
              {getInitials(author.name)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{author.name}</h2>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                {author.id.length > 12 ? `${author.id.slice(0, 8)}...` : author.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                <GlobeHemisphereWest className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {author.nationality || 'Yemeni'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Badge variant="default" size="sm" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                <Books className="w-3 h-3 text-emerald-700 dark:text-emerald-400 mr-1" />
                {authorBooks.length > 0 ? `${authorBooks.length} Books Recorded` : `${author.worksCount ?? 1} Published Works`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Biography & Notable Works Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Sparkle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" weight="fill" />
            <span>Biography & Notable Works</span>
          </div>

          {author.bio ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 shadow-2xs">
              <p className="whitespace-pre-line">{author.bio}</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 italic">
              No biography or notable works summary recorded for this author.
            </div>
          )}
        </div>

        {/* Books List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" weight="bold" />
              <span>Catalog Books by this Author ({authorBooks.length})</span>
            </div>
            <Link
              href={`/books?author_id=${encodeURIComponent(author.id)}&author_name=${encodeURIComponent(author.name)}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 transition-colors shadow-2xs"
            >
              <span>View all in books catalog</span>
              <ArrowSquareOut className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingBooks ? (
            <div className="py-8 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-900/30 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <Spinner size="sm" />
              <p className="mt-2 text-xs text-slate-400">Loading catalog books...</p>
            </div>
          ) : authorBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {authorBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
                >
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.name}
                      width={36}
                      height={48}
                      unoptimized
                      className="w-9 h-12 rounded object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-12 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 truncate">
                      {book.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {book.publisher || 'Independent Press'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {book.language || 'ar'}
                      </span>
                      {book.hasAudiobook && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          <Headphones className="w-2.5 h-2.5" /> Audio
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No active books in the catalog currently reference this author.
              </p>
              <Link
                href="/books/new"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e4634] dark:text-emerald-400 hover:underline"
                title="Register a new book in the catalog"
              >
                <span>Register a new book for this author</span>
                <ArrowSquareOut className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(author)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
                title="Edit author profile details and avatar"
              >
                <PencilSimple className="w-3.5 h-3.5" />
                <span>Edit Author</span>
              </button>
            )}
            <Link
              href={`/authors/${author.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1e4634] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg transition-colors"
            >
              <span>Full Profile Page</span>
              <ArrowSquareOut className="w-3.5 h-3.5" />
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Close popup"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
