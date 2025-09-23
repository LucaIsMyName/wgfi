/**
 * Manual database for enriching Vienna parks data
 * 
 * This file contains additional information about parks that may be missing from the API
 * or needs manual correction. Data is indexed by either park ID or slug.
 */

export interface ManualParkData {
  id?: string;
  slug?: string;
  name?: string;
  district?: number;
  address?: string;
  amenities?: string[];
  description?: string;
  publicTransport?: string[];
  accessibility?: string;
  tips?: string[];
  links?: Array<{
    title: string;
    url: string;
    type?: 'official' | 'wiki' | 'info' | 'event';
  }>;
}

/**
 * Manual database of park information
 * Keys can be either park IDs or slugs
 */
export const manualParksDB: Record<string, ManualParkData> = {
  // By ID
  
  "stadtpark": {
    name: "Stadtpark",
    district: 1,
    address: "Parkring, 1010 Wien",
    amenities: ["Teich", "Denkmäler", "Kinderspielplatz", "Café"],
    description: "Der Wiener Stadtpark erstreckt sich vom Parkring im 1. Wiener Gemeindebezirk bis zum Heumarkt im 3. Wiener Gemeindebezirk.",
    publicTransport: ["U4 Stadtpark", "Straßenbahn D, 71"],
    accessibility: "Gut zugänglich, größtenteils ebene Wege",
    tips: ["Johann-Strauss-Denkmal"],
    links: [
      {
        title: "Stadtpark auf Wikipedia",
        url: "https://de.wikipedia.org/wiki/Wiener_Stadtpark",
        type: "wiki"
      },
      {
        title: "Offizielle Seite der Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/stadtpark.html",
        type: "official"
      }
    ]
  },
  "augarten": {
    name: "Augarten",
    district: 2,
    address: "Obere Augartenstraße, 1020 Wien",
    amenities: ["Barockgarten", "Porzellanmanufaktur", "Flaktürme", "Spielplatz", "Sportanlagen"],
    description: "Der Augarten ist der älteste Barockgarten Wiens und wurde 1712 für die Öffentlichkeit zugänglich gemacht. Neben der historischen Porzellanmanufaktur beherbergt der Park auch die markanten Flaktürme aus dem Zweiten Weltkrieg.",
    publicTransport: ["U2 Taborstraße", "Straßenbahn 5, 31"],
    accessibility: "Größtenteils barrierefrei zugänglich"
  },
  "tuerkenschanzpark": {
    district: 18,
    address: "Türkenschanzstraße, 1190 Wien",
    amenities: ["Grünfläche", "Sitzgelegenheiten", "Schatten", "Teich"],
    description: "Der Türkenschanzpark ist eine Parkanlage im 18. Wiener Gemeindebezirk Währing. Der Park wurde 1888 auf der Türkenschanze eröffnet.",
    publicTransport: ["Straßenbahn 9", "S45"]
  },
  "prater-jesuitenwiese": {
    district: 2,
    address: "Jesuitenwiese - Prater, 1020 Wien",
    amenities: ["Grünfläche", "Sitzgelegenheiten", "Schatten"],
    publicTransport: ["U2 Messe-Prater"],
    tips: ["Volksstimme-Fest am letzten Wochenende in den Sommerferien"]
  },
  "donaupark": {
    name: "Donaupark",
    district: 22,
    address: "Donaupark, 1220 Wien",
    amenities: ["Grünfläche", "Sitzgelegenheiten", "Schatten", "Teich"],
    publicTransport: ["U1 VIC/UNO City"]
  },
  "kurpark-oberlaa": {
    district: 10,
    address: "Kurpark Oberlaa, 1100 Wien",
    amenities: ["Grünfläche", "Sitzgelegenheiten", "Schatten", "Teich"],
    publicTransport: ["U1 Oberlaa"],
    description: "Der Kurpark Oberlaa ist eine Parkanlage im 10. Wiener Gemeindebezirk Favoriten, am Südosthang des Laaer Berges bei Oberlaa. Seine Fläche beträgt rund 608.000 m². Gartenbaudenkmale, Wegsysteme und künstliche Bodenformationen stehen unter Denkmalschutz."
  },
};

/**
 * Generate a slug from a park name
 * @param name Park name
 * @returns Slugified name
 */
export function slugifyParkName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get manual data for a park by ID or slug
 * @param idOrSlug Park ID or slug
 * @returns Manual park data if available
 */
export function getManualParkData(idOrSlug: string): ManualParkData | undefined {
  // Try direct lookup first
  if (manualParksDB[idOrSlug]) {
    return manualParksDB[idOrSlug];
  }
  
  // If not found and could be a slug, try to normalize it
  const normalizedSlug = slugifyParkName(idOrSlug);
  return manualParksDB[normalizedSlug];
}
