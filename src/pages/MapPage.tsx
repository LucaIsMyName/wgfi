import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { getViennaParksForApp } from "../services/viennaApi";
import { MapPin, Filter, Navigation, Map as MapIcon } from "lucide-react";
import mapboxgl from "mapbox-gl";
import { slugifyParkName } from "../data/manualParksData";

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Park {
  id: string;
  name: string;
  district: number;
  address: string;
  area: number;
  coordinates: { lat: number; lng: number };
  amenities: string[];
}

const MapPage = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [filteredParks, setFilteredParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRefs = useRef<{[key: string]: mapboxgl.Popup}>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Router hooks
  const { parkId } = useParams<{ parkId?: string }>();
  const navigate = useNavigate();

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [16.3738, 48.2082], // Vienna center
      zoom: 12,
    });

    map.on("load", () => {
      setMapLoaded(true);
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Handle resize events to ensure map fills available space
    const handleResize = () => {
      map.resize();
    };

    window.addEventListener('resize', handleResize);
    
    // Initial resize to ensure correct sizing with sidebar
    setTimeout(() => {
      map.resize();
    }, 200);

    mapInstance.current = map;

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
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
          
          // Try to get the popup from refs first
          let popup = popupRefs.current[park.id];
          
          if (popup) {
            // If we have the popup, add it to the map
            popup.addTo(mapInstance.current!);
          } else {
            // If popup doesn't exist in refs yet, find the marker and trigger click
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
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [parkId, mapLoaded, parks, findParkByIdOrSlug, navigate]);

  // Add markers when parks or filters change
  useEffect(() => {
    if (!mapLoaded || loading || !mapInstance.current) return;

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add markers for filtered parks
      const markers = filteredParks.map((park) => {
        // Create marker wrapper to prevent positioning issues
        const wrapper = document.createElement("div");
        wrapper.className = "marker-wrapper";

        // Create marker element
        const el = document.createElement("div");
        el.className = "park-marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "var(--primary-green)";
        el.style.border = "2px solid var(--soft-cream)";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";

        // Add marker element to wrapper
        wrapper.appendChild(el);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true })
          .setHTML(`
            <div style="font-family: 'Geist Mono', serif; padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-weight: 400; color: var(--primary-green); font-size: 20px;">${park.name}</h3>
              <p style="margin: 0; font-size: 12px; font-family: 'Geist Mono', monospace;">${park.district}. BEZIRK</p>
              <a href="/park/${slugifyParkName(park.name)}" style="color: var(--primary-green); text-decoration: none; font-size: 12px; font-family: 'Geist Mono', monospace; margin-top: 5px; display: block;">DETAILS</a>
            </div>
          `);
          
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

        // Add hover effect to inner element only
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.2)";
        });

        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });

        return marker;
      });

      // Store markers for later removal
      markersRef.current = markers;

      // Fit map to markers if we have any
      if (markers.length > 0 && mapInstance.current) {
        const bounds = new mapboxgl.LngLatBounds();

        filteredParks.forEach((park) => {
          bounds.extend([park.coordinates.lng, park.coordinates.lat]);
        });
        if (mapInstance.current) {
          mapInstance.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      }
    } catch (error) {
      console.error("Error adding markers:", error);
    }
  }, [filteredParks, loading, mapLoaded]);

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
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        />

        {/* Title Overlay - Top Left - Desktop Only */}
        <div
          className="absolute top-4 left-4 z-10 max-w-md p-3 hidden lg:block"
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
        <div className="absolute top-4 right-4 z-10 hidden lg:block">
          <div className="bg-white shadow-lg p-3 rounded-lg">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => filterParksByDistrict(null)}
                className="px-4 py-2 font-mono text-xs flex items-center justify-center gap-2 w-full"
                style={{
                  backgroundColor: selectedDistrict === null ? "var(--primary-green)" : "var(--light-sage)",
                  color: selectedDistrict === null ? "var(--soft-cream)" : "var(--primary-green)",
                  borderRadius: "4px",
                }}>
                <MapIcon className="w-3 h-3" /> ALLE PARKS
              </button>

              <div className="relative w-full">
                <button
                  onClick={() => setShowDistrictSelector(!showDistrictSelector)}
                  className="w-full px-4 py-2 font-mono text-xs flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: selectedDistrict !== null ? "var(--accent-gold)" : "var(--light-sage)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                  }}>
                  <Filter className="w-3 h-3" /> {selectedDistrict ? `${selectedDistrict}. BEZIRK` : "BEZIRK WÄHLEN"}
                </button>

                {/* District Selector Dropdown */}
                {showDistrictSelector && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden max-h-60 overflow-y-auto">
                    <div className="p-1">
                      {districts.map((district) => (
                        <button
                          key={district}
                          onClick={() => {
                            filterParksByDistrict(district);
                            setShowDistrictSelector(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-opacity-80 transition-colors duration-200 font-mono text-xs"
                          style={{
                            backgroundColor: selectedDistrict === district ? "var(--primary-green)" : "transparent",
                            color: selectedDistrict === district ? "var(--soft-cream)" : "var(--deep-charcoal)",
                          }}>
                          {district}. BEZIRK
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={getUserLocation}
                className="px-4 py-2 font-mono text-xs flex items-center justify-center gap-2 w-full"
                style={{
                  backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
                  color: "var(--deep-charcoal)",
                  borderRadius: "4px",
                }}>
                <Navigation className="w-3 h-3" /> MEIN STANDORT
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Controls - Sticky */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 p-3 bg-white shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3
              className="font-mono text-xs"
              style={{ color: "var(--primary-green)" }}>
              {filteredParks.length} PARKS {selectedDistrict && <span>IM {selectedDistrict}. BEZIRK</span>}
            </h3>
            <button
              onClick={getUserLocation}
              className="px-3 py-1 font-mono text-xs flex items-center justify-center gap-1"
              style={{
                backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
                color: "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              <Navigation className="w-3 h-3" /> STANDORT
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => filterParksByDistrict(null)}
              className="px-3 py-2 font-mono text-xs flex items-center justify-center gap-1"
              style={{
                backgroundColor: selectedDistrict === null ? "var(--primary-green)" : "var(--light-sage)",
                color: selectedDistrict === null ? "var(--soft-cream)" : "var(--primary-green)",
                borderRadius: "4px",
              }}>
              <MapIcon className="w-3 h-3" /> ALLE PARKS
            </button>

            <button
              onClick={() => setShowDistrictSelector(!showDistrictSelector)}
              className="px-3 py-2 font-mono text-xs flex items-center justify-center gap-1"
              style={{
                backgroundColor: selectedDistrict !== null ? "var(--accent-gold)" : "var(--light-sage)",
                color: "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              <Filter className="w-3 h-3" /> {selectedDistrict ? `${selectedDistrict}. BEZIRK` : "BEZIRK"}
            </button>

            {/* Mobile District Selector */}
            {showDistrictSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end">
                <div className="bg-white w-full rounded-t-lg p-4 max-h-[70vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="font-mono text-sm"
                      style={{ color: "var(--primary-green)" }}>
                      BEZIRK WÄHLEN
                    </h3>
                    <button
                      onClick={() => setShowDistrictSelector(false)}
                      className="p-1">
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {districts.map((district) => (
                      <button
                        key={district}
                        onClick={() => {
                          filterParksByDistrict(district);
                          setShowDistrictSelector(false);
                        }}
                        className="text-left px-3 py-2 font-mono text-xs"
                        style={{
                          backgroundColor: selectedDistrict === district ? "var(--primary-green)" : "var(--light-sage)",
                          color: selectedDistrict === district ? "var(--soft-cream)" : "var(--deep-charcoal)",
                          borderRadius: "4px",
                        }}>
                        {district}. BEZIRK
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
