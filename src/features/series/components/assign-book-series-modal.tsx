'use client';

import React, { useState } from 'react';
import { useAllSeries, useAddBookToSeries } from '../hooks/use-series';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Books, Hash } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

interface AssignBookSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
  onSuccess?: () => void;
}

export function AssignBookSeriesModal({
  isOpen,
  onClose,
  bookId,
  bookName,
  onSuccess,
}: AssignBookSeriesModalProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [position, setPosition] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: seriesList = [], isLoading: isLoadingSeries } = useAllSeries();

  const handleModalClose = () => {
    setSelectedSeriesId('');
    setPosition(1);
    setFormError(null);
    onClose();
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesId) {
      setFormError('Please select a series');
      return;
    }
    if (position < 1 || position > 128) {
      setFormError('Position must be between 1 and 128');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { seriesApi } = await import('../api/series-api');
      await seriesApi.addBook(selectedSeriesId, {
        bookId,
        position: Number(position),
      });

      handleModalClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Failed to assign book to series.');
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Assign Book to Series"
      subtitle={`Add "${bookName}" to a serialized book set or multi-volume publication.`}
      maxWidth="md"
    >
      <form onSubmit={handleAssign} className="space-y-4 pt-2">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/60">
            {formError}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Series <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            disabled={isLoadingSeries}
            className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e4634]/20 dark:focus:ring-emerald-500/20 focus:border-[#1e4634] dark:focus:border-emerald-500 transition-colors"
          >
            <option value="">
              {isLoadingSeries ? 'Loading series...' : '-- Select a series --'}
            </option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Input
            label="Volume Position (1-128)"
            type="number"
            min={1}
            max={128}
            required
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Enter 1 for Volume 1, 2 for Volume 2, etc.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!selectedSeriesId}
            leftIcon={<Books className="w-4 h-4" />}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            Assign to Series
          </Button>
        </div>
      </form>
    </Modal>
  );
}
