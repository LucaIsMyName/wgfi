import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { slugifyParkName } from "@/data/manualParksData";
import { isFavorite } from "@/utils/favoritesManager";
import { createMapMarkerPopupEl } from "@/utils/mapPopupDom";
import type { Park } from "@/types/park";

interface UseMapMarkersProps {
  parks: Park[];
  mapInstance: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  styleLoadedCounter: number;
  loading: boolean;
}

/**
 * Custom hook for managing map markers
 * Handles marker creation, updates, popups, and URL synchronization
 */
export function useMapMarkers({
  parks,
  mapInstance,
  mapLoaded,
  styleLoadedCounter,
  loading,
}: UseMapMarkersProps) {
  const navigate = useNavigate();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRefs = useRef<{ [key: string]: mapboxgl.Popup }>({});

  useEffect(() => {
    if (!mapLoaded || loading || !mapInstance.current || !mapInstance.current.isStyleLoaded()) {
      return;
    }

    const initMarkers = () => {
      try {
        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        popupRefs.current = {};

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
        
        // Create wrapper for Mapbox (this gets positioned by Mapbox)
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
        
        // Create inner marker element (this handles hover effects)
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

        // Create popup (DOM nodes avoid HTML injection from park fields)
        const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true }).setDOMContent(
          createMapMarkerPopupEl(park),
        );
          
        // Store popup reference and set park ID as data attribute
        popupRefs.current[park.id] = popup;
        // Add data attribute to the popup element for easier selection
        popup.getElement()?.setAttribute('data-park-id', park.id);

        // Track if popup was closed by user action
        let closedByUser = false;
        
        // Handle popup close
        popup.on('close', () => {
          // Only update URL if this popup was closed by user action
          if (closedByUser && window.location.pathname === `/map/${slugifyParkName(park.name)}`) {
            navigate('/map', { replace: true });
          }
          closedByUser = false; // Reset the flag
        });
        
        // Add click handler to the close button
        popup.on('open', () => {
          // Only update URL if it's not already set to this park
          if (window.location.pathname !== `/map/${slugifyParkName(park.name)}`) {
            navigate(`/map/${slugifyParkName(park.name)}`, { replace: true });
          }
          
          // Set up close button click handler
          const closeButton = popup.getElement()?.querySelector('.mapboxgl-popup-close-button');
          if (closeButton) {
            closeButton.addEventListener('click', () => {
              closedByUser = true;
            });
          }
        });

        // Handle marker click
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (popup.isOpen()) {
            closedByUser = true; // Mark as closed by user
            popup.remove();
          } else {
            // Close all other popups first
            document.querySelectorAll('.mapboxgl-popup').forEach(p => {
              // Mark other popups as closed by program
              const popupId = p.getAttribute('data-park-id');
              if (popupId) {
                const otherPopup = popupRefs.current[popupId];
                if (otherPopup) {
                  otherPopup.remove();
                }
              }
            });
            // Then open this one
            popup.addTo(mapInstance.current!);
          }
        });

        // Add data attribute to the marker element for easier selection
        el.setAttribute('data-park-id', park.id);
        
        // Create and add marker using wrapper
        const marker = new mapboxgl.Marker(wrapper)
          .setLngLat([park.coordinates.lng, park.coordinates.lat])
          .setPopup(popup)
          .addTo(mapInstance.current!);

        // Add hover effect - maintain rotation for favorites
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

        return marker;
      });

        // Store markers for later removal
        markersRef.current = markers;

        // Fit map to markers if we have any
        if (markers.length > 0 && mapInstance.current) {
          const bounds = new mapboxgl.LngLatBounds();

          parks.forEach((park) => {
            bounds.extend([park.coordinates.lng, park.coordinates.lat]);
          });
          if (mapInstance.current) {
            mapInstance.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
          }
        }
      } catch (error) {
        // Markers failed to load
      }
    };

    initMarkers();
  }, [parks, loading, mapLoaded, styleLoadedCounter, mapInstance, navigate]);

  return {
    markersRef,
    popupRefs,
  };
}
