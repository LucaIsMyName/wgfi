/**
 * Simplified Vienna district bounding boxes (lng/lat).
 * Keep in sync with `getDistrictFromCoordinates` in `scripts/generate-parks-data.js` (build-time).
 */
export function getDistrictFromCoordinates(coordinates: {
  lat: number;
  lng: number;
}): number {
  const { lat, lng } = coordinates;

  if (lng > 16.36 && lng < 16.38 && lat > 48.2 && lat < 48.22) return 1;
  if (lng > 16.38 && lng < 16.43 && lat > 48.2 && lat < 48.23) return 2;
  if (lng > 16.38 && lng < 16.41 && lat > 48.18 && lat < 48.21) return 3;
  if (lng > 16.36 && lng < 16.38 && lat > 48.19 && lat < 48.2) return 4;
  if (lng > 16.34 && lng < 16.36 && lat > 48.18 && lat < 48.2) return 5;
  if (lng > 16.34 && lng < 16.36 && lat > 48.19 && lat < 48.2) return 6;
  if (lng > 16.33 && lng < 16.35 && lat > 48.2 && lat < 48.21) return 7;
  if (lng > 16.34 && lng < 16.36 && lat > 48.21 && lat < 48.22) return 8;
  if (lng > 16.35 && lng < 16.37 && lat > 48.22 && lat < 48.23) return 9;
  if (lng > 16.36 && lng < 16.4 && lat > 48.15 && lat < 48.18) return 10;
  if (lng > 16.4 && lng < 16.48 && lat > 48.15 && lat < 48.18) return 11;
  if (lng > 16.31 && lng < 16.34 && lat > 48.16 && lat < 48.18) return 12;
  if (lng > 16.25 && lng < 16.31 && lat > 48.16 && lat < 48.19) return 13;
  if (lng > 16.22 && lng < 16.3 && lat > 48.19 && lat < 48.22) return 14;
  if (lng > 16.31 && lng < 16.34 && lat > 48.19 && lat < 48.2) return 15;
  if (lng > 16.29 && lng < 16.33 && lat > 48.2 && lat < 48.22) return 16;
  if (lng > 16.31 && lng < 16.34 && lat > 48.22 && lat < 48.24) return 17;
  if (lng > 16.33 && lng < 16.36 && lat > 48.22 && lat < 48.24) return 18;
  if (lng > 16.34 && lng < 16.38 && lat > 48.24 && lat < 48.28) return 19;
  if (lng > 16.36 && lng < 16.39 && lat > 48.23 && lat < 48.25) return 20;
  if (lng > 16.38 && lng < 16.45 && lat > 48.25 && lat < 48.32) return 21;
  if (lng > 16.42 && lng < 16.55 && lat > 48.2 && lat < 48.25) return 22;
  if (lng > 16.25 && lng < 16.35 && lat > 48.12 && lat < 48.16) return 23;

  return 1;
}
