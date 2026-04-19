import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { useParksData } from "../hooks/useParksData";
import Loading from "../components/Loading";
import type { Park } from "../types/park";

// Lazy load the entire map component to reduce initial bundle size
const LazyMapComponent = lazy(() => import("../components/map/LazyMapComponent"));

// Local storage key
const STORAGE_KEY_AMENITIES = "wgfi:map-selected-amenities";

const MapPage = () => {
  const { parks } = useParksData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredParks, setFilteredParks] = useState<Park[]>(parks);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Router hooks
  const { parkId } = useParams<{ parkId?: string }>();

  // Initialize selected amenities from URL params and localStorage
  useEffect(() => {
    const urlAmenities = searchParams.get("amenities");
    if (urlAmenities) {
      setSelectedAmenities(urlAmenities.split(",").filter(Boolean));
    } else {
      const stored = localStorage.getItem(STORAGE_KEY_AMENITIES);
      if (stored) {
        setSelectedAmenities(JSON.parse(stored));
      }
    }
  }, [searchParams]);

  // Update URL params and localStorage when amenities change
  const updateSelectedAmenities = (value: string[]) => {
    setSelectedAmenities(value);
    localStorage.setItem(STORAGE_KEY_AMENITIES, JSON.stringify(value));
    
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value.length > 0) {
        newParams.set("amenities", value.join(","));
      } else {
        newParams.delete("amenities");
      }
      return newParams;
    }, { replace: true });
  };

  // Get available amenities from all parks
  const availableAmenities = Array.from(
    new Set(parks.flatMap(park => park.amenities))
  ).sort((a, b) => a.localeCompare(b));

  // Apply filters to parks
  useEffect(() => {
    let filtered = parks;

    // District filter
    if (selectedDistrict !== null) {
      filtered = filtered.filter(park => park.district === selectedDistrict);
    }

    // Amenities filter - park must have ALL selected amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(park => 
        selectedAmenities.every(amenity => park.amenities.includes(amenity))
      );
    }

    setFilteredParks(filtered);
  }, [parks, selectedDistrict, selectedAmenities]);

  // Initialize filtered parks when parks data is available
  useEffect(() => {
    if (parks.length > 0 && filteredParks.length === 0) {
      setFilteredParks(parks);
    }
  }, [parks, filteredParks.length]);

  return (
    <div className="min-h-screen lg:flex lg:flex-col overflow-hidden">
      <Helmet>
        <title>Wiener Grünflächen Index | Karte</title>
        <meta
          name="description"
          content="Interaktive Karte aller Parks in Wien. Finde Parks in deiner Nähe und entdecke Grünflächen in jedem Bezirk."
        />
      </Helmet>

      <p className="sr-only" id="map-page-intro">
        Interaktive Karte der Wiener Parks. Steuerung über die beschrifteten Schaltflächen am
        Kartenrand. Alle Parks finden Sie auch in der Index-Ansicht.
      </p>

      {/* Map Container - Respects sidebar on desktop */}
      <div className="relative flex-1 h-screen" data-lg-margin>
        <Suspense fallback={<Loading variant="map" />}>
          <LazyMapComponent
            parks={parks}
            filteredParks={filteredParks}
            selectedDistrict={selectedDistrict}
            selectedAmenities={selectedAmenities}
            availableAmenities={availableAmenities}
            userLocation={userLocation}
            parkId={parkId}
            onFilteredParksChange={setFilteredParks}
            onUserLocationChange={setUserLocation}
            onSelectedDistrictChange={setSelectedDistrict}
            onSelectedAmenitiesChange={updateSelectedAmenities}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MapPage;
