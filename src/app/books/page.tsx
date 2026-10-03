'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { BookTable } from '@/features/books/components/book-table';
import { useBooks } from '@/features/books/hooks/use-books';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Plus, MagnifyingGlass, ArrowClockwise, Funnel } from '@phosphor-icons/react';

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const { data, isLoading, isError, error, refetch } = useBooks({
    page,
    pageSize,
    search,
    category: category !== 'All' ? category : undefined,
    status: status !== 'All' ? status : undefined,
  });

  const books = data?.books || [];
  const total = data?.total || 2850;

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
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-xs"
          >
            <option value="All">Category: All</option>
            <option value="Fiction">Fiction</option>
            <option value="Tafsir">Tafsir</option>
            <option value="History">History</option>
            <option value="Literature">Literature</option>
          </select>

          {/* Format Filter */}
          <select
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-xs"
          >
            <option value="All">Filter: Format</option>
            <option value="Audiobook">has Audiobook</option>
            <option value="Text">Text-only</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-xs"
          >
            <option value="All">Status: All</option>
            <option value="Published">Published / Live</option>
            <option value="Review">In Review</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh table"
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
