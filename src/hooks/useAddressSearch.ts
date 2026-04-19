import { useState, useCallback, useRef, useEffect } from "react";

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number];
  context: Array<{ [key: string]: string }>;
}

interface UseAddressSearchProps {
  onAddressSelect: (coordinates: [number, number], address: string) => void;
}

export const useAddressSearch = ({ onAddressSelect }: UseAddressSearchProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}&limit=5&country=at&language=de&proximity=16.3738,48.2082`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error("Suche fehlgeschlagen");
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSuggestions(data.features);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapboxToken]);

  const debouncedSearch = useCallback((value: string) => {
    setQuery(value);
    
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  }, [searchAddresses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAddressSelect = useCallback((result: GeocodingResult) => {
    onAddressSelect(result.center, result.place_name);
    setQuery(result.place_name);
    setSuggestions([]);
  }, [onAddressSelect]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    query,
    suggestions,
    isLoading,
    error,
    debouncedSearch,
    handleAddressSelect,
    clearSearch,
  };
};
