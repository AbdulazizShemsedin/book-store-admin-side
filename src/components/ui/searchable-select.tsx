'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CaretUpDown, MagnifyingGlass, Check, Plus, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface SearchableSelectOption {
  label: string;
  value: string;
  sublabel?: string;
  badge?: string;
}

export interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  // On-the-fly quick creation hooks
  onCreateNew?: (typedText: string) => void;
  createNewText?: string;
  onQuickAddClick?: () => void;
  quickAddLabel?: string;
}

export function SearchableSelect({
  label,
  required,
  value = '',
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search or filter...',
  emptyText = 'No matching options found.',
  error,
  helperText,
  disabled = false,
  className,
  onCreateNew,
  createNewText,
  onQuickAddClick,
  quickAddLabel = '+ New',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  // Check if typed search is an exact match for an existing option
  const hasExactMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return false;
    return options.some((opt) => opt.label.trim().toLowerCase() === q);
  }, [options, search]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearch('');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const item = filteredOptions[highlightedIndex];
        onChange(item.value);
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      } else if (search.trim() && onCreateNew && !hasExactMatch) {
        onCreateNew(search.trim());
        setIsOpen(false);
        setSearch('');
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Label & Header Quick-Add Button */}
      {(label || onQuickAddClick) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          {onQuickAddClick && (
            <button
              type="button"
              onClick={onQuickAddClick}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors cursor-pointer group"
              title={quickAddLabel}
            >
              <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" weight="bold" />
              <span>{quickAddLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full min-h-[38px] px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between gap-2 transition-all duration-150',
          'bg-white/70 dark:bg-white/[0.05] border shadow-2xs backdrop-blur-md',
          isOpen
            ? 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-white/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20',
          error && 'border-red-500 dark:border-red-500 ring-1 ring-red-500/30',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex-1">
          {selectedOption ? (
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5 text-[11px]">
                  ({selectedOption.sublabel})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
          {selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" weight="bold" />
            </span>
          )}
          <CaretUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </button>

      {/* Floating Dropdown Deck */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 glass-panel rounded-2xl shadow-xl overflow-hidden border border-white/90 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
            <div className="relative">
              <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-7 text-xs bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain text-xs"
          >
            {filteredOptions.length === 0 ? (
              <li className="py-3 px-3 text-center text-slate-400 dark:text-slate-500 text-xs">
                {emptyText}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      'px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-colors',
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100/80 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" weight="bold" />
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Inline "+ Create <typed text>" Deck */}
          {onCreateNew && search.trim() && !hasExactMatch && (
            <div className="p-1.5 border-t border-slate-100/80 dark:border-white/10 bg-emerald-50/50 dark:bg-emerald-950/30">
              <button
                type="button"
                onClick={() => {
                  onCreateNew(search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 transition-colors text-left"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-200/80 dark:bg-emerald-800/80 flex items-center justify-center flex-shrink-0 text-emerald-900 dark:text-emerald-100">
                  <Plus className="w-3.5 h-3.5" weight="bold" />
                </div>
                <div className="truncate flex-1">
                  <span>{createNewText || 'Add new'}: </span>
                  <span className="font-bold underline underline-offset-2">&ldquo;{search.trim()}&rdquo;</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error / Helper text */}
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helperText}</p>}
    </div>
  );
}
