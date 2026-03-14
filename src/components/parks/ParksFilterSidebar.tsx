import { ArrowDownUp, Check, Filter } from 'lucide-react';
import { getAmenityIcon } from '../../utils/amenityIcons';
import type { SortOrder } from '../../hooks/useParksFilters';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

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
        className="sticky top-6 p-4 overflow-y-auto"
        style={{ 
          backgroundColor: "var(--light-sage)", 
          border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
          maxHeight: 'calc(100vh - 48px)'
        }}>
        <h2
          className="font-mono text-lg mb-5"
          style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
          SUCHE & FILTER
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
            value={selectedDistrict || 'all'}
            onValueChange={(value) => onDistrictChange(value === 'all' ? '' : value)}
            options={[
              { value: 'all', label: 'Alle Bezirke' },
              ...districts.map((district) => ({
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
          <label
            className="block font-mono text-[10px] mb-1"
            style={{ color: "var(--primary-green)", opacity: 0.8 }}>
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
                      onAmenitiesChange(selectedAmenities.filter((a) => a !== amenity));
                    } else {
                      onAmenitiesChange([...selectedAmenities, amenity]);
                    }
                  }}
                  className="px-2 py-1 text-[10px] font-mono flex items-center gap-1"
                  style={{
                    backgroundColor: isSelected ? "var(--primary-green)" : "var(--soft-cream)",
                    color: isSelected ? "var(--soft-cream)" : "var(--deep-charcoal)",
                    borderRadius: "4px",
                    marginBottom: "0.25rem",
                  }}>
                  <AmenityIcon className="w-2 h-2 flex-shrink-0" />
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label
            className="block font-mono text-[10px] mb-1"
            style={{ color: "var(--primary-green)", opacity: 0.8 }}>
            <ArrowDownUp className="w-3 h-3 inline mr-1" /> SORTIERUNG
          </label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSortChange("desc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "desc" ? "opacity-100" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "desc" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              {sortOrder === "desc" && <Check className="w-2 h-2 flex-shrink-0" />}
              <span>GRÖSSTE</span>
            </button>
            <button
              onClick={() => onSortChange("asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "asc" ? "opacity-100" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "asc" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              {sortOrder === "asc" && <Check className="w-2 h-2 flex-shrink-0" />}
              <span>KLEINSTE</span>
            </button>
            <button
              onClick={() => onSortChange("district_asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "district_asc" ? "opacity-100" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "district_asc" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "district_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              {sortOrder === "district_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
              <span>BEZIRK</span>
            </button>
            <button
              onClick={() => onSortChange("name_asc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_asc" ? "opacity-100" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "name_asc" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "name_asc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              {sortOrder === "name_asc" && <Check className="w-2 h-2 flex-shrink-0" />}
              <span>A-Z</span>
            </button>
            <button
              onClick={() => onSortChange("name_desc")}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "name_desc" ? "opacity-100" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "name_desc" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "name_desc" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
              }}>
              {sortOrder === "name_desc" && <Check className="w-2 h-2 flex-shrink-0" />}
              <span>Z-A</span>
            </button>
            <button
              onClick={onNearestSort}
              disabled={locationPermission === false}
              className={`w-full px-2 py-1 text-[10px] font-mono flex items-center gap-1 justify-center ${sortOrder === "nearest" ? "opacity-100" : locationPermission === false ? "opacity-40" : "opacity-80"}`}
              style={{
                backgroundColor: sortOrder === "nearest" ? "var(--primary-green)" : "var(--light-sage)",
                color: sortOrder === "nearest" ? "var(--soft-cream)" : "var(--deep-charcoal)",
                borderRadius: "4px",
                cursor: locationPermission === false ? "not-allowed" : "pointer",
              }}>
              {sortOrder === "nearest" && <Check className="w-2 h-2 flex-shrink-0" />}
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
            style={{ fontSize: '0.625rem' }}>
            FILTER ZURÜCKSETZEN
          </Button>
        )}
      </div>
    </div>
  );
}
