'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { advertisementSchema, AdvertisementFormData } from '../schemas/advertisement-schema';
import { advertisementsApi } from '../api/advertisements-api';
import { useQueryClient } from '@tanstack/react-query';
import { ADS_QUERY_KEY } from '../hooks/use-advertisements';
import { useBooks } from '@/features/books/hooks/use-books';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  Megaphone,
  UploadSimple,
  CheckCircle,
  ArrowRight,
  Check,
  Link,
  BookOpen,
  Sparkle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

interface CreateAdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAdvertisementModal({ isOpen, onClose }: CreateAdvertisementModalProps) {
  const queryClient = useQueryClient();
  const { data: booksData } = useBooks({ page: 1, pageSize: 50 });
  const books = booksData?.books || [];

  // Wizard state: Step 1 (Record details) -> Step 2 (Banner upload)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [createdAdMessage, setCreatedAdMessage] = useState<string>('');

  // Step 2 banner state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isBannerUploaded, setIsBannerUploaded] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdvertisementFormData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      message: '',
      buttonLabel: '',
      activeUntil: '',
      actionType: 'subscription',
      actionUrl: '',
      actionBookId: '',
    },
  });

  const watchedActionType = watch('actionType');

  const handleResetModal = () => {
    reset();
    setCurrentStep(1);
    setCreatedAdId(null);
    setCreatedAdMessage('');
    setBannerFile(null);
    setBannerPreview(null);
    setIsUploadingBanner(false);
    setIsBannerUploaded(false);
    setBannerError(null);
    setStep1Error(null);
    onClose();
  };

  // STEP 1 SUBMIT: Calls documented POST /admin/api/advertisement
  const onStep1Submit = async (data: AdvertisementFormData) => {
    setStep1Error(null);
    try {
      const result = await advertisementsApi.createRecord(data);
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
      setCreatedAdId(result.id);
      setCreatedAdMessage(data.message);
      setCurrentStep(2);
    } catch (err) {
      setStep1Error(
        err instanceof Error ? err.message : 'Failed to create advertisement record on backend.'
      );
    }
  };

  // STEP 2 SUBMIT: Calls documented PUT /admin/api/advertisement/{id}/banner
  const onStep2Upload = async () => {
    if (!createdAdId || !bannerFile) return;
    setIsUploadingBanner(true);
    setBannerError(null);

    try {
      await advertisementsApi.uploadBanner(createdAdId, bannerFile);
      setIsBannerUploaded(true);
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
      setTimeout(() => {
        handleResetModal();
      }, 1400);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Banner upload failed. Ensure format is PNG, JPG, or WebP.'
      );
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={currentStep === 1 ? 'New Promotional Advertisement' : 'Upload Advertisement Banner'}
      subtitle={currentStep === 1 ? 'Step 1 of 2: Campaign message and action destination' : 'Step 2 of 2: Upload banner image'}
      maxWidth="lg"
    >
      {/* Wizard Progress Bar */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div
          className={cn(
            'flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
            currentStep === 1
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-[#1e4634] dark:text-emerald-300 ring-1 ring-emerald-600/30'
              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
          )}
        >
          <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] shadow-xs">
            {currentStep > 1 ? <Check className="w-3 h-3 text-emerald-600" /> : '1'}
          </span>
          <span>1. Campaign Details</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

        <div
          className={cn(
            'flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
            currentStep === 2
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-[#1e4634] dark:text-emerald-300 ring-1 ring-emerald-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          )}
        >
          <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] shadow-xs">
            2
          </span>
          <span>2. Banner Image</span>
        </div>
      </div>

      {/* STEP 1: CAMPAIGN DETAILS FORM */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
          {step1Error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs border border-red-200 dark:border-red-800/60 font-medium">
              {step1Error}
            </div>
          )}

          {/* Campaign Message */}
          <Input
            label="Ad Message / Title"
            required
            placeholder="e.g. Ramadan Book Fair — 30% OFF Classical Works"
            helperText="Appears as primary promotional title on mobile home banner (1–128 characters)"
            error={errors.message?.message}
            {...register('message')}
          />

          {/* Action Destination Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              When Tapped: Action Destination <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border text-xs cursor-pointer transition-all text-center',
                  watchedActionType === 'subscription'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-300 font-semibold ring-1 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                )}
              >
                <input
                  type="radio"
                  value="subscription"
                  className="sr-only"
                  {...register('actionType')}
                />
                <Sparkle className="w-4 h-4 mb-1" />
                <span>Subscription Plan</span>
              </label>

              <label
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border text-xs cursor-pointer transition-all text-center',
                  watchedActionType === 'book_detail'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-300 font-semibold ring-1 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                )}
              >
                <input
                  type="radio"
                  value="book_detail"
                  className="sr-only"
                  {...register('actionType')}
                />
                <BookOpen className="w-4 h-4 mb-1" />
                <span>Specific Book</span>
              </label>

              <label
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border text-xs cursor-pointer transition-all text-center',
                  watchedActionType === 'external_link'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-[#1e4634] dark:text-emerald-300 font-semibold ring-1 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                )}
              >
                <input
                  type="radio"
                  value="external_link"
                  className="sr-only"
                  {...register('actionType')}
                />
                <Link className="w-4 h-4 mb-1" />
                <span>External Link</span>
              </label>
            </div>
          </div>

          {/* Conditional Destination Target Fields */}
          {watchedActionType === 'book_detail' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Book <span className="text-red-500">*</span>
              </label>
              {books.length > 0 ? (
                <select
                  className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                  {...register('actionBookId')}
                >
                  <option value="">Select a book from catalog...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.author ? `(by ${b.author})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  label="Target Book UUID"
                  required
                  placeholder="e.g. 01a17905-756c-7826-8ffa-..."
                  error={errors.actionBookId?.message}
                  {...register('actionBookId')}
                />
              )}
            </div>
          )}

          {watchedActionType === 'external_link' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Input
                label="Target External URL"
                required
                type="url"
                placeholder="https://example.com/promotion"
                helperText="Must be a valid web address starting with https://"
                error={errors.actionUrl?.message}
                {...register('actionUrl')}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Button Label */}
            <Input
              label="Button CTA Label (Optional)"
              placeholder="e.g. Explore Collection"
              helperText="Call-to-action button text on the banner"
              error={errors.buttonLabel?.message}
              {...register('buttonLabel')}
            />

            {/* Active Until (Timing Expiration) */}
            <Input
              label="Active Until (Optional Timing)"
              type="datetime-local"
              helperText="Leave empty for indefinite banner"
              error={errors.activeUntil?.message}
              {...register('activeUntil')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={handleResetModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-[#1e4634] hover:bg-[#153426]"
            >
              Save & Proceed to Banner Upload
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: BANNER IMAGE UPLOAD */}
      {currentStep === 2 && (
        <div className="space-y-5">
          {/* Success summary of Step 1 */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" weight="fill" />
              <div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Advertisement Created Successfully!
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate max-w-sm">
                  &ldquo;{createdAdMessage}&rdquo;
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ID: {createdAdId?.slice(0, 8)}...
            </span>
          </div>

          {bannerError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs border border-red-200 dark:border-red-800/60 font-medium">
              {bannerError}
            </div>
          )}

          {isBannerUploaded && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" weight="fill" />
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Banner Uploaded & Linked!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Promotional advertisement is now live on the store. Closing modal...
              </p>
            </div>
          )}

          {!isBannerUploaded && (
            <>
              <FileDropzone
                label="Banner Image"
                required
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxSizeMB={10}
                iconType="image"
                helperText="Recommended: 1200 x 400 (PNG, JPG, WebP). Directly attached via PUT /admin/api/advertisement/{id}/banner"
                onFileSelected={(file) => {
                  setBannerFile(file);
                  if (file) {
                    setBannerPreview(URL.createObjectURL(file));
                  } else {
                    setBannerPreview(null);
                  }
                }}
              />

              {bannerPreview && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 px-1">
                    Banner Preview:
                  </p>
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetModal}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Skip Banner for Now (Finish)
                </Button>

                <Button
                  type="button"
                  disabled={!bannerFile}
                  isLoading={isUploadingBanner}
                  leftIcon={<UploadSimple className="w-4 h-4" />}
                  onClick={onStep2Upload}
                  className="bg-[#1e4634] hover:bg-[#153426]"
                >
                  Upload & Complete
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
