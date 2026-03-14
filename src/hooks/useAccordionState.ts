/**
 * Custom hook for managing accordion state with localStorage persistence
 * Stores open/closed state of the metadata accordion
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wgfi:metadata-accordion-state';

/**
 * Hook to manage accordion state with localStorage persistence
 * @param defaultOpen - Default open state (defaults to empty array - closed)
 * @returns [value, setValue] - Current accordion value and setter function
 */
export function useAccordionState(defaultOpen: string[] = []): [string[], (value: string[]) => void] {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save accordion state to localStorage:', error);
    }
  }, [value]);

  return [value, setValue];
}
