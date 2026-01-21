import { useState, useEffect } from "react";
import { getViennaParksForApp } from "../services/viennaApi";
import type { Park } from "../types/park";

/**
 * Custom hook for fetching and managing parks data
 * Returns parks, loading state, error state, available amenities, and unique districts
 */
export function useParksData() {
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<number[]>([]);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const viennaParks: Park[] = await getViennaParksForApp();
        setParks(viennaParks);

        // Extract all unique amenities from parks
        const allAmenities = new Set<string>();
        viennaParks.forEach((park: Park) => {
          park.amenities.forEach((amenity: string) => allAmenities.add(amenity));
        });
        setAvailableAmenities(Array.from(allAmenities).sort());

        // Extract unique districts
        const uniqueDistricts = Array.from(new Set(viennaParks.map((park: Park) => park.district))).sort() as number[];
        setDistricts(uniqueDistricts);

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

  return {
    parks,
    loading,
    error,
    availableAmenities,
    districts,
  };
}
