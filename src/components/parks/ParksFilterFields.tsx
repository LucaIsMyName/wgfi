import { useMemo } from "react";
import { ArrowDownUp, Check, Filter } from "lucide-react";
import { getAmenityIcon } from "@/utils/amenityIcons";
import type { SortOrder } from "@/hooks/useParksFilters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/utils/cn";
import { buildDistrictSelectOptions } from "./parksFilterUtils";

export interface ParksFilterFieldsProps {
  searchTerm: string;
  selectedDistrict: string;
  selectedAmenities: string[];
  sortOrder: SortOrder;
  availableAmenities: string[];
  districts: number[];
  locationPermission: boolean | null;
  onSearchChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onAmenitiesChange: (value: string[]) => void;
  onSortChange: (order: SortOrder) => void;
  onNearestSort: () => Promise<void>;
  onResetFilters: () => void;
}

function SortOptionButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center rounded",
        active
          ? "opacity-100 bg-primary-green text-soft-cream"
          : disabled
            ? "opacity-40 bg-light-sage text-deep-charcoal cursor-not-allowed"
            : "opacity-80 bg-light-sage text-deep-charcoal",
      )}
    >
      {active && <Check className="w-2 h-2 flex-shrink-0" aria-hidden />}
      <span>{label}</span>
    </button>
  );
}

/**
 * Shared search, district, amenity, and sort controls for index filters.
 */
export default function ParksFilterFields({
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
}: ParksFilterFieldsProps) {
  const districtOptions = useMemo(
    () => buildDistrictSelectOptions(districts),
    [districts],
  );

  return (
    <>
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

      <div className="mb-6">
        <Select
          value={selectedDistrict || "all"}
          onValueChange={(value) =>
            onDistrictChange(value === "all" ? "" : value)
          }
          options={districtOptions}
          label="BEZIRK"
          placeholder="Alle Bezirke"
          fullWidth
        />
      </div>

      <div className="mb-8">
        <label className="block font-mono text-[10px] mb-1 text-primary-green opacity-80">
          <Filter className="w-3 h-3 inline mr-1" aria-hidden /> AUSSTATTUNG
        </label>
        <div className="flex flex-wrap gap-1">
          {availableAmenities.map((amenity: string) => {
            const AmenityIcon = getAmenityIcon(amenity);
            const isSelected = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) {
                    onAmenitiesChange(
                      selectedAmenities.filter((a) => a !== amenity),
                    );
                  } else {
                    onAmenitiesChange([...selectedAmenities, amenity]);
                  }
                }}
                className={cn(
                  "px-2 py-1 text-[10px] font-mono flex items-center gap-1 rounded mb-1",
                  isSelected
                    ? "bg-primary-green text-soft-cream"
                    : "bg-soft-cream text-deep-charcoal",
                )}
              >
                <AmenityIcon className="w-2 h-2 flex-shrink-0" aria-hidden />
                <span>{amenity}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] mb-1 text-primary-green opacity-80">
          <ArrowDownUp className="w-3 h-3 inline mr-1" aria-hidden /> SORTIERUNG
        </label>
        <div className="flex flex-col gap-1">
          <SortOptionButton
            active={sortOrder === "desc"}
            label="GRÖSSTE"
            onClick={() => onSortChange("desc")}
          />
          <SortOptionButton
            active={sortOrder === "asc"}
            label="KLEINSTE"
            onClick={() => onSortChange("asc")}
          />
          <SortOptionButton
            active={sortOrder === "district_asc"}
            label="BEZIRK"
            onClick={() => onSortChange("district_asc")}
          />
          <SortOptionButton
            active={sortOrder === "name_asc"}
            label="A-Z"
            onClick={() => onSortChange("name_asc")}
          />
          <SortOptionButton
            active={sortOrder === "name_desc"}
            label="Z-A"
            onClick={() => onSortChange("name_desc")}
          />
          <SortOptionButton
            active={sortOrder === "nearest"}
            disabled={locationPermission === false}
            label="AM NÄHESTEN"
            onClick={onNearestSort}
          />
        </div>
      </div>

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
    </>
  );
}
