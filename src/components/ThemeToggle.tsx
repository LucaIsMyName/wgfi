import { Sun, Moon, Monitor, Contrast } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

const ThemeToggle = () => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { value: 'auto' as const, label: 'Auto (System)', icon: Monitor },
    { value: 'light' as const, label: 'Hell', icon: Sun },
    { value: 'dark' as const, label: 'Dunkel', icon: Moon },
    { value: 'light-hc' as const, label: 'Hell (Hoher Kontrast)', icon: Sun },
    { value: 'dark-hc' as const, label: 'Dunkel (Hoher Kontrast)', icon: Moon },
  ];

  const currentTheme = themes.find(t => t.value === mode) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 font-mono text-[9px] transition-opacity duration-200 hover:underline"
        style={{ color: 'var(--primary-green)' }}
        aria-label="Theme wechseln">
        <Icon className="w-3 h-3" />
        <span>Theme</span>
      </button>

      {isOpen && (
        <div
          className="fixed lg:absolute bottom-16 lg:bottom-full mb-0 lg:mb-2 left-4 lg:left-0 right-4 lg:right-auto w-auto lg:w-64 border-2 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--soft-cream)',
            borderColor: 'var(--border-color)',
          }}>
          <div className="p-2">
            <p className="font-mono text-[9px] mb-3 pb-2 border-b" style={{ 
              color: 'var(--deep-charcoal)',
              borderColor: 'var(--border-color)',
            }}>
              FARBSCHEMA WÄHLEN
            </p>
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              const isActive = mode === theme.value;
              
              return (
                <button
                  key={theme.value}
                  onClick={() => {
                    setMode(theme.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 mb-1 transition-opacity duration-200 hover:opacity-70"
                  style={{
                    backgroundColor: isActive ? 'var(--light-sage)' : 'transparent',
                    color: 'var(--deep-charcoal)',
                  }}>
                  <ThemeIcon className="w-3 h-3" />
                  {theme.value.includes('hc') && (
                    <Contrast className="w-2.5 h-2.5" style={{ opacity: 0.6 }} />
                  )}
                  <span className="font-mono text-[9px] flex-1 text-left">
                    {theme.label}
                  </span>
                  {isActive && (
                    <span className="font-mono text-[9px]" style={{ color: 'var(--primary-green)' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
