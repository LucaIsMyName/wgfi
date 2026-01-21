import { 
  Check, 
  PlayCircle, 
  Droplets, 
  TreePine, 
  Armchair, 
  Dog, 
  Utensils, 
  Dumbbell, 
  Bike, 
  Coffee, 
  Baby, 
  Toilet, 
  Flower2, 
  Tent, 
  Umbrella 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Interface for amenity icon mapping
export interface AmenityIcon {
  icon: LucideIcon;
  label: string;
}

// Map of amenity names to their corresponding icons
export const amenityIcons: Record<string, AmenityIcon> = {
  // Common amenities
  'Spielplatz': { icon: PlayCircle, label: 'Spielplatz' },
  'Wasserspiele': { icon: Droplets, label: 'Wasserspiele' },
  'Grünfläche': { icon: TreePine, label: 'Grünfläche' },
  'Sitzgelegenheiten': { icon: Armchair, label: 'Sitzgelegenheiten' },
  'Hundebereich': { icon: Dog, label: 'Hundebereich' },
  'Gastronomie': { icon: Utensils, label: 'Gastronomie' },
  'Sportanlage': { icon: Dumbbell, label: 'Sportanlage' },
  'Radweg': { icon: Bike, label: 'Radweg' },
  'Café': { icon: Coffee, label: 'Café' },
  'Kleinkindbereich': { icon: Baby, label: 'Kleinkindbereich' },
  'WC': { icon: Toilet, label: 'WC' },
  'Blumengarten': { icon: Flower2, label: 'Blumengarten' },
  'Picknickbereich': { icon: Tent, label: 'Picknickbereich' },
  'Schattenplätze': { icon: Umbrella, label: 'Schattenplätze' },
};

/**
 * Get the icon component for a given amenity name
 * @param amenityName The name of the amenity
 * @returns The icon component or Check as fallback
 */
export function getAmenityIcon(amenityName: string): LucideIcon {
  return amenityIcons[amenityName]?.icon || Check;
}

/**
 * Check if an amenity has a specific icon
 * @param amenityName The name of the amenity
 * @returns True if the amenity has a specific icon, false otherwise
 */
export function hasSpecificIcon(amenityName: string): boolean {
  return amenityName in amenityIcons;
}
