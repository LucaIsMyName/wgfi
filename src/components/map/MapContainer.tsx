import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  effectiveTheme: 'light' | 'dark';
  onMapLoad?: () => void;
}

/**
 * MapContainer component - renders the Mapbox map container
 * This is a simple wrapper component for the map div
 */
export default function MapContainer({ mapContainerRef, effectiveTheme, onMapLoad }: MapContainerProps) {
  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full lg:ml-[clamp(200px,16vw,280px)]"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}
    />
  );
}
