/**
 * Vienna district areas in square meters (approximate)
 * Source: Vienna Open Data
 */

export const DISTRICT_AREAS: Record<number, number> = {
  1: 3.0e6,
  2: 19.2e6,
  3: 7.4e6,
  4: 1.8e6,
  5: 2.2e6,
  6: 1.5e6,
  7: 2.1e6,
  8: 1.1e6,
  9: 1.6e6,
  10: 31.8e6,
  11: 23.7e6,
  12: 8.2e6,
  13: 37.7e6,
  14: 33.8e6,
  15: 3.8e6,
  16: 7.3e6,
  17: 11.3e6,
  18: 6.3e6,
  19: 24.9e6,
  20: 5.6e6,
  21: 44.5e6,
  22: 102.2e6,
  23: 32.0e6,
};

export const VIENNA_TOTAL_AREA: number = Object.values(DISTRICT_AREAS).reduce(
  (a, b) => a + b,
  0,
);

// Area conversion constants
export const SQUARE_METERS_TO_HECTARES = 1e4;
export const SQUARE_METERS_TO_SQUARE_KILOMETERS = 1e6;

// Chart constants
export const CHART_MARGINS = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 80,
} as const;

export const CHART_DEFAULT_HEIGHT = 400;
export const CHART_DEFAULT_WIDTH = 400;
export const LARGE_CHART_HEIGHT = 600;
export const LARGE_CHART_WIDTH = 800;

// Pagination constants
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

// Location constants
export const DEFAULT_ZOOM = 12;
export const VIENNA_CENTER = {
  lat: 48.2082,
  lng: 16.3738,
} as const;

// Animation constants
export const ANIMATION_DURATION = 300;
export const DEBOUNCE_DELAY = 200;
