import type { Park } from "@/types/park";

/**
 * Get all districts for a park (primary district + any districts from districtAreaSplit)
 * Returns sorted array of district numbers
 */
export function getAllDistrictsForPark(park: Park): number[] {
  const districts = new Set<number>([park.district]);
  
  // Check for district area splits
  const areaSplit = park.districtAreaSplit;
  if (areaSplit) {
    Object.keys(areaSplit).forEach(districtStr => {
      const district = parseInt(districtStr, 10);
      if (!isNaN(district)) {
        districts.add(district);
      }
    });
  }
  
  return Array.from(districts).sort((a, b) => a - b);
}

/**
 * Format districts for display (e.g., "2., 22. BEZIRK" or "2. Bezirk")
 * @param districts Array of district numbers
 * @param format 'short' for "2., 22." or 'full' for "2., 22. Bezirk"
 */
export function formatDistricts(districts: number[], format: 'short' | 'full' = 'full'): string {
  if (districts.length === 0) return '';
  if (districts.length === 1) {
    return format === 'short' ? `${districts[0]}.` : `${districts[0]}. Bezirk`;
  }
  
  const formatted = districts.map(d => `${d}.`).join(', ');
  return format === 'short' ? formatted : `${formatted} Bezirk`;
}

/**
 * Get park area distribution across districts
 * Returns a Map of district number to area in that district
 */
export function getParkDistrictAreaDistribution(park: Park): Map<number, number> {
  const distribution = new Map<number, number>();
  
  // If park has explicit district area split, use it
  if (park.districtAreaSplit) {
    Object.entries(park.districtAreaSplit).forEach(([districtStr, area]) => {
      const district = parseInt(districtStr, 10);
      if (!isNaN(district)) {
        distribution.set(district, area);
      }
    });
  } else {
    // Otherwise, assign full area to primary district
    distribution.set(park.district, park.area);
  }
  
  return distribution;
}
