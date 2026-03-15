/**
 * Park Comparison Manager
 * Manages parks selected for comparison
 */

const STORAGE_KEY_COMPARISON = 'wgfi:comparison-parks';
const MAX_COMPARISON_PARKS = 128;

/**
 * Get all parks in comparison
 * @returns Array of park IDs
 */
export function getComparisonParks(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY_COMPARISON);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add a park to comparison
 * @param parkId The ID of the park to add
 * @returns True if added, false if already at max
 */
export function addToComparison(parkId: string): boolean {
  const current = getComparisonParks();
  
  // Don't add if already in comparison
  if (current.includes(parkId)) {
    return true;
  }
  
  // Check if at max
  if (current.length >= MAX_COMPARISON_PARKS) {
    return false;
  }
  
  current.push(parkId);
  localStorage.setItem(STORAGE_KEY_COMPARISON, JSON.stringify(current));
  return true;
}

/**
 * Remove a park from comparison
 * @param parkId The ID of the park to remove
 */
export function removeFromComparison(parkId: string): void {
  const current = getComparisonParks();
  const updated = current.filter(id => id !== parkId);
  localStorage.setItem(STORAGE_KEY_COMPARISON, JSON.stringify(updated));
}

/**
 * Check if a park is in comparison
 * @param parkId The ID of the park to check
 * @returns True if in comparison
 */
export function isInComparison(parkId: string): boolean {
  return getComparisonParks().includes(parkId);
}

/**
 * Clear all parks from comparison
 */
export function clearComparison(): void {
  localStorage.removeItem(STORAGE_KEY_COMPARISON);
}

/**
 * Get count of parks in comparison
 * @returns Number of parks
 */
export function getComparisonCount(): number {
  return getComparisonParks().length;
}

/**
 * Toggle a park's comparison status
 * @param parkId The ID of the park to toggle
 * @returns True if added, false if removed or at max
 */
export function toggleComparison(parkId: string): boolean {
  if (isInComparison(parkId)) {
    removeFromComparison(parkId);
    return false;
  } else {
    return addToComparison(parkId);
  }
}
