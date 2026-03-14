import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wgfi:visit-history';
const MAX_HISTORY_ITEMS = 10;

export interface VisitHistoryItem {
  parkId: string;
  timestamp: number;
}

export function useVisitHistory() {
  const [history, setHistory] = useState<VisitHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VisitHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading visit history:', error);
      setHistory([]);
    }
  }, []);

  const addVisit = useCallback((parkId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentHistory: VisitHistoryItem[] = stored ? JSON.parse(stored) : [];

      const existingIndex = currentHistory.findIndex(item => item.parkId === parkId);
      if (existingIndex !== -1) {
        currentHistory.splice(existingIndex, 1);
      }

      const newItem: VisitHistoryItem = {
        parkId,
        timestamp: Date.now(),
      };

      currentHistory.unshift(newItem);

      if (currentHistory.length > MAX_HISTORY_ITEMS) {
        currentHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory));
      setHistory(currentHistory);
    } catch (error) {
      console.error('Error adding visit to history:', error);
    }
  }, []);

  const getRecentVisits = useCallback((count: number = 5): string[] => {
    return history.slice(0, count).map(item => item.parkId);
  }, [history]);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Error clearing visit history:', error);
    }
  }, []);

  return {
    history,
    addVisit,
    getRecentVisits,
    clearHistory,
  };
}

export function getRecentVisitsSync(count: number = 5): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as VisitHistoryItem[];
      return parsed.slice(0, count).map(item => item.parkId);
    }
  } catch (error) {
    console.error('Error getting recent visits:', error);
  }
  return [];
}

export function addVisitSync(parkId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let currentHistory: VisitHistoryItem[] = stored ? JSON.parse(stored) : [];

    const existingIndex = currentHistory.findIndex(item => item.parkId === parkId);
    if (existingIndex !== -1) {
      currentHistory.splice(existingIndex, 1);
    }

    const newItem: VisitHistoryItem = {
      parkId,
      timestamp: Date.now(),
    };

    currentHistory.unshift(newItem);

    if (currentHistory.length > MAX_HISTORY_ITEMS) {
      currentHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory));
  } catch (error) {
    console.error('Error adding visit to history:', error);
  }
}
