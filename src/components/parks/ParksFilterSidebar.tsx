import ParksFilterFields from "./ParksFilterFields";
import type { SortOrder } from "@/hooks/useParksFilters";

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
}

/**
 * ParksFilterSidebar component - desktop filter sidebar
 */
export default function ParksFilterSidebar({
  userLocation: _userLocation,
  ...filterProps
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
        <ParksFilterFields {...filterProps} />
      </div>
    </div>
  );
}
