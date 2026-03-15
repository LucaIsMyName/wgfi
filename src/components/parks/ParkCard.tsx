import { Link } from "react-router-dom";
import { Building, Ruler, Heart, GitCompare } from "lucide-react";
import { getAmenityIcon } from "../../utils/amenityIcons";
import { isFavorite } from "../../utils/favoritesManager";
import { isInComparison, toggleComparison } from "../../utils/comparisonManager";
import { slugifyParkName } from "../../data/manualParksData";
import { getAllDistrictsForPark, formatDistricts } from "../../utils/parkUtils";
import type { Park } from "../../types/park";

interface ParkCardProps {
  park: Park;
  onToggleFavorite: (parkId: string) => void;
  onToggleCompare?: (parkId: string) => void;
  isHighContrast: boolean;
}

/**
 * ParkCard component - renders an individual park card in the list
 */
export default function ParkCard({ park, onToggleFavorite, onToggleCompare, isHighContrast }: ParkCardProps) {
  const allDistricts = getAllDistrictsForPark(park);
  const districtsDisplay = formatDistricts(allDistricts, 'full').toUpperCase();
  
  return (
    <Link
      to={`/index/${slugifyParkName(park.name)}`}
      className="block p-4 mb-4 park-list-item bg-card-bg border border-border-color">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="font-serif text-2xl mb-3 text-deep-charcoal font-normal italic">
            {park.name}
          </h3>
          <div className="flex flex-wrap gap-6 mb-4">
            <span className="flex items-center gap-2 font-mono text-xs truncate text-deep-charcoal">
              <Building className="w-4 h-4" /> <span className="truncate">{districtsDisplay}</span>
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-deep-charcoal">
              <Ruler className="w-4 h-4" /> {park.area.toLocaleString()} M²
            </span>
          </div>

          {/* Amenities moved below district and area */}
          <div className="flex flex-wrap gap-2 mt-2">
            {park.amenities.slice(0, 2).map((amenity: string, index: number) => {
              const AmenityIcon = getAmenityIcon(amenity);
              return (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs font-mono flex items-center gap-1 bg-light-sage text-deep-charcoal rounded ${isHighContrast ? 'border border-border-color' : ''}`}>
                  <AmenityIcon className="w-3 h-3" />
                  {amenity}
                </span>
              );
            })}

            {/* Show count of additional amenities if more than 2 */}
            {park.amenities.length > 2 && (
              <span
                className={`px-2 py-1 text-xs font-mono flex items-center bg-soft-cream text-deep-charcoal rounded ${isHighContrast ? 'border border-border-color' : ''}`}>
                +{park.amenities.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleComparison(park.id);
              onToggleCompare?.(park.id);
            }}
            className="p-2 transition-transform"
            style={{
              color: isInComparison(park.id) ? 'var(--primary-green)' : 'var(--deep-charcoal)',
              opacity: isInComparison(park.id) ? 1 : 0.5,
            }}
            aria-label={isInComparison(park.id) ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'}
          >
            <GitCompare
              className="w-5 h-5"
              fill={isInComparison(park.id) ? 'var(--primary-green)' : 'transparent'}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(park.id);
            }}
            className="p-2 transition-transform"
            style={{
              color: isFavorite(park.id) ? 'var(--accent-gold)' : 'var(--primary-green)',
            }}
            aria-label={isFavorite(park.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart
              className="w-6 h-6"
              fill={isFavorite(park.id) ? 'var(--accent-gold)' : 'transparent'}
            />
          </button>
        </div>
      </div>
    </Link>
  );
}
