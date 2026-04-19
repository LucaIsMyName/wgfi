/**
 * Favorites Manager for Vienna Parks
 * Handles storing and retrieving favorite parks from local storage
 */

// Local storage key for favorites
const STORAGE_KEY_FAVORITES = 'wgfi:favorite-parks';

// Custom event for favorites changes
export const FAVORITES_CHANGED_EVENT = 'wgfi:favorites-changed';

/**
 * Get all favorite parks from local storage
 * @returns Array of park IDs that are favorites
 */
export function getFavorites(): string[] {
  try {
    const storedFavorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a park is in favorites
 * @param parkId The ID of the park to check
 * @returns True if the park is a favorite, false otherwise
 */
export function isFavorite(parkId: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(parkId);
}

/**
 * Add a park to favorites
 * @param parkId The ID of the park to add to favorites
 */
export function addFavorite(parkId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(parkId)) {
    favorites.push(parkId);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: { parkId, action: 'add' } }));
  }
}

/**
 * Remove a park from favorites
 * @param parkId The ID of the park to remove from favorites
 */
export function removeFavorite(parkId: string): void {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(id => id !== parkId);
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updatedFavorites));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: { parkId, action: 'remove' } }));
}

/**
 * Toggle a park's favorite status
 * @param parkId The ID of the park to toggle
 * @returns The new favorite status (true if added, false if removed)
 */
export function toggleFavorite(parkId: string): boolean {
  if (isFavorite(parkId)) {
    removeFavorite(parkId);
    return false;
  } else {
    addFavorite(parkId);
    return true;
  }
}
