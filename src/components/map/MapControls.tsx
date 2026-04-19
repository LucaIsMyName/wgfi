import { Navigation, Map as MapIcon } from "lucide-react";
import type { Park } from "../../types/park";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { MultiSelect } from "../ui/MultiSelect";
import AddressSearch from "./AddressSearch";

interface MapControlsProps {
  selectedDistrict: number | null;
  districts: number[];
  selectedAmenities: string[];
  availableAmenities: string[];
  userLocation: { lat: number; lng: number } | null;
  filteredParksCount: number;
  onDistrictFilter: (district: number | null) => void;
  onAmenitiesChange: (amenities: string[]) => void;
  onGetUserLocation: () => void;
  onAddressSelect: (coordinates: [number, number], address: string) => void;
}

/**
 * MapControls component - desktop map controls overlay
 */
export default function MapControls({
  selectedDistrict,
  districts,
  selectedAmenities,
  availableAmenities,
  userLocation,
  filteredParksCount,
  onDistrictFilter,
  onAmenitiesChange,
  onGetUserLocation,
  onAddressSelect,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 hidden lg:block">
      <div
        className="bg-soft-cream border border-border-color shadow-lg rounded-lg overflow-hidden"
        style={{ width: "240px" }}
      >
        {/* Header */}
        <div className="bg-primary-green px-4 py-2.5 border-b border-border-color">
          <div className="flex items-center justify-between">
            <span className="font-serif text-base text-soft-cream tracking-wide">
              Filter
            </span>
            <span className="font-mono text-xs text-soft-cream">
              {filteredParksCount}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 flex flex-col gap-2 bg-soft-cream">
          {/* Address Search */}
          <AddressSearch onAddressSelect={onAddressSelect} />
          
          {/* All Parks Button */}
          <button
            onClick={() => onDistrictFilter(null)}
            className="h-10 px-4 flex items-center justify-start gap-2 font-serif text-base tracking-wide transition-all rounded-md"
            style={{
              backgroundColor:
                selectedDistrict === null
                  ? "var(--primary-green)"
                  : "var(--light-sage)",
              color:
                selectedDistrict === null
                  ? "var(--soft-cream)"
                  : "var(--primary-green)",
              border:
                selectedDistrict === null
                  ? "none"
                  : "1px solid var(--border-color)",
            }}
          >
            <MapIcon className="w-4 h-4" />
            Alle Parks
          </button>
          <button
            onClick={onGetUserLocation}
            className="h-10 px-4 flex items-center justify-start gap-2 font-serif text-base tracking-wide transition-all rounded-md border"
            style={{
              backgroundColor: userLocation
                ? "var(--accent-gold)"
                : "var(--card-bg)",
              color: userLocation
                ? "var(--soft-cream)"
                : "var(--primary-green)",
              borderColor: userLocation
                ? "var(--accent-gold)"
                : "var(--border-color)",
            }}
          >
            <Navigation className="w-4 h-4" />
            Mein Standort
          </button>
          {/* District Dropdown */}
          <Select
            value={selectedDistrict ? String(selectedDistrict) : "all"}
            onValueChange={(value) =>
              onDistrictFilter(value === "all" ? null : Number(value))
            }
            options={[
              { value: "all", label: "Alle Bezirke" },
              ...districts
                .sort((a, b) => a - b)
                .map((district) => ({
                  value: String(district),
                  label: `${district}. Bezirk`,
                })),
            ]}
            placeholder="Bezirk wählen"
            className=""
            fullWidth
          />

          {/* Amenities Multiselect */}
          <MultiSelect
            value={selectedAmenities}
            onValueChange={onAmenitiesChange}
            options={availableAmenities.map(amenity => ({ value: amenity, label: amenity }))}
            placeholder="Ausstattung wählen..."
            label="AUSSTATTUNG"
            fullWidth
            size="md"
            className="mt-2"
          />

          {/* Divider */}
          {/* <div className="h-px bg-border-color my-1" /> */}

          {/* User Location Button */}
        </div>
      </div>
    </div>
  );
}
