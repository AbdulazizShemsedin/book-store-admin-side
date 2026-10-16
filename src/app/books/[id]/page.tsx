'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { useBook } from '@/features/books/hooks/use-books';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { booksApi } from '@/features/books/api/books-api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeft,
  Check,
  Headphones,
  BookOpen,
  Image as ImageIcon,
  Folder,
  Plus,
  TreeStructure,
  Tag,
  CheckCircle,
  UploadSimple,
  PencilSimple,
} from '@phosphor-icons/react';
import {
  buildCategoryTree,
  flattenCategoryTree,
  resolveCategoryLineage,
} from '@/features/categories/utils/category-tree';
import { uploadBookThumbnail } from '@/lib/upload/multipart-upload';
import { cn } from '@/lib/utils/cn';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = typeof params?.id === 'string' ? params.id : '';

  const { data: book, isLoading, isError, error, refetch } = useBook(bookId);
  const { data: categoriesData } = useCategories({ pageSize: 100 });
  const allCategories = categoriesData?.categories || [];

  const [selectedTagId, setSelectedTagId] = useState('');
  const [isAttachingTag, setIsAttachingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cover image upload state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadCoverError, setUploadCoverError] = useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setUploadCoverError(null);
    try {
      await uploadBookThumbnail(bookId, file);
      await refetch();
    } catch (err: any) {
      setUploadCoverError(err.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Build hierarchical category nodes
  const categoryTree = React.useMemo(() => buildCategoryTree(allCategories), [allCategories]);
  const flatCategoryNodes = React.useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  const selectedNode = React.useMemo(
    () => flatCategoryNodes.find((n) => n.id === selectedTagId),
    [flatCategoryNodes, selectedTagId]
  );

  if (isLoading) {
    return (
      <AdminShell>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading book details from catalog...</p>
        </div>
      </AdminShell>
    );
  }

  if (isError || !book) {
    return (
      <AdminShell>
        <ErrorState
          title="Failed to load book record"
          message={error?.message || 'Book record could not be retrieved from catalog service.'}
          onRetry={() => refetch()}
        />
      </AdminShell>
    );
  }

  const attachedTags = book.tags || [];

  const handleAttachCategory = async () => {
    if (!selectedTagId) return;
    setIsAttachingTag(true);
    setTagError(null);
    setSuccessMessage(null);
    try {
      // Resolve lineage so that all ancestor categories (e.g. Master Category -> Subcategory)
      // are attached to the book for complete mobile app catalog discovery
      const lineageIds = resolveCategoryLineage([selectedTagId], allCategories);
      for (const id of lineageIds) {
        await booksApi.attachTag(bookId, id);
      }
      setSelectedTagId('');
      setSuccessMessage('Category attached successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      await refetch();
    } catch (err) {
      setTagError('Failed to attach category. Please try again.');
    } finally {
      setIsAttachingTag(false);
    }
  };

  return (
    <AdminShell>
      {/* Top Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Catalog', href: '/books' },
          { label: 'Books', href: '/books' },
          { label: book.name || bookId },
        ]}
        title={book.name}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => router.push('/books')}
            >
              Back to Books
            </Button>
            <Button
              size="sm"
              leftIcon={<PencilSimple className="w-3.5 h-3.5" weight="bold" />}
              onClick={() => router.push(`/books/${bookId}/edit`)}
              className="bg-[#1e4634] hover:bg-[#153426] text-white shadow-xs"
            >
              Edit Book
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Metadata, Description, Assets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Cover graphic & direct upload */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className={cn(
                      'w-36 h-48 rounded-xl border flex flex-col items-center justify-center overflow-hidden shadow-inner relative group cursor-pointer transition-all',
                      book.thumbnail
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-slate-50 border-dashed border-slate-300 hover:border-[#1e4634] hover:bg-emerald-50/40'
                    )}
                    title={book.thumbnail ? 'Click to replace cover image' : 'Click to upload cover image'}
                  >
                    {book.thumbnail ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.thumbnail}
                          alt={book.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                          <UploadSimple className="w-5 h-5 mb-1" />
                          <span className="text-[11px] font-semibold">Replace Cover</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-[#1e4634] p-3 text-center transition-colors">
                        <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                        <span className="text-xs font-semibold">Upload Cover</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-500 mt-0.5">PNG, JPG, WEBP</span>
                      </div>
                    )}

                    {isUploadingCover && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-20">
                        <Spinner size="md" />
                        <span className="text-xs font-semibold text-[#1e4634] mt-2">Uploading...</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleUploadCover}
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    isLoading={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                    className="text-xs h-7 px-2 text-slate-600 hover:text-slate-900 font-medium"
                  >
                    {book.thumbnail ? 'Replace Cover' : 'Upload Cover'}
                  </Button>

                  {uploadCoverError && (
                    <p className="text-[11px] text-red-600 font-medium text-center max-w-[144px]">
                      {uploadCoverError}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {book.language || 'English'}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{book.name}</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Author</span>
                      <span className="font-semibold text-slate-800">{book.author || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Publisher</span>
                      <span className="font-semibold text-slate-800">{book.publisher || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Status</span>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold capitalize mt-0.5',
                          book.status?.toLowerCase() === 'public' || book.status?.toLowerCase() === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        )}
                      >
                        {book.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Master Language</span>
                      <span className="font-semibold text-slate-800">{book.language || 'English'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Digital Book</span>
                      <span className="font-semibold text-slate-800">
                        {book.hasAudiobook ? 'Has Audio Track' : 'Standard'}
                      </span>
                    </div>

                    {book.price && (book.price.bookOnly || book.price.audioOnly || book.price.total) && (
                      <div className="col-span-2 sm:col-span-3 pt-3 border-t border-slate-100 flex flex-wrap gap-5 text-xs">
                        {book.price.bookOnly && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Book Price</span>
                            <span className="font-semibold text-slate-800">{book.price.bookOnly} ETB</span>
                          </div>
                        )}
                        {book.price.audioOnly && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Audio Price</span>
                            <span className="font-semibold text-slate-800">{book.price.audioOnly} ETB</span>
                          </div>
                        )}
                        {book.price.total && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Bundle Total</span>
                            <span className="font-semibold text-emerald-800">{book.price.total} ETB</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader title="Description / Synopsis" />
            <CardContent>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                {book.description || 'No description provided for this title.'}
              </p>
            </CardContent>
          </Card>

          {/* Real Assets Card */}
          <Card>
            <CardHeader title="Digital Media Assets" />
            <CardContent className="space-y-4">
              {/* Asset 1: EPUB Manuscript */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Digital E-Book (EPUB)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Manuscript reader file for mobile and tablet reading
                    </p>
                  </div>
                </div>
                <div>
                  <Badge
                    variant={book.assets?.book ? 'success' : 'default'}
                    size="sm"
                    className={
                      book.assets?.book
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {book.assets?.book ? 'Active File' : 'Not Attached'}
                  </Badge>
                </div>
              </div>

              {/* Asset 2: Audiobook Master */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center">
                    <Headphones className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Audiobook Master (MP3)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Audio narration stream for mobile audiobook player
                    </p>
                  </div>
                </div>
                <div>
                  <Badge
                    variant={book.assets?.audio || book.hasAudiobook ? 'success' : 'default'}
                    size="sm"
                    className={
                      book.assets?.audio
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {book.assets?.audio ? 'Active Stream' : book.hasAudiobook ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
              </div>

              {/* Asset 3: Storefront Thumbnail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Storefront Cover Image
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Catalog thumbnail for mobile discovery feeds
                    </p>
                    {uploadCoverError && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{uploadCoverError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={book.thumbnail ? 'success' : 'default'}
                    size="sm"
                    className={book.thumbnail ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600'}
                  >
                    {book.thumbnail ? 'Uploaded' : 'No Cover'}
                  </Badge>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleUploadCover}
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    isLoading={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                    className="text-xs h-8 px-2.5 font-medium"
                  >
                    {book.thumbnail ? 'Replace Cover' : 'Upload Cover'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Categories & Attached Tags */}
        <div className="space-y-6">
          {/* Categories Card */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-1.5">
                  <TreeStructure className="w-4 h-4 text-[#1e4634]" />
                  <span>Attached Categories</span>
                </div>
              }
              action={
                <span className="text-[11px] font-semibold text-[#1e4634] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {attachedTags.length} attached
                </span>
              }
            />
            <CardContent className="space-y-4">
              {/* Attached Category Badges */}
              <div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Categories linked to this book on the backend:
                </p>
                {attachedTags.length === 0 ? (
                  <div className="p-4 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                    <Folder className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">No categories attached yet</p>
                    <p className="text-[11px] text-slate-400">
                      Attach this book to catalog categories to make it discoverable on mobile feeds.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attachedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#1e4634]" weight="fill" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attach Existing Category */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                    Attach Taxonomy Category
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a section or subcategory from the catalog hierarchy.
                  </p>
                </div>

                {tagError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {tagError}
                  </div>
                )}

                {successMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedTagId}
                      onChange={(e) => setSelectedTagId(e.target.value)}
                      className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4634]/20 focus:border-[#1e4634] transition-colors"
                    >
                      <option value="">Select category to attach...</option>
                      {flatCategoryNodes.map((node) => {
                        const isAlreadyAttached = attachedTags.some(
                          (t) => t.toLowerCase() === node.name.toLowerCase()
                        );
                        const indent = node.depth > 1 ? `${'— '.repeat(node.depth - 1)}` : '';
                        const levelLabel = node.depth === 1 ? '(Master)' : `(L${node.depth})`;
                        return (
                          <option
                            key={node.id}
                            value={node.id}
                            disabled={isAlreadyAttached}
                          >
                            {indent}{node.name} {isAlreadyAttached ? '✓ Already Attached' : levelLabel}
                          </option>
                        );
                      })}
                    </select>

                    <Button
                      size="sm"
                      onClick={handleAttachCategory}
                      isLoading={isAttachingTag}
                      disabled={!selectedTagId}
                      leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
                      className="bg-[#1e4634] hover:bg-[#153426] text-white h-9 px-3 text-xs font-semibold shadow-xs"
                    >
                      Attach
                    </Button>
                  </div>

                  {/* Lineage Info Pill */}
                  {selectedNode && selectedNode.depth > 1 && (
                    <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5">
                      <TreeStructure className="w-3.5 h-3.5 text-[#1e4634] flex-shrink-0" />
                      <span>
                        Path: <strong>{selectedNode.fullPath}</strong> (will automatically link parent levels)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Record Card */}
          <Card>
            <CardHeader title="Catalog System Info" />
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Record ID</span>
                <span className="font-mono text-[11px] text-slate-700">{book.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Catalog Publication</span>
                <span className="font-medium text-emerald-800">{book.status || 'Active'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Language Standard</span>
                <span className="font-medium text-slate-800">{book.language || 'English'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
