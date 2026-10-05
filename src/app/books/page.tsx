'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { BookTable } from '@/features/books/components/book-table';
import { useBooks } from '@/features/books/hooks/use-books';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, MagnifyingGlass, ArrowClockwise, Funnel } from '@phosphor-icons/react';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading, isError, error, refetch } = useBooks({
    page,
    pageSize,
    search,
    category: category !== 'All' ? category : undefined,
  });

  const books = data?.books || [];
  const total = data?.total || 0;

  return (
    <AdminShell>
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

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-96 relative">
          <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or publisher..."
            className="w-full h-9 pl-10 pr-9 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors shadow-xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Funnel className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dropdown Filters & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="w-36">
            <Select
              size="sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: 'Category: All', value: 'All' },
                { label: 'Fiction', value: 'Fiction' },
                { label: 'Tafsir', value: 'Tafsir' },
                { label: 'History', value: 'History' },
                { label: 'Literature', value: 'Literature' },
              ]}
            />
          </div>

          {/* Format Filter */}
          <div className="w-36">
            <Select
              size="sm"
              defaultValue="All"
              options={[
                { label: 'Filter: Format', value: 'All' },
                { label: 'has Audiobook', value: 'Audiobook' },
                { label: 'Text-only', value: 'Text' },
              ]}
            />
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh table"
            title="Refresh books list"
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowClockwise className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Books Table & Pagination */}
      <div className="space-y-0">
        <BookTable
          books={books}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />

        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="books"
        />
      </div>
    </AdminShell>
  );
}
