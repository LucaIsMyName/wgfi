import type { Park } from '../types/park';

export interface SearchResult {
  park: Park;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

export function searchParks(query: string, parks: Park[]): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  parks.forEach((park) => {
    const parkName = park.name.toLowerCase();
    const parkDistrict = park.district.toString();
    const parkAmenities = park.amenities.map(a => a.toLowerCase());
    const parkAddress = park.address?.toLowerCase() || '';

    let score = 0;
    let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';

    if (parkName === normalizedQuery) {
      score = 1000;
      matchType = 'exact';
    } else if (parkName.startsWith(normalizedQuery)) {
      score = 900;
      matchType = 'partial';
    } else if (parkName.includes(normalizedQuery)) {
      score = 800;
      matchType = 'partial';
    } else if (parkDistrict === normalizedQuery) {
      score = 700;
      matchType = 'exact';
    } else if (parkAddress.includes(normalizedQuery)) {
      score = 600;
      matchType = 'partial';
    } else if (parkAmenities.some(amenity => amenity.includes(normalizedQuery))) {
      score = 500;
      matchType = 'partial';
    } else if (fuzzyMatch(parkName, normalizedQuery)) {
      score = 400;
      matchType = 'fuzzy';
    }

    if (score > 0) {
      score += park.area / 10000;
      
      results.push({
        park,
        score,
        matchType,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

function fuzzyMatch(text: string, query: string): boolean {
  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === query.length;
}

export function getTopParksByArea(parks: Park[], count: number = 3): Park[] {
  return [...parks]
    .sort((a, b) => b.area - a.area)
    .slice(0, count);
}

export function formatSearchResult(park: Park): string {
  const district = park.district;
  const area = park.area.toLocaleString();
  return `${park.name} • ${district}. Bezirk • ${area} m²`;
}

export function highlightMatch(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!query.trim()) {
    return [{ text, isMatch: false }];
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return [{ text, isMatch: false }];
  }

  const parts: { text: string; isMatch: boolean }[] = [];
  
  if (index > 0) {
    parts.push({ text: text.slice(0, index), isMatch: false });
  }
  
  parts.push({ text: text.slice(index, index + query.length), isMatch: true });
  
  if (index + query.length < text.length) {
    parts.push({ text: text.slice(index + query.length), isMatch: false });
  }

  return parts;
}
