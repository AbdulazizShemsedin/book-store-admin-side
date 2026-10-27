'use client';

import React from 'react';
import { Advertisement } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Eye, UploadSimple } from '@phosphor-icons/react';

interface AdvertisementTableProps {
  ads: Advertisement[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onSelectAd: (adId: string) => void;
  onAddNew: () => void;
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
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading promotional advertisements from backend...
        </p>
      </div>
    );
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
      <EmptyState
        icon={<Megaphone className="w-8 h-8 text-slate-400" />}
        title="No advertisements found"
        description="Create your first promotional hero banner to highlight campaigns on the store homepage."
        actionLabel="Create Advertisement"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-44">Banner</th>
              <th className="py-3 px-4">Campaign Message</th>
              <th className="py-3 px-4">Timing & Expiry</th>
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {ads.map((ad) => {
              const isExpired = ad.activeUntil
                ? new Date(ad.activeUntil).getTime() < Date.now()
                : false;

              return (
                <tr
                  key={ad.id}
                  onClick={() => onSelectAd(ad.id)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Banner Preview */}
                  <td className="py-3.5 px-4">
                    {ad.banner ? (
                      <div className="w-36 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shadow-2xs group-hover:border-emerald-600/40 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ad.banner}
                          alt={ad.message}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-14 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                        <span className="text-[10px] font-medium text-slate-400">No Banner</span>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold group-hover:underline">
                          + Upload
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Campaign Message */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block text-xs truncate">
                      {ad.message}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      ID: {ad.id}
                    </span>
                  </td>

                  {/* Timing & Expiry */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {ad.activeUntil ? (
                      <div>
                        <span className="font-medium text-xs block">
                          {new Date(ad.activeUntil).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
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
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAd(ad.id);
                      }}
                      className="text-xs"
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
