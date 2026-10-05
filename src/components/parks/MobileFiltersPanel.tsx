import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SortOrder } from "@/hooks/useParksFilters";
import { cn } from "@/utils/cn";
import ParksFilterFields from "./ParksFilterFields";

interface MobileFiltersPanelProps {
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

const MOBILE_FILTERS_PANEL_ID = "mobile-filters-panel";
const MOBILE_FILTERS_HEADING_ID = "mobile-filters-heading";

/**
 * MobileFiltersPanel component - mobile filter accordion at bottom
 */
export default function MobileFiltersPanel(props: MobileFiltersPanelProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      <section
        className="bg-main-bg shadow-lg border-t border-primary-green/20"
        aria-label="Suche und Filter"
      >
        <h2 id={MOBILE_FILTERS_HEADING_ID} className="sr-only">
          Suche und Filter
        </h2>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          aria-expanded={mobileFiltersOpen}
          aria-controls={MOBILE_FILTERS_PANEL_ID}
          aria-labelledby={MOBILE_FILTERS_HEADING_ID}
          className="w-full px-4 py-4 flex items-center justify-between touch-manipulation min-h-[56px]"
        >
          <span className="font-mono text-lg text-primary-green tracking-wide">
            SUCHE & FILTER
          </span>
          {mobileFiltersOpen ? (
            <ChevronUp className="w-5 h-5 text-primary-green" aria-hidden />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary-green" aria-hidden />
          )}
        </button>

        <div
          id={MOBILE_FILTERS_PANEL_ID}
          className={cn(
            "transition-all duration-300",
            mobileFiltersOpen
              ? "overflow-y-auto pt-0"
              : "overflow-hidden",
          )}
          style={{
            height: mobileFiltersOpen ? "50vh" : "0",
            opacity: mobileFiltersOpen ? 1 : 0,
          }}
        >
          {mobileFiltersOpen && (
            <div className="px-4 pb-4">
              <ParksFilterFields {...props} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
