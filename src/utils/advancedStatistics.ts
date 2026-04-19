import type { Park } from "@/types/park";
import { DISTRICT_AREAS as CONST_DISTRICT_AREAS } from "@/constants/districtAreas";
// Vienna district areas in square meters (approximate)
export const DISTRICT_AREAS: Record<number, number> = CONST_DISTRICT_AREAS;

export interface ParkDensityStats {
  district: number;
  parkCount: number;
  totalArea: number;
  districtArea: number;
  parksPerKm2: number;
  greenSpacePercentage: number;
  avgParkSize: number;
}

export interface AmenityDensityStats {
  district: number;
  totalAmenities: number;
  uniqueAmenityTypes: number;
  amenitiesPerKm2: number;
  amenitiesPerPark: number;
  popularAmenities: Array<{ amenity: string; count: number }>;
}

export interface TransportConnectivityStats {
  district: number;
  parksWithTransport: number;
  totalParks: number;
  connectivityPercentage: number;
  avgTransportOptions: number;
  transportTypes: Array<{ type: string; count: number }>;
}

/**
 * Calculate park density statistics for each district
 */
export function calculateParkDensity(parks: Park[]): ParkDensityStats[] {
  const statsMap = new Map<
    number,
    {
      parkCount: number;
      totalArea: number;
    }
  >();

  // Count parks and total area per district
  parks.forEach((park) => {
    const existing = statsMap.get(park.district) || {
      parkCount: 0,
      totalArea: 0,
    };
    statsMap.set(park.district, {
      parkCount: existing.parkCount + 1,
      totalArea: existing.totalArea + park.area,
    });
  });

  // Calculate density metrics
  return Array.from(statsMap.entries())
    .map(([district, data]) => {
      const districtArea = DISTRICT_AREAS[district] || 1;
      const parksPerKm2 = (data.parkCount / districtArea) * 1e6; // Convert to per km²
      const greenSpacePercentage = (data.totalArea / districtArea) * 100;
      const avgParkSize = data.totalArea / data.parkCount;

      return {
        district,
        parkCount: data.parkCount,
        totalArea: data.totalArea,
        districtArea,
        parksPerKm2,
        greenSpacePercentage,
        avgParkSize,
      };
    })
    .sort((a, b) => a.district - b.district);
}

/**
 * Calculate amenity density statistics for each district
 */
export function calculateAmenityDensity(parks: Park[]): AmenityDensityStats[] {
  const statsMap = new Map<
    number,
    {
      totalAmenities: number;
      amenityTypes: Set<string>;
      parkCount: number;
      amenityCounts: Map<string, number>;
    }
  >();

  // Count amenities per district
  parks.forEach((park) => {
    const existing = statsMap.get(park.district) || {
      totalAmenities: 0,
      amenityTypes: new Set(),
      parkCount: 0,
      amenityCounts: new Map(),
    };

    existing.totalAmenities += park.amenities.length;
    existing.parkCount += 1;

    park.amenities.forEach((amenity) => {
      existing.amenityTypes.add(amenity);
      const count = existing.amenityCounts.get(amenity) || 0;
      existing.amenityCounts.set(amenity, count + 1);
    });

    statsMap.set(park.district, existing);
  });

  // Calculate density metrics
  return Array.from(statsMap.entries())
    .map(([district, data]) => {
      const districtArea = DISTRICT_AREAS[district] || 1;
      const amenitiesPerKm2 = (data.totalAmenities / districtArea) * 1e6;
      const amenitiesPerPark = data.totalAmenities / data.parkCount;

      const popularAmenities = Array.from(data.amenityCounts.entries())
        .map(([amenity, count]) => ({ amenity, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        district,
        totalAmenities: data.totalAmenities,
        uniqueAmenityTypes: data.amenityTypes.size,
        amenitiesPerKm2,
        amenitiesPerPark,
        popularAmenities,
      };
    })
    .sort((a, b) => a.district - b.district);
}

/**
 * Calculate transport connectivity statistics for each district
 */
export function calculateTransportConnectivity(
  parks: Park[],
): TransportConnectivityStats[] {
  const statsMap = new Map<
    number,
    {
      parksWithTransport: number;
      totalParks: number;
      transportTypes: Map<string, number>;
    }
  >();

  // Count transport connectivity per district
  parks.forEach((park) => {
    const existing = statsMap.get(park.district) || {
      parksWithTransport: 0,
      totalParks: 0,
      transportTypes: new Map(),
    };

    existing.totalParks += 1;

    if (park.publicTransport && park.publicTransport.length > 0) {
      existing.parksWithTransport += 1;

      park.publicTransport.forEach((transport) => {
        // Extract transport type (U-Bahn, Tram, Bus, etc.)
        const type = transport.split(/\s/)[0]; // Get first word
        const count = existing.transportTypes.get(type) || 0;
        existing.transportTypes.set(type, count + 1);
      });
    }

    statsMap.set(park.district, existing);
  });

  // Calculate connectivity metrics
  return Array.from(statsMap.entries())
    .map(([district, data]) => {
      const connectivityPercentage =
        (data.parksWithTransport / data.totalParks) * 100;
      const avgTransportOptions =
        data.parksWithTransport > 0
          ? Array.from(data.transportTypes.values()).reduce(
              (a, b) => a + b,
              0,
            ) / data.parksWithTransport
          : 0;

      const transportTypes = Array.from(data.transportTypes.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      return {
        district,
        parksWithTransport: data.parksWithTransport,
        totalParks: data.totalParks,
        connectivityPercentage,
        avgTransportOptions,
        transportTypes,
      };
    })
    .sort((a, b) => a.district - b.district);
}

/**
 * Get overall density summary
 */
export function getDensitySummary(parks: Park[]) {
  const parkDensity = calculateParkDensity(parks);
  const amenityDensity = calculateAmenityDensity(parks);
  const transportConnectivity = calculateTransportConnectivity(parks);

  const totalDistrictArea = Object.values(DISTRICT_AREAS).reduce(
    (a, b) => a + b,
    0,
  );
  const totalParks = parks.length;
  const totalArea = parks.reduce((sum, park) => sum + park.area, 0);
  const totalAmenities = parks.reduce(
    (sum, park) => sum + park.amenities.length,
    0,
  );

  return {
    overall: {
      parksPerKm2: (totalParks / totalDistrictArea) * 1e6,
      greenSpacePercentage: (totalArea / totalDistrictArea) * 100,
      amenitiesPerKm2: (totalAmenities / totalDistrictArea) * 1e6,
      amenitiesPerPark: totalAmenities / totalParks,
    },
    topDistricts: {
      densestParks: parkDensity
        .sort((a, b) => b.parksPerKm2 - a.parksPerKm2)
        .slice(0, 3),
      greenest: parkDensity
        .sort((a, b) => b.greenSpacePercentage - a.greenSpacePercentage)
        .slice(0, 3),
      bestAmenities: amenityDensity
        .sort((a, b) => b.amenitiesPerKm2 - a.amenitiesPerKm2)
        .slice(0, 3),
      bestConnectivity: transportConnectivity
        .sort((a, b) => b.connectivityPercentage - a.connectivityPercentage)
        .slice(0, 3),
    },
  };
}
