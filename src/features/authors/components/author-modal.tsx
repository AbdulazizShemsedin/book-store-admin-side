'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authorSchema, AuthorFormData } from '../schemas/author-schema';
import { NationalityCombobox } from './nationality-combobox';
import { authorsApi } from '../api/authors-api';
import { useQueryClient } from '@tanstack/react-query';
import { AUTHORS_QUERY_KEY } from '../hooks/use-authors';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  UploadSimple,
  CheckCircle,
  ArrowRight,
  Check,
  User,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreatedAuthorState {
  id: string;
  name: string;
  nationality?: string;
}

export function AuthorModal({ isOpen, onClose }: AuthorModalProps) {
  const queryClient = useQueryClient();

  // Step 1 vs Step 2 Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [createdAuthor, setCreatedAuthor] = useState<CreatedAuthorState | null>(null);

  // Form error state
  const [formError, setFormError] = useState<string | null>(null);

  // Step 2 Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarUploaded, setIsAvatarUploaded] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      nationality: 'Yemeni',
      bio: '',
      photoUrl: '',
    },
  });

  const handleResetModal = () => {
    reset();
    setCurrentStep(1);
    setCreatedAuthor(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsAvatarUploaded(false);
    setFormError(null);
    setAvatarError(null);
    onClose();
  };

  // STEP 1 SUBMIT: Register Author Metadata via POST /admin/api/author
  const onStep1Submit = async (data: AuthorFormData) => {
    setFormError(null);
    try {
      const result = await authorsApi.createRecord(data);
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
      setCreatedAuthor({
        id: result.id,
        name: data.name,
        nationality: data.nationality,
      });
      setCurrentStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError('name', { message: err.fieldErrors.name });
        }
        setFormError(err.message);
      } else {
        setFormError('Failed to register author. Please check your network connectivity.');
      }
    }
  };

  // STEP 2: Handle Profile Photo Selection & Upload via POST /admin/api/author/{id}/avatar
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdAuthor) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Photo size must not exceed 5MB.');
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Auto-upload immediately with created author ID
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      await authorsApi.uploadAvatar(createdAuthor.id, file);
      setIsAvatarUploaded(true);
      queryClient.invalidateQueries({ queryKey: [AUTHORS_QUERY_KEY] });
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFinish = () => {
    handleResetModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={currentStep === 1 ? 'Add Author' : 'Upload Author Photo'}
      subtitle={
        currentStep === 1
          ? 'Step 1 of 2: Register author credentials & biography'
          : `Step 2 of 2: Attach headshot for ${createdAuthor?.name}`
      }
      maxWidth="md"
    >
      {/* 2-Step Stepper Header */}
      <div className="flex items-center justify-between mb-5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs',
              currentStep === 1
                ? 'bg-[#1e4634] text-white shadow-2xs'
                : 'bg-emerald-100 text-[#1e4634]'
            )}
          >
            {currentStep === 2 ? <Check className="w-3.5 h-3.5" weight="bold" /> : '1'}
          </div>
          <span className={cn('font-semibold', currentStep === 1 ? 'text-slate-900' : 'text-slate-600')}>
            Author Details
          </span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs',
              currentStep === 2
                ? 'bg-[#1e4634] text-white shadow-2xs'
                : 'bg-slate-200 text-slate-500'
            )}
          >
            2
          </div>
          <span className={cn('font-semibold', currentStep === 2 ? 'text-slate-900' : 'text-slate-400')}>
            Profile Photo
          </span>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          {formError}
        </div>
      )}

      {/* STEP 1: Metadata Form */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
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
            <Button type="button" variant="secondary" onClick={handleResetModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-[#1e4634] hover:bg-[#153426] text-white"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Save Author & Continue
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: Profile Picture Upload */}
      {currentStep === 2 && createdAuthor && (
        <div className="space-y-5">
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" weight="fill" />
              <span>
                Author record created with ID: <strong>{createdAuthor.id.slice(0, 8)}...</strong>
              </span>
            </div>
          </div>

          {avatarError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {avatarError}
            </div>
          )}

          {/* Profile Photo Upload Target */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#1e4634] transition-colors bg-slate-50/50">
              {avatarPreview ? (
                <div className="relative group">
                  <Image
                    src={avatarPreview}
                    alt="Author preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                      <Spinner size="md" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2 cursor-pointer hover:bg-emerald-50 hover:text-[#1e4634] transition-colors border border-slate-200"
                >
                  <User className="w-10 h-10 stroke-1" />
                </div>
              )}

              <p className="text-xs font-semibold text-slate-800 mt-3">
                {isAvatarUploaded ? 'Profile photo uploaded successfully!' : 'Select Author Headshot'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                isLoading={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                className="mt-3 text-xs h-8"
              >
                {avatarPreview ? 'Change Headshot' : 'Choose Headshot'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={handleFinish} className="text-xs text-slate-500">
              Skip for now
            </Button>
            <Button
              type="button"
              onClick={handleFinish}
              className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-9"
              leftIcon={<Check className="w-3.5 h-3.5" weight="bold" />}
            >
              Finish & View Directory
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
