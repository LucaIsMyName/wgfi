import { Navigation, Map as MapIcon } from "lucide-react";
import type { Park } from "../../types/park";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

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
            className="text-xs">
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
            placeholder="Bezirk wählen"
            fullWidth
          />

          <Button
            onClick={onGetUserLocation}
            variant="secondary"
            size="sm"
            icon={Navigation}
            fullWidth
            className="text-xs"
            style={{
              backgroundColor: userLocation ? "var(--accent-gold)" : "var(--light-sage)",
            }}>
            MEIN STANDORT
          </Button>
        </div>
      </div>
    </div>
  );
}
