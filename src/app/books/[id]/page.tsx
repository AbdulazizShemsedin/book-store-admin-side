'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { useBook } from '@/features/books/hooks/use-books';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import {
  ArrowLeft,
  Check,
  PencilSimple,
  DownloadSimple,
  ArrowClockwise,
  Headphones,
  BookOpen,
  Image as ImageIcon,
  ShoppingCart,
  PlayCircle,
  Star,
  Plus,
  X,
} from '@phosphor-icons/react';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = typeof params?.id === 'string' ? params.id : 'BK-30291';
  const { data: book, isLoading, isError, error, refetch } = useBook(bookId);

  const [tags, setTags] = useState(['Literary Fiction', 'Bestseller', 'Staff Pick']);
  const [newTagInput, setNewTagInput] = useState('');

  if (isLoading) {
    return (
      <AdminShell>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading book details...</p>
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

  const handleAttachTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <AdminShell>
      {/* Top Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Catalog', href: '/books' },
          { label: 'Books', href: '/books' },
          { label: bookId },
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
            <Button
              size="sm"
              leftIcon={<Check className="w-3.5 h-3.5" weight="bold" />}
              className="bg-[#1e4634] hover:bg-[#153426]"
              onClick={() => alert('Changes saved successfully!')}
            >
              Save Changes
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
                <div className="w-36 h-48 flex-shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                  <BookOpen className="w-12 h-12" weight="duotone" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        {book.category || 'Fiction / Literary'}
                      </p>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">{book.name}</h2>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                    >
                      <PencilSimple className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Author</span>
                      <span className="font-semibold text-slate-800">{book.author || 'Matt Haig'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Publisher</span>
                      <span className="font-semibold text-slate-800">{book.publisher || 'Canongate Books'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Publication Date</span>
                      <span className="font-semibold text-slate-800">Sep 19, 2020</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Page Count</span>
                      <span className="font-semibold text-slate-800">{book.pageCount || 304} pages</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Primary Language</span>
                      <span className="font-semibold text-slate-800">{book.language || 'English'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader
              title="Description"
              action={
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <PencilSimple className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              }
            />
            <CardContent>
              <p className="text-xs leading-relaxed text-slate-600">
                {book.description ||
                  'The Midnight Library is a bestselling novel by Matt Haig, hailed by critics and readers alike as a life-affirming exploration of regret, possibility, and the meaning of existence. Between life and death lies the Midnight Library - a place where every book represents a different life Nora Seed could have lived.'}
              </p>
            </CardContent>
          </Card>

          {/* Assets Card */}
          <Card>
            <CardHeader title="Assets" />
            <CardContent className="space-y-4">
              {/* Asset 1: EPUB */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      midnight_library_en_v1.0.epub
                    </p>
                    <p className="text-[11px] text-slate-500">5.2 MB · Uploaded Mar 04, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<DownloadSimple className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<ArrowClockwise className="w-3.5 h-3.5" />}
                  >
                    Replace
                  </Button>
                </div>
              </div>

              {/* Asset 2: Audiobook */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center">
                    <Headphones className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      midnight_library_audiobook_master.mp3
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Narrated by Carey Mulligan · 312.4 MB
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<ArrowClockwise className="w-3.5 h-3.5" />}
                >
                  Replace Audio
                </Button>
              </div>

              {/* Asset 3: Thumbnail */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Storefront Thumbnail & Badges
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Auto-derived variants for mobile, web, and syndication feeds
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<ArrowClockwise className="w-3.5 h-3.5" />}
                >
                  Replace Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Tags & Performance Stats */}
        <div className="space-y-6">
          {/* Tags Card */}
          <Card>
            <CardHeader
              title="Tags"
              action={
                <span className="text-[11px] text-slate-500 font-medium">
                  {tags.length} active
                </span>
              }
            />
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Primary Category
                </label>
                <select className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20">
                  <option>Literary Fiction</option>
                  <option>Contemporary Literature</option>
                  <option>Philosophy</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Attached Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1 font-medium bg-emerald-50 text-emerald-800 border-emerald-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAttachTag();
                    }
                  }}
                  placeholder="Add custom tag..."
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAttachTag}
                  className="bg-[#1e4634] text-white hover:bg-[#153426]"
                >
                  Attach
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Stats Card */}
          <Card>
            <CardHeader
              title="Performance & Stats"
              subtitle="Last 30 Days"
            />
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Copies Sold
                    </span>
                    <p className="text-base font-bold text-slate-900">3,840</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Audio Plays
                    </span>
                    <p className="text-base font-bold text-slate-900">12,460</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Star className="w-4 h-4" weight="fill" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Average Rating
                    </span>
                    <p className="text-base font-bold text-slate-900">
                      4.9 <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
