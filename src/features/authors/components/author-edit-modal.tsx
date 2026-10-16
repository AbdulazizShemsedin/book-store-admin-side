'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { authorSchema, AuthorFormData } from '../schemas/author-schema';
import { authorsApi } from '../api/authors-api';
import { useUpdateAuthor, AUTHORS_QUERY_KEY } from '../hooks/use-authors';
import { useBooks } from '@/features/books/hooks/use-books';
import { getAuthorSuggestionByBookNames, AuthorSuggestion } from '../utils/author-recovery-map';
import { NationalityCombobox } from './nationality-combobox';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Author } from '@/types/domain';
import {
  UploadSimple,
  CheckCircle,
  FloppyDisk,
  User,
  BookOpen,
  Sparkle,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

interface AuthorEditModalProps {
  author: Author | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuthorEditModal({ author, isOpen, onClose }: AuthorEditModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(author?.photoUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load books catalog to identify which book(s) are linked to this author
  const { data: booksData } = useBooks({ pageSize: 100 });

  const linkedBooks = useMemo(() => {
    if (!author || !booksData?.books) return [];
    return booksData.books.filter((b) => b.authorId === author.id);
  }, [author, booksData?.books]);

  const authorSuggestion = useMemo(() => {
    if (!linkedBooks.length) return null;
    return getAuthorSuggestionByBookNames(linkedBooks.map((b) => b.name));
  }, [linkedBooks]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: author?.name || '',
      nationality: author?.nationality || 'Yemeni',
      bio: author?.bio || '',
      photoUrl: author?.photoUrl || '',
    },
  });

  const handleApplySuggestion = (sug: AuthorSuggestion) => {
    setValue('name', sug.name, { shouldValidate: true });
    setValue('nationality', sug.nationality, { shouldValidate: true });
    setValue('bio', sug.bio, { shouldValidate: true });
  };

  // Re-sync form when author prop changes
  useEffect(() => {
    if (author) {
      reset({
        name: author.name || '',
        nationality: author.nationality || 'Yemeni',
        bio: author.bio || '',
        photoUrl: author.photoUrl || '',
      });
      setAvatarPreview(author.photoUrl || null);
      setAvatarSuccess(false);
      setAvatarError(null);
      setFormError(null);
      setFormSuccess(null);
    }
  }, [author, reset]);

  const updateMutation = useUpdateAuthor(() => {
    setFormSuccess('Author profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1200);
  });

  // Handle immediate avatar upload via POST /admin/api/author/{id}/avatar
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !author) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Photo size must not exceed 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);
    setAvatarError(null);
    setAvatarSuccess(false);

    try {
      await authorsApi.uploadAvatar(author.id, file);
      setAvatarSuccess(true);
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload author photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: AuthorFormData) => {
    if (!author) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      await updateMutation.mutateAsync({
        authorId: author.id,
        data,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError('name', { message: err.fieldErrors.name });
        }
        setFormError(err.message);
      } else {
        setFormError('Failed to update author. Please check connectivity.');
      }
    }
  };

  if (!author) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit: ${author.name}`}
      subtitle="Update credentials, nationality, or profile headshot"
      maxWidth="md"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" weight="fill" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Historical Relink Suggestion Banner */}
      {authorSuggestion && linkedBooks.length > 0 && (
        <div className="mb-4 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start justify-between gap-3 text-xs shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Sparkle className="w-4 h-4 text-amber-600 flex-shrink-0" weight="fill" />
              <span>Linked Catalog Book: &quot;{linkedBooks.map((b) => b.name).join(', ')}&quot;</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Original author matched: <strong className="text-amber-950">{authorSuggestion.name}</strong> ({authorSuggestion.nationality})
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleApplySuggestion(authorSuggestion)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs flex-shrink-0"
            title="Auto-fill this author with the verified original details"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" weight="bold" />
            <span>Auto-fill Original</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Headshot Quick Manager */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <div className="relative flex-shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={author.name}
                width={56}
                height={56}
                unoptimized
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-300">
                <User className="w-6 h-6" />
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900">Profile Photo</p>
            <p className="text-[11px] text-slate-500">
              {avatarSuccess ? '✓ Photo updated on backend' : 'Displayed in catalog feeds'}
            </p>
            {avatarError && <p className="text-[11px] text-red-600 mt-0.5">{avatarError}</p>}
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            isLoading={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
            className="text-xs h-8 px-2.5"
          >
            {avatarPreview ? 'Change' : 'Upload'}
          </Button>
        </div>

        <Input
          label="Author Full Name"
          required
          placeholder="e.g. Imam Muslim ibn al-Hajjaj"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          name="nationality"
          control={control}
          render={({ field }) => (
            <NationalityCombobox
              value={field.value}
              onChange={field.onChange}
              error={errors.nationality?.message}
              helperText="Select or search country of origin or literary heritage"
            />
          )}
        />

        <Textarea
          label="Biography & Notable Works"
          placeholder="Brief background, scholarly works, or notable published titles..."
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
            isLoading={updateMutation.isPending}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
            leftIcon={<FloppyDisk className="w-3.5 h-3.5" weight="bold" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
