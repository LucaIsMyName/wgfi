/**
 * Mapbox GL Dynamic Loader
 * Loads mapbox-gl library and CSS on-demand to reduce initial bundle size
 */

import type mapboxgl from 'mapbox-gl';

let mapboxPromise: Promise<typeof mapboxgl> | null = null;
let mapboxInstance: typeof mapboxgl | null = null;
let cssLoaded = false;

/**
 * Dynamically load Mapbox GL library and CSS
 * Returns cached instance on subsequent calls
 */
export async function loadMapbox(): Promise<typeof mapboxgl> {
  // Return cached instance if already loaded
  if (mapboxInstance) {
    return mapboxInstance;
  }

  // Return existing promise if loading is in progress
  if (mapboxPromise) {
    return mapboxPromise;
  }

  // Start loading mapbox
  mapboxPromise = (async () => {
    // Load CSS first
    if (!cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css';
      document.head.appendChild(link);
      cssLoaded = true;
    }

    // Dynamically import mapbox-gl
    const mapbox = await import('mapbox-gl');
    
    // Set access token
    mapbox.default.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    // Cache the instance
    mapboxInstance = mapbox.default;
    
    return mapbox.default;
  })();

  return mapboxPromise;
}

/**
 * Check if Mapbox is already loaded
 */
export function isMapboxLoaded(): boolean {
  return mapboxInstance !== null;
}

/**
 * Get cached Mapbox instance (throws if not loaded)
 */
export function getMapbox(): typeof mapboxgl {
  if (!mapboxInstance) {
    throw new Error('Mapbox not loaded. Call loadMapbox() first.');
  }
  return mapboxInstance;
}
