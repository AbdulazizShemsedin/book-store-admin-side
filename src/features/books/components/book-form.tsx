'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { bookFormSchema, BookFormData } from '../schemas/book-schema';
import { useCreateBook } from '../hooks/use-books';
import { useAuthors } from '@/features/authors/hooks/use-authors';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  BookOpen,
  Headphones,
  Sparkle,
  X,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  Check,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { cn } from '@/lib/utils/cn';

const PRESET_TAG_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Slate', value: '#475569' },
];

export function BookForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Tag list & color management
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Fiction',
    'Non-Fiction',
    'Bestseller',
    'Literary Fiction',
    'Staff Pick',
    'New Release',
    'Classic',
    'Islamic Studies',
    'History',
    'Biography',
    'Philosophy',
    'Science',
    'Poetry',
  ]);
  const [selectedTagToAttach, setSelectedTagToAttach] = useState<string>('');
  const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#10b981');
  const [tagColors, setTagColors] = useState<Record<string, string>>({
    'Bestseller': '#d97706',
    'Literary Fiction': '#7c3aed',
    'Fiction': '#10b981',
    'Non-Fiction': '#0284c7',
    'Staff Pick': '#db2777',
    'New Release': '#2563eb',
    'Classic': '#475569',
    'Islamic Studies': '#059669',
    'History': '#b45309',
    'Biography': '#4f46e5',
    'Philosophy': '#6b7280',
    'Science': '#0d9488',
    'Poetry': '#9333ea',
  });

  const { data: authorsData } = useAuthors({ pageSize: 100 });
  const { data: categoriesData } = useCategories({ pageSize: 100 });

  const authors = authorsData?.authors || [];
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
      publisherId: 'pub-01',
      pageCount: 384,
      tags: ['Bestseller', 'Literary Fiction'],
      categoryId: '',
      subcategoryId: '',
      description: '',
      language: 'English',
      audiobookOption: 'has_audiobook',
      hasAudiobook: false,
      narrator: '',
    },
  });

  const watchedTitle = watch('name') || 'Book Title Preview';
  const watchedAuthorId = watch('authorId');
  const watchedCategoryId = watch('categoryId');
  const watchedTags = watch('tags') || [];
  const watchedHasAudiobook = watch('hasAudiobook');
  const watchedAudioOption = watch('audiobookOption');

  // Derive author and category display names for live preview
  const selectedAuthor = authors.find((a) => a.id === watchedAuthorId);
  const selectedCategory = categories.find((c) => c.id === watchedCategoryId);

  // Subcategories derived from chosen primary category
  const availableSubcategories = categories.filter(
    (c) => c.parentId && c.parentId === watchedCategoryId
  );

  const createBookMutation = useCreateBook((bookId) => {
    router.push(`/books/${bookId}`);
  });

  const handleAttachSelectedTag = () => {
    if (selectedTagToAttach && !watchedTags.includes(selectedTagToAttach)) {
      setValue('tags', [...watchedTags, selectedTagToAttach]);
      setSelectedTagToAttach('');
    }
  };

  const handleCreateNewTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    setTagColors((prev) => ({ ...prev, [trimmed]: selectedColor }));
    if (!watchedTags.includes(trimmed)) {
      setValue('tags', [...watchedTags, trimmed]);
    }
    setNewTagName('');
    setIsAddingNewTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((t) => t !== tagToRemove)
    );
  };

  const onSubmit = async (data: BookFormData) => {
    setFormError(null);
    try {
      await createBookMutation.mutateAsync(data);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Book Info & Asset Uploads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Book Information */}
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
                <Select
                  label="Author"
                  required
                  placeholder="Select registered author..."
                  options={authors.map((a) => ({ label: a.name, value: a.id }))}
                  error={errors.authorId?.message}
                  {...register('authorId')}
                />

                <Select
                  label="Publisher"
                  placeholder="Select publisher..."
                  options={[
                    { label: 'Darussalam Publishers', value: 'pub-01' },
                    { label: 'Islamic Texts Society', value: 'pub-02' },
                    { label: 'Turath Publishing', value: 'pub-03' },
                    { label: 'Kube Publishing', value: 'pub-04' },
                    { label: 'Canongate Books', value: 'pub-05' },
                  ]}
                  error={errors.publisherId?.message}
                  {...register('publisherId')}
                />
              </div>

              {/* Number of Pages & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Number of Pages"
                  type="number"
                  placeholder="e.g. 384"
                  error={errors.pageCount?.message}
                  {...register('pageCount')}
                />

                {/* Tags Field (Dropdown + Search + Add Tag + Color Picker + Attached Tags) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Tags <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewTag((prev) => !prev)}
                      className="text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" weight="bold" />
                      <span>{isAddingNewTag ? 'Cancel Add Tag' : 'Add New Tag'}</span>
                    </button>
                  </div>

                  {/* Dropdown with Attach Button */}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        placeholder="Select tag from list..."
                        options={availableTags
                          .filter((t) => !watchedTags.includes(t))
                          .map((t) => ({ label: t, value: t }))}
                        value={selectedTagToAttach}
                        onChange={(e) => setSelectedTagToAttach(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      size="md"
                      variant="secondary"
                      onClick={handleAttachSelectedTag}
                      disabled={!selectedTagToAttach}
                      className="h-10 px-4 font-medium"
                    >
                      Attach
                    </Button>
                  </div>

                  {/* Add New Tag Drawer/Section */}
                  {isAddingNewTag && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tag Name
                        </label>
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateNewTag();
                            }
                          }}
                          placeholder="e.g. Science Fiction, Academic..."
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                        />
                      </div>

                      {/* Color Picker Palette */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Tag Background Color
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRESET_TAG_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setSelectedColor(color.value)}
                              title={color.name}
                              className={cn(
                                'w-6 h-6 rounded-full transition-transform flex items-center justify-center border border-white shadow-xs',
                                selectedColor === color.value
                                  ? 'scale-110 ring-2 ring-emerald-700 ring-offset-1'
                                  : 'hover:scale-105'
                              )}
                              style={{ backgroundColor: color.value }}
                            >
                              {selectedColor === color.value && (
                                <Check className="w-3 h-3 text-white" weight="bold" />
                              )}
                            </button>
                          ))}
                          {/* Custom Color Input */}
                          <label
                            title="Custom color"
                            className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden bg-white hover:border-slate-400"
                          >
                            <input
                              type="color"
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className="opacity-0 w-0 h-0"
                            />
                            <div className="w-full h-full" style={{ backgroundColor: selectedColor }} />
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setIsAddingNewTag(false);
                            setNewTagName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateNewTag}
                          className="bg-[#1e4634] hover:bg-[#153426]"
                        >
                          Add & Attach
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Attached Tags (Excalidraw design: Attached tags) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Attached tags
                    </span>
                    {watchedTags.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No tags attached yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {watchedTags.map((tag) => {
                          const tagBgColor = tagColors[tag] || '#10b981';
                          return (
                            <span
                              key={tag}
                              style={{ backgroundColor: tagBgColor }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white shadow-xs"
                            >
                              <span>{tag}</span>
                              {/* Color changer input */}
                              <label
                                title={`Change background color for "${tag}"`}
                                className="w-3.5 h-3.5 rounded-full border border-white/60 cursor-pointer overflow-hidden flex items-center justify-center flex-shrink-0"
                              >
                                <input
                                  type="color"
                                  value={tagBgColor}
                                  onChange={(e) =>
                                    setTagColors((prev) => ({ ...prev, [tag]: e.target.value }))
                                  }
                                  className="opacity-0 w-0 h-0"
                                />
                                <div className="w-full h-full" style={{ backgroundColor: tagBgColor }} />
                              </label>
                              {/* Remove tag */}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                aria-label={`Remove tag ${tag}`}
                                title={`Remove tag ${tag}`}
                                className="text-white/80 hover:text-white transition-opacity ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {errors.tags?.message && (
                    <p className="text-xs text-red-600 font-medium">{errors.tags.message}</p>
                  )}
                </div>
              </div>

              {/* Category & Subcategory (PM Requirement: Subcategories) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Category"
                  required
                  placeholder="Assign category..."
                  options={categories
                    .filter((c) => !c.parentId)
                    .map((c) => ({ label: c.name, value: c.id }))}
                  error={errors.categoryId?.message}
                  {...register('categoryId')}
                />

                <Select
                  label="Subcategory"
                  placeholder={
                    availableSubcategories.length > 0
                      ? 'Select subcategory...'
                      : 'No subcategories available'
                  }
                  options={availableSubcategories.map((sub) => ({
                    label: sub.name,
                    value: sub.id,
                  }))}
                  disabled={availableSubcategories.length === 0}
                  helperText={
                    availableSubcategories.length === 0
                      ? 'Select a parent category to enable subcategories'
                      : undefined
                  }
                  {...register('subcategoryId')}
                />
              </div>

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Enter brief description..."
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />

              {/* Master Language (PM Requirement: Applies to BOTH book & audiobook) */}
              <Select
                label="Book & Audiobook Master Language"
                required
                helperText="Master Language applies to both the written book file and the audiobook edition."
                options={[
                  { label: 'English', value: 'English' },
                  { label: 'Amharic (አማርኛ)', value: 'Amharic' },
                  { label: 'Arabic (العربية)', value: 'Arabic' },
                  { label: 'French (Français)', value: 'French' },
                  { label: 'Oromo (Afaan Oromoo)', value: 'Oromo' },
                  { label: 'Somali (Soomaali)', value: 'Somali' },
                ]}
                error={errors.language?.message}
                {...register('language')}
              />
            </CardContent>
          </Card>

          {/* Section 2: Assets & Audiobook Upload */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2 text-slate-900">
                  <Headphones className="w-5 h-5 text-[#1e4634]" />
                  <span>Assets & Audiobook Upload</span>
                </div>
              }
            />
            <CardContent className="space-y-6">
              {/* Book File Upload (EPUB / PDF) */}
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
                onUploaded={(result) => setValue('bookFileId', result.fileId)}
              />

              {/* Condition Choice between Has Audiobook vs Generated Using AI (PM Requirement) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Audiobook Production Option
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Choose between providing recorded audio master or reserving future AI generation
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
                      <span>Has Recorded Audio</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-not-allowed opacity-75">
                      <input
                        type="radio"
                        value="ai_generated"
                        checked={watchedAudioOption === 'ai_generated'}
                        onChange={() => {
                          setValue('audiobookOption', 'ai_generated');
                          setValue('hasAudiobook', false);
                        }}
                        className="text-emerald-800 focus:ring-emerald-700/20"
                      />
                      <span className="flex items-center gap-1">
                        <Sparkle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Generated Using AI (Future)</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* AI Audio Notice (Future feature: confirmed PM requirement not to run actual generation) */}
                {watchedAudioOption === 'ai_generated' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Sparkle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">AI Audiobook Generation (Roadmap Feature):</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        This title will be flagged for automated synthesis once the AI conversion
                        pipeline is activated by the engineering team.
                      </p>
                    </div>
                  </div>
                )}

                {/* Has Audiobook Toggle and Form Fields */}
                {watchedAudioOption === 'has_audiobook' && (
                  <div className="space-y-4 pt-1">
                    <Controller
                      name="hasAudiobook"
                      control={control}
                      render={({ field }) => (
                        <Toggle
                          checked={field.value}
                          onChange={field.onChange}
                          label="Has Audiobook ?"
                        />
                      )}
                    />

                    {watchedHasAudiobook && (
                      <div className="space-y-4 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in">
                        <Input
                          label="Narrator Name"
                          placeholder="e.g. Jane Smith"
                          error={errors.narrator?.message}
                          {...register('narrator')}
                        />

                        <FileDropzone
                          label="Audio Master Track File"
                          accept={{
                            'audio/mpeg': ['.mp3'],
                            'audio/mp4': ['.m4b', '.m4a'],
                          }}
                          maxSizeMB={500}
                          iconType="audio"
                          helperText="Drag & drop MP3, M4B audio master file (Recommended 192kbps+ stereo track, Max 500MB)"
                          onUploaded={(result) => setValue('audioFileId', result.fileId)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    {selectedCategory?.name || 'Category'}
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
                onUploaded={(result) => {
                  setValue('coverFileId', result.fileId);
                  setCoverPreviewUrl(
                    `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80`
                  );
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
