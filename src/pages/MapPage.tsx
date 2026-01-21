import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { getViennaParksForApp } from "../services/viennaApi";
import { slugifyParkName } from "../data/manualParksData";
import mapboxgl from "mapbox-gl";
import { useTheme } from "../contexts/ThemeContext";
import { useMapboxMap } from "../hooks/useMapboxMap";
import { useMapMarkers } from "../hooks/useMapMarkers";
import MapContainer from "../components/map/MapContainer";
import MapControls from "../components/map/MapControls";
import MobileMapControls from "../components/map/MobileMapControls";
import type { Park } from "../types/park";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapPage = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [filteredParks, setFilteredParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Router hooks
  const { parkId } = useParams<{ parkId?: string }>();
  const navigate = useNavigate();
  
  // Theme
  const { effectiveTheme } = useTheme();

  // Map hooks
  const { mapContainerRef, mapInstance, mapLoaded, styleLoadedCounter } = useMapboxMap(effectiveTheme);
  
  // Use markers hook
  useMapMarkers({
    parks: filteredParks,
    mapInstance,
    mapLoaded,
    styleLoadedCounter,
    loading,
  });

  // Get unique districts from parks
  const districts = Array.from(new Set(parks.map((park) => park.district))).sort();

  // Filter parks by district
  const filterParksByDistrict = (district: number | null) => {
    setSelectedDistrict(district);

    if (district === null) {
      setFilteredParks(parks);
    } else {
      setFilteredParks(parks.filter((park) => park.district === district));
    }
  };

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(userPos);

          // If map is loaded, fly to user location and add a marker
          if (mapInstance.current && mapLoaded) {
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
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Fetch parks data
  useEffect(() => {
    const fetchParks = async () => {
      try {
        const data = await getViennaParksForApp();
        setParks(data);
        setFilteredParks(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parks:", error);
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

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
    <div className="min-h-screen lg:flex lg:flex-col overflow-hidden">
      <Helmet>
        <title>Wiener Grünflächen Index | Karte</title>
        <meta
          name="description"
          content="Interaktive Karte aller Parks in Wien. Finden Sie Parks in Ihrer Nähe und entdecken Sie Grünflächen in jedem Bezirk."
        />
      </Helmet>
      {/* Map Container - Respects sidebar on desktop */}
      <div className="relative flex-1 h-screen" data-lg-margin>
        <MapContainer
          mapContainerRef={mapContainerRef}
          effectiveTheme={effectiveTheme}
        />

        {/* Title Overlay - Top Left - Desktop Only */}
        <div
          className="sr-only absolute top-4 left-4 z-10 max-w-md p-3 hidden lg:block"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "8px" }}>
          <h1
            className="font-serif text-2xl"
            style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
            Wiener Parks Karte
          </h1>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--deep-charcoal)" }}>
            {filteredParks.length} PARKS {selectedDistrict && <span>IM {selectedDistrict}. BEZIRK</span>}
          </p>
        </div>

        {/* Map Controls Overlay - Desktop Only */}
        <MapControls
          selectedDistrict={selectedDistrict}
          districts={districts}
          userLocation={userLocation}
          filteredParksCount={filteredParks.length}
          onDistrictFilter={filterParksByDistrict}
          onGetUserLocation={getUserLocation}
        />

        {/* Mobile Bottom Controls - Sticky */}
        <MobileMapControls
          selectedDistrict={selectedDistrict}
          districts={districts}
          userLocation={userLocation}
          filteredParksCount={filteredParks.length}
          onDistrictFilter={filterParksByDistrict}
          onGetUserLocation={getUserLocation}
        />
      </div>
    </div>
  );
};

export default MapPage;
