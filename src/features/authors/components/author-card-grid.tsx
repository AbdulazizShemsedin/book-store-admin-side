'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Author } from '@/types/domain';
import {
  User,
  GlobeHemisphereWest,
  BookOpen,
  ArrowRight,
  Eye,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import { ErrorState } from '@/components/ui/error-state';
import { useQueryClient } from '@tanstack/react-query';
import { AUTHORS_QUERY_KEY } from '../hooks/use-authors';
import { authorsApi } from '../api/authors-api';

interface AuthorCardGridProps {
  authors: Author[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AuthorCardItemProps {
  author: Author;
  onPrefetch: () => void;
  onEdit: (author: Author) => void;
  onDelete?: (author: Author) => void;
}

function AuthorCardItem({ author, onPrefetch, onEdit, onDelete }: AuthorCardItemProps) {
  return (
    <div
      onMouseEnter={onPrefetch}
      className="glass-panel glass-card-interactive group rounded-3xl p-4 flex flex-col justify-between overflow-hidden relative border border-white/80 dark:border-white/10 hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-2xs hover:shadow-xl hover:-translate-y-0.5"
    >
      <div>
        {/* Top Header: Avatar + Nationality & ID Badges */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/authors/${author.id}`}
            className="relative block flex-shrink-0 group/avatar"
          >
            {author.photoUrl ? (
              <Image
                src={author.photoUrl}
                alt={author.name}
                width={56}
                height={56}
                unoptimized
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/90 dark:border-white/10 shadow-sm group-hover/avatar:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shadow-2xs group-hover/avatar:scale-105 transition-transform duration-200 backdrop-blur-sm">
                {getInitials(author.name)}
              </div>
            )}
          </Link>

          <div className="flex flex-col items-end gap-1.5 min-w-0">
            {author.nationality && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/70 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 backdrop-blur-sm">
                <GlobeHemisphereWest className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span className="truncate max-w-[90px]">{author.nationality}</span>
              </span>
            )}
            <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-white/5">
              {author.id.length > 8 ? `${author.id.slice(0, 8)}...` : author.id}
            </span>
          </div>
        </div>

        {/* Author Name */}
        <div className="mt-3">
          <Link
            href={`/authors/${author.id}`}
            className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors line-clamp-1 leading-snug group-hover:underline block"
            title={author.name}
          >
            {author.name}
          </Link>

          {/* Bio snippet */}
          {author.bio ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal leading-relaxed">
              {author.bio}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-600 italic mt-1">
              No biography recorded
            </p>
          )}
        </div>

        {/* Catalog Works Link Pill */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.05]">
          <Link
            href={`/books?author_id=${encodeURIComponent(author.id)}&author_name=${encodeURIComponent(author.name)}`}
            className="inline-flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group/link"
            title={`View catalog books by ${author.name}`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>
                {author.worksCount !== undefined && author.worksCount > 0
                  ? `${author.worksCount} Works Cataloged`
                  : 'View Author Titles'}
              </span>
            </span>
            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-1.5">
        <Link
          href={`/authors/${author.id}`}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98] flex-1"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-700" />
          <span>Profile</span>
        </Link>

        <button
          type="button"
          onClick={() => onEdit(author)}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-white dark:hover:text-white bg-emerald-500/10 hover:bg-emerald-700 dark:hover:bg-emerald-600 border border-emerald-500/25 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
        >
          <PencilSimple className="w-3.5 h-3.5" weight="bold" />
          <span>Edit</span>
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(author)}
            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            title="Delete Author"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function AuthorCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="glass-panel rounded-3xl p-4 flex flex-col justify-between animate-pulse"
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06]" />
              <div className="h-5 w-20 rounded-full bg-slate-200/60 dark:bg-white/[0.06]" />
            </div>
            <div className="h-4 bg-slate-200/80 dark:bg-white/[0.08] rounded-md w-3/4 mb-2" />
            <div className="h-3 bg-slate-200/50 dark:bg-white/[0.04] rounded-md w-full mb-1" />
            <div className="h-3 bg-slate-200/40 dark:bg-white/[0.03] rounded-md w-2/3" />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center gap-2">
            <div className="h-7 bg-slate-200/60 dark:bg-white/[0.06] rounded-xl flex-1" />
            <div className="h-7 bg-slate-200/60 dark:bg-white/[0.06] rounded-xl w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuthorCardGrid({
  authors,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: AuthorCardGridProps) {
  const queryClient = useQueryClient();

  if (isLoading) {
    return <AuthorCardGridSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load authors"
        message={error?.message || 'Unable to retrieve authors from the server.'}
        onRetry={onRetry}
      />
    );
  }

  if (authors.length === 0) {
    return (
      <div className="py-16 glass-panel rounded-3xl text-center px-4 transition-colors duration-150">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No authors found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No author records match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4.5">
      {authors.map((author) => (
        <AuthorCardItem
          key={author.id}
          author={author}
          onPrefetch={() => {
            queryClient.prefetchQuery({
              queryKey: [AUTHORS_QUERY_KEY, author.id],
              queryFn: () => authorsApi.getById(author.id),
              staleTime: 60 * 1000,
            });
          }}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
