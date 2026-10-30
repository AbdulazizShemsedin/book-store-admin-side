import React from 'react';
import {
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = 'records',
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered pages with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        'glass-panel mt-3 rounded-2xl px-5 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs select-none transition-colors duration-150',
        className
      )}
    >
      {/* Left: View Page Size Segmented Capsule & Range Summary */}
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">View:</span>
            <div className="inline-flex items-center p-0.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 backdrop-blur-md shadow-2xs">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150',
                    pageSize === size
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {onPageSizeChange && (
          <div className="hidden sm:block h-4 w-px bg-slate-200/80 dark:bg-white/10 mx-0.5" />
        )}

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span>
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{startItem}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{totalItems.toLocaleString()}</span>{' '}
            {itemLabel}
          </span>
        </div>
      </div>

      {/* Right: Page Navigation Group */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline-block">
          Page {currentPage} of {totalPages}
        </span>

        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          title="First page"
          className="p-1.5 h-7 w-7 flex items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs backdrop-blur-md active:scale-95"
        >
          <CaretDoubleLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
          className="p-1.5 h-7 w-7 flex items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs backdrop-blur-md active:scale-95"
        >
          <CaretLeft className="w-3.5 h-3.5" />
        </button>

        {/* Direct Page Number Pills */}
        <div className="flex items-center gap-1 mx-0.5">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-6 h-7 flex items-center justify-center text-xs font-mono text-slate-400 dark:text-slate-500"
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all shadow-2xs backdrop-blur-md active:scale-95',
                  isCurrent
                    ? 'glass-dock-active font-bold text-white shadow-xs'
                    : 'bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Next page"
          className="p-1.5 h-7 w-7 flex items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs backdrop-blur-md active:scale-95"
        >
          <CaretRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          title="Last page"
          className="p-1.5 h-7 w-7 flex items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.12] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs backdrop-blur-md active:scale-95"
        >
          <CaretDoubleRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
