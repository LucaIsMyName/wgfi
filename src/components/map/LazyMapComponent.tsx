import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useMapboxMap } from "../../hooks/useMapboxMap";
import { useMapMarkers } from "../../hooks/useMapMarkers";
import { slugifyParkName } from "../../data/manualParksData";
import MapContainer from "./MapContainer";
import MapControls from "./MapControls";
import MobileMapControls from "./MobileMapControls";
import mapboxgl from "mapbox-gl";
import type { Park } from "../../types/park";

interface LazyMapComponentProps {
  parks: Park[];
  filteredParks: Park[];
  selectedDistrict: number | null;
  userLocation: { lat: number; lng: number } | null;
  parkId?: string;
  onFilteredParksChange: (parks: Park[]) => void;
  onUserLocationChange: (location: { lat: number; lng: number } | null) => void;
  onSelectedDistrictChange: (district: number | null) => void;
}

const LazyMapComponent: React.FC<LazyMapComponentProps> = ({
  parks,
  filteredParks,
  selectedDistrict,
  userLocation,
  parkId,
  onFilteredParksChange,
  onUserLocationChange,
  onSelectedDistrictChange,
}) => {
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();

  // Map hooks
  const { mapContainerRef, mapInstance, mapLoaded, styleLoadedCounter } = useMapboxMap({
    effectiveTheme,
    center: [16.3738, 48.2082], // Vienna center
    zoom: 12,
    pitch: 60
  });
  
  // Use markers hook
  useMapMarkers({
    parks: filteredParks,
    mapInstance,
    mapLoaded,
    styleLoadedCounter,
    loading: false,
  });

  // Get unique districts from parks
  const districts = Array.from(new Set(parks.map((park) => park.district))).sort();

  // Initialize filtered parks when parks data is available
  useEffect(() => {
    if (parks.length > 0 && filteredParks.length === 0) {
      onFilteredParksChange(parks);
    }
  }, [parks, filteredParks.length, onFilteredParksChange]);

  // Filter parks by district
  useEffect(() => {
    if (selectedDistrict === null) {
      onFilteredParksChange(parks);
    } else {
      onFilteredParksChange(parks.filter((park) => park.district === selectedDistrict));
    }
  }, [selectedDistrict, parks, onFilteredParksChange]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = { lat: latitude, lng: longitude };
        onUserLocationChange(userPos);

        // Fly to user location
        if (mapInstance.current) {
          mapInstance.current.flyTo({
            center: [userPos.lng, userPos.lat],
            zoom: 14,
          });

          // Add user location marker
          new mapboxgl.Marker({
            color: "#FF0000",
          })
            .setLngLat([userPos.lng, userPos.lat])
            .addTo(mapInstance.current);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        onUserLocationChange(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [onUserLocationChange, mapInstance]);

  // Clear user location
  const clearUserLocation = useCallback(() => {
    onUserLocationChange(null);
  }, [onUserLocationChange]);

  // Function to find park by ID or slug
  const findParkByIdOrSlug = useCallback((idOrSlug: string): Park | undefined => {
    return parks.find(park => 
      park.id === idOrSlug || 
      slugifyParkName(park.name) === idOrSlug
    );
  }, [parks]);

  // Handle park selection from URL
  useEffect(() => {
    if (!mapLoaded || !parkId || !mapInstance.current || parks.length === 0) return;

    const park = findParkByIdOrSlug(parkId);
    if (park) {
      // Store the current park ID to prevent premature reset
      const currentParkId = parkId;
      
      // Close any open popups first
      document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
      
      // Fly to the park
      mapInstance.current.flyTo({
        center: [park.coordinates.lng, park.coordinates.lat],
        zoom: 16,
        duration: 1500
      });

      // Add a small delay to ensure the map has finished moving and markers are rendered
      const timer = setTimeout(() => {
        // Check if we're still on the same park (in case user clicked away)
        if (currentParkId === parkId) {
          // Force update the URL to ensure it's correct
          navigate(`/map/${slugifyParkName(park.name)}`, { replace: true });
          
          // Try to find the marker and trigger click to open popup
          const markerElement = document.querySelector(`[data-park-id="${park.id}"]`);
          if (markerElement && markerElement.parentElement) {
            // Trigger click on the marker to open its popup
            markerElement.parentElement.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
          }
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [parkId, mapLoaded, parks, findParkByIdOrSlug, navigate, mapInstance]);

  return (
    <>
      <MapContainer
        mapContainerRef={mapContainerRef}
        effectiveTheme={effectiveTheme}
      />
      
      {mapLoaded && (
        <>
          <MapControls
            selectedDistrict={selectedDistrict}
            districts={districts}
            userLocation={userLocation}
            filteredParksCount={filteredParks.length}
            onDistrictFilter={onSelectedDistrictChange}
            onGetUserLocation={getUserLocation}
          />
          
          <MobileMapControls
            selectedDistrict={selectedDistrict}
            districts={districts}
            userLocation={userLocation}
            filteredParksCount={filteredParks.length}
            onDistrictFilter={onSelectedDistrictChange}
            onGetUserLocation={getUserLocation}
          />
        </>
      )}
    </>
  );
};

export default LazyMapComponent;
