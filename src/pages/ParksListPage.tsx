import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getViennaParksForApp } from "../services/viennaApi";
import { slugifyParkName } from "../data/manualParksData";
import { Building, Ruler, AlertTriangle, TreePine, ArrowDownUp, Check, Filter, Heart } from 'lucide-react';
import { getAmenityIcon } from '../utils/amenityIcons';
import { isFavorite, toggleFavorite } from '../utils/favoritesManager';
import STYLE from '../utils/config';

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
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_SEARCH) || "";
  });
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_DISTRICT) || "";
  });
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest">(() => {
    return (localStorage.getItem(STORAGE_KEY_SORT) as "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest") || "desc";
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_AMENITIES);
    return stored ? JSON.parse(stored) : [];
  });
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LOCATION_PERMISSION);
    return stored ? JSON.parse(stored) : null;
  });

  // Custom setters that update local storage
  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    localStorage.setItem(STORAGE_KEY_SEARCH, value);
  };

  const updateSelectedDistrict = (value: string) => {
    setSelectedDistrict(value);
    localStorage.setItem(STORAGE_KEY_DISTRICT, value);
  };

  const updateSortOrder = (order: "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest") => {
    setSortOrder(order);
    localStorage.setItem(STORAGE_KEY_SORT, order);
  };

  const updateSelectedAmenities = (value: string[]) => {
    setSelectedAmenities(value);
    localStorage.setItem(STORAGE_KEY_AMENITIES, JSON.stringify(value));
  };

  // Reset all filters
  const resetAllFilters = () => {
    updateSearchTerm("");
    updateSelectedDistrict("");
    updateSelectedAmenities([]);
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}>
        <div
          className="p-6 flex items-center justify-center"
          style={{ backgroundColor: "transparent" }}>
          <TreePine
            className="w-10 h-10 animate-pulse"
            stroke="var(--primary-green)"
            style={{
              animation: "pulse 2s cubic-bezier(0.2, 0, 0.8, 1) infinite",
              opacity: 0.7,
            }}
          />
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
      className="min-h-screen lg:px-6"
      style={{ background: "var(--main-bg)" }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Alle Parks</title>
        <meta
          name="description"
          content={`Entdecken Sie ${filteredParks.length} Parks in Wien mit detaillierten Informationen zu Lage, Ausstattung und Größe.`}
        />
      </Helmet>
      {/* Header */}
      <div className="px-4 lg:px-0 pt-6">
        <div className="w-full">
          <h1
            className={`${STYLE.pageTitle} mb-4`}
            style={{ color: "var(--primary-green)" }}>
            Index
          </h1>
          <p
            className="sr-only font-serif italic text-lg"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
            Entdecken Sie {filteredParks.length} Parks in Wien
          </p>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="px-0 lg:px-0 py-3">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar for Search and Filters - Desktop */}
          <div className=" px-4 lg:px-0 w-full lg:w-72 lg:flex-shrink-0">
            <div
              className="sticky top-6 p-2"
              style={{ backgroundColor: "var(--light-sage)", borderRadius: "8px" }}>
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
                          backgroundColor: isSelected ? "var(--primary-green)" : "var(--light-sage)",
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

          {/* Parks List */}
          <div className="flex-1">
            <div className="space-y-4 p-4 lg:p-0 lg:pl-6">
              {sortedParks.map((park) => (
                <Link
                  key={park.id}
                  to={`/park/${slugifyParkName(park.name)}`}
                  className="block lg:px-4 pb-4 mb-4"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderRadius: "8px",
                    borderBottom: "1px solid var(--light-sage)",
                  }}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="mb-6 md:mb-0">
                      <h3
                        className="font-serif text-2xl mb-3"
                        style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
                        {park.name}
                      </h3>
                      <div className="flex flex-wrap gap-6 mb-2">
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
                        className="p-2 transition-transform hover:scale-110"
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
              ))}
            </div>

            {filteredParks.length === 0 && (
              <div className="py-16 text-center">
                <p
                  className="font-serif italic text-xl"
                  style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                  Keine Parks gefunden, die Ihren Kriterien entsprechen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParksListPage;
