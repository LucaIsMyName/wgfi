import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useParksData } from "../hooks/useParksData";
import { SkeletonMap } from "../components/Loading";
import type { Park } from "../types/park";

// Lazy load the entire map component to reduce initial bundle size
const LazyMapComponent = lazy(() => import("../components/map/LazyMapComponent"));

const MapPage = () => {
  const { parks } = useParksData();
  const [filteredParks, setFilteredParks] = useState<Park[]>(parks);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Router hooks
  const { parkId } = useParams<{ parkId?: string }>();

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
          content="Interaktive Karte aller Parks in Wien. Finden Sie Parks in Ihrer Nähe und entdecken Sie Grünflächen in jedem Bezirk."
        />
      </Helmet>
      
      {/* Map Container - Respects sidebar on desktop */}
      <div className="relative flex-1 h-screen" data-lg-margin>
        <Suspense fallback={<SkeletonMap />}>
          <LazyMapComponent
            parks={parks}
            filteredParks={filteredParks}
            selectedDistrict={selectedDistrict}
            userLocation={userLocation}
            parkId={parkId}
            onFilteredParksChange={setFilteredParks}
            onUserLocationChange={setUserLocation}
            onSelectedDistrictChange={setSelectedDistrict}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MapPage;
