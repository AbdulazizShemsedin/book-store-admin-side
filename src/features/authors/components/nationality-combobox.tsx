'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { COUNTRIES_AND_NATIONALITIES, CountryNationality } from '../data/countries';
import { CaretDown, MagnifyingGlass, Check, GlobeHemisphereWest, X } from '@phosphor-icons/react';

interface NationalityComboboxProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function NationalityCombobox({
  label = 'Nationality',
  value = '',
  onChange,
  error,
  helperText,
  placeholder = 'Select country or nationality...',
  disabled = false,
}: NationalityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES_AND_NATIONALITIES;
    return COUNTRIES_AND_NATIONALITIES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.nationality.toLowerCase().includes(q)
    );
  }, [search]);

  // Check if search query is a custom text not in the list
  const hasExactMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COUNTRIES_AND_NATIONALITIES.some(
      (c) => c.nationality.toLowerCase() === q || c.country.toLowerCase() === q
    );
  }, [search]);

  const handleSelect = (nationalityVal: string) => {
    onChange(nationalityVal);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            'w-full h-10 px-3.5 flex items-center justify-between text-left text-sm bg-[#f8fafc] border border-slate-200 rounded-lg transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed',
            error && 'border-red-500 bg-red-50/20',
            isOpen && 'border-emerald-700 ring-2 ring-emerald-700/20 bg-white'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GlobeHemisphereWest className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {value ? (
              <span className="font-medium text-slate-900 truncate">{value}</span>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <CaretDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isOpen && 'transform rotate-180 text-emerald-800'
              )}
            />
          </div>
        </button>

        {/* Searchable Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or nationality..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false);
                      setSearch('');
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filtered.length > 0) {
                        handleSelect(filtered[0].nationality);
                      } else if (search.trim()) {
                        handleSelect(search.trim());
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Countries & Nationalities List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
              {/* Custom input entry if no exact match */}
              {search.trim() && !hasExactMatch && (
                <button
                  type="button"
                  onClick={() => handleSelect(search.trim())}
                  className="w-full px-3.5 py-2.5 text-left text-xs bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 font-semibold flex items-center justify-between transition-colors"
                >
                  <span>Use custom: &quot;{search.trim()}&quot;</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              )}

              {filtered.map((item) => {
                const isSelected = value.toLowerCase() === item.nationality.toLowerCase();
                return (
                  <button
                    key={`${item.country}-${item.nationality}`}
                    type="button"
                    onClick={() => handleSelect(item.nationality)}
                    className={cn(
                      'w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50/50 transition-colors group',
                      isSelected && 'bg-emerald-50 text-emerald-900 font-semibold'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-900 font-medium group-hover:text-emerald-950 truncate">
                        {item.nationality}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">
                        ({item.country})
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" weight="bold" />
                    )}
                  </button>
                );
              })}

              {filtered.length === 0 && !search.trim() && (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  No nationalities found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
