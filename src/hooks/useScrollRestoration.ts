import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_POSITION_KEY = 'wgfi:parks-list-scroll';

export function useScrollRestoration(enabled: boolean = true) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isParksListPage = location.pathname === '/index';

  // Save scroll position before leaving
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current || !isParksListPage) return;

    const container = scrollContainerRef.current;
    
    return () => {
      // Save scroll position when component unmounts or route changes
      if (container) {
        const scrollTop = container.scrollTop;
        sessionStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString());
      }
    };
  }, [enabled, isParksListPage]);

  // Restore scroll position when returning to list
  useEffect(() => {
    if (!enabled || !isParksListPage) return;

    const savedScroll = sessionStorage.getItem(SCROLL_POSITION_KEY);
    
    if (savedScroll !== null) {
      // Use setTimeout to ensure DOM is ready and ref is set
      const timeoutId = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop = parseInt(savedScroll, 10);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, isParksListPage]);

  return scrollContainerRef;
}
