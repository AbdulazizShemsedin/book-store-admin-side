'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { updateBookSchema, UpdateBookFormData } from '../schemas/book-schema';
import { booksApi } from '../api/books-api';
import { useAuthors } from '@/features/authors/hooks/use-authors';
import { usePublishers } from '@/features/publishers/hooks/use-publishers';
import { useCategories, useAllCategories } from '@/features/categories/hooks/use-categories';
import { CategoryTreeSelect } from '@/features/categories/components/category-tree-select';
import { resolveCategoryLineage } from '@/features/categories/utils/category-tree';
import { uploadBookThumbnail, uploadBookAsset } from '@/lib/upload/multipart-upload';
import { Book } from '@/types/domain';
import { UpdateBookRequestBody } from '@/types/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  BookOpen,
  Headphones,
  Image as ImageIcon,
  CheckCircle,
  FloppyDisk,
  ArrowLeft,
  Check,
  TreeStructure,
  Folder,
  UploadSimple,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

interface BookEditFormProps {
  book: Book;
  onSuccess?: () => void;
}

export function BookEditForm({ book, onSuccess }: BookEditFormProps) {
  const router = useRouter();

  // Query lookups
  const { data: authorsData } = useAuthors({ pageSize: 100 });
  const { data: publishersData } = usePublishers({ pageSize: 100 });
  const { data: allCategoriesData } = useAllCategories();
  const { data: categoriesData } = useCategories({ pageSize: 100 });

  const authors = authorsData?.authors || [];
  const publishers = publishersData?.publishers || [];
  const categories = allCategoriesData && allCategoriesData.length > 0
    ? allCategoriesData
    : (categoriesData?.categories || []);

  // Match initial author / publisher ID by name if not explicit
  const initialAuthorId =
    book.authorId ||
    authors.find((a) => a.name.toLowerCase() === (book.author || '').toLowerCase())?.id ||
    '';

  const initialPublisherId =
    book.publisherId ||
    publishers.find((p) => p.name.toLowerCase() === (book.publisher || '').toLowerCase())?.id ||
    '';

  const initialLang =
    book.language?.toLowerCase() === 'amharic' || book.language === 'am'
      ? 'am'
      : book.language?.toLowerCase() === 'arabic' || book.language === 'ar'
      ? 'ar'
      : 'en';

  const initialStatus =
    book.status?.toLowerCase() === 'private' ? 'private' : 'public';

  // Form error & success states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Asset upload states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverSuccess, setCoverSuccess] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(book.thumbnail || book.coverUrl || null);

  const [isUploadingManuscript, setIsUploadingManuscript] = useState(false);
  const [manuscriptProgress, setManuscriptProgress] = useState(0);
  const [manuscriptError, setManuscriptError] = useState<string | null>(null);
  const [manuscriptSuccess, setManuscriptSuccess] = useState(false);

  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioSuccess, setAudioSuccess] = useState(false);

  // Category tags state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [attachedCategoryNames, setAttachedCategoryNames] = useState<string[]>(book.tags || []);
  const [isAttachingCategories, setIsAttachingCategories] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBookFormData>({
    resolver: zodResolver(updateBookSchema),
    defaultValues: {
      name: book.name || '',
      language: initialLang,
      authorId: initialAuthorId,
      publisherId: initialPublisherId,
      description: book.description || '',
      status: initialStatus,
      bookPrice: book.price?.bookOnly || '',
      audioPrice: book.price?.audioOnly || '',
      totalPrice: book.price?.total || '',
    },
  });

  // Re-sync form when author or publisher lists resolve
  useEffect(() => {
    reset({
      name: book.name || '',
      language: initialLang,
      authorId: initialAuthorId,
      publisherId: initialPublisherId,
      description: book.description || '',
      status: initialStatus,
      bookPrice: book.price?.bookOnly || '',
      audioPrice: book.price?.audioOnly || '',
      totalPrice: book.price?.total || '',
    });
  }, [book, authors, publishers, reset, initialAuthorId, initialPublisherId, initialLang, initialStatus]);

  // Handle Cover Replacement
  const handleUploadCover = async (file: File) => {
    setIsUploadingCover(true);
    setCoverError(null);
    setCoverSuccess(false);
    setCoverProgress(0);
    try {
      await uploadBookThumbnail(book.id, file, {
        onProgress: (pct) => setCoverProgress(pct),
      });
      setCoverSuccess(true);
      setCurrentCoverUrl(URL.createObjectURL(file));
    } catch (err: any) {
      setCoverError(err.message || 'Failed to upload cover artwork.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle Manuscript Replacement
  const handleUploadManuscript = async (file: File) => {
    setIsUploadingManuscript(true);
    setManuscriptError(null);
    setManuscriptSuccess(false);
    setManuscriptProgress(0);
    try {
      await uploadBookAsset(book.id, 'book', file, {
        onProgress: (pct) => setManuscriptProgress(pct),
      });
      setManuscriptSuccess(true);
    } catch (err: any) {
      setManuscriptError(err.message || 'Failed to upload manuscript file.');
    } finally {
      setIsUploadingManuscript(false);
    }
  };

  // Handle Audio Replacement
  const handleUploadAudio = async (file: File) => {
    setIsUploadingAudio(true);
    setAudioError(null);
    setAudioSuccess(false);
    setAudioProgress(0);
    try {
      await uploadBookAsset(book.id, 'audio', file, {
        onProgress: (pct) => setAudioProgress(pct),
      });
      setAudioSuccess(true);
    } catch (err: any) {
      setAudioError(err.message || 'Failed to upload narration audio track.');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Handle Category Tag Attachment
  const handleAttachCategories = async () => {
    if (selectedCategoryIds.length === 0) return;
    setIsAttachingCategories(true);
    setCategoryError(null);
    setCategorySuccess(null);
    try {
      const lineageIds = resolveCategoryLineage(selectedCategoryIds, categories);
      for (const id of lineageIds) {
        await booksApi.attachTag(book.id, id);
      }
      const names = lineageIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[];
      setAttachedCategoryNames((prev) => Array.from(new Set([...prev, ...names])));
      setCategorySuccess('Categories attached successfully!');
      setSelectedCategoryIds([]);
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to attach categories.');
    } finally {
      setIsAttachingCategories(false);
    }
  };

  // Primary Metadata Form Submit (PATCH /admin/api/book/{book_id})
  const onSubmit = async (data: UpdateBookFormData) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      const payload: UpdateBookRequestBody = {
        name: data.name?.trim() || undefined,
        language: data.language,
        author_id: data.authorId || undefined,
        publisher_id: data.publisherId || undefined,
        description: data.description?.trim() || undefined,
        status: data.status,
        book_price: data.bookPrice?.trim() || undefined,
        audio_price: data.audioPrice?.trim() || undefined,
        total_price: data.totalPrice?.trim() || undefined,
      };

      await booksApi.update(book.id, payload);
      setFormSuccess('Book metadata updated successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/books/${book.id}`);
        }, 1200);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(err?.message || 'Failed to update book record.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-6xl">
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" weight="fill" />
          <span>{formSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Primary Details, Pricing, Assets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Card */}
          <Card>
            <CardHeader
              title="Book Metadata & Taxonomy"
              action={
                <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  ID: {book.id.slice(0, 8)}...
                </span>
              }
            />
            <CardContent className="space-y-5">
              <Input
                label="Book Title"
                required
                placeholder="e.g. Sahih Muslim"
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Master Language"
                      required
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'am', label: 'Amharic (አማርኛ)' },
                        { value: 'ar', label: 'Arabic (العربية)' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.language?.message}
                    />
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Publication Status"
                      required
                      options={[
                        { value: 'public', label: 'Public (Published on Storefront)' },
                        { value: 'private', label: 'Private (Draft / Internal Only)' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.status?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="authorId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Author"
                      options={[
                        { value: '', label: 'Select author...' },
                        ...authors.map((a) => ({ value: a.id, label: a.name })),
                      ]}
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={errors.authorId?.message}
                    />
                  )}
                />

                <Controller
                  name="publisherId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Publisher (Optional)"
                      options={[
                        { value: '', label: 'Select publisher...' },
                        ...publishers.map((p) => ({ value: p.id, label: p.name })),
                      ]}
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={errors.publisherId?.message}
                    />
                  )}
                />
              </div>

              <Textarea
                label="Description / Synopsis"
                rows={4}
                placeholder="Enter complete overview, themes, or author notes..."
                error={errors.description?.message}
                {...register('description')}
              />
            </CardContent>
          </Card>

          {/* Pricing Structure Card */}
          <Card>
            <CardHeader title="Pricing Structure (ETB / USD)" />
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">
                Configure prices for standalone formats or bundled editions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Digital Book Price"
                  placeholder="0.00"
                  error={errors.bookPrice?.message}
                  {...register('bookPrice')}
                />
                <Input
                  label="Audiobook Price"
                  placeholder="0.00"
                  error={errors.audioPrice?.message}
                  {...register('audioPrice')}
                />
                <Input
                  label="Bundle Total Price"
                  placeholder="0.00"
                  error={errors.totalPrice?.message}
                  {...register('totalPrice')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Attached Digital Media Assets */}
          <Card>
            <CardHeader title="Digital Media Assets (EPUB & Audio)" />
            <CardContent className="space-y-6">
              {/* Manuscript File Replacement */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                    <BookOpen className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" weight="bold" />
                    <span>Digital Manuscript (EPUB or PDF)</span>
                  </div>
                  <Badge
                    variant={book.assets?.book || manuscriptSuccess ? 'success' : 'default'}
                    size="sm"
                    className={
                      book.assets?.book || manuscriptSuccess
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                    }
                  >
                    {book.assets?.book || manuscriptSuccess ? 'Active Asset' : 'Not Attached'}
                  </Badge>
                </div>

                {manuscriptError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{manuscriptError}</p>
                )}
                {manuscriptSuccess && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" weight="bold" />
                    <span>Manuscript updated successfully!</span>
                  </p>
                )}

                <FileDropzone
                  label="Upload New Manuscript Version"
                  accept={{
                    'application/epub+zip': ['.epub'],
                    'application/pdf': ['.pdf'],
                  }}
                  maxSizeMB={100}
                  iconType="file"
                  helperText="Select EPUB or PDF to replace current manuscript (Max 100MB)"
                  onFileSelected={(file) => {
                    if (file) handleUploadManuscript(file);
                  }}
                />

                {isUploadingManuscript && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1e4634] dark:bg-emerald-500 h-2 transition-all duration-300"
                      style={{ width: `${manuscriptProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Audiobook Narration Replacement */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                    <Headphones className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" weight="bold" />
                    <span>Audiobook Narration Master (MP3 or M4B)</span>
                  </div>
                  <Badge
                    variant={book.assets?.audio || audioSuccess ? 'success' : 'default'}
                    size="sm"
                    className={
                      book.assets?.audio || audioSuccess
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                    }
                  >
                    {book.assets?.audio || audioSuccess ? 'Active Audio' : 'Not Attached'}
                  </Badge>
                </div>

                {audioError && (
                  <p className="text-xs text-red-600 font-medium">{audioError}</p>
                )}
                {audioSuccess && (
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" weight="bold" />
                    <span>Audio track updated successfully!</span>
                  </p>
                )}

                <FileDropzone
                  label="Upload New Audio Master Track"
                  accept={{
                    'audio/mpeg': ['.mp3'],
                    'audio/mp4': ['.m4b', '.m4a'],
                  }}
                  maxSizeMB={500}
                  iconType="audio"
                  helperText="Select MP3 or M4B narration file (Max 500MB)"
                  onFileSelected={(file) => {
                    if (file) handleUploadAudio(file);
                  }}
                />

                {isUploadingAudio && (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1e4634] h-2 transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories & Taxonomy */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-1.5">
                  <TreeStructure className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" />
                  <span>Attach Catalog Categories</span>
                </div>
              }
              action={
                <span className="text-[11px] font-semibold text-[#1e4634] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  {attachedCategoryNames.length} linked
                </span>
              }
            />
            <CardContent className="space-y-4">
              {categoryError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{categoryError}</p>
              )}
              {categorySuccess && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" weight="bold" />
                  <span>{categorySuccess}</span>
                </p>
              )}

              {attachedCategoryNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {attachedCategoryNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                    >
                      <Folder className="w-3.5 h-3.5 text-[#1e4634] dark:text-emerald-400" weight="fill" />
                      <span>{name}</span>
                    </span>
                  ))}
                </div>
              )}

              <CategoryTreeSelect
                label="Select Additional Categories"
                helperText="Select categories from the catalog tree. All parent levels are linked automatically."
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onChange={(ids) => setSelectedCategoryIds(ids)}
              />

              {selectedCategoryIds.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCategoryIds.length} categories chosen
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    isLoading={isAttachingCategories}
                    onClick={handleAttachCategories}
                    className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-8 px-3"
                  >
                    Attach Categories
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Cover Artwork & Form Actions */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Cover Artwork Card */}
          <Card>
            <CardHeader
              title="Storefront Cover Artwork"
              action={
                <Badge
                  variant={currentCoverUrl ? 'success' : 'default'}
                  size="sm"
                  className={
                    currentCoverUrl
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }
                >
                  {currentCoverUrl ? 'Cover Active' : 'No Cover'}
                </Badge>
              }
            />
            <CardContent className="space-y-4">
              {coverError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{coverError}</p>
              )}
              {coverSuccess && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" weight="bold" />
                  <span>Cover uploaded successfully!</span>
                </p>
              )}

              <div className="relative aspect-[3/4] w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                {currentCoverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentCoverUrl}
                    alt={book.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                    <ImageIcon className="w-12 h-12 mb-2 stroke-1 mx-auto" />
                    <span className="text-xs font-medium block">No Cover Uploaded</span>
                  </div>
                )}

                {isUploadingCover && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-20">
                    <Spinner size="md" />
                    <span className="text-xs font-semibold text-[#1e4634] dark:text-emerald-400 mt-2">
                      Uploading {coverProgress}%...
                    </span>
                  </div>
                )}
              </div>

              <FileDropzone
                label="Replace Cover Image"
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxSizeMB={10}
                iconType="image"
                helperText="Select PNG, JPG, or WEBP (Max 10MB)"
                onFileSelected={(file) => {
                  if (file) handleUploadCover(file);
                }}
              />

              {isUploadingCover && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#1e4634] h-2 transition-all duration-300"
                    style={{ width: `${coverProgress}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Action Controls */}
          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<FloppyDisk className="w-4 h-4" weight="bold" />}
              className="w-full bg-[#1e4634] hover:bg-[#153426] text-white shadow-md font-semibold text-xs h-11"
            >
              Save Book Changes
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push(`/books/${book.id}`)}
              className="w-full text-xs h-10"
            >
              Cancel & Back to Book
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
