import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { CaretDown, MagnifyingGlass, Check, X } from '@phosphor-icons/react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      id,
      required,
      disabled,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState<string>(
      props.value !== undefined
        ? String(props.value)
        : props.defaultValue !== undefined
        ? String(props.defaultValue)
        : ''
    );

    const containerRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);

    // Sync controlled value if changed by parent
    useEffect(() => {
      if (props.value !== undefined) {
        setSelectedValue(String(props.value));
      }
    }, [props.value]);

    // Handle forwarded ref to the hidden select element
    const setRefs = useCallback(
      (node: HTMLSelectElement | null) => {
        hiddenSelectRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
        }
      },
      [ref]
    );

    // Filter options based on search query
    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find((opt) => String(opt.value) === selectedValue);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Auto-focus search input when opened
    useEffect(() => {
      if (isOpen) {
        const timeout = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timeout);
      }
    }, [isOpen]);

    const handleSelect = (val: string) => {
      setSelectedValue(val);
      setIsOpen(false);
      setSearchQuery('');

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = val;
        const event = new Event('change', { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(event);
      }

      if (props.onChange) {
        const syntheticEvent = {
          target: { value: val, name: props.name },
          currentTarget: { value: val, name: props.name },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        props.onChange(syntheticEvent);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    return (
      <div className="w-full space-y-1.5" ref={containerRef} onKeyDown={handleKeyDown}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Custom Trigger Button */}
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={cn(
              'w-full flex items-center justify-between text-left text-sm bg-[#f8fafc] border border-slate-200 rounded-lg transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed',
              size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 pl-3.5 pr-3 py-2',
              error && 'border-red-500 focus:border-red-500 bg-red-50/20',
              isOpen && 'border-emerald-700 ring-2 ring-emerald-700/20 bg-white',
              className
            )}
          >
            <span className={cn('truncate', !selectedOption && 'text-slate-400')}>
              {selectedOption ? selectedOption.label : placeholder || 'Select an option...'}
            </span>
            <CaretDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2',
                isOpen && 'transform rotate-180 text-emerald-800'
              )}
            />
          </button>

          {/* Synchronized hidden native select for form libraries (react-hook-form) */}
          <select
            ref={setRefs}
            name={props.name}
            id={selectId ? `${selectId}-native` : undefined}
            value={selectedValue}
            required={required}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only pointer-events-none"
            onChange={() => {}}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Searchable Dropdown Popover */}
          {isOpen && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[200px]"
            >
              {/* Search Bar Input */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full text-xs bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-center text-slate-400">
                    No matching options found
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = String(opt.value) === selectedValue;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-medium'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                          opt.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#1e4634] flex-shrink-0 ml-2" weight="bold" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

