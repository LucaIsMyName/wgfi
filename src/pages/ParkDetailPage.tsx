import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getViennaParksForApp } from "../services/viennaApi";
import { getManualParkData, slugifyParkName } from "../data/manualParksData";
import { MapPin, Building, Ruler, AlertTriangle, ChevronLeft, TreePine, Clock, Train, Accessibility, Navigation, Heart, ExternalLink, BookOpen, FileText, Calendar } from "lucide-react";
import { getAmenityIcon } from "../utils/amenityIcons";
import { isFavorite, toggleFavorite } from "../utils/favoritesManager";
import mapboxgl from "mapbox-gl";
import STYLE from "../utils/config";
import Loading from "../components/Loading";

// Function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ParkDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [park, setPark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [nearbyParks, setNearbyParks] = useState<any[]>([]);

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
          console.log("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchPark = async () => {
      try {
        setLoading(true);
        const parks = await getViennaParksForApp();

        // Try to find park by ID first
        let foundPark = parks.find((p: { id: string; name: string }) => p.id === idOrSlug);

        // If not found by ID, try to find by slug
        if (!foundPark) {
          foundPark = parks.find((p: { id: string; name: string }) => slugifyParkName(p.name) === idOrSlug);
        }

        if (foundPark) {
          // Merge with manual data if available
          const manualData = getManualParkData(foundPark.id);
          const currentPark = {
            ...foundPark,
            ...manualData,
          };
          setPark(currentPark);
          setError(null);

          // Find nearby parks
          if (currentPark.coordinates) {
            const parksWithDistance = parks
              .filter((p: any) => p.id !== currentPark.id) // Exclude current park
              .map((p: any) => ({
                ...p,
                ...getManualParkData(p.id),
                distance: calculateDistance(currentPark.coordinates.lat, currentPark.coordinates.lng, p.coordinates.lat, p.coordinates.lng),
              }))
              .sort((a: any, b: any) => a.distance - b.distance)
              .slice(0, 5); // Get 5 nearest parks

            setNearbyParks(parksWithDistance);
          }
        } else {
          setError("Park nicht gefunden");
        }
      } catch (err) {
        setError("Fehler beim Laden des Parks");
        console.error("Error fetching park:", err);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchPark();
    }
  }, [idOrSlug]);

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
      // Create map
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: STYLE.mapboxStyle,
        center: [park.coordinates.lng, park.coordinates.lat],
        zoom: 15.5,
        pitch: 71, // Tilt map for 3D view
        bearing: 0,
        antialias: true, // Smooth 3D rendering
        attributionControl: false,
      });

      // Add 3D terrain when map loads
      map.on('load', () => {
        map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
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
      el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

      // Add inner element to wrapper
      wrapper.appendChild(el);

      // Create popup with Art Nouveau styling
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="font-family: 'EB Garamond', serif; padding: 12px; border-radius: 8px;">
            <h3 style="font-weight: 600; margin: 0 0 8px 0; color: var(--primary-green); font-size: 16px;">${park.name}</h3>
            <p style="margin: 0; font-size: 14px; color: var(--deep-charcoal);">${park.address || "Adresse nicht verfügbar"}</p>
          </div>
        `);

      // Add marker using the wrapper
      const marker = new mapboxgl.Marker(wrapper).setLngLat([park.coordinates.lng, park.coordinates.lat]).setPopup(popup).addTo(map);

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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}>
        <div
          className="p-6 flex items-center justify-center"
          style={{ backgroundColor: "transparent" }}>
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}>
        <div
          className="p-6"
          style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
          <AlertTriangle
            className="w-16 h-16 mb-5"
            stroke="var(--accent-gold)"
          />
          <p
            className="font-serif italic text-lg"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
            {error || "Park nicht gefunden"}
          </p>
          <Link
            to="/parks"
            className="px-4 py-2 mt-4 inline-block font-serif"
            style={{
              backgroundColor: "var(--primary-green)",
              color: "var(--soft-cream)",
              borderRadius: "6px",
            }}>
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  if (park) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--main-bg)" }}>
        <Helmet>
          <title>{`${park.name} | Wiener Grünflächen Index`}</title>
          <meta
            name="description"
            content={`${park.name} im ${park.district}. Bezirk mit detaillierten Informationen zu Lage, Ausstattung und Größe.`}
          />
          <meta
            name="keywords"
            content={`${park.name}, ${park.district}, Wien, Park, Grünfläche, Grünflächen, Grünflächen Index, Wiener Grünflächen Index, Wiener Parks, Wiener Grünflächen`}
          />
        </Helmet>

        {/* Header with park name */}
        <div className="px-4 py-6 lg:mr-[calc(30%+64px)]">
          <Link
            to="/parks"
            className="mb-3 inline-flex items-center font-serif hover:underline"
            style={{ color: "var(--primary-green)" }}>
            <ChevronLeft className="w-4 h-4 inline mr-1" /> Zurück zur Übersicht
          </Link>
          <h1
            className={`${STYLE.pageTitle} mb-4`}
            style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
            {park.name}
          </h1>
          <div className="flex items-center space-x-4 text-body">
            <span
              className="flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--primary-green)" }}>
              <Building className="w-4 h-4" /> {park.district}. BEZIRK
            </span>
            <span
              className="flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--deep-charcoal)" }}>
              <Ruler className="w-4 h-4" /> {park.area.toLocaleString()} M²
            </span>
          </div>
        </div>

        {/* Fixed Right Sidebar - Desktop */}
        <div
          className="hidden lg:block fixed right-0 top-0 w-[30%] h-screen overflow-y-auto pb-8 pt-4 pr-4 z-10"
          style={{ backgroundColor: "var(--card-bg)", scrollbarWidth: "thin", scrollbarColor: "var(--light-sage) transparent" }}>
          <div
            className="space-y-4 pl-4 mt-4"
            style={{ borderColor: "var(--primary-green)" }}>
            {/* Basic Info */}
            <div
              className="py-4"
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h3
                className="font-serif italic text-2xl mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                Informationen
              </h3>
              <div className="space-y-6">
                {/* Address Section */}
                <div>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    ADRESSE:
                  </span>
                  <p
                    className="font-serif italic mt-1 flex items-center gap-2"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    <MapPin className="w-5 h-5 flex-shrink-0" /> {park.address || "Adresse nicht verfügbar"}
                  </p>
                  <p
                    className="font-serif italic mt-1 flex items-center gap-2"
                    style={{ color: "var(--deep-charcoal)" }}>
                    <Building className="w-5 h-5 flex-shrink-0" /> {park.district}. Bezirk
                  </p>
                </div>

                {/* Opening Hours Section */}
                {park.openingHours && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ÖFFNUNGSZEITEN:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Clock className="w-5 h-5 flex-shrink-0" /> {park.openingHours}
                    </p>
                  </div>
                )}

                {/* Accessibility Section */}
                {park.accessibility && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      BARRIEREFREIHEIT:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Accessibility className="w-5 h-5 flex-shrink-0" /> {park.accessibility}
                    </p>
                  </div>
                )}

                {/* Public Transport Section */}
                {park.publicTransport && park.publicTransport.length > 0 && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ÖFFENTLICHE VERKEHRSMITTEL:
                    </span>
                    <div className="space-y-3 mt-1">
                      {park.publicTransport.map((transport: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3">
                          <Train
                            className="w-5 h-5 mt-1 flex-shrink-0"
                            stroke="var(--deep-charcoal)"
                          />
                          <span
                            className="font-serif italic"
                            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                            {transport}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Google Maps Directions Link */}
                    <div
                      className="mt-4 pt-4 border-t border-opacity-20"
                      style={{ borderColor: "var(--border-color)" }}>
                      <a
                        href={`https://www.google.com/maps/dir/${userLocation ? `${userLocation.lat},${userLocation.lng}` : ""}/${park.coordinates.lat},${park.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-mono text-xs hover:underline"
                        style={{ color: "var(--deep-charcoal)" }}>
                        <Navigation className="w-5 h-5 flex-shrink-0" />
                        {userLocation ? "Route von meinem Standort" : "Route planen"}
                      </a>
                    </div>
                  </div>
                )}

                {/* Tips Section */}
                {park.tips && park.tips.length > 0 && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      INSIDER-TIPPS:
                    </span>
                    <div className="space-y-2 mt-1">
                      {park.tips.map((tip: string, index: number) => (
                        <p
                          key={index}
                          className="font-serif italic"
                          style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links Section - Only shown if links are available */}
            {park.links && park.links.length > 0 && (
              <div
                className="py-4"
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                <h3
                  className="font-serif italic text-2xl mb-3 truncate"
                  style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                  Links
                </h3>
                <div className="space-y-2">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    EXTERNE LINKS:
                  </span>
                  <div className="mt-2 space-y-2">
                    {park.links.map((link: { title: string; url: string; type?: "official" | "wiki" | "info" | "event" }, index: number) => {
                      // Choose icon based on link type
                      let icon = <ExternalLink className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "wiki") icon = <BookOpen className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "official") icon = <FileText className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "event") icon = <Calendar className="w-4 h-4 flex-shrink-0" />;

                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-serif hover:underline py-1"
                          style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                          {icon}
                          {link.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to={`/map/${slugifyParkName(park.name)}`}
                className="w-full px-4 py-3 text-center font-mono text-xs block"
                style={{
                  backgroundColor: "var(--primary-green)",
                  color: "var(--soft-cream)",
                  borderRadius: "6px",
                }}>
                Auf Karte anzeigen
              </Link>
              <button
                onClick={() => {
                  const newStatus = toggleFavorite(park.id);
                  setIsFavorited(newStatus);
                }}
                className="w-full px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isFavorited ? "var(--accent-gold)" : "var(--card-bg)",
                  color: isFavorited ? "var(--soft-cream)" : "var(--primary-green)",
                  borderRadius: "6px",
                }}>
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-4 py-3 lg:mr-[calc(30%+64px)]">
          <div className="space-y-6 block lg:hidden">
            {/* Basic Info */}
            <div
              className="py-4 "
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h3
                className="font-serif italic text-2xl mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                Informationen
              </h3>
              <div className="space-y-6">
                {/* Address Section */}
                <div>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    ADRESSE:
                  </span>
                  <p
                    className="font-serif italic mt-1 flex items-center gap-2"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    <MapPin className="w-5 h-5 flex-shrink-0" /> {park.address || "Adresse nicht verfügbar"}
                  </p>
                  <p
                    className="font-serif italic mt-1 flex items-center gap-2"
                    style={{ color: "var(--deep-charcoal)" }}>
                    <Building className="w-5 h-5 flex-shrink-0" /> {park.district}. Bezirk
                  </p>
                </div>

                {/* Opening Hours Section */}
                {park.openingHours && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ÖFFNUNGSZEITEN:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Clock className="w-5 h-5 flex-shrink-0" /> {park.openingHours}
                    </p>
                  </div>
                )}

                {/* Accessibility Section */}
                {park.accessibility && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      BARRIEREFREIHEIT:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Accessibility className="w-5 h-5 flex-shrink-0" /> {park.accessibility}
                    </p>
                  </div>
                )}

                {/* Public Transport Section */}
                {park.publicTransport && park.publicTransport.length > 0 && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ÖFFENTLICHE VERKEHRSMITTEL:
                    </span>
                    <div className="space-y-3 mt-1">
                      {park.publicTransport.map((transport: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3">
                          <Train
                            className="w-5 h-5 mt-1 flex-shrink-0"
                            stroke="var(--deep-charcoal)"
                          />
                          <span
                            className="font-serif italic"
                            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                            {transport}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Google Maps Directions Link */}
                    <div
                      className="mt-4 pt-4 border-t border-opacity-20"
                      style={{ borderColor: "var(--border-color)" }}>
                      <a
                        href={`https://www.google.com/maps/dir/${userLocation ? `${userLocation.lat},${userLocation.lng}` : ""}/${encodeURIComponent(`${park.coordinates.lat},${park.coordinates.lng} (${park.name}, ${park.district}. Bezirk, Wien)`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-mono text-xs hover:underline"
                        style={{ color: "var(--deep-charcoal)" }}>
                        <Navigation className="w-5 h-5 flex-shrink-0" />
                        {userLocation ? "Route von meinem Standort" : "Route planen"}
                      </a>
                    </div>
                  </div>
                )}

                {/* Tips Section */}
                {park.tips && park.tips.length > 0 && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      INSIDER-TIPPS:
                    </span>
                    <div className="space-y-2 mt-1">
                      {park.tips.map((tip: string, index: number) => (
                        <p
                          key={index}
                          className="font-serif italic"
                          style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links Section - Only shown if links are available */}
            {park.links && park.links.length > 0 && (
              <div
                className="py-4"
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                <h3
                  className="font-serif italic text-2xl mb-3 truncate"
                  style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                  Links
                </h3>
                <div className="space-y-2">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    EXTERNE LINKS:
                  </span>
                  <div className="mt-2 space-y-2">
                    {park.links.map((link: { title: string; url: string; type?: "official" | "wiki" | "info" | "event" }, index: number) => {
                      // Choose icon based on link type
                      let icon = <ExternalLink className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "wiki") icon = <BookOpen className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "official") icon = <FileText className="w-4 h-4 flex-shrink-0" />;
                      if (link.type === "event") icon = <Calendar className="w-4 h-4 flex-shrink-0" />;

                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-serif hover:underline py-1"
                          style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                          {icon}
                          {link.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Actions for Mobile */}
            <div className="space-y-2">
              <Link
                to="/map"
                className="w-full px-4 py-3 text-center font-mono text-xs block"
                style={{
                  backgroundColor: "var(--primary-green)",
                  color: "var(--soft-cream)",
                  borderRadius: "6px",
                }}>
                Auf Karte anzeigen
              </Link>
              <button
                onClick={() => {
                  const newStatus = toggleFavorite(park.id);
                  setIsFavorited(newStatus);
                }}
                className="w-full px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isFavorited ? "var(--accent-gold)" : "var(--card-bg)",
                  color: isFavorited ? "var(--deep-charcoal)" : "var(--primary-green)",
                  borderRadius: "6px",
                }}>
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:mr-[30%]  py-3">
            {/* Left Column - Main Content */}
            <div className="space-y-4">
              {/* Description - Only show if description exists and is not just "Park" */}
              {park.description && park.description.trim() !== "Park" && (
                <div
                  className=""
                  style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                  <h2
                    className="font-mono text-lg mb-3 truncate"
                    style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                    BESCHREIBUNG
                  </h2>
                  <p
                    className="font-serif italic text-lg leading-relaxed"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    {park.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              <div
                className=""
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                <h2
                  className="font-mono text-lg mb-3 truncate"
                  style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                  AUSSTATTUNG & EINRICHTUNGEN
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(park.amenities || []).map((amenity: string, index: number) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-2"
                        style={{ backgroundColor: "var(--light-sage)", borderRadius: "8px" }}>
                        <div
                          className="flex-shrink-0"
                          style={{ width: "20px" }}>
                          <AmenityIcon
                            className="w-5 h-5"
                            style={{ color: "var(--primary-green)" }}
                          />
                        </div>
                        <span
                          className="font-mono text-xs"
                          style={{ color: "var(--deep-charcoal)" }}>
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Map */}
              <div
                className=""
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                <h2
                  className="font-mono text-lg mb-3 truncate"
                  style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                  LAGE & KARTE
                </h2>
                <div
                  ref={mapContainer}
                  style={{
                    height: "400px",
                    width: "100%",
                    borderRadius: "8px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                />
                <p
                  className="font-mono text-xs mt-3 mb-8 flex items-center justify-start gap-2"
                  style={{ color: "var(--primary-green)" }}>
                  <MapPin className="w-4 h-4" /> KOORDINATEN: {park.coordinates?.lat.toFixed(6)}, {park.coordinates?.lng.toFixed(6)}
                </p>
              </div>

              {/* Nearby Parks Section */}
              {nearbyParks.length > 0 && (
                <div
                  className=""
                  style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
                  <h2
                    className="font-mono text-lg mb-4 truncate"
                    style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                    ANDERE PARKS IN DER NÄHE
                  </h2>
                  <div className="space-y-4">
                    {nearbyParks.map((nearbyPark) => (
                      <Link
                        key={nearbyPark.id}
                        to={`/park/${slugifyParkName(nearbyPark.name)}`}
                        className="block p-3 mb-2"
                        style={{
                          backgroundColor: "var(--light-sage)",
                          borderRadius: "8px",
                          borderBottom: "1px solid var(--light-sage)",
                        }}>
                        <div className="flex flex-col">
                          <h3
                            className="font-serif text-xl mb-2"
                            style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
                            {nearbyPark.name}
                          </h3>
                          <div className="flex flex-wrap gap-4 mb-2">
                            <span
                              className="flex items-center gap-2 font-mono text-xs"
                              style={{ color: "var(--primary-green)" }}>
                              <Building className="w-4 h-4" /> {nearbyPark.district}. BEZIRK
                            </span>
                            <span
                              className="flex items-center gap-2 font-mono text-xs"
                              style={{ color: "var(--deep-charcoal)" }}>
                              <Ruler className="w-4 h-4" /> {nearbyPark.area.toLocaleString()} M²
                            </span>
                            <span
                              className="flex items-center gap-2 font-mono text-xs"
                              style={{ color: "var(--accent-gold)" }}>
                              <MapPin className="w-4 h-4" /> {nearbyPark.distance.toFixed(2)} km
                            </span>
                          </div>
                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(nearbyPark.amenities || []).slice(0, 2).map((amenity: string, index: number) => {
                              const AmenityIcon = getAmenityIcon(amenity);
                              return (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs font-mono flex items-center gap-1"
                                  style={{
                                    backgroundColor: "var(--card-bg)",
                                    color: "var(--deep-charcoal)",
                                    borderRadius: "4px",
                                  }}>
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
                                }}>
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
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--main-bg)" }}>
      {/* Header */}
      <div className="px-6 py-6">
        <div className="w-full">
          <Link
            to="/parks"
            className="px-4 py-2 mb-3 inline-block font-serif hover:underline"
            style={{ color: "var(--primary-green)" }}>
            &larr; Zurück zur Übersicht
          </Link>
          <h1
            className={`${STYLE.pageTitle} mb-4`}
            style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
            {park.name}
          </h1>
          <div className="flex items-center space-x-4 text-body">
            <span
              className="flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--primary-green)" }}>
              <Building className="w-4 h-4" /> {park.district}. BEZIRK
            </span>
            <span
              className="flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--deep-charcoal)" }}>
              <Ruler className="w-4 h-4" /> {park.area.toLocaleString()} M²
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div
              className=""
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h2
                className="font-mono text-lg mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                BESCHREIBUNG
              </h2>
              <p
                className="font-serif italic text-lg leading-relaxed"
                style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                {park.description || "Keine Beschreibung verfügbar"}
              </p>
            </div>

            {/* Amenities */}
            <div
              className=""
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h2
                className="font-mono text-lg mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                AUSSTATTUNG & EINRICHTUNGEN
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(park.amenities || []).map((amenity: string, index: number) => {
                  const AmenityIcon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-2"
                      style={{ backgroundColor: "var(--light-sage)", borderRadius: "8px" }}>
                      <div
                        className="flex-shrink-0"
                        style={{ width: "20px" }}>
                        <AmenityIcon
                          className="w-5 h-5"
                          style={{ color: "var(--primary-green)" }}
                        />
                      </div>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "var(--deep-charcoal)" }}>
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map */}
            <div
              className=""
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h2
                className="font-mono text-lg mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                LAGE & KARTE
              </h2>
              <div
                ref={mapContainer}
                style={{
                  height: "400px",
                  width: "100%",
                  borderRadius: "8px",
                  position: "relative",
                  overflow: "hidden",
                }}
              />
              <p
                className="font-mono text-xs mt-3 flex items-center justify-center gap-2"
                style={{ color: "var(--primary-green)" }}>
                <MapPin className="w-4 h-4" /> KOORDINATEN: {park.coordinates?.lat.toFixed(6)}, {park.coordinates?.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div
              className="p-4"
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h3
                className="font-mono text-lg mb-3 truncate"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                PARK-INFORMATIONEN
              </h3>
              <div className="space-y-4">
                <div>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    ADRESSE:
                  </span>
                  <p
                    className="font-serif italic mt-1 flex items-center gap-2"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    <MapPin className="w-5 h-5 flex-shrink-0" /> {park.address || "Adresse nicht verfügbar"}
                  </p>
                  <p
                    className="font-mono text-xs mt-1 flex items-center gap-2"
                    style={{ color: "var(--primary-green)" }}>
                    <Building className="w-5 h-5 flex-shrink-0" /> {park.district}. Bezirk
                  </p>
                </div>

                {park.openingHours && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ÖFFNUNGSZEITEN:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Clock className="w-5 h-5 flex-shrink-0" /> {park.openingHours}
                    </p>
                  </div>
                )}

                {park.accessibility && (
                  <div>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      BARRIEREFREIHEIT:
                    </span>
                    <p
                      className="font-serif italic mt-1 flex items-center gap-2"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      <Accessibility className="w-5 h-5 flex-shrink-0" /> {park.accessibility}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Public Transport */}
            <div
              className=""
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <h3
                className="font-mono text-lg mb-3 truncate"
                style={{ color: "var(--deep-charcoal)", letterSpacing: "0.02em" }}>
                VERKEHRSMITTEL
              </h3>
              <div className="space-y-3">
                {(park.publicTransport || []).map((transport: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3">
                    <Train
                      className="w-5 h-5 mt-1 flex-shrink-0"
                      stroke="var(--deep-charcoal)"
                    />
                    <span
                      className="font-serif italic"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      {transport}
                    </span>
                  </div>
                ))}

                {/* Google Maps Directions Link */}
                <div
                  className="mt-4 pt-4 border-t border-opacity-20"
                  style={{ borderColor: "var(--border-color)" }}>
                  <a
                    href={`https://www.google.com/maps/dir/${userLocation ? `${userLocation.lat},${userLocation.lng}` : ""}/${`${park.coordinates.lat},${park.coordinates.lng}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs hover:underline"
                    style={{ color: "var(--deep-charcoal)" }}>
                    <Navigation className="w-5 h-5 flex-shrink-0" />
                    {userLocation ? "Route von meinem Standort" : "Route planen"}
                  </a>
                </div>
              </div>
            </div>

            {/* Tips Section - Only shown if tips are available */}
            {park.tips && park.tips.length > 0 && (
              <div style={{ borderRadius: "8px" }}>
                <h3
                  className="font-mono text-sm mb-2"
                  style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                  TIPPS
                </h3>
                <div className="space-y-2">
                  {park.tips.map((tip: string, index: number) => (
                    <p
                      key={index}
                      className="font-serif italic"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to="/map"
                className="w-full px-4 py-3 text-center font-mono text-xs block"
                style={{
                  backgroundColor: "var(--primary-green)",
                  color: "var(--soft-cream)",
                  borderRadius: "6px",
                }}>
                Auf Karte anzeigen
              </Link>
              <button
                onClick={() => {
                  const newStatus = toggleFavorite(park.id);
                  setIsFavorited(newStatus);
                }}
                className="w-full px-4 py-3 font-mono text-xs flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isFavorited ? "var(--accent-gold)" : "var(--card-bg)",
                  color: isFavorited ? "var(--deep-charcoal)" : "var(--primary-green)",
                  borderRadius: "6px",
                }}>
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkDetailPage;
