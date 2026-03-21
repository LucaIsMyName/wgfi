/**
 * Shared type definitions for Park data structures
 * This is the single source of truth for Park-related types across the application
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParkLink {
  title: string;
  url: string;
  type?: "official" | "wiki" | "info" | "event";
}

/**
 * Main Park interface - represents a park in the application
 * Consolidates all Park interface definitions from across the codebase
 */
export interface Park {
  id: string;
  name: string;
  district: number;
  address: string;
  area: number;
  coordinates: Coordinates;
  amenities: string[];
  category?: string;
  openingHours?: string;
  website?: string;
  phone?: string;
  description?: string;
  descriptionLicense?: string;
  accessibility?: string;
  publicTransport?: string[];
  tips?: string[];
  links?: ParkLink[];
  isFavorite?: boolean;
  /**
   * Optional district area split for parks spanning multiple districts.
   * Key is district number, value is percentage of park area in that district.
   * Example: { 13: 10, 14: 35, 16: 5 } means 10% in district 13, 35% in district 14, etc.
   */
  districtAreaSplit?: Record<number, number>;
  /**
   * Raw metadata from Vienna Open Data API.
   * Contains all original API fields for transparency and data quality verification.
   * Only available for parks fetched from the API (not manual-only parks).
   */
  rawMetadata?: Record<string, unknown>;
}

/**
 * Park with distance information - used for nearby parks functionality
 */
export interface ParkWithDistance extends Park {
  distance: number;
}
