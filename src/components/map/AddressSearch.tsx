import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { useAddressSearch, type GeocodingResult } from "../../hooks/useAddressSearch";

interface AddressSearchProps {
  onAddressSelect: (coordinates: [number, number], address: string) => void;
  className?: string;
}

function AddressSearch({ onAddressSelect, className = "" }: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    suggestions,
    isLoading,
    error,
    debouncedSearch,
    handleAddressSelect,
    clearSearch,
  } = useAddressSearch({ onAddressSelect });

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleAddressSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (result: GeocodingResult) => {
    handleAddressSelect(result);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const formatAddress = useMemo(() => (result: GeocodingResult) => {
    // Extract relevant parts for better display
    const parts = result.place_name.split(",");
    const mainAddress = parts[0]?.trim() || "";
    const city = parts[parts.length - 1]?.trim() || "";
    
    return { mainAddress, city };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Adresse suchen..."
          className="w-full h-10 pl-10 pr-10 font-serif text-sm bg-soft-cream border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
          aria-label="Adresse suchen"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Suche löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-primary-green" />
          </div>
        )}
      </div>

      {isOpen && (query.length >= 2 || error) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-soft-cream border border-border-color rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          role="listbox"
        >
          {error && (
            <div className="px-3 py-2 text-sm text-red-600 border-b border-border-color">
              {error}
            </div>
          )}
          
          {isLoading && query.length >= 2 && !error && (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Suchen...
            </div>
          )}
          
          {!isLoading && !error && suggestions.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Keine Ergebnisse gefunden
            </div>
          )}
          
          {suggestions.map((result, index) => {
            const { mainAddress, city } = formatAddress(result);
            const isSelected = index === selectedIndex;
            
            return (
              <button
                key={result.id}
                onClick={() => handleSuggestionClick(result)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-light-sage transition-colors flex items-start gap-2 border-b border-border-color last:border-b-0 ${
                  isSelected ? "bg-light-sage" : ""
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <MapPin className="w-4 h-4 text-primary-green mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary-green truncate">
                    {mainAddress}
                  </div>
                  {city && (
                    <div className="text-xs text-gray-600 truncate">
                      {city}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(AddressSearch);
