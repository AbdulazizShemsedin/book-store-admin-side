'use client';

import React from 'react';
import {
  X,
  DownloadSimple,
  ArrowSquareOut,
  FilePdf,
} from '@phosphor-icons/react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  bookTitle: string;
}

export function PdfPreviewModal({ isOpen, onClose, url, bookTitle }: PdfPreviewModalProps) {
  if (!isOpen || !url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full max-w-5xl max-h-[92vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md z-20 text-xs font-semibold select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <FilePdf className="w-4 h-4" weight="bold" />
            </div>
            <div className="truncate">
              <span className="font-bold truncate block">{bookTitle}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                PDF Manuscript Preview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in new tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200/70 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              title="Open PDF in new tab"
            >
              <ArrowSquareOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {/* Direct download */}
            <a
              href={url}
              download={`${bookTitle}.pdf`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Download PDF"
            >
              <DownloadSimple className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors ml-1"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>

        {/* Embedded PDF View */}
        <div className="relative flex-1 w-full h-full bg-slate-100 dark:bg-slate-950">
          <iframe
            src={`${url}#toolbar=1&navpanes=0`}
            className="w-full h-full border-none"
            title={`${bookTitle} PDF`}
          />
        </div>
      </div>
    </div>
  );
}
