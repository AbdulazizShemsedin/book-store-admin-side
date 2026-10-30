'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AdvertisementTable } from '@/features/advertisements/components/advertisement-table';
import { CreateAdvertisementModal } from '@/features/advertisements/components/create-advertisement-modal';
import { AdvertisementDetailModal } from '@/features/advertisements/components/advertisement-detail-modal';
import { useAdvertisements } from '@/features/advertisements/hooks/use-advertisements';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Plus, MagnifyingGlass, ArrowClockwise, DownloadSimple } from '@phosphor-icons/react';
import { exportToCSV, exportToJSON } from '@/lib/utils/export-utils';
import { toast } from 'sonner';

export default function AdvertisementsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const { data: ads = [], isLoading, isError, error, refetch, isFetching } = useAdvertisements();

  const filteredAds = React.useMemo(() => {
    return search
      ? ads.filter((a) => a.message.toLowerCase().includes(search.toLowerCase()))
      : ads;
  }, [ads, search]);

  const pagedAds = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAds.slice(start, start + pageSize);
  }, [filteredAds, page, pageSize]);

  const handleExportCSV = () => {
    if (!filteredAds || filteredAds.length === 0) {
      toast.error('No advertisements available to export');
      return;
    }
    exportToCSV(
      filteredAds.map((a) => ({
        id: a.id,
        message: a.message,
        activeUntil: a.activeUntil || 'Indefinite',
        hasBanner: Boolean(a.banner),
      })),
      `tewba-ads-${new Date().toISOString().split('T')[0]}`
    );
    toast.success(`Exported ${filteredAds.length} advertisements to CSV`);
  };

  const handleExportJSON = () => {
    if (!filteredAds || filteredAds.length === 0) {
      toast.error('No advertisements available to export');
      return;
    }
    exportToJSON(filteredAds, `tewba-ads-${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exported ${filteredAds.length} advertisements to JSON`);
  };

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements' }]}
        title="Advertisements"
        subtitle="Manage promotional hero banners, discount campaigns, and featured offers for the mobile bookstore."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#1e4634] hover:bg-[#153426] shadow-sm rounded-xl font-semibold"
            >
              Create Advertisement
            </Button>
          </div>
        }
      />

      {/* Sticky Search & Filter Toolbar */}
      <div className="sticky top-0 z-20 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mb-5 bg-[#edf2ef]/85 dark:bg-[#06090e]/85 backdrop-blur-2xl border-b border-white/70 dark:border-white/10 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search promotional banners..."
              className="w-full h-9 pl-10 pr-3 text-xs bg-white/70 dark:bg-white/[0.05] border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-colors shadow-2xs backdrop-blur-md"
            />
          </div>

          {/* Action and Export Group */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Export buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export advertisements to CSV"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 h-9 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <DownloadSimple className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                title="Export advertisements to JSON"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 h-9 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-white/80 dark:border-white/10 shadow-2xs backdrop-blur-md transition-all active:scale-[0.98]"
              >
                <span>JSON</span>
              </button>
            </div>

            {/* Refresh Action */}
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Refresh advertisements"
              title="Refresh advertisements"
              className="p-2 h-9 w-9 flex items-center justify-center bg-white/70 dark:bg-white/[0.05] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-white dark:hover:bg-white/[0.1] transition-all shadow-2xs backdrop-blur-md"
            >
              <ArrowClockwise
                className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {/* Full Width Table with Sticky Header */}
        <AdvertisementTable
          ads={pagedAds}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          onSelectAd={(id) => setSelectedAdId(id)}
          onAddNew={() => setIsCreateModalOpen(true)}
        />

        {/* Option A Pagination Deck */}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredAds.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          itemLabel="campaigns"
        />
      </div>

      {/* Step 1 & 2 Creation Wizard Modal */}
      <CreateAdvertisementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Details & Banner Upload Modal */}
      <AdvertisementDetailModal
        adId={selectedAdId}
        onClose={() => setSelectedAdId(null)}
      />
    </AdminShell>
  );
}
