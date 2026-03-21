import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { calculateDistance } from "../utils/geoUtils";
import { getAllDistrictsForPark } from "../utils/parkUtils";
import type { Park } from "../types/park";

// Local storage keys
const STORAGE_KEY_SEARCH = "wgfi:search-term";
const STORAGE_KEY_DISTRICT = "wgfi:selected-district";
const STORAGE_KEY_SORT = "wgfi:sort-order";
const STORAGE_KEY_AMENITIES = "wgfi:selected-amenities";
const STORAGE_KEY_LOCATION_PERMISSION = "wgfi:location-permission";

export type SortOrder = "none" | "asc" | "desc" | "name_asc" | "name_desc" | "district_asc" | "nearest";

interface UseParksFiltersReturn {
  searchTerm: string;
  selectedDistrict: string;
  sortOrder: SortOrder;
  selectedAmenities: string[];
  userLocation: { lat: number; lng: number } | null;
  locationPermission: boolean | null;
  updateSearchTerm: (value: string) => void;
  updateSelectedDistrict: (value: string) => void;
  updateSortOrder: (order: SortOrder) => void;
  updateSelectedAmenities: (value: string[]) => void;
  resetAllFilters: () => void;
  requestLocationPermission: () => Promise<void>;
  handleNearestSort: () => Promise<void>;
  filteredAndSortedParks: Park[];
}

/**
 * Custom hook for managing parks filter state
 * Handles URL params, localStorage, and filter/sort logic
 */
export function useParksFilters(parks: Park[]): UseParksFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params, fallback to localStorage, then default
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get("search") || localStorage.getItem(STORAGE_KEY_SEARCH) || "";
  });
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return searchParams.get("district") || localStorage.getItem(STORAGE_KEY_DISTRICT) || "";
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    return (searchParams.get("sort") as SortOrder) || 
           (localStorage.getItem(STORAGE_KEY_SORT) as SortOrder) || 
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

  const updateSortOrder = (order: SortOrder) => {
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

  // Sync state with URL params (for browser back/forward navigation only)
  // This effect ONLY reads from URL and updates state, never the reverse
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlDistrict = searchParams.get("district") || "";
    const urlSort = (searchParams.get("sort") as SortOrder) || "desc";
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

  // Filter parks based on search term, district and amenities
  const filteredParks = parks.filter((park) => {
    // Search filter - search in name and address
    const matchesSearch = searchTerm === "" || park.name.toLowerCase().includes(searchTerm.toLowerCase()) || park.address.toLowerCase().includes(searchTerm.toLowerCase());

    // District filter - check primary district AND district area splits
    let matchesDistrict = true;
    if (selectedDistrict !== "") {
      const allDistricts = getAllDistrictsForPark(park);
      matchesDistrict = allDistricts.some(district => district.toString() === selectedDistrict);
    }

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
        {
          const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
          const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
          return distanceA - distanceB; // Nearest first
        }
      default:
        return 0; // No sorting
    }
  });

  return {
    searchTerm,
    selectedDistrict,
    sortOrder,
    selectedAmenities,
    userLocation,
    locationPermission,
    updateSearchTerm,
    updateSelectedDistrict,
    updateSortOrder,
    updateSelectedAmenities,
    resetAllFilters,
    requestLocationPermission,
    handleNearestSort,
    filteredAndSortedParks: sortedParks,
  };
}
