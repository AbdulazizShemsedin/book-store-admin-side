'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Author } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, Eye, GlobeHemisphereWest, PencilSimple } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { AuthorDetailModal } from './author-detail-modal';
import { AuthorEditModal } from './author-edit-modal';
import { useBooks } from '@/features/books/hooks/use-books';
import { cn } from '@/lib/utils/cn';

interface AuthorTableProps {
  authors: Author[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (author: Author) => void;
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
}: AuthorTableProps) {
  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Load books catalog to map book titles to their corresponding authorId
  const { data: booksData } = useBooks({ pageSize: 100 });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Loading authors directory...</p>
        <p className="mt-1 text-xs text-slate-400">Retrieving registered authors from backend</p>
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
      <div className="py-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-center px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-400 flex items-center justify-center mb-3">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No authors found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Get started by registering your first author into the directory.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Author</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">Catalog Works</th>
                <th className="py-3 px-5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {authors.map((author) => {
                const linkedBooks = (booksData?.books || []).filter((b) => b.authorId === author.id);

                return (
                  <tr
                    key={author.id}
                    className="hover:bg-emerald-50/20 transition-colors group"
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
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-50 to-emerald-100/90 text-emerald-800 border border-emerald-200/70 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                            {getInitials(author.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingAuthor(author)}
                              className="font-bold text-slate-900 hover:text-emerald-800 transition-colors block text-xs group-hover:underline text-left truncate"
                            >
                              {author.name}
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {author.id.length > 8 ? `${author.id.slice(0, 8)}...` : author.id}
                            </span>
                          </div>
                          {author.bio ? (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md font-normal">
                              {author.bio}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-300 italic">No biography added</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Nationality */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {author.nationality ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          <GlobeHemisphereWest className="w-3.5 h-3.5 text-slate-500" />
                          <span>{author.nationality}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Catalog Works & Linked Books */}
                    <td className="py-3.5 px-4">
                      {linkedBooks.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {linkedBooks.map((b) => (
                            <span
                              key={b.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#1e4634] border border-emerald-200/80 shadow-2xs max-w-[220px]"
                              title={`Linked book in catalog: ${b.name}`}
                            >
                              <BookOpen className="w-3 h-3 text-[#1e4634] flex-shrink-0" />
                              <span className="truncate">{b.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : author.worksCount !== undefined ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <BookOpen className="w-3 h-3 text-emerald-700" />
                          <span>{author.worksCount} Titles</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No books linked</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingAuthor(author)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 shadow-2xs transition-all active:scale-[0.98]"
                          title="View author profile & books"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-700" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAuthor(author)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#1e4634] hover:text-white bg-emerald-50 hover:bg-[#1e4634] border border-emerald-200 shadow-2xs transition-all active:scale-[0.98]"
                          title="Edit author profile & photo"
                        >
                          <PencilSimple className="w-3.5 h-3.5" weight="bold" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Details Modal */}
      <AuthorDetailModal
        author={viewingAuthor}
        isOpen={Boolean(viewingAuthor)}
        onClose={() => setViewingAuthor(null)}
        onEdit={(auth) => {
          setViewingAuthor(null);
          setEditingAuthor(auth);
        }}
      />

      {/* Author Edit Modal */}
      <AuthorEditModal
        author={editingAuthor}
        isOpen={Boolean(editingAuthor)}
        onClose={() => setEditingAuthor(null)}
      />
    </>
  );
}
