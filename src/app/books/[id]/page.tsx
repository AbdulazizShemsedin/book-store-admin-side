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
} from '@phosphor-icons/react';

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
    try {
      await booksApi.attachTag(bookId, selectedTagId);
      setSelectedTagId('');
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
        title={`Book Details - ${book.name}`}
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
                {/* Cover graphic */}
                <div className="w-36 h-48 flex-shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner relative">
                  {book.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.thumbnail}
                      alt={book.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12" weight="duotone" />
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
                      <span className="font-semibold text-slate-800 capitalize">
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
                  <Badge variant="default" size="sm" className="bg-slate-100 text-slate-700 border-slate-200">
                    Active
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
                    variant={book.hasAudiobook ? 'success' : 'default'}
                    size="sm"
                    className={book.hasAudiobook ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600'}
                  >
                    {book.hasAudiobook ? 'Attached' : 'Not Configured'}
                  </Badge>
                </div>
              </div>

              {/* Asset 3: Storefront Thumbnail */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Storefront Cover Image
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Catalog thumbnail for mobile discovery feeds
                    </p>
                  </div>
                </div>
                <div>
                  <Badge
                    variant={book.thumbnail ? 'success' : 'default'}
                    size="sm"
                    className={book.thumbnail ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600'}
                  >
                    {book.thumbnail ? 'Uploaded' : 'No Cover'}
                  </Badge>
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
                  <TreeStructure className="w-4 h-4 text-emerald-800" />
                  <span>Attached Categories</span>
                </div>
              }
              action={
                <span className="text-[11px] text-slate-500 font-medium">
                  {attachedTags.length} attached
                </span>
              }
            />
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Categories linked to this book on the backend:
                </p>
                {attachedTags.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 italic text-center">
                    No categories attached yet.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {attachedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs"
                      >
                        <Folder className="w-3.5 h-3.5 text-emerald-700" weight="fill" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attach Existing Category */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Attach Taxonomy Category
                </label>
                {tagError && (
                  <p className="text-xs text-red-600 font-medium">{tagError}</p>
                )}
                <div className="flex gap-2">
                  <select
                    value={selectedTagId}
                    onChange={(e) => setSelectedTagId(e.target.value)}
                    className="flex-1 h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  >
                    <option value="">Select category...</option>
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.parentId ? '(Subcategory)' : '(Main Category)'}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleAttachCategory}
                    isLoading={isAttachingTag}
                    disabled={!selectedTagId}
                    leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
                    className="bg-[#1e4634] hover:bg-[#153426] text-white h-9 px-3 text-xs"
                  >
                    Attach
                  </Button>
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
