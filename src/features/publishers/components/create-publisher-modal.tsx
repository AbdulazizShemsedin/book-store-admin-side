'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publisherSchema, PublisherFormData } from '../schemas/publisher-schema';
import { publishersApi } from '../api/publishers-api';
import { useQueryClient } from '@tanstack/react-query';
import { PUBLISHERS_QUERY_KEY } from '../hooks/use-publishers';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Buildings, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CreatePublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onSuccess?: (createdPublisher: { id: string; name: string }) => void;
}

export function CreatePublisherModal({
  isOpen,
  onClose,
  initialName = '',
  onSuccess,
}: CreatePublisherModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: initialName || '',
    },
  });

  // Re-sync initial name whenever modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialName || '',
      });
    }
  }, [isOpen, initialName, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: PublisherFormData) => {
    try {
      const result = await publishersApi.create(data);
      queryClient.invalidateQueries({ queryKey: [PUBLISHERS_QUERY_KEY] });

      toast.success(`Publisher "${data.name}" registered successfully!`);

      if (onSuccess) {
        onSuccess({ id: result.id, name: data.name });
      }

      handleClose();
    } catch (err: any) {
      setError('name', {
        message: err?.message || 'Failed to register publisher. Please try again.',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register New Publisher"
      subtitle="Add a publishing house, imprint, or distribution partner to the catalog."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-950 dark:text-emerald-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0 text-emerald-800 dark:text-emerald-300">
            <Buildings className="w-4 h-4" weight="bold" />
          </div>
          <p className="text-[11px] leading-relaxed">
            The newly created publisher will immediately be linked to this book.
          </p>
        </div>

        <Input
          label="Publisher / Imprint Name"
          required
          placeholder="e.g. Darussalam Publishers"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            Create & Link Publisher
          </Button>
        </div>
      </form>
    </Modal>
  );
}
