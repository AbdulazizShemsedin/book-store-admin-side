'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Advertisement } from '@/types/domain';
import { SortableAdRow } from './sortable-ad-row';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

interface AdvertisementTableProps {
  ads: Advertisement[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onReorder: (newAds: Advertisement[]) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (ad: Advertisement) => void;
}

export function AdvertisementTable({
  ads,
  isLoading,
  isError,
  error,
  onRetry,
  onReorder,
  onToggleStatus,
  onDelete,
  onEdit,
}: AdvertisementTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ads.findIndex((a) => a.id === active.id);
    const newIndex = ads.findIndex((a) => a.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(ads, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      onReorder(reordered);
    }
  };

  const handleMove = (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= ads.length) return;
    const reordered = arrayMove(ads, currentIndex, targetIndex).map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    onReorder(reordered);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading promotional banners...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load advertisements"
        message={error?.message || 'Unable to retrieve promotional campaigns.'}
        onRetry={onRetry}
        isBackendGap
      />
    );
  }

  if (ads.length === 0) {
    return (
      <EmptyState
        title="No active advertisements"
        description="Create your first promotional banner for the mobile store carousel."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-3 w-10 text-center"></th>
              <th className="py-3.5 px-4 w-20">Order No</th>
              <th className="py-3.5 px-4 w-44">Preview</th>
              <th className="py-3.5 px-6">Ad Message</th>
              <th className="py-3.5 px-4 w-28">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            <SortableContext items={ads.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              {ads.map((ad, index) => (
                <SortableAdRow
                  key={ad.id}
                  ad={ad}
                  index={index}
                  total={ads.length}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onToggleStatus={() => onToggleStatus(ad.id)}
                  onDelete={() => onDelete(ad.id)}
                  onEdit={() => onEdit(ad)}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
