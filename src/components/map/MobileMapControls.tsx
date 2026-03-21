import { Navigation, Map as MapIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

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
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 p-3 bg-card-bg shadow-lg border-t border-primary-green/20 safe-area-inset-bottom">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-mono text-xs text-primary-green">
          {filteredParksCount} PARKS {selectedDistrict && <span>IM {selectedDistrict}. BEZIRK</span>}
        </h3>
        <Button
          onClick={onGetUserLocation}
          variant="secondary"
          size="sm"
          icon={Navigation}
          className="text-xs min-h-[32px] touch-manipulation"
          style={{
            backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
          }}
          aria-label="Aktuellen Standort finden"
        >
          STANDORT
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onDistrictFilter(null)}
          variant={selectedDistrict === null ? "primary" : "secondary"}
          size="sm"
          icon={MapIcon}
          className="text-xs min-h-[32px] touch-manipulation"
          aria-label="Alle Parks anzeigen"
        >
          ALLE PARKS
        </Button>

        <Select
          value={selectedDistrict ? String(selectedDistrict) : 'all'}
          onValueChange={(value) => onDistrictFilter(value === 'all' ? null : Number(value))}
          options={[
            { value: 'all', label: 'Alle Bezirke' },
            ...districts.sort((a, b) => a - b).map((district) => ({
              value: String(district),
              label: `${district}. Bezirk`,
            })),
          ]}
          placeholder="Bezirk"
          fullWidth
          className="min-h-[32px] touch-manipulation"
          aria-label="Bezirk auswählen"
        />
      </div>
    </div>
  );
}
