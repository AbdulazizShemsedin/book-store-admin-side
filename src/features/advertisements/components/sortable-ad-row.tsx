'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Advertisement } from '@/types/domain';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DotsSixVertical,
  PencilSimple,
  Trash,
  Prohibit,
  ArrowUp,
  ArrowDown,
} from '@phosphor-icons/react';

interface SortableAdRowProps {
  ad: Advertisement;
  index: number;
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function SortableAdRow({
  ad,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggleStatus,
  onDelete,
  onEdit,
}: SortableAdRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ad.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const orderLabels = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'];
  const orderDisplay =
    ad.status === 'disabled'
      ? '---'
      : orderLabels[ad.order - 1] || `${ad.order}TH`;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50/70 transition-colors border-b border-slate-100 ${
        isDragging ? 'bg-emerald-50/50 shadow-md ring-1 ring-emerald-500/30' : 'bg-white'
      }`}
    >
      {/* Drag handle */}
      <td className="py-4 px-3 w-10 text-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${ad.message}`}
          className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing rounded"
        >
          <DotsSixVertical className="w-5 h-5" />
        </button>
      </td>

      {/* Order No */}
      <td className="py-4 px-4 font-bold text-xs text-slate-700 font-mono">
        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
          {orderDisplay}
        </span>
      </td>

      {/* Banner Preview Thumbnail */}
      <td className="py-4 px-4 w-40">
        <div className="w-36 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shadow-xs flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt={ad.message}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center p-1 text-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-sm line-clamp-1">
              {ad.message.split('—')[0] || 'Promo'}
            </span>
          </div>
        </div>
      </td>

      {/* Ad Message */}
      <td className="py-4 px-6">
        <span className="font-semibold text-slate-900 block text-xs">{ad.message}</span>
        <span className="text-[11px] text-slate-400">Mobile Homepage Billboard</span>
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <StatusBadge status={ad.status === 'active' ? 'Active' : 'Disabled'} />
      </td>

      {/* Accessible Reorder buttons (PM Requirement: Non-drag alternative) */}
      <td className="py-4 px-2 w-16">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move banner up"
            title="Move up"
            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move banner down"
            title="Move down"
            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Edit advertisement"
          >
            <PencilSimple className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
            aria-label="Toggle banner status"
            title={ad.status === 'active' ? 'Disable banner' : 'Activate banner'}
          >
            <Prohibit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            aria-label="Delete advertisement"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
