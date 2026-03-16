import { ArrowDownUp, Check, Filter } from "lucide-react";
import { getAmenityIcon } from "../../utils/amenityIcons";
import type { SortOrder } from "../../hooks/useParksFilters";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface ParksFilterSidebarProps {
  searchTerm: string;
  selectedDistrict: string;
  selectedAmenities: string[];
  sortOrder: SortOrder;
  availableAmenities: string[];
  districts: number[];
  locationPermission: boolean | null;
  userLocation: { lat: number; lng: number } | null;
  onSearchChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onAmenitiesChange: (value: string[]) => void;
  onSortChange: (order: SortOrder) => void;
  onNearestSort: () => Promise<void>;
  onResetFilters: () => void;
  isHighContrast: boolean;
}

/**
 * ParksFilterSidebar component - desktop filter sidebar
 */
export default function ParksFilterSidebar({
  searchTerm,
  selectedDistrict,
  selectedAmenities,
  sortOrder,
  availableAmenities,
  districts,
  locationPermission,
  onSearchChange,
  onDistrictChange,
  onAmenitiesChange,
  onSortChange,
  onNearestSort,
  onResetFilters,
  isHighContrast,
}: ParksFilterSidebarProps) {
  return (
    <div className="hidden lg:block lg:w-72 lg:flex-shrink-0 mt-6">
      <div
        className="sticky top-6 p-4 overflow-y-auto bg-light-sage border border-border-color"
        style={{
          maxHeight: "calc(100vh - 48px)",
        }}
      >
        <h2 className="font-serif italic text-xl mb-3 text-primary-green">
          Suche & Filter
        </h2>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Park suchen..."
            label="PARKNAME ODER ADRESSE"
            fullWidth
          />
        </div>

        {/* District Filter */}
        <div className="mb-6">
          <Select
            value={selectedDistrict || "all"}
            onValueChange={(value) =>
              onDistrictChange(value === "all" ? "" : value)
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
            label="BEZIRK"
            placeholder="Alle Bezirke"
            fullWidth
          />
        </div>

        {/* Amenities Filter */}
        <div className="mb-8">
          <label className="block font-mono text-[10px] mb-1 text-primary-green opacity-80">
            <Filter className="w-3 h-3 inline mr-1" /> AUSSTATTUNG
          </label>
          <div className="flex flex-wrap gap-1">
            {availableAmenities.map((amenity: string) => {
              const AmenityIcon = getAmenityIcon(amenity);
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => {
                    if (isSelected) {
                      onAmenitiesChange(
                        selectedAmenities.filter((a) => a !== amenity),
                      );
                    } else {
                      onAmenitiesChange([...selectedAmenities, amenity]);
                    }
                  }}
                  className={`px-2 py-1 text-[10px] font-mono flex items-center gap-1 rounded mb-1 ${
                    isSelected
                      ? "bg-primary-green text-soft-cream"
                      : "bg-soft-cream text-deep-charcoal"
                  }`}
                >
                  <AmenityIcon className="w-2 h-2 flex-shrink-0" />
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block font-mono text-[10px] mb-1 text-primary-green opacity-80">
            <ArrowDownUp className="w-3 h-3 inline mr-1" /> SORTIERUNG
          </label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSortChange("desc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "desc"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "desc" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>GRÖSSTE</span>
            </button>
            <button
              onClick={() => onSortChange("asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "asc"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "asc" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>KLEINSTE</span>
            </button>
            <button
              onClick={() => onSortChange("district_asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "district_asc"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "district_asc" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>BEZIRK</span>
            </button>
            <button
              onClick={() => onSortChange("name_asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "name_asc"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "name_asc" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>A-Z</span>
            </button>
            <button
              onClick={() => onSortChange("name_desc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "name_desc"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "name_desc" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>Z-A</span>
            </button>
            <button
              onClick={onNearestSort}
              disabled={locationPermission === false}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded ${
                sortOrder === "nearest"
                  ? "opacity-100 bg-primary-green text-soft-cream"
                  : locationPermission === false
                    ? "opacity-40 bg-light-sage text-deep-charcoal cursor-not-allowed"
                    : "opacity-80 bg-light-sage text-deep-charcoal"
              }`}
            >
              {sortOrder === "nearest" && (
                <Check className="w-2 h-2 flex-shrink-0" />
              )}
              <span>AM NÄHESTEN</span>
            </button>
          </div>
        </div>

        {/* Reset All Filters Button */}
        {(searchTerm || selectedDistrict || selectedAmenities.length > 0) && (
          <Button
            onClick={onResetFilters}
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-4"
            style={{ fontSize: "0.625rem" }}
          >
            FILTER ZURÜCKSETZEN
          </Button>
        )}
      </div>
    </div>
  );
}
