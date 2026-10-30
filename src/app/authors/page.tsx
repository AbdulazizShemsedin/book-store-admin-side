'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AuthorTable } from '@/features/authors/components/author-table';
import { AuthorModal } from '@/features/authors/components/author-modal';
import { useAuthors, useDeleteAuthor } from '@/features/authors/hooks/use-authors';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DownloadSimple, MagnifyingGlass, Funnel, ArrowsDownUp } from '@phosphor-icons/react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { exportToCSV, exportToJSON } from '@/lib/utils/export-utils';
import { toast } from 'sonner';

export default function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input to avoid spamming network on every keystroke
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('action') === 'new' || window.location.hash === '#author-form') {
        setIsModalOpen(true);
      }
    }
  }, []);

  const { data, isLoading, isError, error, refetch } = useAuthors({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const deleteAuthorMutation = useDeleteAuthor();

  const authors = data?.authors || [];
  const total = data?.total || 0;

  const handleExportCSV = () => {
    if (!authors || authors.length === 0) {
      toast.error('No authors available to export');
      return;
    }
    exportToCSV(
      authors.map((a) => ({
        id: a.id,
        name: a.name,
        nationality: a.nationality || '',
        bio: a.bio || '',
        worksCount: a.worksCount ?? 0,
      })),
      `tewba-authors-${new Date().toISOString().split('T')[0]}`
    );
    toast.success(`Exported ${authors.length} authors to CSV`);
  };

  const handleExportJSON = () => {
    if (!authors || authors.length === 0) {
      toast.error('No authors available to export');
      return;
    }
    exportToJSON(authors, `tewba-authors-${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exported ${authors.length} authors to JSON`);
  };

  return (
    <AdminShell>
      {/* Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Authors' }]}
        title="Author Directory"
        badge={
          <Badge variant="primary" size="md">
            {total} Active Authors
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export authors to CSV"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <DownloadSimple className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                title="Export authors to JSON"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <span>JSON</span>
              </button>
            </div>

            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1e4634] hover:bg-[#153426] rounded-xl shadow-sm"
            >
              Add Author
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl mb-4 relative z-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search author by name, ID, or bio..."
              className="w-full h-9 pl-10 pr-3 text-xs bg-white/70 dark:bg-white/[0.05] border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors shadow-2xs backdrop-blur-md"
            />
          </div>
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
          onDelete={(author) => {
            if (confirm(`Remove author "${author.name}"? This action cannot be undone.`)) {
              deleteAuthorMutation.mutate(author.id);
            }
          }}
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
