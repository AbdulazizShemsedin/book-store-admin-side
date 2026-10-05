'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      nationality: 'Yemeni',
      bio: '',
      photoUrl: '',
    },
  });

  const createAuthorMutation = useCreateAuthor(() => {
    reset();
    setPhotoPreview(null);
    onClose();
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Photo size must not exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue('photoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setValue('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: AuthorFormData) => {
    setFormError(null);
    try {
      await createAuthorMutation.mutateAsync({
        ...data,
        photoUrl: photoPreview || undefined,
      });
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

        {/* Profile Photo Upload */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Profile Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          {photoPreview ? (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Image
                src={photoPreview}
                alt="Author preview"
                width={56}
                height={56}
                unoptimized
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">Profile photo ready</p>
                <p className="text-[11px] text-slate-500">Will be displayed beside author name in catalog</p>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove profile photo"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50 cursor-pointer"
              title="Click to select profile photo"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                <UploadSimple className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-700">Click to upload headshot</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP up to 5MB</p>
            </div>
          )}
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
