import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'auto' | 'light' | 'dark' | 'light-hc' | 'dark-hc';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateSystemPreference = (e: MediaQueryList | MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    updateSystemPreference(mediaQuery);
    mediaQuery.addEventListener('change', updateSystemPreference);

    return () => mediaQuery.removeEventListener('change', updateSystemPreference);
  }, []);

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wgfi-theme-mode');
    if (saved && ['auto', 'light', 'dark', 'light-hc', 'dark-hc'].includes(saved)) {
      setModeState(saved as ThemeMode);
    }
  }, []);

  // Set mode and save to localStorage
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('wgfi-theme-mode', newMode);
  };

  // Calculate effective theme
  const effectiveTheme: 'light' | 'dark' = 
    mode === 'auto' 
      ? systemPreference
      : mode === 'light' || mode === 'light-hc'
        ? 'light'
        : 'dark';

  const isHighContrast = mode === 'light-hc' || mode === 'dark-hc';

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    
    // Add appropriate classes
    root.classList.add(effectiveTheme);
    if (isHighContrast) {
      root.classList.add('high-contrast');
    }
    
    // Store in data attribute for debugging
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-effective-theme', effectiveTheme);
  }, [effectiveTheme, isHighContrast, mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, effectiveTheme, isHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
