import type { Park } from "../types/park";

/**
 * Get district area contributions for a park
 * Returns map of district -> area in square meters
 * Handles parks that span multiple districts via districtAreaSplit
 */
export function getParkDistrictAreaDistribution(park: Park): Map<number, number> {
  const distribution = new Map<number, number>();
  
  // Check for manual area split data (stored in park metadata)
  const areaSplit = (park as any).districtAreaSplit as Record<number, number> | undefined;
  
  if (areaSplit && Object.keys(areaSplit).length > 0) {
    // Calculate total split percentage
    const splitPercentage = Object.values(areaSplit).reduce((sum, pct) => sum + pct, 0);
    const remainingPercentage = Math.max(0, 100 - splitPercentage);
    
    // Primary district gets remaining area
    if (remainingPercentage > 0) {
      distribution.set(park.district, (park.area * remainingPercentage) / 100);
    }
    
    // Secondary districts get their split percentages
    Object.entries(areaSplit).forEach(([district, percentage]) => {
      const distNum = parseInt(district);
      const existing = distribution.get(distNum) || 0;
      distribution.set(distNum, existing + (park.area * percentage) / 100);
    });
  } else {
    // No split - full area in primary district
    distribution.set(park.district, park.area);
  }
  
  return distribution;
}

/**
 * Calculate distribution of amenities across all parks
 * Returns a map of amenity name to count
 */
export function calculateAmenitiesDistribution(parks: Park[]): Map<string, number> {
  const distribution = new Map<string, number>();
  
  parks.forEach((park) => {
    park.amenities.forEach((amenity) => {
      const currentCount = distribution.get(amenity) || 0;
      distribution.set(amenity, currentCount + 1);
    });
  });
  
  return distribution;
}

/**
 * Interface for park size bins
 */
export interface ParkSizeBin {
  range: string;
  min: number; // in square meters
  max: number; // in square meters (Infinity for last bin)
  count: number;
}

/**
 * Bin parks into size categories
 * Returns array of bins with counts
 */
export function binParkSizes(parks: Park[]): ParkSizeBin[] {
  // Define size bins in square meters
  // 1 hectare = 10,000 m²
  const bins: Array<{ range: string; min: number; max: number }> = [
    { range: "< 1 ha", min: 0, max: 10000 },
    { range: "1-5 ha", min: 10000, max: 50000 },
    { range: "5-10 ha", min: 50000, max: 100000 },
    { range: "10-50 ha", min: 100000, max: 500000 },
    { range: "50-100 ha", min: 500000, max: 1000000 },
    { range: "> 100 ha", min: 1000000, max: Infinity },
  ];
  
  const result: ParkSizeBin[] = bins.map((bin) => ({
    ...bin,
    count: 0,
  }));
  
  parks.forEach((park) => {
    const bin = result.find(
      (b) => park.area >= b.min && (b.max === Infinity || park.area < b.max)
    );
    if (bin) {
      bin.count++;
    }
  });
  
  return result;
}

/**
 * Interface for amenity correlation
 */
export interface AmenityCorrelation {
  amenity1: string;
  amenity2: string;
  count: number;
  percentage: number; // Percentage of parks with amenity1 that also have amenity2
}

/**
 * Calculate which amenities appear together most frequently
 * Returns array of correlations sorted by count descending
 */
export function calculateAmenitiesCorrelation(parks: Park[]): AmenityCorrelation[] {
  const correlations: AmenityCorrelation[] = [];
  const amenityCounts = calculateAmenitiesDistribution(parks);
  const allAmenities = Array.from(amenityCounts.keys());
  
  // For each pair of amenities, count how many parks have both
  for (let i = 0; i < allAmenities.length; i++) {
    for (let j = i + 1; j < allAmenities.length; j++) {
      const amenity1 = allAmenities[i];
      const amenity2 = allAmenities[j];
      
      let coOccurrenceCount = 0;
      parks.forEach((park) => {
        if (park.amenities.includes(amenity1) && park.amenities.includes(amenity2)) {
          coOccurrenceCount++;
        }
      });
      
      if (coOccurrenceCount > 0) {
        const amenity1Count = amenityCounts.get(amenity1) || 0;
        const percentage = amenity1Count > 0 ? (coOccurrenceCount / amenity1Count) * 100 : 0;
        
        correlations.push({
          amenity1,
          amenity2,
          count: coOccurrenceCount,
          percentage,
        });
      }
    }
  }
  
  // Sort by count descending, then by percentage descending
  return correlations.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.percentage - a.percentage;
  });
}

/**
 * Interface for district chart data
 */
export interface DistrictChartData {
  district: number;
  parkCount: number;
  totalArea: number;
  coveragePercentage: number;
}

/**
 * Prepare district data for chart visualization
 */
export function prepareDistrictChartData(
  parks: Park[],
  districtAreas: Record<number, number>
): DistrictChartData[] {
  const districtMap = new Map<number, { parkCount: number; totalArea: number }>();
  
  parks.forEach((park) => {
    const areaDistribution = getParkDistrictAreaDistribution(park);
    areaDistribution.forEach((area, district) => {
      const existing = districtMap.get(district) || { parkCount: 0, totalArea: 0 };
      districtMap.set(district, {
        parkCount: existing.parkCount + 1,
        totalArea: existing.totalArea + area,
      });
    });
  });
  
  const result: DistrictChartData[] = Array.from(districtMap.entries()).map(([district, data]) => {
    const districtArea = districtAreas[district] || 1;
    return {
      district,
      parkCount: data.parkCount,
      totalArea: data.totalArea,
      coveragePercentage: (data.totalArea / districtArea) * 100,
    };
  });
  
  // Sort by district number
  return result.sort((a, b) => a.district - b.district);
}

/**
 * Calculate total area per district
 * Returns array of districts with their cumulative area
 */
export interface DistrictAreaData {
  district: number;
  totalArea: number;
  percentage: number;
}

export function calculateDistrictAreaDistribution(parks: Park[]): DistrictAreaData[] {
  const districtMap = new Map<number, number>();
  
  parks.forEach((park) => {
    const areaDistribution = getParkDistrictAreaDistribution(park);
    areaDistribution.forEach((area, district) => {
      const existing = districtMap.get(district) || 0;
      districtMap.set(district, existing + area);
    });
  });
  
  const totalArea = Array.from(districtMap.values()).reduce((sum, area) => sum + area, 0);
  
  const result: DistrictAreaData[] = Array.from(districtMap.entries()).map(([district, area]) => ({
    district,
    totalArea: area,
    percentage: (area / totalArea) * 100,
  }));
  
  // Sort by district number
  return result.sort((a, b) => a.district - b.district);
}

/**
 * Calculate distribution of park categories
 * Returns a map of category name to count
 */
export function calculateCategoryDistribution(parks: Park[]): Map<string, number> {
  const distribution = new Map<string, number>();
  
  parks.forEach((park) => {
    const category = park.category || "Park";
    const currentCount = distribution.get(category) || 0;
    distribution.set(category, currentCount + 1);
  });
  
  return distribution;
}

/**
 * Get top N parks by size (area)
 * Returns array of parks sorted by area descending
 */
export function getTopParksBySize(parks: Park[], limit: number = 10): Park[] {
  return [...parks]
    .sort((a, b) => b.area - a.area)
    .slice(0, limit);
}

/**
 * Interface for amenities per park bins
 */
export interface AmenitiesPerParkBin {
  range: string;
  min: number;
  max: number; // Infinity for last bin
  count: number;
}

/**
 * Bin parks by number of amenities
 * Returns array of bins with counts
 */
export function binAmenitiesPerPark(parks: Park[]): AmenitiesPerParkBin[] {
  const bins: Array<{ range: string; min: number; max: number }> = [
    { range: "0-5", min: 0, max: 5 },
    { range: "6-10", min: 6, max: 10 },
    { range: "11-15", min: 11, max: 15 },
    { range: "16-20", min: 16, max: 20 },
    { range: "21+", min: 21, max: Infinity },
  ];
  
  const result: AmenitiesPerParkBin[] = bins.map((bin) => ({
    ...bin,
    count: 0,
  }));
  
  parks.forEach((park) => {
    const amenityCount = park.amenities.length;
    const bin = result.find(
      (b) => amenityCount >= b.min && (b.max === Infinity || amenityCount <= b.max)
    );
    if (bin) {
      bin.count++;
    }
  });
  
  return result;
}

/**
 * Interface for average park size by district
 */
export interface AverageParkSizeByDistrict {
  district: number;
  avgSize: number;
  parkCount: number;
}

/**
 * Calculate average park size per district
 * Returns array sorted by district number
 */
export function calculateAverageParkSizeByDistrict(parks: Park[]): AverageParkSizeByDistrict[] {
  const districtMap = new Map<number, { totalArea: number; parkCount: number }>();
  
  parks.forEach((park) => {
    const areaDistribution = getParkDistrictAreaDistribution(park);
    areaDistribution.forEach((area, district) => {
      const existing = districtMap.get(district) || { totalArea: 0, parkCount: 0 };
      districtMap.set(district, {
        totalArea: existing.totalArea + area,
        parkCount: existing.parkCount + 1,
      });
    });
  });
  
  const result: AverageParkSizeByDistrict[] = Array.from(districtMap.entries()).map(
    ([district, data]) => ({
      district,
      avgSize: data.totalArea / data.parkCount,
      parkCount: data.parkCount,
    })
  );
  
  // Sort by district number
  return result.sort((a, b) => a.district - b.district);
}
