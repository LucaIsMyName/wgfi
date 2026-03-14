/**
 * Share utilities using Web Share API
 */

import type { Park } from '../types/park';

/**
 * Check if Web Share API is available
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share a park using the Web Share API
 * @param park The park to share
 * @param url Optional custom URL (defaults to current page)
 */
export async function sharePark(park: Park, url?: string): Promise<boolean> {
  if (!canShare()) {
    // Fallback: copy to clipboard
    const shareUrl = url || window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  try {
    await navigator.share({
      title: `${park.name} - Wiener Grünflächen Index`,
      text: `Entdecke ${park.name} im ${park.district}. Bezirk - ${park.area.toLocaleString()} m² Grünfläche in Wien`,
      url: url || window.location.href,
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    if ((err as Error).name !== 'AbortError') {
      console.error('Share failed:', err);
    }
    return false;
  }
}

/**
 * Copy URL to clipboard
 * @param url The URL to copy
 */
export async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Share comparison URL
 * @param parkIds Array of park IDs in comparison
 */
export async function shareComparison(parkIds: string[]): Promise<boolean> {
  const params = new URLSearchParams();
  parkIds.forEach(id => params.append('park', id));
  const shareUrl = `${window.location.origin}/compare?${params.toString()}`;
  
  if (!canShare()) {
    return copyToClipboard(shareUrl);
  }

  try {
    await navigator.share({
      title: 'Parkvergleich - Wiener Grünflächen Index',
      text: `Vergleiche ${parkIds.length} Parks in Wien`,
      url: shareUrl,
    });
    return true;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Share failed:', err);
    }
    return false;
  }
}
