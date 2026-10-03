'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AuthorTable } from '@/features/authors/components/author-table';
import { AuthorModal } from '@/features/authors/components/author-modal';
import { useAuthors } from '@/features/authors/hooks/use-authors';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DownloadSimple, MagnifyingGlass, Funnel, ArrowsDownUp } from '@phosphor-icons/react';

export default function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAuthors({
    page,
    pageSize,
    search,
  });

  const authors = data?.authors || [];
  const total = data?.total || 0;

  return (
    <AdminShell>
      {/* Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Authors' }]}
        title="Author Directory"
        badge={
          <Badge variant="primary" size="md">
            {total || 52} Active Authors
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<DownloadSimple className="w-3.5 h-3.5" />}
              onClick={() => alert('Exporting author catalog CSV...')}
            >
              Export
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1e4634] hover:bg-[#153426]"
            >
              Add Author
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search author by name, ID, or bio..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Funnel className="w-3.5 h-3.5 text-slate-500" />}
          >
            Filter Field
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowsDownUp className="w-3.5 h-3.5 text-slate-500" />}
          >
            Sort: Joined
          </Button>
        </div>
      </div>

      {/* Authors Table & Pagination */}
      <div className="space-y-0">
        <AuthorTable
          authors={authors}
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
          itemLabel="records"
        />
      </div>

      {/* Author Creation Modal */}
      <AuthorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AdminShell>
  );
}
