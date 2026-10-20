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
              <span>View in catalog</span>
              <ArrowSquareOut className="w-3 h-3" />
            </Link>
          </div>

          {isLoadingBooks ? (
            <div className="py-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800">
              <Spinner size="md" />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Retrieving author publication list...</p>
            </div>
          ) : authorBooks.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-2xs overflow-hidden max-h-64 overflow-y-auto">
              {authorBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-11 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors shadow-2xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/books/${book.id}`}
                        onClick={onClose}
                        className="font-semibold text-xs text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors line-clamp-1 group-hover:underline"
                        title={book.name}
                      >
                        {book.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={book.status || 'Published'} />
                        {book.hasAudiobook && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/60">
                            <Headphones className="w-2.5 h-2.5" />
                            Audiobook
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/books/${book.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1e4634] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-[#1e4634] dark:hover:bg-emerald-700 hover:text-white dark:hover:text-white border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg transition-all flex-shrink-0 shadow-2xs"
                    title={`View details for ${book.name}`}
                  >
                    <span>View Book</span>
                    <ArrowSquareOut className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No catalog books are currently linked to <span className="font-semibold text-slate-700 dark:text-slate-300">{author.name}</span>.
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
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(author)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
              title="Edit author profile details and avatar"
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>Edit Author</span>
            </button>
          ) : <div />}
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
