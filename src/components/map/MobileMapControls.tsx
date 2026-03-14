import { useState } from "react";
import { Filter, Navigation, Map as MapIcon, X } from "lucide-react";
import { Button } from "../ui/Button";

interface MobileMapControlsProps {
  selectedDistrict: number | null;
  districts: number[];
  userLocation: { lat: number; lng: number } | null;
  filteredParksCount: number;
  onDistrictFilter: (district: number | null) => void;
  onGetUserLocation: () => void;
}

/**
 * MobileMapControls component - mobile bottom controls
 */
export default function MobileMapControls({
  selectedDistrict,
  districts,
  userLocation,
  filteredParksCount,
  onDistrictFilter,
  onGetUserLocation,
}: MobileMapControlsProps) {
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 p-3 bg-white shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-mono text-xs"
          style={{ color: "var(--primary-green)" }}>
          {filteredParksCount} PARKS {selectedDistrict && <span>IM {selectedDistrict}. BEZIRK</span>}
        </h3>
        <Button
          onClick={onGetUserLocation}
          variant="secondary"
          size="sm"
          icon={Navigation}
          style={{
            backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
            fontSize: '0.75rem'
          }}>
          STANDORT
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onDistrictFilter(null)}
          variant={selectedDistrict === null ? "primary" : "secondary"}
          size="sm"
          icon={MapIcon}
          style={{ fontSize: '0.75rem' }}>
          ALLE PARKS
        </Button>

        <Button
          onClick={() => setShowDistrictSelector(!showDistrictSelector)}
          variant="secondary"
          size="sm"
          icon={Filter}
          style={{
            backgroundColor: selectedDistrict !== null ? "var(--accent-gold)" : "var(--light-sage)",
            fontSize: '0.75rem'
          }}>
          {selectedDistrict ? `${selectedDistrict}. BEZIRK` : "BEZIRK"}
        </Button>

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
                <Button
                  onClick={() => setShowDistrictSelector(false)}
                  variant="ghost"
                  size="sm"
                  icon={X}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {districts.map((district) => (
                  <button
                    key={district}
                    onClick={() => {
                      onDistrictFilter(district);
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
  );
}
