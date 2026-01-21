import { useState } from "react";
import { Filter, Navigation, Map as MapIcon } from "lucide-react";
import type { Park } from "../../types/park";

interface MapControlsProps {
  selectedDistrict: number | null;
  districts: number[];
  userLocation: { lat: number; lng: number } | null;
  filteredParksCount: number;
  onDistrictFilter: (district: number | null) => void;
  onGetUserLocation: () => void;
}

/**
 * MapControls component - desktop map controls overlay
 */
export default function MapControls({
  selectedDistrict,
  districts,
  userLocation,
  filteredParksCount,
  onDistrictFilter,
  onGetUserLocation,
}: MapControlsProps) {
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10 hidden lg:block">
      <div className="bg-white shadow-lg p-3 rounded-lg">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDistrictFilter(null)}
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
                        onDistrictFilter(district);
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
            onClick={onGetUserLocation}
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
  );
}
