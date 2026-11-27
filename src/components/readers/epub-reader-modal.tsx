'use client';

import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import {
  X,
  CaretLeft,
  CaretRight,
  TextAa,
  List,
  DownloadSimple,
  ArrowsOut,
  ArrowsIn,
  SpinnerGap,
  BookOpen,
  WarningCircle,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils/cn';

interface TocItem {
  label: string;
  href: string;
}

interface EpubReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  bookTitle: string;
}

export function EpubReaderModal({ isOpen, onClose, url, bookTitle }: EpubReaderModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookInstanceRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [fontSizePercent, setFontSizePercent] = useState(100);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const { theme: appTheme } = useTheme();

  // Initialize theme from app theme on first open
  useEffect(() => {
    if (appTheme === 'dark') {
      setReaderTheme('dark');
    } else {
      setReaderTheme('light');
    }
  }, [appTheme, isOpen]);

  // Load and render EPUB
  useEffect(() => {
    if (!isOpen || !url) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setCurrentChapter('');

    // Destroy existing instance
    if (renditionRef.current) {
      try {
        renditionRef.current.destroy();
      } catch {
        // ignore
      }
      renditionRef.current = null;
    }
    if (bookInstanceRef.current) {
      try {
        bookInstanceRef.current.destroy();
      } catch {
        // ignore
      }
      bookInstanceRef.current = null;
    }

    try {
      const book = (ePub as any)(url);
      bookInstanceRef.current = book;

      if (!viewerRef.current) return;

      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'auto',
      });
      renditionRef.current = rendition;

      // Register reader themes
      rendition.themes.register('light', {
        body: { background: '#ffffff !important', color: '#1e293b !important', 'font-family': 'system-ui, sans-serif !important' },
      });
      rendition.themes.register('dark', {
        body: { background: '#0b0f17 !important', color: '#f1f5f9 !important', 'font-family': 'system-ui, sans-serif !important' },
      });
      rendition.themes.register('sepia', {
        body: { background: '#fbf0d9 !important', color: '#5f4b32 !important', 'font-family': 'system-ui, sans-serif !important' },
      });

      rendition.display().then(() => {
        if (!isMounted) return;
        setIsLoading(false);
      }).catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to display EPUB:', err);
        setLoadError(err?.message || 'Failed to render EPUB. File may be encrypted or blocked by CORS.');
        setIsLoading(false);
      });

      // Load Navigation / TOC
      book.loaded.navigation.then((nav: any) => {
        if (!isMounted) return;
        if (nav && Array.isArray(nav.toc)) {
          const items: TocItem[] = nav.toc.map((t: any) => ({
            label: t.label?.trim() || 'Untitled Section',
            href: t.href,
          }));
          setToc(items);
        }
      }).catch(() => {
        // ignore navigation errors
      });

      // Track location changes
      rendition.on('relocated', (location: any) => {
        if (!isMounted) return;
        if (location?.start?.href && book.navigation) {
          const chapter = book.navigation.get(location.start.href);
          if (chapter?.label) {
            setCurrentChapter(chapter.label.trim());
          }
        }
      });
    } catch (err: any) {
      if (isMounted) {
        setLoadError(err?.message || 'Unable to open EPUB reader.');
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch {
          // ignore
        }
        renditionRef.current = null;
      }
      if (bookInstanceRef.current) {
        try {
          bookInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        bookInstanceRef.current = null;
      }
    };
  }, [isOpen, url]);

  // Apply visual theme
  const applyTheme = (themeName: 'light' | 'dark' | 'sepia') => {
    setReaderTheme(themeName);
    if (renditionRef.current) {
      renditionRef.current.themes.select(themeName);
    }
  };

  // Adjust font size
  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.max(70, Math.min(180, fontSizePercent + delta));
    setFontSizePercent(nextSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${nextSize}%`);
    }
  };

  // Page navigation
  const handlePrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const handleSelectChapter = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
      setIsTocOpen(false);
    }
  };

  // Sync theme changes with rendition
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.select(readerTheme);
    }
  }, [readerTheme]);

  // Sync font size changes with rendition
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSizePercent}%`);
    }
  }, [fontSizePercent]);

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isTocOpen) {
          setIsTocOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTocOpen, onClose]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={modalContainerRef}
        className={cn(
          'relative w-full h-full max-w-5xl max-h-[92vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border transition-colors',
          readerTheme === 'dark'
            ? 'bg-[#0b0f17] border-white/10 text-slate-100'
            : readerTheme === 'sepia'
            ? 'bg-[#fbf0d9] border-[#e7d8be] text-[#5f4b32]'
            : 'bg-white border-slate-200 text-slate-900',
          isFullscreen && 'max-w-none max-h-none rounded-none'
        )}
      >
        {/* Reader Topbar */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2.5 border-b backdrop-blur-md z-20 text-xs font-semibold select-none',
            readerTheme === 'dark'
              ? 'bg-[#0f172a]/90 border-white/10 text-slate-200'
              : readerTheme === 'sepia'
              ? 'bg-[#f4e6cb]/90 border-[#e3d2b2] text-[#4a3924]'
              : 'bg-slate-50/90 border-slate-200 text-slate-800'
          )}
        >
          {/* Left: TOC button & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95',
                isTocOpen
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border-slate-300 dark:border-white/10'
              )}
              title="Table of Contents"
            >
              <List className="w-4 h-4" weight="bold" />
              <span className="hidden sm:inline">Contents</span>
            </button>

            <div className="truncate">
              <span className="font-bold truncate block">{bookTitle}</span>
              {currentChapter && (
                <span className="text-[10px] opacity-75 truncate block">{currentChapter}</span>
              )}
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-1.5">
            {/* Font size adjustments */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleFontSizeChange(-10)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Decrease font size"
              >
                <TextAa className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1">{fontSizePercent}%</span>
              <button
                type="button"
                onClick={() => handleFontSizeChange(10)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Increase font size"
              >
                <TextAa className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Themes: Light / Sepia / Dark */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => applyTheme('light')}
                className={cn(
                  'w-6 h-6 rounded-md text-[10px] font-bold border transition-all',
                  readerTheme === 'light' ? 'bg-white text-black border-slate-400 shadow-xs' : 'bg-transparent text-slate-500 border-transparent'
                )}
                title="Light Theme"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => applyTheme('sepia')}
                className={cn(
                  'w-6 h-6 rounded-md text-[10px] font-bold border transition-all',
                  readerTheme === 'sepia' ? 'bg-[#f4e6cb] text-[#4a3924] border-[#caa87d] shadow-xs' : 'bg-transparent text-[#7a6448] border-transparent'
                )}
                title="Sepia Theme"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => applyTheme('dark')}
                className={cn(
                  'w-6 h-6 rounded-md text-[10px] font-bold border transition-all',
                  readerTheme === 'dark' ? 'bg-[#0f172a] text-white border-white/30 shadow-xs' : 'bg-transparent text-slate-400 border-transparent'
                )}
                title="Dark Theme"
              >
                A
              </button>
            </div>

            {/* Direct Download fallback */}
            <a
              href={url}
              download={`${bookTitle}.epub`}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Download EPUB file"
            >
              <DownloadSimple className="w-4 h-4" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <ArrowsIn className="w-4 h-4" /> : <ArrowsOut className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors ml-1"
              title="Close Reader (Esc)"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>

        {/* Reader Body / Content Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* Table of Contents Drawer */}
          {isTocOpen && (
            <div
              className={cn(
                'absolute inset-y-0 left-0 z-30 w-72 sm:w-80 border-r shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-left duration-200',
                readerTheme === 'dark'
                  ? 'bg-[#0c121e]/95 border-white/10 text-slate-200'
                  : readerTheme === 'sepia'
                  ? 'bg-[#f7ebd4]/95 border-[#e2d0af] text-[#4a3924]'
                  : 'bg-white/95 border-slate-200 text-slate-800'
              )}
            >
              <div className="p-3 border-b flex items-center justify-between font-bold text-xs">
                <span>Table of Contents ({toc.length})</span>
                <button
                  type="button"
                  onClick={() => setIsTocOpen(false)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                {toc.length === 0 ? (
                  <p className="text-slate-400 p-4 text-center text-xs italic">
                    No Table of Contents detected in this manuscript.
                  </p>
                ) : (
                  toc.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectChapter(item.href)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg font-medium truncate transition-all',
                        currentChapter === item.label
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      )}
                    >
                      {item.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-inherit/90 backdrop-blur-xs">
              <SpinnerGap className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold mt-3 text-slate-500">
                Opening manuscript reader...
              </p>
            </div>
          )}

          {/* Error Overlay with Fallback Download */}
          {loadError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center mb-3">
                <WarningCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold mb-1">In-Browser Reader Notice</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                {loadError}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  download={`${bookTitle}.epub`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all active:scale-95"
                >
                  <DownloadSimple className="w-4 h-4" />
                  <span>Download EPUB File</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ePub Viewer Element */}
          <div ref={viewerRef} className="w-full h-full select-text" />

          {/* Floating Left/Right Navigation Buttons */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-40 hover:opacity-100 shadow-md"
            title="Previous Page (Left Arrow)"
          >
            <CaretLeft className="w-5 h-5" weight="bold" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-40 hover:opacity-100 shadow-md"
            title="Next Page (Right Arrow)"
          >
            <CaretRight className="w-5 h-5" weight="bold" />
          </button>
        </div>

        {/* Reader Footer Info */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-1.5 border-t text-[11px] select-none',
            readerTheme === 'dark'
              ? 'bg-[#0f172a]/90 border-white/10 text-slate-400'
              : readerTheme === 'sepia'
              ? 'bg-[#f4e6cb]/90 border-[#e3d2b2] text-[#6b563b]'
              : 'bg-slate-50/90 border-slate-200 text-slate-500'
          )}
        >
          <span className="hidden sm:inline">Use &larr; &rarr; Arrow keys or Spacebar to flip pages</span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={handlePrev}
              className="hover:underline font-semibold"
            >
              &larr; Prev
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={handleNext}
              className="hover:underline font-semibold"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
