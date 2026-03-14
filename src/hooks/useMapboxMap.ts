import { useState, useEffect, useRef } from "react";
import type mapboxgl from "mapbox-gl";
import { loadMapbox } from "../utils/mapboxLoader";
import STYLE from "../utils/config";

interface UseMapboxMapReturn {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  styleLoadedCounter: number;
}

/**
 * Custom hook for initializing and managing Mapbox map instance
 * Handles map creation, style loading, theme changes, and cleanup
 * Dynamically loads mapbox-gl to reduce initial bundle size
 */
export function useMapboxMap(effectiveTheme: 'light' | 'dark'): UseMapboxMapReturn {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoadedCounter, setStyleLoadedCounter] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: mapboxgl.Map | null = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      // Dynamically load mapbox
      const mapboxgl = await loadMapbox();

      const isDark = effectiveTheme === 'dark';
      map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: STYLE.getMapStyle(isDark),
      center: [16.3738, 48.2082], // Vienna center
      zoom: 12,
      pitch: 60, // Tilt map for 3D view
      bearing: 0,
      antialias: true // Smooth 3D rendering
    });

      map.on("load", () => {
        // Add 3D terrain only if it doesn't exist
        if (map && !map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        }
        
        setMapLoaded(true);
        setStyleLoadedCounter(prev => prev + 1);
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Handle resize events to ensure map fills available space
      const handleResize = () => {
        map?.resize();
      };

      window.addEventListener('resize', handleResize);
      
      // Initial resize to ensure correct sizing with sidebar
      setTimeout(() => {
        map?.resize();
      }, 200);

      mapInstance.current = map;

      return () => {
        window.removeEventListener('resize', handleResize);
        map?.remove();
      };
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [effectiveTheme]);
  
  // Update map style when theme changes
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;
    
    const isDark = effectiveTheme === 'dark';
    const newStyle = STYLE.getMapStyle(isDark);
    
    // Check if style is loaded before updating
    if (mapInstance.current.isStyleLoaded()) {
      try {
        const currentStyle = mapInstance.current.getStyle();
        // Only update if style URL is different
        if (currentStyle && !currentStyle.sprite?.includes(newStyle)) {
          mapInstance.current.setStyle(newStyle);
          // Increment counter after new style loads to trigger marker re-creation
          mapInstance.current.once('style.load', () => {
            setStyleLoadedCounter(prev => prev + 1);
          });
        }
      } catch (error) {
        // If style is not loaded, wait for it
        mapInstance.current.once('style.load', () => {
          mapInstance.current?.setStyle(newStyle);
          mapInstance.current?.once('style.load', () => {
            setStyleLoadedCounter(prev => prev + 1);
          });
        });
      }
    } else {
      // Wait for style to load
      mapInstance.current.once('style.load', () => {
        mapInstance.current?.setStyle(newStyle);
        mapInstance.current?.once('style.load', () => {
          setStyleLoadedCounter(prev => prev + 1);
        });
      });
    }
  }, [effectiveTheme, mapLoaded]);

  return {
    mapContainerRef,
    mapInstance,
    mapLoaded,
    styleLoadedCounter,
  };
}
