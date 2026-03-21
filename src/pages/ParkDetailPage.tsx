import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParksData } from "../hooks/useParksData";
import { getManualParkData, slugifyParkName } from "../data/manualParksData";
import {
  MapPin,
  Map,
  Building,
  Ruler,
  AlertTriangle,
  ChevronLeft,
  Heart,
  GitCompare,
} from "lucide-react";
import { getAmenityIcon } from "../utils/amenityIcons";
import { isFavorite, toggleFavorite } from "../utils/favoritesManager";
import { isInComparison, toggleComparison } from "../utils/comparisonManager";
import { addVisitSync } from "../hooks/useVisitHistory";
import { addRecentlyViewed } from "../utils/recentlyViewedManager";
import ParkInfo from "../components/ParkInfo";
import MetadataAccordion from "../components/MetadataAccordion";
import { useMapboxMap } from "../hooks/useMapboxMap";
import { useTheme } from "../contexts/ThemeContext";
import STYLE from "../utils/config";
import { getAllDistrictsForPark, formatDistricts } from "../utils/parkUtils";
import type { Park, ParkWithDistance } from "../types/park";
import { calculateDistance } from "../utils/geoUtils";
import { Button } from "../components/ui/Button";

const ParkDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { effectiveTheme, isHighContrast } = useTheme();
  const { parks } = useParksData();
  const [park, setPark] = useState<Park | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [nearbyParks, setNearbyParks] = useState<ParkWithDistance[]>([]);

  // Map references - using shared hook
  const mapCenter: [number, number] = useMemo(() => {
    if (park?.coordinates) {
      return [park.coordinates.lng, park.coordinates.lat];
    }
    // Fallback to Vienna center if park coordinates not available yet
    return [16.3738, 48.2082];
  }, [park?.coordinates]);

  const { mapContainerRef, mapInstance, mapLoaded, styleLoadedCounter } =
    useMapboxMap({
      effectiveTheme,
      center: mapCenter,
      zoom: 15.5,
      pitch: 60,
    });
  const mapMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Set map ready state when map is loaded and park is available
  useEffect(() => {
    setMapReady(mapLoaded && !!park);
  }, [mapLoaded, park]);

  // Update map center when park coordinates become available
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !park?.coordinates) return;

    const currentCenter = mapInstance.current.getCenter();
    const targetCenter: [number, number] = [
      park.coordinates.lng,
      park.coordinates.lat,
    ];

    // Only flyTo if we're not already at the target location
    const centerChanged =
      Math.abs(currentCenter.lng - targetCenter[0]) > 0.0001 ||
      Math.abs(currentCenter.lat - targetCenter[1]) > 0.0001;

    if (centerChanged) {
      mapInstance.current.flyTo({
        center: targetCenter,
        zoom: 15.5,
        pitch: 60,
        duration: 1000,
      });
    }
  }, [park?.coordinates, mapLoaded, mapInstance]);

  // Check if park is in favorites and comparison when it loads
  useEffect(() => {
    if (park?.id) {
      setIsFavorited(isFavorite(park.id));
      setIsInCompare(isInComparison(park.id));
    }
  }, [park]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (_error) => {
          // User location denied or unavailable
        },
      );
    }
  }, []);

  // Find and set park data
  useEffect(() => {
    if (!idOrSlug || parks.length === 0) {
      setPark(null);
      setError(null);
      return;
    }

    try {
      // Try to find park by ID first
      let foundPark = parks.find(
        (p: { id: string; name: string }) => p.id === idOrSlug,
      );

      // If not found by ID, try to find by slug
      if (!foundPark) {
        foundPark = parks.find(
          (p: { id: string; name: string }) =>
            slugifyParkName(p.name) === idOrSlug,
        );
      }

      if (foundPark) {
        // Merge with manual data if available
        let manualData = getManualParkData(foundPark.id);

        // If not found by ID, try by slugified name
        if (!manualData) {
          manualData = getManualParkData(slugifyParkName(foundPark.name));
        }

        // Merge amenities: combine API amenities with manual amenities
        const mergedAmenities = manualData?.amenities
          ? [
              ...new Set([
                ...(foundPark.amenities || []),
                ...manualData.amenities,
              ]),
            ]
          : foundPark.amenities;

        const currentPark = {
          ...foundPark,
          ...manualData,
          amenities: mergedAmenities,
        };

        setPark(currentPark);
        setError(null);

        addVisitSync(foundPark.id);
        addRecentlyViewed(foundPark.id);
      } else {
        setPark(null);
        setError("Park nicht gefunden");
      }
    } catch (err) {
      console.error("Error loading park:", err);
      setPark(null);
      setError("Fehler beim Laden des Parks");
    }
  }, [idOrSlug, parks]);

  // Calculate nearby parks when park changes
  useEffect(() => {
    if (!park || !park.coordinates) return;

    const parksWithDistance: ParkWithDistance[] = parks
      .filter((p: Park) => p.id !== park.id) // Exclude current park
      .map((p: Park): ParkWithDistance => {
        const manualData =
          getManualParkData(p.id) || getManualParkData(slugifyParkName(p.name));
        // Merge amenities for nearby parks too
        const nearbyMergedAmenities = manualData?.amenities
          ? [...new Set([...(p.amenities || []), ...manualData.amenities])]
          : p.amenities;
        return {
          ...p,
          ...manualData,
          amenities: nearbyMergedAmenities,
          distance: calculateDistance(
            park.coordinates.lat,
            park.coordinates.lng,
            p.coordinates.lat,
            p.coordinates.lng,
          ),
        };
      })
      .sort(
        (a: ParkWithDistance, b: ParkWithDistance) => a.distance - b.distance,
      )
      .slice(0, 5); // Get 5 nearest parks

    setNearbyParks(parksWithDistance);
  }, [park, parks]);

  // Initialize map marker when park and map are ready
  useEffect(() => {
    if (!park || !park.coordinates || !mapInstance.current || !mapReady) return;

    // Reset error state
    setMapError(null);

    // Clean up previous marker if it exists
    if (mapMarker.current) {
      mapMarker.current.remove();
      mapMarker.current = null;
    }

    const initMarker = () => {
      try {
        // Import mapboxgl dynamically for marker creation
        import("mapbox-gl")
          .then((mapboxgl) => {
            if (!mapInstance.current || !park) return;

            // Create marker wrapper and inner element
            const wrapper = document.createElement("div");
            wrapper.className = "marker-wrapper";
            wrapper.style.position = "absolute";
            wrapper.style.transform = "translate(-50%, -50%)";

            const el = document.createElement("div");
            el.className = "custom-marker";
            el.style.width = "30px";
            el.style.height = "30px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "var(--primary-green)";
            el.style.display = "flex";
            el.style.justifyContent = "center";
            el.style.alignItems = "center";
            el.style.color = "var(--soft-cream)";
            el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
            el.style.cursor = "pointer";
            el.style.transition = "all 0.2s";
            el.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

            wrapper.appendChild(el);

            // Create popup
            const popup = new mapboxgl.default.Popup({
              offset: 25,
              closeButton: false,
            }).setHTML(`
            <div style=" padding: 12px; border-radius: 8px; text-align:center">
              <h3 style="font-family: ' Instrument Serif', serif; font-style:italic; font-weight: 600; margin: 0 0 8px 0; color: var(--primary-green); font-size: 24px;">${
                park.name
              }</h3>
              <p style="font-family: 'Geist Mono', monospace; margin: 0; font-size: 14px; color: var(--deep-charcoal);">${
                park.address || "Adresse nicht verfügbar"
              }</p>
            </div>
          `);

            // Add marker using the wrapper
            const marker = new mapboxgl.default.Marker(wrapper)
              .setLngLat([park.coordinates.lng, park.coordinates.lat])
              .setPopup(popup)
              .addTo(mapInstance.current);

            // Add hover effect
            el.addEventListener("mouseenter", () => {
              el.style.transform = "scale(1.1)";
              el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
            });
            el.addEventListener("mouseleave", () => {
              el.style.transform = "scale(1)";
              el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
            });

            // Store reference
            mapMarker.current = marker;

            // Map is already centered by the hook, no need to flyTo again
          })
          .catch((error) => {
            console.error("Error loading mapbox:", error);
            setMapError("Karte konnte nicht geladen werden");
          });
      } catch (error) {
        console.error("Error initializing marker:", error);
        setMapError("Marker konnte nicht geladen werden");
      }
    };

    // Wait for map to be fully loaded
    if (mapInstance.current.isStyleLoaded()) {
      initMarker();
    } else {
      mapInstance.current.once("load", initMarker);
    }

    // Cleanup function
    return () => {
      if (mapMarker.current) {
        mapMarker.current.remove();
        mapMarker.current = null;
      }
    };
  }, [park, mapReady, mapInstance, styleLoadedCounter]);

  // Update marker when style changes (theme handled by shared hook)
  useEffect(() => {
    if (!mapInstance.current || !park || !mapMarker.current) return;

    // Re-create marker when style changes
    const timer = setTimeout(() => {
      if (mapMarker.current) {
        mapMarker.current.remove();
        mapMarker.current = null;
      }

      // Re-initialize marker with new style
      import("mapbox-gl").then((mapboxgl) => {
        if (!mapInstance.current || !park) return;

        // Create marker wrapper and inner element
        const wrapper = document.createElement("div");
        wrapper.className = "marker-wrapper";
        wrapper.style.position = "absolute";
        wrapper.style.transform = "translate(-50%, -50%)";

        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "var(--primary-green)";
        el.style.display = "flex";
        el.style.justifyContent = "center";
        el.style.alignItems = "center";
        el.style.color = "var(--soft-cream)";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";
        el.style.transition = "all 0.2s";
        el.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

        wrapper.appendChild(el);

        // Create popup
        const popup = new mapboxgl.default.Popup({
          offset: 25,
          closeButton: false,
        }).setHTML(`
            <div style=" padding: 12px; border-radius: 8px; text-align:center">
              <h3 style="font-family: ' Instrument Serif', serif; font-style:italic; font-weight: 600; margin: 0 0 8px 0; color: var(--primary-green); font-size: 24px;">${
                park.name
              }</h3>
              <p style="font-family: 'Geist Mono', monospace; margin: 0; font-size: 14px; color: var(--deep-charcoal);">${
                park.address || "Adresse nicht verfügbar"
              }</p>
            </div>
          `);

        // Add marker using the wrapper
        const marker = new mapboxgl.default.Marker(wrapper)
          .setLngLat([park.coordinates.lng, park.coordinates.lat])
          .setPopup(popup)
          .addTo(mapInstance.current);

        // Add hover effect
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.1)";
          el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        });

        mapMarker.current = marker;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [styleLoadedCounter, park, mapInstance]);

  // Only show error after parks are loaded to prevent flash
  if (parks.length > 0 && (error || !park)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg">
        <div className="p-6 bg-card-bg">
          <AlertTriangle
            className="w-16 h-16 mb-5"
            stroke="var(--accent-gold)"
          />
          <p className="font-serif italic text-lg text-deep-charcoal font-normal">
            {error || "Park nicht gefunden"}
          </p>
          <Button
            onClick={() => history.back()}
            variant="primary"
            size="md"
            className="mt-4"
          >
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  // Show nothing while parks are loading
  if (!park) {
    return null;
  }

  // TypeScript now knows park is non-null after the early return
  const parkData: Park = park;
  const allDistricts = getAllDistrictsForPark(parkData);
  const districtsDisplay = formatDistricts(allDistricts, "full").toUpperCase();

  return (
    <div className="min-h-screen bg-main-bg">
      <Helmet>
        <title>{`${parkData.name} | Wiener Grünflächen Index`}</title>
        <meta
          name="description"
          content={`${parkData.name} im ${parkData.district}. Bezirk mit detaillierten Informationen zu Lage, Ausstattung und Größe.`}
        />
        <meta
          name="keywords"
          content={`${parkData.name}, ${parkData.district}, Wien, Park, Grünfläche, Grünflächen, Grünflächen Index, Wiener Grünflächen Index, Wiener Parks, Wiener Grünflächen`}
        />
      </Helmet>

      {/* Header with park name */}
      <div className="px-4 py-6 lg:mr-[calc(30%+96px)]">
        <div className="flex items-center justify-between mb-4">
          <Button to="/index" variant="ghost" size="sm" icon={ChevronLeft}>
            Zurück
          </Button>
        </div>
        <h1
          className={`${STYLE.pageTitle(true)} mb-4`}
          style={{
            color: "var(--primary-green)",
            fontWeight: "400",
            fontStyle: "italic",
          }}
        >
          {parkData.name}
        </h1>
        <div className="sm:flex items-center gap-6 space-y-4 sm:space-y-0 text-body">
          <span
            className="flex items-center gap-2 font-mono text-xs truncate"
            style={{ color: "var(--deep-charcoal)" }}
          >
            <Building className="w-4 h-4" /> {districtsDisplay}
          </span>
          <span
            className="flex items-center gap-2 font-mono text-xs"
            style={{ color: "var(--deep-charcoal)" }}
          >
            <Ruler className="w-4 h-4" /> {parkData.area.toLocaleString()} M²
          </span>
        </div>
      </div>

      {/* Fixed Right Sidebar - Desktop */}
      <div
        className="hidden lg:block fixed right-0 top-0 w-[30%] h-screen overflow-y-auto pb-8 pt-4 pr-4 z-10"
        style={{
          backgroundColor: "var(--card-bg)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--light-sage) transparent",
        }}
      >
        <div
          className="space-y-4 pl-4 mt-4"
          style={{ borderColor: "var(--primary-green)" }}
        >
          <div style={{ backgroundColor: "var(--card-bg)" }}>
            <ParkInfo park={park} userLocation={userLocation} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/map/${slugifyParkName(parkData.name)}`}
              className="flex-1 px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--primary-green)",
                color: "var(--soft-cream)",
                borderRadius: "6px",
              }}
            >
              <Map className="w-4 h-4" />
              Karte
            </Link>
            <button
              onClick={() => {
                const newStatus = toggleFavorite(parkData.id);
                setIsFavorited(newStatus);
              }}
              className="w-10 h-10 font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: isFavorited
                  ? "var(--accent-gold)"
                  : "var(--card-bg)",
                color: isFavorited
                  ? "var(--soft-cream)"
                  : "var(--primary-green)",
                borderRadius: "6px",
              }}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorited ? "currentColor" : "none"}
              />
              {isFavorited ? "" : ""}
            </button>
            <button
              onClick={() => {
                const success = toggleComparison(parkData.id);
                if (success || !isInCompare) {
                  setIsInCompare(!isInCompare);
                }
              }}
              className="w-10 h-10 font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: isInCompare
                  ? "var(--primary-green)"
                  : "var(--card-bg)",
                color: isInCompare
                  ? "var(--soft-cream)"
                  : "var(--primary-green)",
              }}
            >
              <GitCompare className="w-4 h-4" />
              {isInCompare ? "" : ""}
            </button>
          </div>

          {/* Metadata Accordion */}
          <div style={{ backgroundColor: "var(--card-bg)" }}>
            <MetadataAccordion park={park} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-3 lg:mr-[calc(30%+96px)]">
        <div className="space-y-6 block lg:hidden">
          {/* Actions for Mobile */}
          <div className="flex gap-2">
            <Link
              to="/map"
              className="flex-1 px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--primary-green)",
                color: "var(--soft-cream)",
                borderRadius: "6px",
              }}
            >
              <Map className="w-4 h-4" />
              Karte
            </Link>
            <button
              onClick={() => {
                const newStatus = toggleFavorite(parkData.id);
                setIsFavorited(newStatus);
              }}
              className="flex-1 h-10 w-10 max-w-10 font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: isFavorited
                  ? "var(--accent-gold)"
                  : "var(--card-bg)",
                color: isFavorited
                  ? "var(--deep-charcoal)"
                  : "var(--primary-green)",
                borderRadius: "6px",
              }}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorited ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={() => {
                const success = toggleComparison(parkData.id);
                if (success || !isInCompare) {
                  setIsInCompare(!isInCompare);
                }
              }}
              className="flex-1 h-10 w-10 max-w-10 font-mono text-xs flex items-center justify-center gap-2 border"
              style={{
                backgroundColor: isInCompare
                  ? "var(--deep-charcoal)"
                  : "var(--light-sage)",
                color: isInCompare
                  ? "var(--soft-cream)"
                  : "var(--deep-charcoal)",
                
              }}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full lg:mr-[30%]  py-3">
          {/* Left Column - Main Content */}
          <div className="space-y-4">
            {/* Description - Only show if description exists and is not just "Park" */}
            {parkData.description && parkData.description.trim() !== "Park" && (
              <div className="" style={{ backgroundColor: "var(--card-bg)" }}>
                <h2
                  className="font-mono text-xs opacity-70 mb-3 truncate"
                  style={{
                    color: "var(--deep-charcoal)",
                    letterSpacing: "0.02em",
                  }}
                >
                  BESCHREIBUNG
                </h2>
                <p
                  className="font-serif text-lg leading-relaxed"
                  style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}
                >
                  {parkData.description}
                </p>
                {parkData.descriptionLicense && (
                  <p
                    className="font-serif italic text-sm mt-3"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}
                  >
                    Text von {parkData.descriptionLicense}
                  </p>
                )}
              </div>
            )}

            {/* Amenities */}
            <div className="" style={{ backgroundColor: "var(--card-bg)" }}>
              <h2
                className="font-mono text-xs opacity-70 uppercase mb-3 truncate"
                style={{
                  color: "var(--deep-charcoal)",
                  letterSpacing: "0.02em",
                }}
              >
                Ausstattung & Infrastruktur
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(parkData.amenities || []).map(
                  (amenity: string, index: number) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    return (
                      <Link
                        to={`/index?amenities=${amenity}`}
                        key={index}
                        className=" flex items-center space-x-2 p-2 bg-[var(--light-sage)]"
                        style={{
                          border: isHighContrast
                            ? "1px solid var(--border-color)"
                            : "none",
                        }}
                      >
                        <div
                          className=" flex-shrink-0"
                          style={{ width: "20px" }}
                        >
                          <AmenityIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xs truncate">
                          {amenity}
                        </span>
                      </Link>
                    );
                  },
                )}
              </div>
            </div>

            {/* Interactive Map */}
            <div className="" style={{ backgroundColor: "var(--card-bg)" }}>
              <h2
                className="font-mono text-xs uppercase opacity-70 uppercase mb-3 truncate"
                style={{
                  color: "var(--deep-charcoal)",
                  letterSpacing: "0.02em",
                }}
              >
                Lage & Karte
              </h2>

              {/* Map Container with Loading and Error States */}
              <div
                style={{
                  height: "400px",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: "var(--light-sage)",
                }}
              >
                {/* Loading Skeleton */}
                {!mapLoaded && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-sage)" }}
                  >
                    <div className="text-center">
                      <div className="animate-pulse">
                        <div className="sr-only w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary-green border-t-transparent"></div>
                        <p
                          className="font-mono text-sm"
                          style={{ color: "var(--primary-green)" }}
                        >
                          Karte wird geladen...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {mapError && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-sage)" }}
                  >
                    <div className="text-center p-4">
                      <AlertTriangle
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: "var(--accent-gold)" }}
                      />
                      <p
                        className="font-serif text-lg mb-3"
                        style={{ color: "var(--deep-charcoal)" }}
                      >
                        {mapError}
                      </p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                        size="sm"
                      >
                        Seite neu laden
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actual Map */}
                <div
                  ref={mapContainerRef}
                  style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: mapLoaded && !mapError ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>

              <p
                className="font-mono text-xs mt-3 mb-8 flex items-center justify-start gap-2"
                style={{ color: "var(--deep-charcoal)" }}
              >
                <MapPin className="w-4 h-4" /> Koordinaten:{" "}
                {parkData.coordinates?.lat.toFixed(6)},{" "}
                {parkData.coordinates?.lng.toFixed(6)}
              </p>
            </div>

            {/* Park Info - Mobile Only */}
            <div
              className="block lg:hidden p-4"
              style={{ backgroundColor: "var(--light-sage)" }}
            >
              <ParkInfo park={park} userLocation={userLocation} />
            </div>

            {/* Metadata Accordion - Mobile Only */}
            <div
              className="block lg:hidden"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <MetadataAccordion park={park} />
            </div>

            {/* Nearby Parks Section */}
            {nearbyParks.length > 0 && (
              <div
                className=""
                style={{
                  backgroundColor: "var(--card-bg)",
                }}
              >
                <h2
                  className="font-mono text-xs opacity-70 uppercase mb-3 truncate"
                  style={{
                    color: "var(--deep-charcoal)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Parks in der nähe
                </h2>
                <div className="space-y-4">
                  {nearbyParks.map((nearbyPark) => (
                    <Link
                      key={nearbyPark.id}
                      to={`/index/${slugifyParkName(nearbyPark.name)}`}
                      className="block p-3 mb-2"
                      style={{
                        backgroundColor: "var(--light-sage)",
                        border: isHighContrast
                          ? "1px solid var(--border-color)"
                          : "none",
                      }}
                    >
                      <div className="flex flex-col">
                        <h3
                          className="font-serif text-xl sm:text-2xl mb-2"
                          style={{
                            color: "var(--deep-charcoal)",
                            fontWeight: "400",
                            fontStyle: "italic",
                          }}
                        >
                          {nearbyPark.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 mb-2">
                          <span
                            className="flex items-center gap-2 font-mono text-xs"
                            style={{ color: "var(--deep-charcoal)" }}
                          >
                            <Building className="w-4 h-4" />{" "}
                            {nearbyPark.district}. BEZIRK
                          </span>
                          <span
                            className="flex items-center gap-2 font-mono text-xs"
                            style={{ color: "var(--deep-charcoal)" }}
                          >
                            <Ruler className="w-4 h-4" />{" "}
                            {nearbyPark.area.toLocaleString()} M²
                          </span>
                          <span
                            className="flex items-center gap-2 font-mono text-xs"
                            style={{ color: "var(--deep-charcoal)" }}
                          >
                            <MapPin className="w-4 h-4" />{" "}
                            {nearbyPark.distance.toFixed(2)} km
                          </span>
                        </div>
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(nearbyPark.amenities || [])
                            .slice(0, 2)
                            .map((amenity: string, index: number) => {
                              const AmenityIcon = getAmenityIcon(amenity);
                              const isAmenityHighContrast = isHighContrast;
                              return (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs font-mono flex items-center gap-1"
                                  style={{
                                    backgroundColor: "var(--soft-cream)",
                                    color: "var(--deep-charcoal)",
                                    border: isAmenityHighContrast
                                      ? "1px solid var(--border-color)"
                                      : "none",
                                  }}
                                >
                                  <AmenityIcon className="w-3 h-3" />
                                  {amenity}
                                </span>
                              );
                            })}

                          {/* Show count of additional amenities if more than 2 */}
                          {(nearbyPark.amenities || []).length > 2 && (
                            <span
                              className="px-2 py-1 text-xs font-mono flex items-center"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                color: "var(--deep-charcoal)",
                                borderRadius: "4px",
                                border: isHighContrast
                                  ? "1px solid var(--border-color)"
                                  : "none",
                              }}
                            >
                              +{(nearbyPark.amenities || []).length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkDetailPage;
