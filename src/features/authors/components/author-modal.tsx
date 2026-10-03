'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authorSchema, AuthorFormData } from '../schemas/author-schema';
import { useCreateAuthor } from '../hooks/use-authors';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UploadSimple } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthorModal({ isOpen, onClose }: AuthorModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      nationality: 'Yemeni',
      bio: '',
    },
  });

  const createAuthorMutation = useCreateAuthor(() => {
    reset();
    onClose();
  });

  const onSubmit = async (data: AuthorFormData) => {
    setFormError(null);
    try {
      await createAuthorMutation.mutateAsync(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError('name', { message: err.fieldErrors.name });
        }
        setFormError(err.message);
      } else {
        setFormError('Failed to register author. Please check connectivity.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Author"
      subtitle="Register a new author to the system"
      maxWidth="md"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Author Full Name"
          required
          placeholder="e.g. Jane Smith"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Nationality"
          placeholder="e.g. Yemeni"
          helperText="Confirmed PM requirement: replaced Primary Genre and Joined Date"
          error={errors.nationality?.message}
          {...register('nationality')}
        />

        {/* Profile Photo Upload Placeholder */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Profile Photo
          </label>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
              <UploadSimple className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-700">Click to upload headshot</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP up to 5MB</p>
          </div>
        </div>

        <Textarea
          label="Biography & Notable Works"
          placeholder="Brief background, writing style, key published titles..."
          rows={3}
          error={errors.bio?.message}
          {...register('bio')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createAuthorMutation.isPending}
            className="bg-[#1e4634] hover:bg-[#153426]"
          >
            Save Author
          </Button>
        </div>
      </form>
    </Modal>
  );
}
