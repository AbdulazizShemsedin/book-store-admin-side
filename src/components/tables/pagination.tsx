import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = 'records',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-100 text-xs text-slate-600">
      {/* Left: page size and count summary */}
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">View:</span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    pageSize === size
                      ? 'bg-[#1e4634] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        <span className="text-slate-400">|</span>
        <span>
          Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalItems.toLocaleString()}</span>{' '}
          {itemLabel}
        </span>
      </div>

      {/* Right: page navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <CaretLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-3 py-1 font-medium text-slate-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <CaretRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
