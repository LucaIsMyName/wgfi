import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { useParksData } from '../hooks/useParksData';
import { useTheme } from '../contexts/ThemeContext';
import { getRecentVisitsSync } from '../hooks/useVisitHistory';
import { getRecentlyViewedIds } from '../utils/recentlyViewedManager';
import { searchParks, getTopParksByArea } from '../utils/searchUtils';
import { slugifyParkName } from '../data/manualParksData';
import type { Park } from '../types/park';
import {
  Home,
  Palmtree,
  Map,
  BarChart3,
  Heart,
  BookOpen,
  Search,
  Clock,
  Trophy,
  Shuffle,
  Sun,
  Moon,
  MapPin,
  List,
  GitCompare,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { parks } = useParksData();
  const { mode, setMode, effectiveTheme } = useTheme();
  const commandRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Focus trap implementation
  useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the input field when command palette opens
      const inputElement = commandRef.current?.querySelector('input') as HTMLInputElement;
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 0);
      }
      
      // Prevent focus from leaving the command palette and handle escape
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          return;
        }
        
        if (e.key === 'Tab') {
          const container = commandRef.current;
          if (!container) return;
          
          const focusableElements = container.querySelectorAll(
            'input, button, [href], [tabindex]:not([tabindex="-1"]), [cmdk-item], [role="option"]'
          );
          
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            // Shift + Tab (going backwards)
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab (going forwards)
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restore focus to the previously focused element when closing
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        setTimeout(() => previousActiveElement.current?.focus(), 0);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const searchResults = useMemo(() => {
    if (!search.trim()) {
      return [];
    }
    return searchParks(search, parks).slice(0, 50);
  }, [search, parks]);

  const recentVisitIds = useMemo(() => getRecentVisitsSync(5), [open]);
  const recentParks = useMemo(() => {
    return recentVisitIds
      .map(id => parks.find(p => p.id === id))
      .filter((p): p is Park => p !== undefined);
  }, [recentVisitIds, parks]);

  const recentlyViewedIds = useMemo(() => getRecentlyViewedIds().slice(0, 5), [open]);
  const recentlyViewedParks = useMemo(() => {
    return recentlyViewedIds
      .map(id => parks.find(p => p.id === id))
      .filter((p): p is Park => p !== undefined);
  }, [recentlyViewedIds, parks]);

  const topParks = useMemo(() => getTopParksByArea(parks, 10), [parks]);

  const handleSelectPark = (park: Park) => {
    navigate(`/index/${slugifyParkName(park.name)}`);
    setOpen(false);
  };

  const handleSelectPage = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleRandomPark = () => {
    if (parks.length > 0) {
      const randomIndex = Math.floor(Math.random() * parks.length);
      const randomPark = parks[randomIndex];
      navigate(`/index/${slugifyParkName(randomPark.name)}`);
      setOpen(false);
    }
  };

  const handleToggleTheme = () => {
    const modes: Array<'auto' | 'light' | 'dark' | 'light-hc' | 'dark-hc'> = ['auto', 'light', 'dark', 'light-hc', 'dark-hc'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmdk-label"
    >
      <div
        ref={commandRef}
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '640px',
          maxHeight: '60vh',
          backgroundColor: 'var(--soft-cream)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 16px 70px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--soft-cream)',
          }}
          shouldFilter={false}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 16px',
              gap: '12px',
            }}
          >
            <Search className="w-5 h-5" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Suche Parks, Seiten oder Aktionen..."
              id="cmdk-input"
              aria-label="Suche Parks, Seiten oder Aktionen"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '18px',
                color: 'var(--deep-charcoal)',
              }}
            />
            <kbd
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--primary-green)',
                opacity: 0.6,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              ESC
            </kbd>
          </div>

          <Command.List
            style={{
              maxHeight: 'calc(60vh - 60px)',
              overflowY: 'auto',
              padding: '8px',
            }}
          >
            <Command.Empty
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--primary-green)',
              }}
            >
              Keine Ergebnisse gefunden
            </Command.Empty>

            {search.trim() === '' && (
              <>
                {recentlyViewedParks.length > 0 && (
                  <Command.Group
                    heading="Kürzlich angesehen"
                    style={{
                      marginBottom: '16px',
                    }}
                  >
                    {recentlyViewedParks.map((park) => (
                      <Command.Item
                        key={park.id}
                        value={`viewed-${park.id}`}
                        onSelect={() => handleSelectPark(park)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--deep-charcoal)',
                          transition: 'background-color 0.15s',
                        }}
                        className="command-item"
                      >
                        <Clock className="w-4 h-4 mt-1" style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontStyle: 'italic', fontSize: '16px' }}>{park.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                            {park.district}. BEZIRK • {park.area.toLocaleString()} M²
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* {recentParks.length > 0 && (
                  <Command.Group
                    heading="Zuletzt besucht"
                    style={{
                      marginBottom: '16px',
                    }}
                  >
                    {recentParks.map((park) => (
                      <Command.Item
                        key={park.id}
                        value={`recent-${park.id}`}
                        onSelect={() => handleSelectPark(park)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--deep-charcoal)',
                          transition: 'background-color 0.15s',
                        }}
                        className="command-item"
                      >
                        <Clock className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontStyle: 'italic', fontSize: '16px' }}>{park.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                            {park.district}. BEZIRK • {park.area.toLocaleString()} M²
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )} */}

                <Command.Group
                  heading="Größte Parks"
                  style={{
                    marginBottom: '16px',
                  }}
                >
                  {topParks.map((park) => (
                    <Command.Item
                      key={park.id}
                      value={`top-${park.id}`}
                      onSelect={() => handleSelectPark(park)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        
                        cursor: 'pointer',
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--deep-charcoal)',
                        transition: 'background-color 0.15s',
                      }}
                      className="command-item"
                    >
                      <Trophy className="w-4 h-4 mt-1" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontStyle: 'italic', fontSize: '16px' }}>{park.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                          {park.district}. BEZIRK • {park.area.toLocaleString()} M²
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group
                  heading="Schnellaktionen"
                  style={{
                    marginBottom: '16px',
                  }}
                >
                  <Command.Item
                    value="action-map"
                    onSelect={() => handleSelectPage('/map')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <MapPin  className="w-4 h-4 mt-1" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Zur Karte
                  </Command.Item>
                  <Command.Item
                    value="action-index"
                    onSelect={() => handleSelectPage('/index')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <List className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Zum Index
                  </Command.Item>
                  <Command.Item
                    value="action-compare"
                    onSelect={() => handleSelectPage('/compare')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <GitCompare className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Parkvergleich
                  </Command.Item>
                  <Command.Item
                    value="action-random"
                    onSelect={handleRandomPark}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Shuffle className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Zufälliger Park
                  </Command.Item>
                  <Command.Item
                    value="action-theme"
                    onSelect={handleToggleTheme}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    {effectiveTheme === 'dark' ? (
                      <Sun className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    ) : (
                      <Moon className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    )}
                    Theme wechseln
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Seiten">
                  <Command.Item
                    value="page-home"
                    onSelect={() => handleSelectPage('/')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Home className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Home
                  </Command.Item>
                  <Command.Item
                    value="page-index"
                    onSelect={() => handleSelectPage('/index')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Palmtree className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Index
                  </Command.Item>
                  <Command.Item
                    value="page-map"
                    onSelect={() => handleSelectPage('/map')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Map className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Karte
                  </Command.Item>
                  <Command.Item
                    value="page-statistics"
                    onSelect={() => handleSelectPage('/statistics')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Statistiken
                  </Command.Item>
                  <Command.Item
                    value="page-favorites"
                    onSelect={() => handleSelectPage('/favorites')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Heart className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Favoriten
                  </Command.Item>
                  <Command.Item
                    value="page-idea"
                    onSelect={() => handleSelectPage('/idea')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    Idee
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {search.trim() !== '' && searchResults.length > 0 && (
              <Command.Group heading="Parks">
                {searchResults.map(({ park }) => (
                  <Command.Item
                    key={park.id}
                    value={`park-${park.id}-${park.name}`}
                    onSelect={() => handleSelectPark(park)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--deep-charcoal)',
                      transition: 'background-color 0.15s',
                    }}
                    className="command-item"
                  >
                    <Palmtree className="w-4 h-4 mt-1" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontStyle: 'italic', fontSize: '16px' }}>{park.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                        {park.district}. BEZIRK • {park.area.toLocaleString()} M²
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>

        <style>{`
          [cmdk-group-heading] {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--primary-green);
            opacity: 0.8;
            padding: 8px 12px 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .command-item[aria-selected="true"] {
            background-color: var(--light-sage);
          }

          .command-item:hover {
            background-color: var(--light-sage);
          }

          [cmdk-list] {
            scrollbar-width: thin;
            scrollbar-color: var(--border-color) transparent;
          }

          [cmdk-list]::-webkit-scrollbar {
            width: 8px;
          }

          [cmdk-list]::-webkit-scrollbar-track {
            background: transparent;
          }

          [cmdk-list]::-webkit-scrollbar-thumb {
            background-color: var(--border-color);
          }

          [cmdk-list]::-webkit-scrollbar-thumb:hover {
            background-color: var(--primary-green);
          }
        `}</style>
      </div>
    </div>
  );
}
