'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { BookTable } from '@/features/books/components/book-table';
import { useBooks } from '@/features/books/hooks/use-books';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Plus,
  MagnifyingGlass,
  ArrowClockwise,
  Funnel,
  User,
  X,
  Translate,
  DownloadSimple,
  Headphones,
  FileText,
} from '@phosphor-icons/react';
import { exportToCSV, exportToJSON } from '@/lib/utils/export-utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

import { useDebounce } from '@/lib/hooks/use-debounce';

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven query parameters for author filtering
  const authorIdParam = searchParams.get('author_id') || searchParams.get('authorId') || '';
  const authorNameParam = searchParams.get('author_name') || searchParams.get('authorName') || '';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');
  const [format, setFormat] = useState('All');

  // Debounce search input to avoid firing network requests on every keystroke
  const debouncedSearch = useDebounce(search, 350);

  // Query books catalog with authorId, language, and format forwarded to the server
  const { data, isLoading, isError, error, refetch } = useBooks({
    page,
    pageSize,
    search: debouncedSearch,
    category: category !== 'All' ? category : undefined,
    authorId: authorIdParam || undefined,
    language: language !== 'All' ? language : undefined,
    hasAudio: format === 'Audiobook' ? true : format === 'Text' ? false : undefined,
  });

  const books = React.useMemo(() => data?.books || [], [data?.books]);
  const total = data?.total || 0;

  // Filter books by selected language and format (three supported languages: en, am, ar)
  const displayedBooks = React.useMemo(() => {
    return books.filter((book) => {
      // Language filter
      if (language !== 'All') {
        const lang = (book.language || '').toLowerCase().trim();
        const matchesLang =
          (language === 'en' && (lang === 'en' || lang === 'english')) ||
          (language === 'am' && (lang === 'am' || lang === 'amharic')) ||
          (language === 'ar' && (lang === 'ar' || lang === 'arabic')) ||
          lang === language.toLowerCase();
        if (!matchesLang) return false;
      }

      // Format filter
      if (format === 'Audiobook' && !book.hasAudiobook) return false;
      if (format === 'Text' && book.hasAudiobook) return false;

      return true;
    });
  }, [books, language, format]);

  const handleClearAuthorFilter = () => {
    router.replace('/books');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!displayedBooks || displayedBooks.length === 0) {
      toast.error('No books available to export');
      return;
    }
    exportToCSV(
      displayedBooks.map((b) => ({
        id: b.id,
        title: b.name,
        author: b.author || '',
        publisher: b.publisher || '',
        language: b.language || '',
        format: b.hasAudiobook ? 'Audiobook' : 'E-Book',
        pageCount: b.pageCount || '',
        createdAt: b.createdAt || '',
      })),
      `tewba-books-${new Date().toISOString().split('T')[0]}`
    );
    toast.success(`Exported ${displayedBooks.length} books to CSV`);
  };

  const handleExportJSON = () => {
    if (!displayedBooks || displayedBooks.length === 0) {
      toast.error('No books available to export');
      return;
    }
    exportToJSON(
      displayedBooks,
      `tewba-books-${new Date().toISOString().split('T')[0]}`
    );
    toast.success(`Exported ${displayedBooks.length} books to JSON`);
  };

  return (
    <>
      {/* Top Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Books' }]}
        title="Books Catalog"
        actions={
          <Link href="/books/new">
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
              className="bg-[#1e4634] hover:bg-[#153426]"
            >
              Add Book
            </Button>
          </Link>
        }
      />

      {/* Active Filter Banner when filtered by author */}
      {authorIdParam && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-300 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/90 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" weight="bold" />
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Active filter: </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Books by {authorNameParam || authorIdParam}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                ({total} {total === 1 ? 'title found' : 'titles found'})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearAuthorFilter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-slate-800 font-semibold text-xs shadow-2xs transition-colors"
          >
            <X className="w-3.5 h-3.5" weight="bold" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Sticky Filter Bar & Table Actions */}
      <div className="sticky top-0 z-20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mb-5 bg-[#edf2ef]/85 dark:bg-[#06090e]/85 backdrop-blur-2xl border-b border-white/70 dark:border-white/10 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full lg:w-80 relative">
          <MagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, author, or publisher..."
            className="w-full h-9 pl-10 pr-9 text-xs bg-white/70 dark:bg-white/[0.05] border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors shadow-2xs backdrop-blur-md"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Funnel className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Quick Format Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 backdrop-blur-md shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setFormat('All');
                setPage(1);
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                format === 'All'
                  ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All Formats
            </button>
            <button
              type="button"
              onClick={() => {
                setFormat('Audiobook');
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                format === 'Audiobook'
                  ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audiobook</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormat('Text');
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                format === 'Text'
                  ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>E-Book</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="w-32">
            <Select
              size="sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'Category: All', value: 'All' },
                { label: 'Fiction', value: 'Fiction' },
                { label: 'Tafsir', value: 'Tafsir' },
                { label: 'History', value: 'History' },
                { label: 'Literature', value: 'Literature' },
              ]}
            />
          </div>

          {/* Language Filter */}
          <div className="w-32">
            <Select
              size="sm"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'Language: All', value: 'All' },
                { label: 'English', value: 'en' },
                { label: 'Amharic', value: 'am' },
                { label: 'Arabic', value: 'ar' },
              ]}
            />
          </div>

          {/* Export Dropdown Group */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExportCSV}
              title="Export current view to CSV"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 h-9 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <DownloadSimple className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              title="Export current view to JSON"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 h-9 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <span>JSON</span>
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh table"
            title="Refresh books list"
            className="p-2 h-9 w-9 flex items-center justify-center bg-white/70 dark:bg-white/[0.05] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-white dark:hover:bg-white/[0.1] transition-all shadow-2xs backdrop-blur-md"
          >
            <ArrowClockwise className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filters Row */}
      {(language !== 'All' || format !== 'All') && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Active filters:</span>
          {language !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium">
              <Translate className="w-3.5 h-3.5" />
              <span>
                Language: {language === 'en' ? 'English' : language === 'am' ? 'Amharic' : language === 'ar' ? 'Arabic' : language}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLanguage('All');
                  setPage(1);
                }}
                className="hover:text-emerald-950 dark:hover:text-emerald-100 ml-0.5 cursor-pointer"
                aria-label="Remove language filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {format !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium">
              <span>Format: {format === 'Audiobook' ? 'Audiobook' : 'Text-only'}</span>
              <button
                type="button"
                onClick={() => {
                  setFormat('All');
                  setPage(1);
                }}
                className="hover:text-emerald-950 dark:hover:text-emerald-100 ml-0.5 cursor-pointer"
                aria-label="Remove format filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setLanguage('All');
              setFormat('All');
              setPage(1);
            }}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline underline-offset-2 ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
      </div>

      {/* Books Table & Pagination */}
      <div className="space-y-0">
        <BookTable
          books={displayedBooks}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />

        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={language !== 'All' || format !== 'All' ? displayedBooks.length : total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="books"
        />
      </div>
    </>
  );
}

export default function BooksPage() {
  return (
    <AdminShell>
      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-slate-400">Loading catalog...</p>
          </div>
        }
      >
        <BooksContent />
      </Suspense>
    </AdminShell>
  );
}
