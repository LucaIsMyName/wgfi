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
}

/**
 * Park with distance information - used for nearby parks functionality
 */
export interface ParkWithDistance extends Park {
  distance: number;
}
