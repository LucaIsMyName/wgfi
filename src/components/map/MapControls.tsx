import { useState } from "react";
import { Filter, Navigation, Map as MapIcon } from "lucide-react";
import type { Park } from "../../types/park";
import { Button } from "../ui/Button";

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
          <Button
            onClick={() => onDistrictFilter(null)}
            variant={selectedDistrict === null ? "primary" : "secondary"}
            size="sm"
            icon={MapIcon}
            fullWidth
            style={{ fontSize: '0.75rem' }}>
            ALLE PARKS
          </Button>

          <div className="relative w-full">
            <Button
              onClick={() => setShowDistrictSelector(!showDistrictSelector)}
              variant="secondary"
              size="sm"
              icon={Filter}
              fullWidth
              style={{
                backgroundColor: selectedDistrict !== null ? "var(--accent-gold)" : "var(--light-sage)",
                fontSize: '0.75rem'
              }}>
              {selectedDistrict ? `${selectedDistrict}. BEZIRK` : "BEZIRK WÄHLEN"}
            </Button>

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

          <Button
            onClick={onGetUserLocation}
            variant="secondary"
            size="sm"
            icon={Navigation}
            fullWidth
            style={{
              backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
              fontSize: '0.75rem'
            }}>
            MEIN STANDORT
          </Button>
        </div>
      </div>
    </div>
  );
}
