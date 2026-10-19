'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any rapidly changing value.
 * Delays updating the debounced value until after the specified delay
 * has elapsed since the last time the value was changed.
 *
 * @param value The value to debounce (e.g. search string)
 * @param delay Milliseconds to wait before updating (default: 350ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
