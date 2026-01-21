import { Link } from "react-router-dom";
import { Building, Ruler, Heart } from "lucide-react";
import { getAmenityIcon } from "../../utils/amenityIcons";
import { isFavorite } from "../../utils/favoritesManager";
import { slugifyParkName } from "../../data/manualParksData";
import { getAllDistrictsForPark, formatDistricts } from "../../utils/parkUtils";
import type { Park } from "../../types/park";

interface ParkCardProps {
  park: Park;
  onToggleFavorite: (parkId: string) => void;
  isHighContrast: boolean;
}

/**
 * ParkCard component - renders an individual park card in the list
 */
export default function ParkCard({ park, onToggleFavorite, isHighContrast }: ParkCardProps) {
  const allDistricts = getAllDistrictsForPark(park);
  const districtsDisplay = formatDistricts(allDistricts, 'full').toUpperCase();
  
  return (
    <Link
      to={`/index/${slugifyParkName(park.name)}`}
      className="block p-4 mb-4 park-list-item"
      style={{
        backgroundColor: "var(--card-bg)",
        border: isHighContrast ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
      }}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="mb-6 md:mb-0">
          <h3
            className="font-serif text-2xl mb-3"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400", fontStyle: "italic" }}>
            {park.name}
          </h3>
          <div className="flex flex-wrap gap-6 mb-4">
            <span
              className="flex items-center gap-2 font-mono text-xs truncate"
              style={{ color: "var(--deep-charcoal)" }}>
              <Building className="w-4 h-4" /> <span className="truncate">{districtsDisplay}</span>
            </span>
            <span
              className="flex items-center gap-2 font-mono text-xs"
              style={{ color: "var(--deep-charcoal)" }}>
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
                  className="px-2 py-1 text-xs font-mono flex items-center gap-1"
                  style={{
                    backgroundColor: "var(--light-sage)",
                    color: "var(--deep-charcoal)",
                    borderRadius: "4px",
                    border: isHighContrast ? "1px solid var(--border-color)" : "none",
                  }}>
                  <AmenityIcon className="w-3 h-3" />
                  {amenity}
                </span>
              );
            })}

            {/* Show count of additional amenities if more than 2 */}
            {park.amenities.length > 2 && (
              <span
                className="px-2 py-1 text-xs font-mono flex items-center"
                style={{
                  backgroundColor: "var(--soft-cream)",
                  color: "var(--deep-charcoal)",
                  borderRadius: "4px",
                  border: isHighContrast ? "1px solid var(--border-color)" : "none",
                }}>
                +{park.amenities.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Favorite button in place of amenities */}
        <div>
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation when clicking the heart
              onToggleFavorite(park.id);
            }}
            className="p-2 transition-transform "
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
