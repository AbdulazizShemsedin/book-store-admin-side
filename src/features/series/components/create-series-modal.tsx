'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSeriesSchema, CreateSeriesFormData } from '../schemas/series-schema';
import { useCreateSeries } from '../hooks/use-series';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Books } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSeriesId: string) => void;
}

export function CreateSeriesModal({ isOpen, onClose, onSuccess }: CreateSeriesModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateSeriesFormData>({
    resolver: zodResolver(createSeriesSchema),
    defaultValues: {
      name: '',
    },
  });

  const seriesName = watch('name') || '';

  const createMutation = useCreateSeries((newId) => {
    reset();
    setFormError(null);
    onClose();
    if (onSuccess) {
      onSuccess(newId);
    }
  });

  const handleModalClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (data: CreateSeriesFormData) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Failed to create series.');
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred while creating the series.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create Book Series"
      subtitle="Create a collection for multi-volume book sets or serialized publications."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/60">
            {formError}
          </div>
        )}

        <div className="space-y-1">
          <Input
            label="Series Title"
            required
            placeholder="e.g. History of Ethiopia, Tafsir Ibn Kathir"
            error={errors.name?.message}
            maxLength={128}
            {...register('name')}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 px-0.5">
            <span>Name of the umbrella series</span>
            <span>{seriesName.length} / 128</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            leftIcon={<Books className="w-4 h-4" />}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            Create Series
          </Button>
        </div>
      </form>
    </Modal>
  );
}
