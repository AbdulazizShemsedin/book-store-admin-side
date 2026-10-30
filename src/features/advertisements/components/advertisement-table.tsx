'use client';

import React from 'react';
import { Advertisement } from '@/types/domain';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Eye } from '@phosphor-icons/react';

interface AdvertisementTableProps {
  ads: Advertisement[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onSelectAd: (adId: string) => void;
  onAddNew: () => void;
}

function AdvertisementTableSkeleton() {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 glass-table-th">
              <th className="py-3.5 px-5 w-48">Banner</th>
              <th className="py-3.5 px-4">Campaign Message</th>
              <th className="py-3.5 px-4">Timing & Expiry</th>
              <th className="py-3.5 px-4 w-28">Status</th>
              <th className="py-3.5 px-5 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-5">
                  <div className="w-36 h-14 rounded-xl bg-slate-200/60 dark:bg-white/[0.06]" />
                </td>
                <td className="py-3.5 px-4 space-y-2">
                  <div className="h-3.5 bg-slate-200/80 dark:bg-white/[0.08] rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-200/50 dark:bg-white/[0.04] rounded-md w-1/3" />
                </td>
                <td className="py-3.5 px-4 space-y-1.5">
                  <div className="h-3.5 bg-slate-200/70 dark:bg-white/[0.06] rounded-md w-24" />
                  <div className="h-2.5 bg-slate-200/40 dark:bg-white/[0.04] rounded-md w-16" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-5 bg-slate-200/60 dark:bg-white/[0.06] rounded-full w-20" />
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="h-7 bg-slate-200/60 dark:bg-white/[0.06] rounded-xl w-20 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdvertisementTable({
  ads,
  isLoading,
  isError,
  error,
  onRetry,
  onSelectAd,
  onAddNew,
}: AdvertisementTableProps) {
  if (isLoading) {
    return <AdvertisementTableSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load advertisements"
        message={error?.message || 'Unable to retrieve promotional campaigns from backend.'}
        onRetry={onRetry}
      />
    );
  }

  if (ads.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8">
        <EmptyState
          icon={<Megaphone className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />}
          title="No advertisements found"
          description="Create your first promotional hero banner to highlight campaigns on the store homepage."
          actionLabel="Create Advertisement"
          onAction={onAddNew}
        />
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-xs transition-colors duration-150">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] min-h-[340px] relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 glass-table-th backdrop-blur-2xl">
              <th className="py-3.5 px-5 w-48">Banner</th>
              <th className="py-3.5 px-4">Campaign Message</th>
              <th className="py-3.5 px-4">Timing & Expiry</th>
              <th className="py-3.5 px-4 w-28">Status</th>
              <th className="py-3.5 px-5 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {ads.map((ad) => {
              const isExpired = ad.activeUntil
                ? new Date(ad.activeUntil).getTime() < Date.now()
                : false;

              return (
                <tr
                  key={ad.id}
                  onClick={() => onSelectAd(ad.id)}
                  className="glass-table-row group cursor-pointer relative"
                >
                  {/* Banner Preview */}
                  <td className="py-3.5 px-5">
                    {ad.banner ? (
                      <div className="w-36 h-14 rounded-xl overflow-hidden bg-slate-100/80 dark:bg-white/[0.05] border border-white/80 dark:border-white/10 relative shadow-2xs group-hover:scale-[1.02] group-hover:shadow-md transition-all">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ad.banner}
                          alt={ad.message}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-14 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-dashed border-slate-300/80 dark:border-white/20 flex flex-col items-center justify-center text-slate-400 group-hover:border-emerald-500/50 transition-colors">
                        <span className="text-[10px] font-medium text-slate-400">No Banner</span>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline">
                          + Upload
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Campaign Message */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs truncate group-hover:underline">
                      {ad.message}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                      ID: {ad.id}
                    </span>
                  </td>

                  {/* Timing & Expiry */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {ad.activeUntil ? (
                      <div>
                        <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                          {new Date(ad.activeUntil).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ad.activeUntil).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Indefinite (No expiry)</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={isExpired ? 'Disabled' : 'Active'} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAd(ad.id);
                      }}
                      className="text-xs rounded-xl shadow-2xs backdrop-blur-md"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
