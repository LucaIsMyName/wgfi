import { useMemo } from "react";
import { PARKS_DATA } from "../data/generatedParks";
import type { Park } from "../types/park";

/**
 * Custom hook for managing parks data
 * Returns parks, available amenities, and unique districts
 * 
 * Note: Parks data is now statically generated at build time,
 * so there's no loading state or async fetching required.
 */
export function useParksData() {
  // Parks data is available immediately from static import
  const parks = PARKS_DATA;

  // Extract all unique amenities from parks
  const availableAmenities = useMemo(() => {
    const allAmenities = new Set<string>();
    parks.forEach((park: Park) => {
      park.amenities.forEach((amenity: string) => allAmenities.add(amenity));
    });
    return Array.from(allAmenities).sort();
  }, [parks]);

  // Extract unique districts
  const districts = useMemo(() => {
    return Array.from(new Set(parks.map((park: Park) => park.district))).sort() as number[];
  }, [parks]);

  return {
    parks,
    loading: false, // No loading needed - data is static
    error: null, // No errors - data is guaranteed to exist
    availableAmenities,
    districts,
  };
}
