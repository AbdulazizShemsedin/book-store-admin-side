'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publisherSchema, PublisherFormData } from '../schemas/publisher-schema';
import { useUpdatePublisher } from '../hooks/use-publishers';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Publisher } from '@/types/domain';
import { Buildings, FloppyDisk, CheckCircle } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

interface EditPublisherModalProps {
  publisher: Publisher | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPublisherModal({
  publisher,
  isOpen,
  onClose,
  onSuccess,
}: EditPublisherModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: publisher?.name || '',
    },
  });

  useEffect(() => {
    if (publisher) {
      reset({
        name: publisher.name || '',
      });
      setFormError(null);
      setFormSuccess(null);
    }
  }, [publisher, reset]);

  const updateMutation = useUpdatePublisher(() => {
    setFormSuccess('Publisher updated successfully!');
    if (onSuccess) {
      onSuccess();
    }
    setTimeout(() => {
      onClose();
    }, 900);
  });

  const onSubmit = async (data: PublisherFormData) => {
    if (!publisher) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      await updateMutation.mutateAsync({
        id: publisher.id,
        data,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors?.name) {
          setError('name', { message: err.fieldErrors.name });
        } else {
          setFormError(err.message);
        }
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update publisher. Please try again.');
      }
    }
  };

  if (!publisher) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Publisher"
      subtitle="Update distribution imprint or publishing house name"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            {formError}
          </div>
        )}

        {/* Publisher Identification Pill */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-100/80 dark:from-blue-950/60 dark:to-indigo-900/40 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 uppercase shadow-2xs flex-shrink-0">
            {publisher.monogram}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {publisher.name}
            </p>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              ID: {publisher.id}
            </p>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Publisher Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name')}
            placeholder="e.g., Dar Al-Tanweer, TEWBA Publications"
            error={errors.name?.message}
            leftIcon={<Buildings className="w-4 h-4 text-slate-400" />}
            autoFocus
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            className="text-xs bg-[#1e4634] hover:bg-[#163527] text-white"
          >
            <FloppyDisk className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
