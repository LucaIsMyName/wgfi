import type { ViennaPark } from "../services/viennaApi";

interface Park {
  id: string;
  name: string;
  district: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
}

function getParkCoordinates(park: Park | ViennaPark): { lat: number; lng: number } {
  if ('coordinates' in park) {
    return park.coordinates;
  } else if ('geometry' in park && 'coordinates' in park.geometry) {
    // Handle ViennaPark type which has geometry.coordinates
    const coords = park.geometry.coordinates;
    
    // Handle the case where coords is a point [number, number]
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return { lng: coords[0], lat: coords[1] };
    }
    
    // Handle the case where coords is a polygon number[][][]
    if (Array.isArray(coords) && coords.length > 0) {
      const firstRing = coords[0];
      if (Array.isArray(firstRing) && firstRing.length > 0) {
        const firstPoint = firstRing[0];
        if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
          return { lng: firstPoint[0], lat: firstPoint[1] };
        }
      }
    }
  }
  throw new Error('Invalid park format: missing coordinates');
}

// Function to calculate distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Function to find the nearest park
export function findNearestPark(
  userLat: number,
  userLng: number,
  parks: (Park | ViennaPark)[]
): Park | null {
  if (!parks.length) return null;

  let nearestPark = parks[0];
  const firstCoords = getParkCoordinates(nearestPark);
  let shortestDistance = getDistanceFromLatLonInKm(
    userLat,
    userLng,
    firstCoords.lat,
    firstCoords.lng
  );

  for (let i = 1; i < parks.length; i++) {
    const park = parks[i];
    const coords = getParkCoordinates(park);
    const distance = getDistanceFromLatLonInKm(
      userLat,
      userLng,
      coords.lat,
      coords.lng
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestPark = park;
    }
  }

  // Ensure we return a Park object with the required properties
  if ('id' in nearestPark) {
    return nearestPark as Park;
  } else {
    // Convert ViennaPark to Park format if needed
    const coords = getParkCoordinates(nearestPark);
    return {
      id: nearestPark.properties.OBJECTID.toString(),
      name: nearestPark.properties.PARKNAME,
      district: nearestPark.properties.BEZIRK,
      coordinates: coords,
      original: nearestPark
    };
  }
}
