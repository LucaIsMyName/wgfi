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
  TreePine,
  Heart,
} from "lucide-react";
import { getAmenityIcon } from "../utils/amenityIcons";
import { isFavorite, toggleFavorite } from "../utils/favoritesManager";
import ParkInfo from "../components/ParkInfo";
import MetadataAccordion from "../components/MetadataAccordion";
import mapboxgl from "mapbox-gl";
import STYLE from "../utils/config";
import { useTheme } from "../contexts/ThemeContext";
import { getAllDistrictsForPark, formatDistricts } from "../utils/parkUtils";
import type { Park, ParkWithDistance } from "../types/park";
import { calculateDistance } from "../utils/geoUtils";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
  const [nearbyParks, setNearbyParks] = useState<ParkWithDistance[]>([]);

  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker | null>(null);

  // Check if park is in favorites when it loads
  useEffect(() => {
    if (park?.id) {
      setIsFavorited(isFavorite(park.id));
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
        (error) => {
          // console.log("Error getting user location:", error);
        }
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
        (p: { id: string; name: string }) => p.id === idOrSlug
      );

      // If not found by ID, try to find by slug
      if (!foundPark) {
        foundPark = parks.find(
          (p: { id: string; name: string }) =>
            slugifyParkName(p.name) === idOrSlug
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
          getManualParkData(p.id) ||
          getManualParkData(slugifyParkName(p.name));
        // Merge amenities for nearby parks too
        const nearbyMergedAmenities = manualData?.amenities
          ? [
            ...new Set([
              ...(p.amenities || []),
              ...manualData.amenities,
            ]),
          ]
          : p.amenities;
        return {
          ...p,
          ...manualData,
          amenities: nearbyMergedAmenities,
          distance: calculateDistance(
            park.coordinates.lat,
            park.coordinates.lng,
            p.coordinates.lat,
            p.coordinates.lng
          ),
        };
      })
      .sort((a: ParkWithDistance, b: ParkWithDistance) => a.distance - b.distance)
      .slice(0, 5); // Get 5 nearest parks

    setNearbyParks(parksWithDistance);
  }, [park, parks]);

  // Initialize map when park data is loaded
  useEffect(() => {
    if (!park || !park.coordinates || !mapContainer.current) return;

    // Clean up previous map instance if it exists
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Clean up previous marker if it exists
    if (mapMarker.current) {
      mapMarker.current.remove();
      mapMarker.current = null;
    }

    try {
      // Create map with theme-aware style
      const isDark = effectiveTheme === "dark";
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: STYLE.getMapStyle(isDark),
        center: [park.coordinates.lng, park.coordinates.lat],
        zoom: 15.5,
        pitch: 60, // Tilt map for 3D view
        bearing: 0,
        antialias: true, // Smooth 3D rendering
        attributionControl: false,
      });

      // Add 3D terrain when map loads
      map.on("load", () => {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }));

      // Create marker wrapper and inner element to fix hover positioning issues
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

      // Add inner element to wrapper
      wrapper.appendChild(el);

      // Create popup with Art Nouveau styling
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style=" padding: 12px; border-radius: 8px; text-align:center">
            <h3 style="font-family: ' Instrument Serif', serif; font-style:italic; font-weight: 600; margin: 0 0 8px 0; color: var(--primary-green); font-size: 24px;">${park.name
          }</h3>
            <p style="font-family: 'Geist Mono', monospace; margin: 0; font-size: 14px; color: var(--deep-charcoal);">${park.address || "Adresse nicht verfügbar"
          }</p>
          </div>
        `);

      // Add marker using the wrapper
      const marker = new mapboxgl.Marker(wrapper)
        .setLngLat([park.coordinates.lng, park.coordinates.lat])
        .setPopup(popup)
        .addTo(map);

      // Add hover effect to inner element only
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.1)";
        el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      });

      // Store references
      mapInstance.current = map;
      mapMarker.current = marker;
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup function
    return () => {
      if (mapMarker.current) {
        mapMarker.current.remove();
        mapMarker.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [park]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapInstance.current || !park) return;

    const isDark = effectiveTheme === "dark";
    const newStyle = STYLE.getMapStyle(isDark);

    // Check if style is loaded before updating
    if (mapInstance.current.isStyleLoaded()) {
      try {
        const currentStyle = mapInstance.current.getStyle();
        // Only update if style URL is different
        if (currentStyle && !currentStyle.sprite?.includes(newStyle)) {
          mapInstance.current.setStyle(newStyle);

          // Re-add marker after style loads
          mapInstance.current.once("style.load", () => {
            if (mapMarker.current && mapInstance.current) {
              // Remove old marker
              mapMarker.current.remove();

              // Create new marker
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

              const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              }).setHTML(`
                <div style="font-family: ' Instrument Serif', serif; padding: 12px; border-radius: 8px;">
                  <h3 style="font-weight: 600; margin: 0 0 8px 0; color: var(--primary-green); font-size: 16px;">${park.name
                }</h3>
                  <p style="margin: 0; font-size: 14px; color: var(--deep-charcoal);">${park.address || "Adresse nicht verfügbar"
                }</p>
                </div>
              `);

              const marker = new mapboxgl.Marker(wrapper)
                .setLngLat([park.coordinates.lng, park.coordinates.lat])
                .setPopup(popup)
                .addTo(mapInstance.current);

              el.addEventListener("mouseenter", () => {
                el.style.transform = "scale(1.1)";
                el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
              });
              el.addEventListener("mouseleave", () => {
                el.style.transform = "scale(1)";
                el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
              });

              mapMarker.current = marker;
            }
          });
        }
      } catch (error) {
        console.error("Error updating map style:", error);
      }
    }
  }, [effectiveTheme, park]);

  // Only show error after parks are loaded to prevent flash
  if (parks.length > 0 && (error || !park)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}
      >
        <div className="p-6" style={{ backgroundColor: "var(--card-bg)" }}>
          <AlertTriangle
            className="w-16 h-16 mb-5"
            stroke="var(--accent-gold)"
          />
          <p
            className="font-serif italic text-lg"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}
          >
            {error || "Park nicht gefunden"}
          </p>
          <button
            onClick={() => {
              history.back();
            }}
            className="px-4 py-2 mt-4 inline-block font-mono"
            style={{
              backgroundColor: "var(--primary-green)",
              color: "var(--soft-cream)",
              borderRadius: "6px",
            }}
          >
            Zurück zur Übersicht
          </button>
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
  const districtsDisplay = formatDistricts(allDistricts, 'full').toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--main-bg)" }}>
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
        <button
          onClick={() => {
            history.back();
          }}
          className="mb-3 inline-flex items-center font-mono text-sm hover:opacity-90"
          style={{}}
        >
          <ChevronLeft className="w-4 h-4 color-[var(--deep-charcoal)] inline mr-1" />{" "}
          <span style={{ color: "var(--primary-green)" }}>
            Zurück zur Übersicht
          </span>
        </button>
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
              className="flex-1 px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
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
              {isFavorited ? "Favorit" : "Favorit"}
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
              className="flex-1 px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
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
              {isFavorited ? "Favorit" : "Favorit"}
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
                  }
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
              <div
                ref={mapContainer}
                style={{
                  height: "400px",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              />
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
