'use client';

import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AdvertisementTable } from '@/features/advertisements/components/advertisement-table';
import { AdEditorCard } from '@/features/advertisements/components/ad-editor-card';
import {
  useAdvertisements,
  useReorderAdvertisements,
  useToggleAdStatus,
  useDeleteAd,
} from '@/features/advertisements/hooks/use-advertisements';
import { Button } from '@/components/ui/button';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { Advertisement } from '@/types/domain';

export default function AdvertisementsPage() {
  const [search, setSearch] = useState('');
  const { data: ads = [], isLoading, isError, error, refetch } = useAdvertisements();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#ad-editor-card') {
      const el = document.getElementById('ad-editor-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-emerald-500/50', 'border-emerald-600', 'shadow-lg');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-500/50', 'border-emerald-600', 'shadow-lg');
        }, 2500);
      }
    }
  }, []);

  const reorderMutation = useReorderAdvertisements();
  const toggleMutation = useToggleAdStatus();
  const deleteMutation = useDeleteAd();

  const filteredAds = search
    ? ads.filter((a) => a.message.toLowerCase().includes(search.toLowerCase()))
    : ads;

  const handleReorder = (newAds: Advertisement[]) => {
    // Send array of IDs in new order to reorder mutation
    const orderedIds = newAds.map((a) => a.id);
    reorderMutation.mutate(orderedIds);
  };

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements' }]}
        title="Advertisements"
        subtitle="Manage promotional hero banners, discount callouts, and reorder sequence for the mobile store carousel."
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
            onClick={() => {
              const el = document.getElementById('ad-message');
              if (el) el.focus();
            }}
            className="bg-[#1e4634] hover:bg-[#153426]"
          >
            Add Advertisement
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Search & Sortable Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search promotional banners..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
              Drag rows to reorder sequence
            </span>
          </div>

          <AdvertisementTable
            ads={filteredAds}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onReorder={handleReorder}
            onToggleStatus={(id) => toggleMutation.mutate(id)}
            onDelete={(id) => {
              if (confirm('Delete this promotional banner?')) {
                deleteMutation.mutate(id);
              }
            }}
            onEdit={(ad) => alert(`Editing banner: ${ad.message}`)}
          />
        </div>

        {/* Right Column (1 span): Advertisement Editor */}
        <div className="lg:col-span-1">
          <AdEditorCard currentCount={ads.length} />
        </div>
      </div>
    </AdminShell>
  );
}
