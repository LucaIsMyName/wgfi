import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import STYLE from "../utils/config";

interface UseMapboxMapReturn {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  styleLoadedCounter: number;
}

interface UseMapboxMapProps {
  effectiveTheme: 'light' | 'dark';
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  pitch?: number;
}

/**
 * Custom hook for initializing and managing Mapbox map instance
 * Handles map creation, style loading, theme changes, and cleanup
 */
export function useMapboxMap({ 
  effectiveTheme, 
  center = [16.3738, 48.2082], // Vienna center
  zoom = 12,
  pitch = 60
}: UseMapboxMapProps): UseMapboxMapReturn {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoadedCounter, setStyleLoadedCounter] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check for access token before creating map
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'your_mapbox_token_here') {
      console.error('Cannot initialize map: Missing or invalid Mapbox access token');
      return;
    }
    
    // Prevent duplicate map creation (especially in StrictMode)
    if (mapInstance.current) {
      console.log('Map already exists, skipping initialization');
      return;
    }

    // Only initialize map when we have valid coordinates or fallback
    if (!center) {
      console.log('No center coordinates provided, skipping map initialization');
      return;
    }

    let map: mapboxgl.Map | null = null;
    let isCleanedUp = false;
    let handleResize: (() => void) | null = null;

    const initMap = () => {
      if (!mapContainerRef.current || isCleanedUp) return;
      
      // Double-check to prevent race conditions
      if (mapInstance.current) {
        console.log('Map instance exists, aborting initialization');
        return;
      }

      try {
        const isDark = effectiveTheme === 'dark';
        map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: STYLE.getMapStyle(isDark),
        center: center, // Use dynamic center
        zoom: zoom, // Use dynamic zoom
        pitch: pitch, // Use dynamic pitch
        bearing: 0,
        antialias: true, // Smooth 3D rendering
        preserveDrawingBuffer: true // Prevent WebGL context loss
      });
      } catch (error) {
        console.error('Error creating map:', error);
        return;
      }

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
      handleResize = () => {
        if (map && map.getCanvas() && !isCleanedUp) {
          try {
            map.resize();
          } catch (error) {
            console.warn('Error during map resize:', error);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      
      // Initial resize to ensure correct sizing with sidebar
      setTimeout(() => {
        if (map && map.getCanvas() && !isCleanedUp) {
          try {
            map.resize();
          } catch (error) {
            console.warn('Error during initial map resize:', error);
          }
        }
      }, 200);

      mapInstance.current = map;
    };

    initMap();

    return () => {
      isCleanedUp = true;
      console.log('Cleaning up map instance');
      
      // Remove event listener first before cleaning up map
      if (handleResize) {
        try {
          window.removeEventListener('resize', handleResize);
        } catch (error) {
          console.warn('Error removing resize listener:', error);
        }
        handleResize = null;
      }
      
      // Clean up map instance safely
      if (mapInstance.current) {
        try {
          // Check if map has a canvas before attempting removal
          if (mapInstance.current.getCanvas()) {
            mapInstance.current.remove();
          }
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        } finally {
          mapInstance.current = null;
        }
      }
      
      // Also clean up local map variable if it exists
      if (map) {
        try {
          if (map.getCanvas()) {
            map.remove();
          }
        } catch (error) {
          console.warn('Error during local map cleanup:', error);
        } finally {
          map = null;
        }
      }
      
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]); // Initialize when center becomes available
  
  // Update map center/zoom/pitch when they change (but don't recreate map)
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;
    
    // Only update if center, zoom, or pitch are different from current
    const currentCenter = mapInstance.current.getCenter();
    const currentZoom = mapInstance.current.getZoom();
    const currentPitch = mapInstance.current.getPitch();
    
    const centerChanged = !center || 
      Math.abs(currentCenter.lng - center[0]) > 0.0001 || 
      Math.abs(currentCenter.lat - center[1]) > 0.0001;
    const zoomChanged = Math.abs(currentZoom - zoom) > 0.1;
    const pitchChanged = Math.abs(currentPitch - pitch) > 1;
    
    if (centerChanged || zoomChanged || pitchChanged) {
      mapInstance.current.flyTo({
        center: center || currentCenter.toArray(),
        zoom: zoom,
        pitch: pitch,
        duration: 1000
      });
    }
  }, [center, zoom, pitch, mapLoaded]);
  
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
