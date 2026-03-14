/**
 * Recently Viewed Parks Manager
 * Tracks and manages recently viewed parks in localStorage
 */

const STORAGE_KEY_RECENT = 'wgfi:recently-viewed';
const MAX_RECENT_PARKS = 10;

export interface RecentPark {
  id: string;
  viewedAt: number; // timestamp
}

/**
 * Get all recently viewed parks
 * @returns Array of recent park objects sorted by most recent first
 */
export function getRecentlyViewed(): RecentPark[] {
  const stored = localStorage.getItem(STORAGE_KEY_RECENT);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add a park to recently viewed
 * @param parkId The ID of the park to add
 */
export function addRecentlyViewed(parkId: string): void {
  let recent = getRecentlyViewed();
  
  // Remove if already exists
  recent = recent.filter(item => item.id !== parkId);
  
  // Add to beginning
  recent.unshift({
    id: parkId,
    viewedAt: Date.now()
  });
  
  // Keep only MAX_RECENT_PARKS
  recent = recent.slice(0, MAX_RECENT_PARKS);
  
  localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent));
}

/**
 * Clear all recently viewed parks
 */
export function clearRecentlyViewed(): void {
  localStorage.removeItem(STORAGE_KEY_RECENT);
}

/**
 * Get recently viewed park IDs only
 * @returns Array of park IDs
 */
export function getRecentlyViewedIds(): string[] {
  return getRecentlyViewed().map(item => item.id);
}
