'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { bookFormSchema, BookFormData } from '../schemas/book-schema';
import { useCreateBook } from '../hooks/use-books';
import { useAuthors } from '@/features/authors/hooks/use-authors';
import { usePublishers } from '@/features/publishers/hooks/use-publishers';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CategoryTreeSelect } from '@/features/categories/components/category-tree-select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  BookOpen,
  Headphones,
  Sparkle,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Books,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

export function BookForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

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
  const watchedCategoryIds = watch('categoryIds') || [];
  const watchedBookFormat = watch('bookFormat') || 'both';
  const watchedAudioOption = watch('audiobookOption');

  // Derive author and primary category display names for live preview
  const selectedAuthor = authors.find((a) => a.id === watchedAuthorId);
  const primaryCategoryId = watchedCategoryIds[0];
  const selectedPrimaryCategory = categories.find((c) => c.id === primaryCategoryId);

  const createBookMutation = useCreateBook((bookId) => {
    router.push(`/books/${bookId}`);
  });

  const onSubmit = async (data: BookFormData) => {
    setFormError(null);
    try {
      await createBookMutation.mutateAsync({
        ...data,
        coverFile: coverFile || undefined,
        bookFile: bookFile || undefined,
        audioFile: audioFile || undefined,
      });
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
        setFormError('Failed to register book. Please verify your inputs and connectivity.');
      }
    }
  };

  return (
    <form
      id="book-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 scroll-mt-24 transition-all duration-500"
    >
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Book Info & Asset Uploads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Book Information */}
          <Card className="relative z-20">
            <CardHeader
              title={
                <div className="flex items-center gap-2 text-slate-900">
                  <BookOpen className="w-5 h-5 text-[#1e4634]" />
                  <span>Book Information</span>
                </div>
              }
            />
            <CardContent className="space-y-5">
              {/* Title */}
              <Input
                label="Book Title"
                required
                placeholder="e.g. The Midnight Library"
                error={errors.name?.message}
                {...register('name')}
              />

              {/* Author & Publisher */}
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
                      placeholder="Select publisher..."
                      options={publishers.map((p) => ({ label: p.name, value: p.id }))}
                      error={errors.publisherId?.message}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>

              {/* Unified Category Selector (Replaces separate Tags, Category, & Subcategory) */}
              <Controller
                name="categoryIds"
                control={control}
                render={({ field }) => (
                  <CategoryTreeSelect
                    label="Category"
                    helperText="Select from the nested 5-level folder tree or search. Up to 5 categories (optional)."
                    categories={categories}
                    selectedCategoryIds={field.value || []}
                    onChange={(ids) => {
                      field.onChange(ids);
                      // Map to tags and primary categoryId for backward compatibility
                      const selectedNames = ids.map((id) => {
                        const found = categories.find((c) => c.id === id);
                        return found ? found.name : id;
                      });
                      setValue('tags', selectedNames);
                      if (ids.length > 0) {
                        setValue('categoryId', ids[0]);
                      } else {
                        setValue('categoryId', '');
                      }
                    }}
                    categoryColors={categoryColors}
                    onColorChange={(catId, color) => {
                      setCategoryColors((prev) => ({ ...prev, [catId]: color }));
                    }}
                    error={errors.categoryIds?.message || errors.tags?.message}
                  />
                )}
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Enter brief description..."
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />

              {/* Master Language */}
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Book & Audiobook Master Language"
                    required
                    helperText="Master Language applies to both the written book file and the audiobook edition."
                    options={[
                      { label: 'English (en)', value: 'en' },
                      { label: 'Amharic (am)', value: 'am' },
                      { label: 'Arabic (ar)', value: 'ar' },
                    ]}
                    error={errors.language?.message}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Product Format & Assets Upload */}
          <Card className="relative z-10">
            <CardHeader
              title={
                <div className="flex items-center gap-2 text-slate-900">
                  <Headphones className="w-5 h-5 text-[#1e4634]" />
                  <span>Format & Asset Uploads</span>
                </div>
              }
              subtitle="Configure whether this title is an E-Book, an Audiobook-only release, or both."
            />
            <CardContent className="space-y-6">
              {/* Product Format Selection: Book Only, Audiobook Only, Both */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Product Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Book Only */}
                  <label
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                      watchedBookFormat === 'book_only'
                        ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>Book Only</span>
                      </div>
                      <input
                        type="radio"
                        value="book_only"
                        checked={watchedBookFormat === 'book_only'}
                        onChange={() => {
                          setValue('bookFormat', 'book_only');
                          setValue('hasAudiobook', false);
                        }}
                        className="text-emerald-800 focus:ring-emerald-700/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Standard e-book (EPUB or PDF). No audio track required.
                    </p>
                  </label>

                  {/* Option 2: Audiobook Only */}
                  <label
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                      watchedBookFormat === 'audiobook_only'
                        ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                        <Headphones className="w-4 h-4 text-emerald-700" />
                        <span>Audiobook Only</span>
                      </div>
                      <input
                        type="radio"
                        value="audiobook_only"
                        checked={watchedBookFormat === 'audiobook_only'}
                        onChange={() => {
                          setValue('bookFormat', 'audiobook_only');
                          setValue('hasAudiobook', true);
                          setValue('audiobookOption', 'has_audiobook');
                        }}
                        className="text-emerald-800 focus:ring-emerald-700/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Audio-first release. E-book file is not required.
                    </p>
                  </label>

                  {/* Option 3: Both Book & Audiobook */}
                  <label
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5',
                      watchedBookFormat === 'both'
                        ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                        <Books className="w-4 h-4 text-emerald-700" />
                        <span>Book & Audiobook</span>
                      </div>
                      <input
                        type="radio"
                        value="both"
                        checked={watchedBookFormat === 'both'}
                        onChange={() => {
                          setValue('bookFormat', 'both');
                          setValue('hasAudiobook', true);
                          setValue('audiobookOption', 'has_audiobook');
                        }}
                        className="text-emerald-800 focus:ring-emerald-700/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Complete package with text e-book and recorded audio.
                    </p>
                  </label>
                </div>
              </div>

              {/* Pricing Section (per documented OpenAPI CreateBookRequestBody fields) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Pricing
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enter the sales price according to the chosen product format.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(watchedBookFormat === 'book_only' || watchedBookFormat === 'both') && (
                    <Input
                      label="Book Price"
                      placeholder="e.g. 19.99"
                      error={errors.bookPrice?.message}
                      {...register('bookPrice')}
                    />
                  )}
                  {(watchedBookFormat === 'audiobook_only' || watchedBookFormat === 'both') && (
                    <Input
                      label="Audiobook Price"
                      placeholder="e.g. 24.99"
                      error={errors.audioPrice?.message}
                      {...register('audioPrice')}
                    />
                  )}
                  {watchedBookFormat === 'both' && (
                    <Input
                      label="Combined Total Price"
                      placeholder="e.g. 34.99"
                      helperText="Official bundled package price"
                      error={errors.totalPrice?.message}
                      {...register('totalPrice')}
                    />
                  )}
                </div>
              </div>

              {/* Book File Upload (EPUB / PDF) - required unless Audiobook Only */}
              {watchedBookFormat !== 'audiobook_only' ? (
                <FileDropzone
                  label="Book File (EPUB or PDF)"
                  required
                  accept={{
                    'application/epub+zip': ['.epub'],
                    'application/pdf': ['.pdf'],
                  }}
                  maxSizeMB={100}
                  iconType="file"
                  helperText="Drag & drop EPUB or PDF master file (Max 100MB)"
                  onFileSelected={(file) => setBookFile(file)}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-700" />
                    <span>
                      <strong>Audiobook-Only Title:</strong> EPUB/PDF manuscript file is omitted and not required.
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Omitted
                  </span>
                </div>
              )}

              {/* Audiobook Section (For Audiobook-Only or Both) */}
              {watchedBookFormat !== 'book_only' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                        Audiobook Production
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Provide recorded master track or reserve automated AI synthesis
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          value="has_audiobook"
                          checked={watchedAudioOption === 'has_audiobook'}
                          onChange={() => {
                            setValue('audiobookOption', 'has_audiobook');
                            setValue('hasAudiobook', true);
                          }}
                          className="text-emerald-800 focus:ring-emerald-700/20"
                        />
                        <span>Recorded Audio Master</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                        <input
                          type="radio"
                          value="ai_generated"
                          checked={watchedAudioOption === 'ai_generated'}
                          onChange={() => {
                            setValue('audiobookOption', 'ai_generated');
                            setValue('hasAudiobook', false);
                          }}
                          className="text-emerald-800 focus:ring-emerald-700/20"
                          disabled={true}
                        />
                        <span className="flex items-center gap-1">  
                          <Sparkle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Generate Using AI (Future)</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* AI Audio Notice */}
                  {watchedAudioOption === 'ai_generated' && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                      <Sparkle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">AI Audiobook Generation (Roadmap Feature):</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          This title will be queued for automated voice synthesis once the AI conversion pipeline is deployed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recorded Audio Upload */}
                  {watchedAudioOption === 'has_audiobook' && (
                    <div className="space-y-4 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in">
                      <Input
                        label="Narrator Name"
                        required={watchedBookFormat === 'audiobook_only'}
                        placeholder="e.g. Jane Smith, Michael Kramer"
                        error={errors.narrator?.message}
                        {...register('narrator')}
                      />

                      <FileDropzone
                        label="Audio Master Track File"
                        required={watchedBookFormat === 'audiobook_only'}
                        accept={{
                          'audio/mpeg': ['.mp3'],
                          'audio/mp4': ['.m4b', '.m4a'],
                        }}
                        maxSizeMB={500}
                        iconType="audio"
                        helperText="Drag & drop MP3, M4B audio master file (Recommended 192kbps+ stereo track, Max 500MB)"
                        onFileSelected={(file) => setAudioFile(file)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Book Cover & Submission */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardHeader title="Book Cover" />
            <CardContent className="space-y-4">
              {/* Cover Live Mockup Preview */}
              <div className="relative aspect-[3/4] w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 overflow-hidden shadow-inner flex flex-col justify-end p-5 text-slate-800">
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
                    <span className="text-xs font-medium">Cover Graphic Placeholder</span>
                  </div>
                )}

                {/* Overlaid preview badge */}
                <div className="relative z-10 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-sm border border-white/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    {selectedPrimaryCategory?.name || 'Category'}
                  </p>
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">
                    {watchedTitle}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {selectedAuthor?.name || 'Author Name'}
                  </p>
                </div>
              </div>

              {/* Cover Upload Dropzone */}
              <FileDropzone
                label="Cover Image File"
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxSizeMB={10}
                iconType="image"
                helperText="PNG, JPG or WEBP (1200x1600 recommended)"
                onFileSelected={(file) => {
                  setCoverFile(file);
                  if (file) {
                    setCoverPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setCoverPreviewUrl(null);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting || createBookMutation.isPending}
              className="w-full bg-[#1e4634] hover:bg-[#153426] shadow-md font-semibold"
              leftIcon={<CheckCircle className="w-4 h-4" weight="bold" />}
            >
              Save Book
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push('/books')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
