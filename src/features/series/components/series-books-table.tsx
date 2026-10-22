'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SeriesBook } from '@/types/domain';
import { useRemoveBookFromSeries } from '../hooks/use-series';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import {
  Trash,
  PencilSimple,
  BookOpen,
  Star,
  WarningCircle,
  Plus,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

interface SeriesBooksTableProps {
  seriesId: string;
  books: SeriesBook[];
  isLoading: boolean;
  onEditPosition: (book: SeriesBook) => void;
  onAddBookClick: () => void;
}

export function SeriesBooksTable({
  seriesId,
  books,
  isLoading,
  onEditPosition,
  onAddBookClick,
}: SeriesBooksTableProps) {
  const [bookToRemove, setBookToRemove] = useState<SeriesBook | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const removeMutation = useRemoveBookFromSeries(seriesId, () => {
    setBookToRemove(null);
    setRemoveError(null);
  });

  const handleConfirmRemove = async () => {
    if (!bookToRemove) return;
    setRemoveError(null);
    try {
      await removeMutation.mutateAsync(bookToRemove.id);
    } catch (err: any) {
      setRemoveError(err?.message || 'Failed to remove book from series.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121d] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-28">Volume #</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span className="text-xs">Loading volumes...</span>
                    </div>
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <BookOpen className="w-10 h-10 stroke-1" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No volumes in this series
                      </p>
                      <p className="text-xs max-w-sm">
                        Assign books from the catalog to build this serialized collection.
                      </p>
                      <Button
                        size="sm"
                        onClick={onAddBookClick}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="mt-2 bg-[#1e4634] hover:bg-[#153426] text-white"
                      >
                        Add First Volume
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Volume Badge */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#1e4634]/10 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        Vol. {book.position}
                      </span>
                    </td>

                    {/* Book Cover + Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {book.thumbnail ? (
                            <Image
                              src={book.thumbnail}
                              alt={book.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/books/${book.id}`}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#1e4634] dark:hover:text-emerald-400 transition-colors truncate block text-sm"
                          >
                            {book.name}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            {book.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {book.author || '—'}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{book.rating || '0.0'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditPosition(book)}
                          leftIcon={<PencilSimple className="w-3.5 h-3.5" />}
                          className="text-xs h-7 px-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          Change Pos
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBookToRemove(book)}
                          leftIcon={<Trash className="w-3.5 h-3.5 text-red-500" />}
                          className="text-xs h-7 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={Boolean(bookToRemove)}
        onClose={() => {
          setBookToRemove(null);
          setRemoveError(null);
        }}
        title="Remove Book from Series"
        subtitle="Are you sure you want to remove this book from the series? The book itself will remain intact in the catalog."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {removeError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/60">
              {removeError}
            </div>
          )}

          {bookToRemove && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <WarningCircle className="w-5 h-5" weight="bold" />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {bookToRemove.name}
                </p>
                <p className="text-slate-400">Position: Volume {bookToRemove.position}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setBookToRemove(null);
                setRemoveError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              isLoading={removeMutation.isPending}
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove from Series
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
