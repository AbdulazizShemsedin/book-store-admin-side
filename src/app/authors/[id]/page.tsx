'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuthor, useDeleteAuthor } from '@/features/authors/hooks/use-authors';
import { useBooks } from '@/features/books/hooks/use-books';
import { AuthorEditModal } from '@/features/authors/components/author-edit-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  User,
  ArrowLeft,
  PencilSimple,
  BookOpen,
  Copy,
  Check,
  GlobeHemisphereWest,
  Headphones,
  FileText,
  ArrowSquareOut,
  IdentificationCard,
  Trash,
} from '@phosphor-icons/react';

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AuthorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const authorId = params?.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const {
    data: author,
    isLoading: isLoadingAuthor,
    isError: isAuthorError,
    refetch,
  } = useAuthor(authorId);

  const deleteAuthorMutation = useDeleteAuthor(() => {
    router.push('/authors');
  });

  const { data: booksData, isLoading: isLoadingBooks } = useBooks({
    authorId,
    pageSize: 100,
  });

  const authorBooks = useMemo(() => {
    if (!author || !booksData?.books) return [];
    const targetName = author.name.trim().toLowerCase();

    return booksData.books.filter((b) => {
      if (b.authorId && b.authorId === author.id) return true;
      if (b.author && b.author.trim().toLowerCase() === targetName) return true;
      return false;
    });
  }, [author, booksData?.books]);

  const handleCopyId = () => {
    if (!author?.id) return;
    navigator.clipboard.writeText(author.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDelete = () => {
    if (!author) return;
    if (confirm(`Are you sure you want to delete author "${author.name}"? This action cannot be undone.`)) {
      deleteAuthorMutation.mutate(author.id);
    }
  };

  if (isLoadingAuthor) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Loading author profile...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Fetching registered author information
          </p>
        </div>
      </AdminShell>
    );
  }

  if (isAuthorError || !author) {
    return (
      <AdminShell>
        <div className="p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Author Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requested author profile could not be found or retrieved from the server.
          </p>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/authors')}
          >
            Back to Authors Directory
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Navigation & Back Button */}
        <div>
          <Link href="/authors">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-2"
            >
              Back to Authors Directory
            </Button>
          </Link>
        </div>

        {/* Author Profile Banner */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121d] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-start gap-4">
              {/* Photo / Monogram Avatar */}
              {author.photoUrl ? (
                <Image
                  src={author.photoUrl}
                  alt={author.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-emerald-950/70 dark:to-teal-900/50 text-[#1e4634] dark:text-emerald-300 font-extrabold text-xl flex items-center justify-center border-2 border-emerald-200/80 dark:border-emerald-800/80 uppercase shadow-xs flex-shrink-0">
                  {getInitials(author.name)}
                </div>
              )}

              {/* Author Details */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    {author.name}
                  </h1>
                  {author.nationality && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                      <GlobeHemisphereWest className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{author.nationality}</span>
                    </span>
                  )}
                  <Badge variant="default">
                    {authorBooks.length} {authorBooks.length === 1 ? 'Work' : 'Works'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    ID: {author.id}
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy Author ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    Registered Catalog Contributor
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<PencilSimple className="w-4 h-4" weight="bold" />}
                className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs"
              >
                Edit Author
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                isLoading={deleteAuthorMutation.isPending}
                leftIcon={<Trash className="w-4 h-4" />}
                className="text-xs border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121d] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <IdentificationCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Biography & Background</span>
          </div>

          {author.bio ? (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {author.bio}
            </p>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
              No biography or background details recorded for this author yet. Click &ldquo;Edit Author&rdquo; to add one.
            </div>
          )}
        </div>

        {/* Cataloged Works Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cataloged Works
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publications authored by {author.name}
              </p>
            </div>
            <Link
              href={`/books/new?author_id=${encodeURIComponent(author.id)}&author_name=${encodeURIComponent(author.name)}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline"
            >
              Add Book for Author &rarr;
            </Link>
          </div>

          {isLoadingBooks ? (
            <div className="py-16 bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center">
              <Spinner size="md" />
              <p className="mt-2 text-xs text-slate-400">Loading catalog works...</p>
            </div>
          ) : authorBooks.length === 0 ? (
            <div className="py-16 bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm text-center px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No works found
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No books have been registered for this author yet.
              </p>
              <div className="mt-4">
                <Link href={`/books/new?author_id=${encodeURIComponent(author.id)}`}>
                  <Button size="sm" className="text-xs bg-[#1e4634] hover:bg-[#153426] text-white">
                    Publish a Book
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#070a10] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-5">Book Title</th>
                      <th className="py-3 px-4">Publisher</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Formats</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {authorBooks.map((book) => (
                      <tr
                        key={book.id}
                        className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            {book.coverUrl || book.thumbnail ? (
                              <Image
                                src={book.coverUrl || book.thumbnail || ''}
                                alt={book.name}
                                width={32}
                                height={44}
                                unoptimized
                                className="w-8 h-11 rounded object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-11 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                href={`/books/${book.id}`}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 group-hover:underline transition-colors block truncate"
                              >
                                {book.name}
                              </Link>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                {book.id.length > 8 ? `${book.id.slice(0, 8)}...` : book.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {book.publisher || <span className="text-slate-400 italic">Independent</span>}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 uppercase">
                            {book.language || 'ar'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {book.assets?.book && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50"
                                title="Digital eBook Available"
                              >
                                <FileText className="w-3 h-3" />
                                <span>eBook</span>
                              </span>
                            )}
                            {(book.hasAudiobook || book.assets?.audio) && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50"
                                title="Audiobook Available"
                              >
                                <Headphones className="w-3 h-3" />
                                <span>Audio</span>
                              </span>
                            )}
                            {!book.assets?.book && !book.hasAudiobook && !book.assets?.audio && (
                              <span className="text-slate-400 text-[10px] italic">—</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                            {book.status || 'Published'}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          <Link
                            href={`/books/${book.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all"
                          >
                            <span>Details</span>
                            <ArrowSquareOut className="w-3.5 h-3.5 text-slate-500" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Author Edit Modal */}
      <AuthorEditModal
        author={author}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
      />
    </AdminShell>
  );
}
