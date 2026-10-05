'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { PublisherTable } from '@/features/publishers/components/publisher-table';
import { PublisherFormCard } from '@/features/publishers/components/publisher-form-card';
import { usePublishers, useDeletePublisher } from '@/features/publishers/hooks/use-publishers';
import { Pagination } from '@/components/tables/pagination';
import { MagnifyingGlass } from '@phosphor-icons/react';

export default function PublishersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Search & Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {total} RECORDS
            </span>
          </div>

          <PublisherTable
            publishers={publishers}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onEdit={(pub) => alert(`Editing publisher: ${pub.name}`)}
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

        {/* Right Column: Add / Edit Publisher Form */}
        <div className="lg:col-span-1">
          <PublisherFormCard />
        </div>
      </div>
    </AdminShell>
  );
}
