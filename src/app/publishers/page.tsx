'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { PublisherTable } from '@/features/publishers/components/publisher-table';
import { PublisherFormCard } from '@/features/publishers/components/publisher-form-card';
import { EditPublisherModal } from '@/features/publishers/components/edit-publisher-modal';
import { usePublishers, useDeletePublisher } from '@/features/publishers/hooks/use-publishers';
import { Pagination } from '@/components/tables/pagination';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Publisher } from '@/types/domain';

export default function PublishersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#publisher-form-card') {
      const el = document.getElementById('publisher-form-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-emerald-500/50', 'border-emerald-600', 'shadow-lg');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-500/50', 'border-emerald-600', 'shadow-lg');
        }, 2500);
      }
    }
  }, []);

  const { data, isLoading, isError, error, refetch } = usePublishers({
    page,
    pageSize,
    search,
  });

  const deletePublisherMutation = useDeletePublisher();

  const publishers = data?.publishers || [];
  const total = data?.total || 0;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Publishers' }]}
        title="Publishers"
        subtitle="Manage registered catalog publishers, press imprints, and distribution partners."
      />

      {/* Search Toolbar */}
      <div className="glass-panel p-3.5 rounded-2xl mb-4 relative z-10 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search publishers..."
              className="w-full h-9 pl-10 pr-3 text-xs bg-white/70 dark:bg-white/[0.05] border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors shadow-2xs backdrop-blur-md"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {total} RECORDS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Table & Pagination */}
        <div className="lg:col-span-2 space-y-0">
          <PublisherTable
            publishers={publishers}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onEdit={(pub) => setEditingPublisher(pub)}
            onDelete={(pub) => {
              if (confirm(`Remove publisher ${pub.name}?`)) {
                deletePublisherMutation.mutate(pub.id);
              }
            }}
          />

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="publishers"
          />
        </div>

        {/* Right Column: Sticky Add Publisher Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-20">
          <PublisherFormCard />
        </div>
      </div>

      {/* Edit Publisher Modal */}
      <EditPublisherModal
        publisher={editingPublisher}
        isOpen={Boolean(editingPublisher)}
        onClose={() => setEditingPublisher(null)}
      />
    </AdminShell>
  );
}
