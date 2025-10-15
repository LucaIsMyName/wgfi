import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useVirtualizer } from '@tanstack/react-virtual';
import { getViennaParksForApp } from "../services/viennaApi";
import { slugifyParkName } from "../data/manualParksData";
import { Building, Ruler, AlertTriangle, TreePine, ArrowDownUp, Check, Filter, Heart } from 'lucide-react';
import { getAmenityIcon } from '../utils/amenityIcons';
import { isFavorite, toggleFavorite } from '../utils/favoritesManager';
import STYLE from '../utils/config';
import Loading from '../components/Loading';
import { useTheme } from '../contexts/ThemeContext';

interface Park {
  id: string;
  name: string;
  district: number;
  address: string;
  area: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  isFavorite?: boolean;
}

// Local storage keys
const STORAGE_KEY_SEARCH = "wbi-search-term";
const STORAGE_KEY_DISTRICT = "wbi-selected-district";
const STORAGE_KEY_SORT = "wbi-sort-order";
const STORAGE_KEY_AMENITIES = "wbi-selected-amenities";
const STORAGE_KEY_LOCATION_PERMISSION = "wbi-location-permission";

const ParksListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isHighContrast } = useTheme();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state from URL params, fallback to localStorage, then default
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get("search") || localStorage.getItem(STORAGE_KEY_SEARCH) || "";
  });
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return searchParams.get("district") || localStorage.getItem(STORAGE_KEY_DISTRICT) || "";
  });
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest">(() => {
    return (searchParams.get("sort") as "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest") || 
           (localStorage.getItem(STORAGE_KEY_SORT) as "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest") || 
           "desc";
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const urlAmenities = searchParams.get("amenities");
    if (urlAmenities) {
      return urlAmenities.split(",").filter(Boolean);
    }
    const stored = localStorage.getItem(STORAGE_KEY_AMENITIES);
    return stored ? JSON.parse(stored) : [];
  });
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LOCATION_PERMISSION);
    return stored ? JSON.parse(stored) : null;
  });

  // Helper function to update URL params
  const updateUrlParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "none") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams;
    }, { replace: true });
  };

  // Custom setters that update local storage AND URL params
  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    localStorage.setItem(STORAGE_KEY_SEARCH, value);
    updateUrlParams({ search: value });
  };

  const updateSelectedDistrict = (value: string) => {
    setSelectedDistrict(value);
    localStorage.setItem(STORAGE_KEY_DISTRICT, value);
    updateUrlParams({ district: value });
  };

  const updateSortOrder = (order: "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest") => {
    setSortOrder(order);
    localStorage.setItem(STORAGE_KEY_SORT, order);
    updateUrlParams({ sort: order });
  };

  const updateSelectedAmenities = (value: string[]) => {
    setSelectedAmenities(value);
    localStorage.setItem(STORAGE_KEY_AMENITIES, JSON.stringify(value));
    updateUrlParams({ amenities: value.length > 0 ? value.join(",") : null });
  };

  // Reset all filters
  const resetAllFilters = () => {
    // Update state
    setSearchTerm("");
    setSelectedDistrict("");
    setSelectedAmenities([]);
    setSortOrder("desc");
    
    // Update localStorage
    localStorage.setItem(STORAGE_KEY_SEARCH, "");
    localStorage.setItem(STORAGE_KEY_DISTRICT, "");
    localStorage.setItem(STORAGE_KEY_AMENITIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_SORT, "desc");
    
    // Update URL params all at once
    updateUrlParams({
      search: null,
      district: null,
      amenities: null,
      sort: null, // Remove sort too since "desc" is default
    });
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Request geolocation permission and get user location
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission(false);
      localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, JSON.stringify(false));
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationPermission(true);
      localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, JSON.stringify(true));
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermission(false);
      localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, JSON.stringify(false));
    }
  };

  // Handle nearest sort - request permission if needed
  const handleNearestSort = async () => {
    if (locationPermission === null) {
      await requestLocationPermission();
    }
    if (locationPermission === true || userLocation) {
      updateSortOrder('nearest');
    }
  };

  // Using the favoritesManager utility for favorites functionality
  const handleToggleFavorite = (parkId: string) => {
    // This will toggle the favorite status and return the new status
    toggleFavorite(parkId);
    // Force a re-render to update the UI
    setParks([...parks]);
  };

  // Sync state with URL params (for browser back/forward navigation only)
  // This effect ONLY reads from URL and updates state, never the reverse
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlDistrict = searchParams.get("district") || "";
    const urlSort = (searchParams.get("sort") as typeof sortOrder) || "desc";
    const urlAmenities = searchParams.get("amenities");
    const urlAmenitiesArray = urlAmenities ? urlAmenities.split(",").filter(Boolean) : [];

    // Update state from URL (without triggering URL update)
    setSearchTerm(urlSearch);
    setSelectedDistrict(urlDistrict);
    setSortOrder(urlSort);
    setSelectedAmenities(urlAmenitiesArray);
    
    // Also update localStorage
    localStorage.setItem(STORAGE_KEY_SEARCH, urlSearch);
    localStorage.setItem(STORAGE_KEY_DISTRICT, urlDistrict);
    localStorage.setItem(STORAGE_KEY_SORT, urlSort);
    localStorage.setItem(STORAGE_KEY_AMENITIES, JSON.stringify(urlAmenitiesArray));
  }, [searchParams]);

  // Fetch real Vienna parks data
  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const viennaParks = await getViennaParksForApp();
        setParks(viennaParks);

        // Extract all unique amenities from parks
        const allAmenities = new Set<string>();
        viennaParks.forEach((park: { amenities: string[] }) => {
          park.amenities.forEach((amenity: string) => allAmenities.add(amenity));
        });
        setAvailableAmenities(Array.from(allAmenities).sort());

        setError(null);
      } catch (err) {
        setError("Fehler beim Laden der Parks");
        console.error("Error fetching parks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  // Filter parks based on search term, district and amenities
  const filteredParks = parks.filter((park) => {
    // Search filter - search in name and address
    const matchesSearch = searchTerm === "" || park.name.toLowerCase().includes(searchTerm.toLowerCase()) || park.address.toLowerCase().includes(searchTerm.toLowerCase());

    // District filter
    const matchesDistrict = selectedDistrict === "" || park.district.toString() === selectedDistrict;

    // Amenities filter - park must have ALL selected amenities
    const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every((amenity) => park.amenities.includes(amenity));

    return matchesSearch && matchesDistrict && matchesAmenities;
  });

  // Sort parks based on selected sort order
  const sortedParks = [...filteredParks].sort((a, b) => {
    switch (sortOrder) {
      case "asc":
        return a.area - b.area; // Smallest to biggest area
      case "desc":
        return b.area - a.area; // Biggest to smallest area
      case "name_asc":
        return a.name.localeCompare(b.name); // A to Z
      case "name_desc":
        return b.name.localeCompare(a.name); // Z to A
      case "district_asc":
        return a.district - b.district; // District number ascending
      case "nearest":
        if (!userLocation) return 0;
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
        return distanceA - distanceB; // Nearest first
      default:
        return 0; // No sorting
    }
  });

  // Get unique districts
  const districts = Array.from(new Set(parks.map((park) => park.district))).sort();

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: sortedParks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimate ~180px per park item
    overscan: 8, // Render 8 extra items above/below viewport for smooth scrolling
  });

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

  if (error) {
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
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="lg:px-6"
      style={{ background: "var(--main-bg)", height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Alle Parks</title>
        <meta
          name="description"
          content={`Entdecken Sie ${filteredParks.length} Parks in Wien mit detaillierten Informationen zu Lage, Ausstattung und Größe.`}
        />
      </Helmet>
      {/* Screen reader only H1 for both mobile and desktop */}
      <h1 className="sr-only">Index - Wiener Grünflächen</h1>

      {/* Main Content with Sidebar Layout */}
      <div className="px-0 lg:px-0 flex-1 overflow-hidden" style={{ height: '100%' }}>
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Sidebar for Search and Filters - Fixed at bottom on mobile, sticky sidebar on desktop */}
          <div className="hidden lg:block lg:w-72 lg:flex-shrink-0 mt-6">
            <div
              className="sticky top-6 p-4 overflow-y-auto"
              style={{ 
                backgroundColor: "var(--light-sage)", 
                border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
                maxHeight: 'calc(100vh - 48px)'
              }}>
              <h2
                className="font-mono text-lg mb-5"
                style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
                SUCHE & FILTER
              </h2>

              {/* Search Input */}
              <div className="mb-6">
                <label
                  className="block font-mono text-xs mb-2"
                  style={{ color: "var(--primary-green)" }}>
                  PARKNAME ODER ADRESSE
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                  placeholder="Park suchen..."
                  className="w-full p-2 font-serif italic"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                    fontWeight: "400",
                  }}
                />
              </div>

              {/* District Filter */}
              <div className="mb-6">
                <label
                  className="block font-mono text-xs mb-2"
                  style={{ color: "var(--primary-green)" }}>
                  BEZIRK
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => updateSelectedDistrict(e.target.value)}
                  className="w-full p-2 font-serif italic"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                    fontWeight: "400",
                  }}>
                  <option value="">Alle Bezirke</option>
                  {districts.map((district) => (
                    <option
                      key={district}
                      value={district}>
                      {district}. Bezirk
                    </option>
                  ))}
                </select>
              </div>

              {/* Amenities Filter */}
              <div className="mb-8">
                <label
                  className="block font-mono text-[10px] mb-1"
                  style={{ color: "var(--primary-green)", opacity: 0.8 }}>
                  <Filter className="w-3 h-3 inline mr-1" /> AUSSTATTUNG
                </label>
                <div className="flex flex-wrap gap-1">
                  {availableAmenities.map((amenity: string) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => {
                          if (isSelected) {
                            updateSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                          } else {
                            updateSelectedAmenities([...selectedAmenities, amenity]);
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-mono flex items-center gap-1"
                        style={{
                          backgroundColor: isSelected ? "var(--primary-green)" : "var(--soft-cream)",
                          color: isSelected ? "var(--soft-cream)" : "var(--deep-charcoal)",
                          borderRadius: "4px",
                          marginBottom: "0.25rem",
                        }}>
                        <AmenityIcon className="w-2 h-2 flex-shrink-0" />
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label
                  className="block font-mono text-[10px] mb-1"
                  style={{ color: "var(--primary-green)", opacity: 0.8 }}>
                  <ArrowDownUp className="w-3 h-3 inline mr-1" /> SORTIERUNG
                </label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateSortOrder("desc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "desc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "desc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "desc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>GRÖSSTE</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>KLEINSTE</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("district_asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "district_asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "district_asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "district_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "district_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>BEZIRK</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("name_asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "name_asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "name_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "name_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>A-Z</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("name_desc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_desc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "name_desc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "name_desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "name_desc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>Z-A</span>
                  </button>
                  <button
                    onClick={handleNearestSort}
                    disabled={locationPermission === false}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "nearest" ? "opacity-100" : locationPermission === false ? "opacity-40" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "nearest" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "nearest" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                      cursor: locationPermission === false ? "not-allowed" : "pointer",
                    }}>
                    {sortOrder === "nearest" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>AM NÄHESTEN</span>
                  </button>
                </div>
              </div>

              {/* Reset All Filters Button */}
              {(searchTerm || selectedDistrict || selectedAmenities.length > 0) && (
                <button
                  onClick={resetAllFilters}
                  className="px-3 py-2 text-[10px] font-mono w-full mt-4"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                  }}>
                  FILTER ZURÜCKSETZEN
                </button>
              )}
            </div>
          </div>

          {/* Parks List - Virtualized */}
          <div className="flex-1 overflow-hidden" style={{ height: '100%' }}>
            {filteredParks.length === 0 ? (
              <div className="py-16 text-center">
                <p
                  className="font-serif italic text-xl"
                  style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                  Keine Parks gefunden, die Ihren Kriterien entsprechen.
                </p>
              </div>
            ) : (
              <div
                ref={parentRef}
                className="p-4 pt-6 lg:pt-6 h-full"
                style={{
                  overflow: 'auto',
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                }}>
                {/* Hide scrollbar for WebKit browsers */}
                <style>{`
                  div[class*="p-4"]::-webkit-scrollbar,
                  div[class*="lg:p-0"]::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const park = sortedParks[virtualRow.index];
                    return (
                      <div
                        key={park.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}>
                        <Link
                          to={`/index/${slugifyParkName(park.name)}`}
                          className="block p-4 mb-4 park-list-item"
                          style={{
                            backgroundColor: "var(--card-bg)",
                            border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
                          }}>
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-6 md:mb-0">
                              <h3
                                className="font-serif text-2xl mb-3"
                                style={{ color: "var(--deep-charcoal)", fontWeight: "400", fontStyle: "italic" }}>
                                {park.name}
                              </h3>
                              <div className="flex flex-wrap gap-6 mb-2">
                                <span
                                  className="flex items-center gap-2 font-mono text-xs"
                                  style={{ color: "var(--deep-charcoal)" }}>
                                  <Building className="w-4 h-4" /> {park.district}. BEZIRK
                                </span>
                                <span
                                  className="flex items-center gap-2 font-mono text-xs"
                                  style={{ color: "var(--deep-charcoal)" }}>
                                  <Ruler className="w-4 h-4" /> {park.area.toLocaleString()} M²
                                </span>
                              </div>

                              {/* Amenities moved below district and area */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {park.amenities.slice(0, 2).map((amenity: string, index: number) => {
                                  const AmenityIcon = getAmenityIcon(amenity);
                                  return (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs font-mono flex items-center gap-1"
                                      style={{
                                        backgroundColor: "var(--light-sage)",
                                        color: "var(--deep-charcoal)",
                                        borderRadius: "4px",
                                        border: isHighContrast ? "1px solid var(--border-color)" : "none",
                                      }}>
                                      <AmenityIcon className="w-3 h-3" />
                                      {amenity}
                                    </span>
                                  );
                                })}

                                {/* Show count of additional amenities if more than 2 */}
                                {park.amenities.length > 2 && (
                                  <span
                                    className="px-2 py-1 text-xs font-mono flex items-center"
                                    style={{
                                      backgroundColor: "var(--soft-cream)",
                                      color: "var(--deep-charcoal)",
                                      borderRadius: "4px",
                                      border: isHighContrast ? "1px solid var(--border-color)" : "none",
                                    }}>
                                    +{park.amenities.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Favorite button in place of amenities */}
                            <div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent navigation when clicking the heart
                                  handleToggleFavorite(park.id);
                                }}
                                className="p-2 transition-transform "
                                style={{
                                  color: isFavorite(park.id) ? 'var(--accent-gold)' : 'var(--primary-green)',
                                }}
                                aria-label={isFavorite(park.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                              >
                                <Heart
                                  className="w-6 h-6"
                                  fill={isFavorite(park.id) ? 'var(--accent-gold)' : 'transparent'}
                                />
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel - Accordion at Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Accordion Header/Toggle */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full p-4 flex items-center justify-between"
          style={{ 
            backgroundColor: "var(--light-sage)", 
            border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}>
          <h2
            className="font-mono text-lg"
            style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
            SUCHE & FILTER
          </h2>
          <span
            className="font-mono text-xl"
            style={{ color: "var(--primary-green)" }}>
            {mobileFiltersOpen ? '−' : '+'}
          </span>
        </button>

        {/* Accordion Content */}
        <div 
          className="overflow-y-auto transition-all duration-300"
          style={{ 
            backgroundColor: "var(--light-sage)", 
            border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
            borderTop: 'none',
            height: mobileFiltersOpen ? '50vh' : '0',
            opacity: mobileFiltersOpen ? 1 : 0,
          }}>
          {mobileFiltersOpen && (
            <div className="p-4">
              {/* Search Input */}
              <div className="mb-6">
                <label
                  className="block font-mono text-xs mb-2"
                  style={{ color: "var(--primary-green)" }}>
                  PARKNAME ODER ADRESSE
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                  placeholder="Park suchen..."
                  className="w-full p-2 font-serif italic"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                    fontWeight: "400",
                  }}
                />
              </div>

              {/* District Filter */}
              <div className="mb-6">
                <label
                  className="block font-mono text-xs mb-2"
                  style={{ color: "var(--primary-green)" }}>
                  BEZIRK
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => updateSelectedDistrict(e.target.value)}
                  className="w-full p-2 font-serif italic"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                    fontWeight: "400",
                  }}>
                  <option value="">Alle Bezirke</option>
                  {districts.map((district) => (
                    <option
                      key={district}
                      value={district}>
                      {district}. Bezirk
                    </option>
                  ))}
                </select>
              </div>

              {/* Amenities Filter */}
              <div className="mb-8">
                <label
                  className="block font-mono text-[10px] mb-1"
                  style={{ color: "var(--primary-green)", opacity: 0.8 }}>
                  <Filter className="w-3 h-3 inline mr-1" /> AUSSTATTUNG
                </label>
                <div className="flex flex-wrap gap-1">
                  {availableAmenities.map((amenity: string) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => {
                          if (isSelected) {
                            updateSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                          } else {
                            updateSelectedAmenities([...selectedAmenities, amenity]);
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-mono flex items-center gap-1"
                        style={{
                          backgroundColor: isSelected ? "var(--primary-green)" : "var(--soft-cream)",
                          color: isSelected ? "var(--soft-cream)" : "var(--deep-charcoal)",
                          borderRadius: "4px",
                          marginBottom: "0.25rem",
                        }}>
                        <AmenityIcon className="w-2 h-2 flex-shrink-0" />
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label
                  className="block font-mono text-[10px] mb-1"
                  style={{ color: "var(--primary-green)", opacity: 0.8 }}>
                  <ArrowDownUp className="w-3 h-3 inline mr-1" /> SORTIERUNG
                </label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateSortOrder("desc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "desc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "desc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "desc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>GRÖSSTE</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>KLEINSTE</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("district_asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "district_asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "district_asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "district_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "district_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>BEZIRK</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("name_asc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_asc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "name_asc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "name_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "name_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>A-Z</span>
                  </button>
                  <button
                    onClick={() => updateSortOrder("name_desc")}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_desc" ? "opacity-100" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "name_desc" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "name_desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    {sortOrder === "name_desc" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>Z-A</span>
                  </button>
                  <button
                    onClick={handleNearestSort}
                    disabled={locationPermission === false}
                    className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "nearest" ? "opacity-100" : locationPermission === false ? "opacity-40" : "opacity-80"}`}
                    style={{
                      backgroundColor: sortOrder === "nearest" ? "var(--primary-green)" : "var(--light-sage)",
                      color: sortOrder === "nearest" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                      borderRadius: "4px",
                      cursor: locationPermission === false ? "not-allowed" : "pointer",
                    }}>
                    {sortOrder === "nearest" && <Check className="w-2 h-2 flex-shrink-0" />}
                    <span>AM NÄHESTEN</span>
                  </button>
                </div>
              </div>

              {/* Reset All Filters Button */}
              {(searchTerm || selectedDistrict || selectedAmenities.length > 0) && (
                <button
                  onClick={resetAllFilters}
                  className="px-3 py-2 text-[10px] font-mono w-full mt-4"
                  style={{
                    backgroundColor: "var(--soft-cream)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                  }}>
                  FILTER ZURÜCKSETZEN
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParksListPage;
