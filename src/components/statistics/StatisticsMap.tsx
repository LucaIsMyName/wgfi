import { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useMapboxMap } from "../../hooks/useMapboxMap";
import { useNavigate } from "react-router-dom";
import { slugifyParkName } from "../../data/manualParksData";
import { isFavorite } from "../../utils/favoritesManager";
import { createMapMarkerPopupEl } from "../../utils/mapPopupDom";
import mapboxgl from "mapbox-gl";
import type { Park } from "../../types/park";

interface StatisticsMapProps {
  parks: Park[];
  height?: string;
}

const StatisticsMap: React.FC<StatisticsMapProps> = ({ 
  parks, 
  height = "300px" 
}) => {
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Map hooks
  const { mapContainerRef, mapInstance, mapLoaded, styleLoadedCounter } = useMapboxMap({
    effectiveTheme,
    center: [16.3738, 48.2082], // Vienna center
    zoom: 11,
    pitch: 0 // Top-down view for statistics
  });
  
  // Custom marker implementation for statistics maps
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !mapInstance.current.isStyleLoaded()) {
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Calculate average park area for scaling
    const parkAreas = parks.map(p => p.area);
    const avgArea = parkAreas.reduce((a, b) => a + b, 0) / parkAreas.length;
    
    // Add markers for parks
    const markers = parks.map((park) => {
      // Calculate marker size based on park area (relative to average)
      const sizeRatio = Math.sqrt(park.area / avgArea);
      const baseSize = 24;
      const minSize = 16;
      const maxSize = 40;
      const markerSize = Math.max(minSize, Math.min(maxSize, baseSize * sizeRatio));
      
      // Create wrapper for Mapbox
      const wrapper = document.createElement("div");
      wrapper.style.width = "0";
      wrapper.style.height = "0";
      
      // Check if park is favorited
      const isFavorited = isFavorite(park.id);
      
      // Get CSS variable values for theming
      const rootStyles = getComputedStyle(document.documentElement);
      const accentGold = rootStyles.getPropertyValue('--accent-gold').trim();
      const primaryGreen = rootStyles.getPropertyValue('--primary-green').trim();
      const softCream = rootStyles.getPropertyValue('--soft-cream').trim();
      
      // Create inner marker element
      const el = document.createElement("div");
      el.className = "park-marker";
      el.style.width = `${markerSize}px`;
      el.style.height = `${markerSize}px`;
      el.style.borderRadius = "50%";
      el.style.backgroundColor = isFavorited ? accentGold : primaryGreen;
      el.style.border = `3px solid ${softCream}`;
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
      el.style.cursor = "pointer";
      el.style.position = "absolute";
      el.style.left = `${-markerSize / 2}px`;
      el.style.top = `${-markerSize / 2}px`;
      el.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      el.style.transformOrigin = "center center";
      el.style.transform = isFavorited ? "rotate(45deg)" : "none";
      
      // Append inner element to wrapper
      wrapper.appendChild(el);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true }).setDOMContent(
        createMapMarkerPopupEl(park),
      );

      // Handle marker click - navigate directly to ParkDetailPage
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (popup.isOpen()) {
          popup.remove();
        } else {
          // Close all other popups first
          document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
          // Then open this one
          popup.addTo(mapInstance.current!);
        }
      });

      // Handle popup "Mehr Details" link click - navigate directly to ParkDetailPage
      popup.on('open', () => {
        const popupElement = popup.getElement();
        if (popupElement) {
          const detailLink = popupElement.querySelector('a[href*="/map/"]');
          if (detailLink) {
            detailLink.addEventListener('click', (e) => {
              e.preventDefault();
              navigate(`/index/${slugifyParkName(park.name)}`);
            });
          }
        }
      });

      // Add hover effect
      el.addEventListener("mouseenter", () => {
        if (isFavorited) {
          el.style.transform = "rotate(45deg) scale(1.3)";
        } else {
          el.style.transform = "scale(1.3)";
        }
        el.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.6)";
        el.style.zIndex = "1000";
      });

      el.addEventListener("mouseleave", () => {
        if (isFavorited) {
          el.style.transform = "rotate(45deg)";
        } else {
          el.style.transform = "none";
        }
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
        el.style.zIndex = "";
      });

      // Create and add marker
      const marker = new mapboxgl.Marker(wrapper)
        .setLngLat([park.coordinates.lng, park.coordinates.lat])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      return marker;
    });

    // Store markers for later removal
    markersRef.current = markers;
  }, [parks, mapLoaded, styleLoadedCounter, mapInstance, navigate]);

  // Fit map to show all markers when parks are loaded
  useEffect(() => {
    if (mapLoaded && parks.length > 0 && mapInstance.current) {
      const bounds = new mapboxgl.LngLatBounds();
      
      parks.forEach((park) => {
        bounds.extend([park.coordinates.lng, park.coordinates.lat]);
      });
      
      // Fit bounds with padding
      mapInstance.current.fitBounds(bounds, { 
        padding: 40, 
        maxZoom: 13 
      });
    }
  }, [parks, mapLoaded, mapInstance]);

  return (
    <div 
      className="w-full rounded-lg overflow-hidden border border-border-color relative"
      style={{ height }}
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          position: "relative",
          zIndex: 0
        }}
      />
    </div>
  );
};

export default StatisticsMap;
