'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { bookFormSchema, BookFormData } from '../schemas/book-schema';
import { booksApi } from '../api/books-api';
import { useAuthors } from '@/features/authors/hooks/use-authors';
import { usePublishers } from '@/features/publishers/hooks/use-publishers';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CategoryTreeSelect } from '@/features/categories/components/category-tree-select';
import { resolveCategoryLineage } from '@/features/categories/utils/category-tree';
import { uploadBookThumbnail, uploadBookAsset } from '@/lib/upload/multipart-upload';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  BookOpen,
  Headphones,
  Image as ImageIcon,
  CheckCircle,
  Books,
  ArrowRight,
  Check,
  TreeStructure,
  Folder,
  Tag,
  ArrowLeft,
  UploadSimple,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

interface CreatedBookState {
  id: string;
  name: string;
  format: 'book_only' | 'audiobook_only' | 'both';
  authorName?: string;
  language: string;
}

export function BookForm() {
  const router = useRouter();

  // Step 1 vs Step 2 Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [createdBook, setCreatedBook] = useState<CreatedBookState | null>(null);

  // Form error state
  const [formError, setFormError] = useState<string | null>(null);

  // Step 2 Media & Asset states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState<number>(0);
  const [isCoverUploaded, setIsCoverUploaded] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [isUploadingManuscript, setIsUploadingManuscript] = useState(false);
  const [manuscriptProgress, setManuscriptProgress] = useState<number>(0);
  const [isManuscriptUploaded, setIsManuscriptUploaded] = useState(false);
  const [manuscriptError, setManuscriptError] = useState<string | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Step 2 Category selection states
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [attachedCategoryNames, setAttachedCategoryNames] = useState<string[]>([]);
  const [isAttachingCategories, setIsAttachingCategories] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Step 2 Finish handler state
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const { data: authorsData } = useAuthors({ pageSize: 100 });
  const { data: publishersData } = usePublishers({ pageSize: 100 });
  const { data: categoriesData } = useCategories({ pageSize: 100 });

  const authors = authorsData?.authors || [];
  const publishers = publishersData?.publishers || [];
  const categories = categoriesData?.categories || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: '',
      authorId: '',
      publisherId: '',
      bookFormat: 'both',
      categoryIds: [],
      tags: [],
      categoryId: '',
      subcategoryId: '',
      description: '',
      language: 'en',
      bookPrice: '',
      audioPrice: '',
      totalPrice: '',
      audiobookOption: 'has_audiobook',
      hasAudiobook: true,
      narrator: '',
    },
  });

  const watchedTitle = watch('name') || 'Book Title Preview';
  const watchedAuthorId = watch('authorId');
  const watchedBookFormat = watch('bookFormat') || 'both';
  const watchedLanguage = watch('language') || 'en';

  const selectedAuthor = authors.find((a) => a.id === watchedAuthorId);

  // STEP 1 SUBMIT: Register the initial book record and obtain the real book_id
  const onStep1Submit = async (data: BookFormData) => {
    setFormError(null);
    try {
      const result = await booksApi.createRecord(data);
      setCreatedBook({
        id: result.id,
        name: data.name,
        format: data.bookFormat,
        authorName: selectedAuthor?.name,
        language: data.language,
      });
      setCurrentStep(2);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError('name', { message: err.fieldErrors.name });
        }
        if (err.fieldErrors.author_id) {
          setError('authorId', { message: err.fieldErrors.author_id });
        }
        setFormError(err.message);
      } else {
        setFormError('Failed to create book record. Please verify your inputs and try again.');
      }
    }
  };

  // STEP 2: Upload Cover Handler
  const handleUploadCover = async (fileToUpload?: File) => {
    const file = fileToUpload || coverFile;
    if (!createdBook || !file) return;
    setIsUploadingCover(true);
    setCoverError(null);
    setCoverProgress(0);
    try {
      await uploadBookThumbnail(createdBook.id, file, {
        onProgress: (pct) => setCoverProgress(pct),
      });
      setIsCoverUploaded(true);
    } catch (err: any) {
      setCoverError(err.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // STEP 2: Upload Manuscript Handler
  const handleUploadManuscript = async (fileToUpload?: File) => {
    const file = fileToUpload || manuscriptFile;
    if (!createdBook || !file) return;
    setIsUploadingManuscript(true);
    setManuscriptError(null);
    setManuscriptProgress(0);
    try {
      await uploadBookAsset(createdBook.id, 'book', file, {
        onProgress: (pct) => setManuscriptProgress(pct),
      });
      setIsManuscriptUploaded(true);
    } catch (err: any) {
      setManuscriptError(err.message || 'Failed to upload manuscript file.');
    } finally {
      setIsUploadingManuscript(false);
    }
  };

  // STEP 2: Upload Audio Handler
  const handleUploadAudio = async (fileToUpload?: File) => {
    const file = fileToUpload || audioFile;
    if (!createdBook || !file) return;
    setIsUploadingAudio(true);
    setAudioError(null);
    setAudioProgress(0);
    try {
      await uploadBookAsset(createdBook.id, 'audio', file, {
        onProgress: (pct) => setAudioProgress(pct),
      });
      setIsAudioUploaded(true);
    } catch (err: any) {
      setAudioError(err.message || 'Failed to upload audiobook track.');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // STEP 2: Attach Categories Handler
  const handleAttachCategories = async (categoryIdsToAttach?: string[]) => {
    const ids = categoryIdsToAttach || selectedCategoryIds;
    if (!createdBook || ids.length === 0) return;
    setIsAttachingCategories(true);
    setCategoryError(null);
    setCategorySuccess(null);
    try {
      // Resolve full ancestor lineage so mobile apps discover the book on root and sub levels
      const lineageIds = resolveCategoryLineage(ids, categories);
      for (const id of lineageIds) {
        await booksApi.attachTag(createdBook.id, id);
      }
      const names = lineageIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[];
      setAttachedCategoryNames(Array.from(new Set(names)));
      setCategorySuccess('Categories attached successfully!');
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to attach categories.');
    } finally {
      setIsAttachingCategories(false);
    }
  };

  // STEP 2: Complete and verify all selected assets before navigating
  const handleFinishStep2 = async () => {
    if (!createdBook) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      // 1. If categories were selected in the tree but not yet attached, attach them now
      if (selectedCategoryIds.length > 0 && attachedCategoryNames.length === 0) {
        await handleAttachCategories(selectedCategoryIds);
      }

      // 2. If cover file was chosen but not uploaded yet, upload it
      if (coverFile && !isCoverUploaded) {
        await handleUploadCover(coverFile);
      }

      // 3. If manuscript file was chosen but not uploaded yet, upload it
      if (manuscriptFile && !isManuscriptUploaded) {
        await handleUploadManuscript(manuscriptFile);
      }

      // 4. If audio file was chosen but not uploaded yet, upload it
      if (audioFile && !isAudioUploaded) {
        await handleUploadAudio(audioFile);
      }

      router.push(`/books/${createdBook.id}`);
    } catch (err: any) {
      setFinishError(err.message || 'Error occurred while saving assets.');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* 2-Step Stepper Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Step 1 Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0',
                currentStep === 1
                  ? 'bg-[#1e4634] text-white shadow-xs'
                  : 'bg-emerald-50 text-[#1e4634] border border-emerald-200'
              )}
            >
              {currentStep === 2 ? <Check className="w-4 h-4" weight="bold" /> : '1'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Step 1
              </span>
              <span
                className={cn(
                  'text-xs font-bold leading-tight block',
                  currentStep === 1 ? 'text-slate-900' : 'text-slate-600'
                )}
              >
                Book Details & Pricing
              </span>
            </div>
          </div>

          {/* Stepper Arrow Divider */}
          <div className="hidden sm:block text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0',
                currentStep === 2
                  ? 'bg-[#1e4634] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              )}
            >
              2
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Step 2
              </span>
              <span
                className={cn(
                  'text-xs font-bold leading-tight block',
                  currentStep === 2 ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                Media Assets & Taxonomy Tags
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: BOOK DETAILS & PRICING FORM                                        */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <form
          id="book-form"
          onSubmit={handleSubmit(onStep1Submit)}
          className="space-y-8 animate-in fade-in duration-300"
        >
          {formError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (2 spans): Metadata & Pricing */}
            <div className="lg:col-span-2 space-y-8">
              {/* Card 1: Book Information */}
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2 text-slate-900">
                      <BookOpen className="w-5 h-5 text-[#1e4634]" />
                      <span>Book Information</span>
                    </div>
                  }
                />
                <CardContent className="space-y-5">
                  <Input
                    label="Book Title"
                    required
                    placeholder="e.g. The Midnight Library"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="authorId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Author"
                          required
                          placeholder="Select registered author..."
                          options={authors.map((a) => ({ label: a.name, value: a.id }))}
                          error={errors.authorId?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    <Controller
                      name="publisherId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Publisher"
                          placeholder="Select publisher (optional)..."
                          options={publishers.map((p) => ({ label: p.name, value: p.id }))}
                          error={errors.publisherId?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>

                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Master Language"
                        required
                        helperText="Primary language applied to written and audiobook editions."
                        options={[
                          { label: 'English (en)', value: 'en' },
                          { label: 'Arabic (ar)', value: 'ar' },
                          { label: 'Amharic (am)', value: 'am' },
                        ]}
                        error={errors.language?.message}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />

                  <Textarea
                    label="Description / Synopsis"
                    placeholder="Enter book synopsis or summary..."
                    rows={4}
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </CardContent>
              </Card>

              {/* Card 2: Format & Pricing */}
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2 text-slate-900">
                      <Books className="w-5 h-5 text-[#1e4634]" />
                      <span>Format & Pricing</span>
                    </div>
                  }
                />
                <CardContent className="space-y-6">
                  {/* Format Choice */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-800 block">
                      Product Format
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                          watchedBookFormat === 'book_only'
                            ? 'border-[#1e4634] bg-emerald-50/40 ring-1 ring-[#1e4634]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">Book Only</span>
                          <input
                            type="radio"
                            value="book_only"
                            checked={watchedBookFormat === 'book_only'}
                            onChange={() => setValue('bookFormat', 'book_only')}
                            className="text-[#1e4634] focus:ring-[#1e4634]/20"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Digital e-book manuscript (EPUB or PDF).
                        </p>
                      </label>

                      <label
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                          watchedBookFormat === 'audiobook_only'
                            ? 'border-[#1e4634] bg-emerald-50/40 ring-1 ring-[#1e4634]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">
                            Audiobook Only
                          </span>
                          <input
                            type="radio"
                            value="audiobook_only"
                            checked={watchedBookFormat === 'audiobook_only'}
                            onChange={() => setValue('bookFormat', 'audiobook_only')}
                            className="text-[#1e4634] focus:ring-[#1e4634]/20"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Narration master track (MP3 or M4B).
                        </p>
                      </label>

                      <label
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                          watchedBookFormat === 'both'
                            ? 'border-[#1e4634] bg-emerald-50/40 ring-1 ring-[#1e4634]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">
                            Book & Audiobook
                          </span>
                          <input
                            type="radio"
                            value="both"
                            checked={watchedBookFormat === 'both'}
                            onChange={() => setValue('bookFormat', 'both')}
                            className="text-[#1e4634] focus:ring-[#1e4634]/20"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Complete bundle with text e-book and audio track.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                    {(watchedBookFormat === 'book_only' || watchedBookFormat === 'both') && (
                      <Input
                        label="Book Price ($)"
                        placeholder="e.g. 19.99"
                        error={errors.bookPrice?.message}
                        {...register('bookPrice')}
                      />
                    )}
                    {(watchedBookFormat === 'audiobook_only' || watchedBookFormat === 'both') && (
                      <Input
                        label="Audiobook Price ($)"
                        placeholder="e.g. 24.99"
                        error={errors.audioPrice?.message}
                        {...register('audioPrice')}
                      />
                    )}
                    {watchedBookFormat === 'both' && (
                      <Input
                        label="Bundled Price ($)"
                        placeholder="e.g. 34.99"
                        error={errors.totalPrice?.message}
                        {...register('totalPrice')}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1 span): Live Summary & Submit Step 1 */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card>
                <CardHeader title="Catalog Preview" />
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {watchedLanguage.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {watchedTitle}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Author: <strong>{selectedAuthor?.name || '—'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      Format: {watchedBookFormat.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Note:</strong> In Step 1, the book record is assigned its official ID on
                    the backend. In Step 2, you will upload the cover image, media files, and attach
                    categories.
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full bg-[#1e4634] hover:bg-[#153426] text-white shadow-md font-semibold text-xs"
                  rightIcon={<ArrowRight className="w-4 h-4" weight="bold" />}
                >
                  Create Book & Continue to Step 2
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/books')}
                  className="w-full text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MEDIA ASSETS & CATEGORIES FORM (WITH REAL BOOK ID)                */}
      {/* ========================================================================= */}
      {currentStep === 2 && createdBook && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Success Banner */}
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1e4634] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <CheckCircle className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Book Created: &ldquo;{createdBook.name}&rdquo;
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Assigned ID: <code className="font-mono text-[11px] font-semibold text-[#1e4634]">{createdBook.id}</code>
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
              Step 2 of 2: Attach Files & Categories
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (2 spans): Files & Categories */}
            <div className="lg:col-span-2 space-y-8">
              {/* Asset 1: Manuscript Upload (if format includes book) */}
              {createdBook.format !== 'audiobook_only' && (
                <Card>
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2 text-slate-900">
                        <BookOpen className="w-5 h-5 text-[#1e4634]" />
                        <span>Digital Manuscript File (EPUB or PDF)</span>
                      </div>
                    }
                    action={
                      isManuscriptUploaded ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Manuscript Uploaded
                        </span>
                      ) : null
                    }
                  />
                  <CardContent className="space-y-4">
                    {manuscriptError && (
                      <p className="text-xs text-red-600 font-medium">{manuscriptError}</p>
                    )}

                    <FileDropzone
                      label="Manuscript Asset File"
                      required
                      accept={{
                        'application/epub+zip': ['.epub'],
                        'application/pdf': ['.pdf'],
                      }}
                      maxSizeMB={100}
                      iconType="file"
                      helperText="EPUB or PDF file (Max 100MB)"
                      onFileSelected={(file) => {
                        setManuscriptFile(file);
                        if (file) handleUploadManuscript(file);
                      }}
                    />

                    {manuscriptFile && !isManuscriptUploaded && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs text-slate-700 truncate font-medium">
                          Selected: {manuscriptFile.name} ({(manuscriptFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                        <Button
                          size="sm"
                          isLoading={isUploadingManuscript}
                          onClick={() => handleUploadManuscript(manuscriptFile)}
                          leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                          className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-8 px-3"
                        >
                          Upload File
                        </Button>
                      </div>
                    )}

                    {isUploadingManuscript && (
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1e4634] h-2 transition-all duration-300"
                          style={{ width: `${manuscriptProgress}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Asset 2: Audiobook Upload (if format includes audio) */}
              {createdBook.format !== 'book_only' && (
                <Card>
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2 text-slate-900">
                        <Headphones className="w-5 h-5 text-[#1e4634]" />
                        <span>Audiobook Narration Master (MP3 or M4B)</span>
                      </div>
                    }
                    action={
                      isAudioUploaded ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Audio Track Uploaded
                        </span>
                      ) : null
                    }
                  />
                  <CardContent className="space-y-4">
                    {audioError && (
                      <p className="text-xs text-red-600 font-medium">{audioError}</p>
                    )}

                    <FileDropzone
                      label="Audiobook Master Track"
                      required
                      accept={{
                        'audio/mpeg': ['.mp3'],
                        'audio/mp4': ['.m4b', '.m4a'],
                      }}
                      maxSizeMB={500}
                      iconType="audio"
                      helperText="MP3 or M4B narration file (Max 500MB)"
                      onFileSelected={(file) => {
                        setAudioFile(file);
                        if (file) handleUploadAudio(file);
                      }}
                    />

                    {audioFile && !isAudioUploaded && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs text-slate-700 truncate font-medium">
                          Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                        <Button
                          size="sm"
                          isLoading={isUploadingAudio}
                          onClick={() => handleUploadAudio(audioFile)}
                          leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                          className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-8 px-3"
                        >
                          Upload Audio
                        </Button>
                      </div>
                    )}

                    {isUploadingAudio && (
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1e4634] h-2 transition-all duration-300"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Asset 3: Categories & Taxonomy */}
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2 text-slate-900">
                      <TreeStructure className="w-5 h-5 text-[#1e4634]" />
                      <span>Taxonomy Categories & Tags</span>
                    </div>
                  }
                  action={
                    attachedCategoryNames.length > 0 ? (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {attachedCategoryNames.length} Linked
                      </span>
                    ) : null
                  }
                />
                <CardContent className="space-y-4">
                  {categoryError && (
                    <p className="text-xs text-red-600 font-medium">{categoryError}</p>
                  )}
                  {categorySuccess && (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4" weight="bold" />
                      <span>{categorySuccess}</span>
                    </p>
                  )}

                  <CategoryTreeSelect
                    label="Attach Catalog Categories"
                    helperText="Select categories from the nested taxonomy tree. All parent levels are linked automatically."
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onChange={(ids) => setSelectedCategoryIds(ids)}
                  />

                  {selectedCategoryIds.length > 0 && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {selectedCategoryIds.length} categories chosen
                      </span>
                      <Button
                        size="sm"
                        isLoading={isAttachingCategories}
                        onClick={() => handleAttachCategories()}
                        className="bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-8 px-3"
                      >
                        Attach Categories to Book
                      </Button>
                    </div>
                  )}

                  {attachedCategoryNames.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Linked Categories on Backend:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {attachedCategoryNames.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs"
                          >
                            <Folder className="w-3.5 h-3.5 text-[#1e4634]" weight="fill" />
                            <span>{name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1 span): Storefront Cover & Completion */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card>
                <CardHeader
                  title="Storefront Cover Image"
                  action={
                    isCoverUploaded ? (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Uploaded
                      </span>
                    ) : null
                  }
                />
                <CardContent className="space-y-4">
                  {coverError && (
                    <p className="text-xs text-red-600 font-medium">{coverError}</p>
                  )}

                  {/* Preview Graphic */}
                  <div className="relative aspect-[3/4] w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex flex-col justify-end p-4 shadow-inner">
                    {coverPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverPreviewUrl}
                        alt="Cover preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
                        <span className="text-xs font-medium">Cover Graphic</span>
                      </div>
                    )}
                    <div className="relative z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-lg shadow-sm border border-slate-200/60">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">
                        {createdBook.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {createdBook.authorName || 'Author'}
                      </p>
                    </div>
                  </div>

                  <FileDropzone
                    label="Cover Image File"
                    accept={{
                      'image/png': ['.png'],
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/webp': ['.webp'],
                    }}
                    maxSizeMB={10}
                    iconType="image"
                    helperText="PNG, JPG or WEBP (Max 10MB)"
                    onFileSelected={(file) => {
                      setCoverFile(file);
                      if (file) {
                        setCoverPreviewUrl(URL.createObjectURL(file));
                        handleUploadCover(file);
                      } else {
                        setCoverPreviewUrl(null);
                      }
                    }}
                  />

                  {coverFile && !isCoverUploaded && (
                    <Button
                      size="sm"
                      isLoading={isUploadingCover}
                      onClick={() => handleUploadCover(coverFile)}
                      leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                      className="w-full bg-[#1e4634] hover:bg-[#153426] text-white text-xs h-9 font-semibold"
                    >
                      Upload Cover to Book
                    </Button>
                  )}

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

              {/* Completion Actions */}
              <div className="space-y-3">
                {finishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {finishError}
                  </div>
                )}
                <Button
                  type="button"
                  size="lg"
                  isLoading={isFinishing}
                  onClick={handleFinishStep2}
                  className="w-full bg-[#1e4634] hover:bg-[#153426] text-white shadow-md font-semibold text-xs h-11"
                  leftIcon={<CheckCircle className="w-4 h-4" weight="bold" />}
                >
                  Finish & View Book Details
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  disabled={isFinishing}
                  onClick={() => router.push('/books')}
                  className="w-full text-xs h-10"
                >
                  Go to Books Catalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
