'use client';

import React, { useState } from 'react';
import { useAdvertisement, useUploadAdvertisementBanner } from '../hooks/use-advertisements';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import {
  Megaphone,
  UploadSimple,
  Calendar,
  Clock,
  Sparkle,
  BookOpen,
  Link,
  CheckCircle,
} from '@phosphor-icons/react';

interface AdvertisementDetailModalProps {
  adId: string | null;
  onClose: () => void;
}

export function AdvertisementDetailModal({ adId, onClose }: AdvertisementDetailModalProps) {
  const { data: ad, isLoading, isError, refetch } = useAdvertisement(adId);
  const [isReplacingBanner, setIsReplacingBanner] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useUploadAdvertisementBanner(() => {
    setUploadSuccess(true);
    setIsReplacingBanner(false);
    setSelectedFile(null);
    refetch();
    setTimeout(() => setUploadSuccess(false), 3000);
  });

  const handleUploadNewBanner = async () => {
    if (!adId || !selectedFile) return;
    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({ id: adId, file: selectedFile });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to update banner image on backend.'
      );
    }
  };

  const isExpired = ad?.active_until ? new Date(ad.active_until).getTime() < Date.now() : false;

  return (
    <Modal
      isOpen={Boolean(adId)}
      onClose={onClose}
      title="Advertisement Details"
      subtitle={`ID: ${adId || ''}`}
      maxWidth="lg"
    >
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Loading advertisement details...</p>
        </div>
      )}

      {isError && (
        <div className="py-8 text-center space-y-3">
          <p className="text-sm font-semibold text-red-600">Failed to load advertisement details.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {ad && (
        <div className="space-y-5">
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" weight="fill" />
              <span>Banner updated successfully on backend!</span>
            </div>
          )}

          {/* Banner Hero Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Banner Image
              </label>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setIsReplacingBanner((prev) => !prev)}
              >
                {isReplacingBanner ? 'Cancel Replace' : 'Replace Banner'}
              </Button>
            </div>

            {isReplacingBanner ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                {uploadError && (
                  <p className="text-xs text-red-600 font-medium">{uploadError}</p>
                )}
                <FileDropzone
                  label="Select new banner"
                  required
                  accept={{
                    'image/png': ['.png'],
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/webp': ['.webp'],
                  }}
                  maxSizeMB={10}
                  iconType="image"
                  onFileSelected={(file) => setSelectedFile(file)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setIsReplacingBanner(false);
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedFile}
                    isLoading={uploadMutation.isPending}
                    leftIcon={<UploadSimple className="w-3.5 h-3.5" />}
                    onClick={handleUploadNewBanner}
                    className="bg-[#1e4634] hover:bg-[#153426]"
                  >
                    Save & Upload Banner
                  </Button>
                </div>
              </div>
            ) : ad.banner ? (
              <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.banner}
                  alt={ad.message}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 space-y-1">
                <Megaphone className="w-6 h-6" />
                <p className="text-xs font-medium">No banner uploaded for this advertisement.</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-emerald-700 dark:text-emerald-400"
                  onClick={() => setIsReplacingBanner(true)}
                >
                  Upload Banner Now
                </Button>
              </div>
            )}
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Campaign Message
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block text-sm">
                {ad.message}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Lifecycle Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={isExpired ? 'Disabled' : 'Active'} />
                <span className="text-slate-500 text-[11px]">
                  {ad.active_until
                    ? isExpired
                      ? `Expired on ${new Date(ad.active_until).toLocaleDateString()}`
                      : `Expires ${new Date(ad.active_until).toLocaleString()}`
                    : 'Indefinite (No expiry set)'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Action Type
              </span>
              <div className="mt-1 flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                {ad.action.type === 'subscription' && (
                  <>
                    <Sparkle className="w-4 h-4 text-emerald-600" />
                    <span>Subscription Plan Offer</span>
                  </>
                )}
                {ad.action.type === 'book_detail' && (
                  <>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Book Detail (ID: {ad.action.book_id})</span>
                  </>
                )}
                {ad.action.type === 'external_link' && (
                  <>
                    <Link className="w-4 h-4 text-purple-600" />
                    <a
                      href={ad.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 underline truncate max-w-[200px]"
                    >
                      {ad.action.url}
                    </a>
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                CTA Button Label
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">
                {ad.button_label || '— (Default CTA)'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Created At
              </span>
              <span className="text-slate-600 dark:text-slate-400 mt-0.5 block">
                {ad.created_at ? new Date(ad.created_at).toLocaleString() : '—'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Updated At
              </span>
              <span className="text-slate-600 dark:text-slate-400 mt-0.5 block">
                {ad.updated_at ? new Date(ad.updated_at).toLocaleString() : '—'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
