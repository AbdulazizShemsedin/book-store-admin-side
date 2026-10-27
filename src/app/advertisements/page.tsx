'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AdvertisementTable } from '@/features/advertisements/components/advertisement-table';
import { CreateAdvertisementModal } from '@/features/advertisements/components/create-advertisement-modal';
import { AdvertisementDetailModal } from '@/features/advertisements/components/advertisement-detail-modal';
import { useAdvertisements } from '@/features/advertisements/hooks/use-advertisements';
import { Button } from '@/components/ui/button';
import { Plus, MagnifyingGlass, ArrowClockwise } from '@phosphor-icons/react';

export default function AdvertisementsPage() {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const { data: ads = [], isLoading, isError, error, refetch, isFetching } = useAdvertisements();

  const filteredAds = search
    ? ads.filter((a) => a.message.toLowerCase().includes(search.toLowerCase()))
    : ads;

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
              variant="secondary"
              leftIcon={
                <ArrowClockwise
                  className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`}
                />
              }
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#1e4634] hover:bg-[#153426]"
            >
              Create Advertisement
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search promotional banners..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg placeholder:text-slate-400 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredAds.length}</span>{' '}
            advertisement{filteredAds.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Full Width Table */}
        <AdvertisementTable
          ads={filteredAds}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          onSelectAd={(id) => setSelectedAdId(id)}
          onAddNew={() => setIsCreateModalOpen(true)}
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
