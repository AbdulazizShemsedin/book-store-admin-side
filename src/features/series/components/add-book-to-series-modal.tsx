'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addBookToSeriesSchema, AddBookToSeriesFormData } from '../schemas/series-schema';
import { useAddBookToSeries } from '../hooks/use-series';
import { useBooks } from '@/features/books/hooks/use-books';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Hash, BookmarkSimple, BookOpen } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

interface AddBookToSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  seriesName?: string;
  defaultPosition?: number;
  existingBook?: {
    id: string;
    name: string;
    position: number;
  } | null;
  onSuccess?: () => void;
}

export function AddBookToSeriesModal({
  isOpen,
  onClose,
  seriesId,
  seriesName,
  defaultPosition = 1,
  existingBook,
  onSuccess,
}: AddBookToSeriesModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [bookSearch, setBookSearch] = useState('');

  // Fetch available books from the catalog
  const { data: booksData, isLoading: isLoadingBooks } = useBooks({
    pageSize: 100,
  });

  const allBooks = booksData?.books || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddBookToSeriesFormData>({
    resolver: zodResolver(addBookToSeriesSchema),
    defaultValues: {
      bookId: existingBook?.id || '',
      position: existingBook?.position || defaultPosition,
    },
  });

  const selectedBookId = watch('bookId');

  useEffect(() => {
    if (isOpen) {
      reset({
        bookId: existingBook?.id || '',
        position: existingBook?.position || defaultPosition,
      });
      setFormError(null);
      setBookSearch('');
    }
  }, [isOpen, existingBook, defaultPosition, reset]);

  const addMutation = useAddBookToSeries(seriesId, () => {
    reset();
    setFormError(null);
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  });

  const handleModalClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (data: AddBookToSeriesFormData) => {
    setFormError(null);
    try {
      await addMutation.mutateAsync({
        bookId: data.bookId,
        position: Number(data.position),
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Failed to add book to series.');
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred.');
      }
    }
  };

  const filteredBooks = allBooks.filter((b) =>
    b.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (b.author && b.author.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const selectedBook = allBooks.find((b) => b.id === selectedBookId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={existingBook ? `Update Volume Position` : `Add Volume to Series`}
      subtitle={
        seriesName
          ? `Series: ${seriesName}`
          : 'Assign a book and its volume order number to this series.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/60">
            {formError}
          </div>
        )}

        {/* If editing an existing book's position, show static book info */}
        {existingBook ? (
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e4634]/10 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <BookmarkSimple className="w-5 h-5" weight="bold" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Selected Book
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {existingBook.name}
              </p>
            </div>
          </div>
        ) : (
          /* Book selection with search */
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Book <span className="text-red-500">*</span>
            </label>

            <Input
              placeholder="Search books by title or author..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="text-xs"
            />

            {/* Book picker list */}
            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
              {isLoadingBooks ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Loading books from catalog...
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No books found matching &quot;{bookSearch}&quot;
                </div>
              ) : (
                filteredBooks.map((b) => {
                  const isSelected = selectedBookId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setValue('bookId', b.id, { shouldValidate: true })}
                      className={cn(
                        'w-full text-left px-3 py-2.5 flex items-center justify-between text-xs transition-colors',
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-300 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-medium">{b.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {b.author || 'Unknown Author'} &bull; {b.language || 'English'}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e4634] text-white">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {errors.bookId && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                {errors.bookId.message}
              </p>
            )}

            {selectedBook && !existingBook && (
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                Selected: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedBook.name}</span>
              </p>
            )}
          </div>
        )}

        {/* Volume Position Input */}
        <div className="space-y-1">
          <Input
            label="Volume / Position Number"
            type="number"
            min={1}
            max={128}
            required
            placeholder="1"
            leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
            error={errors.position?.message}
            {...register('position')}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Integer between 1 and 128 (e.g., 1 for Vol. 1, 2 for Vol. 2).
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={addMutation.isPending}
            disabled={!selectedBookId}
            leftIcon={existingBook ? <BookOpen className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            {existingBook ? 'Save Position' : 'Add to Series'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
