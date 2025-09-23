// Vienna Open Data API Service
// Documentation: https://www.data.gv.at/katalog/dataset/stadt-wien_parkanlageninwien

import { getManualParkData, slugifyParkName } from '../data/manualParksData';

export interface ViennaPark {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  };
  properties: {
    OBJECTID: number;
    PARKNAME: string;
    BEZIRK: number;
    ADRESSE?: string;
    FLAECHE_M2?: number;
    KATEGORIE?: string;
    AUSSTATTUNG?: string;
    OEFFNUNGSZEITEN?: string;
    WEBLINK?: string;
  };
}

export interface ViennaParksResponse {
  type: 'FeatureCollection';
  features: ViennaPark[];
}

import { fetchWithCorsProxy } from '../utils/corsProxy';

// Vienna API base URL
const VIENNA_API_BASE = 'https://data.wien.gv.at/daten/geo';

export const VIENNA_ENDPOINTS = {
  parks: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json`,
  playgrounds: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPIELPLATZOGD&srsName=EPSG:4326&outputFormat=json`,
  trees: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMOGD&srsName=EPSG:4326&outputFormat=json`,
  districts: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json`
};

/**
 * Parse XML response from Vienna API
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseViennaXML(xmlText: string): ViennaPark[] {
  console.log('Parsing XML response...');
  console.log('XML sample (first 500 chars):', xmlText.substring(0, 500));
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Debug: log root element and its children
  console.log('Root element:', xmlDoc.documentElement?.tagName);
  console.log('Root children:', Array.from(xmlDoc.documentElement?.children || []).map(c => c.tagName));
  
  // Try multiple selectors for feature members
  let features = xmlDoc.querySelectorAll('gml\\:featureMember');
  console.log('gml:featureMember found:', features.length);
  
  if (features.length === 0) {
    features = xmlDoc.querySelectorAll('featureMember');
    console.log('featureMember found:', features.length);
  }
  if (features.length === 0) {
    features = xmlDoc.querySelectorAll('wfs\\:member');
    console.log('wfs:member found:', features.length);
  }
  if (features.length === 0) {
    features = xmlDoc.querySelectorAll('member');
    console.log('member found:', features.length);
  }
  
  // Try to find any elements that might contain park data
  if (features.length === 0) {
    const allElements = xmlDoc.querySelectorAll('*');
    console.log('All XML elements:', Array.from(allElements).slice(0, 10).map(e => e.tagName));
    
    // Look for any elements containing "PARK" in the name
    features = xmlDoc.querySelectorAll('*[*|PARKNAME], *[PARKNAME]');
    console.log('Elements with PARKNAME:', features.length);
  }
  
  console.log(`Found ${features.length} features`);
  const parks: ViennaPark[] = [];
  
  features.forEach((feature, index) => {
    // Try multiple selectors for park elements
    let parkElement = feature.querySelector('ogdwien\\:PARKANLAGEOGD');
    if (!parkElement) parkElement = feature.querySelector('PARKANLAGEOGD');
    if (!parkElement) parkElement = feature.children[0]; // Fallback to first child
    
    if (!parkElement) {
      console.log(`No park element found in feature ${index}`);
      return;
    }
    
    console.log(`Processing park element ${index}:`, parkElement.tagName);
    
    // Extract properties with multiple selector attempts
    const getElementText = (selectors: string[]) => {
      for (const selector of selectors) {
        const element = parkElement!.querySelector(selector);
        if (element?.textContent) return element.textContent;
      }
      return '';
    };
    
    const objectId = getElementText(['ogdwien\\:OBJECTID', 'OBJECTID']) || String(index + 1);
    const parkName = getElementText(['ogdwien\\:PARKNAME', 'PARKNAME']) || `Park ${index + 1}`;
    const bezirk = getElementText(['ogdwien\\:BEZIRK', 'BEZIRK']) || '1';
    const adresse = getElementText(['ogdwien\\:ADRESSE', 'ADRESSE']) || 'Wien';
    const flaeche = getElementText(['ogdwien\\:FLAECHE_M2', 'FLAECHE_M2']) || '1000';
    const kategorie = getElementText(['ogdwien\\:KATEGORIE', 'KATEGORIE']) || 'Park';
    const ausstattung = getElementText(['ogdwien\\:AUSSTATTUNG', 'AUSSTATTUNG']) || 'Grünfläche';
    
    // Extract coordinates from geometry with multiple attempts
    let coordinates = { lat: 48.2082 + (Math.random() - 0.5) * 0.1, lng: 16.3738 + (Math.random() - 0.5) * 0.1 };
    
    const posElement = parkElement.querySelector('gml\\:pos') || parkElement.querySelector('pos');
    if (posElement?.textContent) {
      const coords = posElement.textContent.trim().split(/\\s+/);
      if (coords.length >= 2) {
        const lat = parseFloat(coords[1]);
        const lng = parseFloat(coords[0]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = { lat, lng };
        }
      }
    }
    
    const park: ViennaPark = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      properties: {
        OBJECTID: parseInt(objectId) || (index + 1),
        PARKNAME: parkName,
        BEZIRK: parseInt(bezirk) || 1,
        ADRESSE: adresse,
        FLAECHE_M2: parseInt(flaeche) || 1000,
        KATEGORIE: kategorie,
        AUSSTATTUNG: ausstattung,
        OEFFNUNGSZEITEN: '',
        WEBLINK: ''
      }
    };
    
    console.log(`Created park: ${parkName} in district ${bezirk}`);
    parks.push(park);
  });
  
  console.log(`Parsed ${parks.length} parks from XML`);
  return parks;
}

/**
 * Parse CSV response from Vienna API
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseViennaCSV(csvText: string): ViennaPark[] {
  console.log('Parsing CSV response...');
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    console.log('CSV has no data rows');
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('CSV headers:', headers);
  
  const parks: ViennaPark[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < headers.length) continue;
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Extract coordinates - they might be in different column names
    const latCol = headers.find(h => h.toLowerCase().includes('lat') || h.toLowerCase().includes('y'));
    const lngCol = headers.find(h => h.toLowerCase().includes('lon') || h.toLowerCase().includes('lng') || h.toLowerCase().includes('x'));
    
    let coordinates = { lat: 48.2082 + (Math.random() - 0.5) * 0.1, lng: 16.3738 + (Math.random() - 0.5) * 0.1 };
    
    if (latCol && lngCol && row[latCol] && row[lngCol]) {
      const lat = parseFloat(row[latCol]);
      const lng = parseFloat(row[lngCol]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = { lat, lng };
      }
    }
    
    const park: ViennaPark = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      properties: {
        OBJECTID: parseInt(row.OBJECTID || row.FID || i),
        PARKNAME: row.PARKNAME || row.NAME || `Park ${i}`,
        BEZIRK: parseInt(row.BEZIRK || row.DISTRICT || '1'),
        ADRESSE: row.ADRESSE || row.ADDRESS || 'Wien',
        FLAECHE_M2: parseInt(row.FLAECHE_M2 || row.AREA || '1000'),
        KATEGORIE: row.KATEGORIE || row.CATEGORY || 'Park',
        AUSSTATTUNG: row.AUSSTATTUNG || row.FACILITIES || 'Grünfläche',
        OEFFNUNGSZEITEN: row.OEFFNUNGSZEITEN || '',
        WEBLINK: row.WEBLINK || ''
      }
    };
    
    parks.push(park);
  }
  
  console.log(`Parsed ${parks.length} parks from CSV`);
  return parks;
}

/**
 * Try multiple layer names to find working Vienna parks endpoint
 */
async function tryMultipleEndpoints(): Promise<ViennaPark[]> {
  // Use the working endpoint we discovered
  const workingEndpoint = `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json`;
  
  try {
    console.log(`Fetching Vienna parks from: ${workingEndpoint}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Use the CORS proxy to fetch the data
    const response = await fetchWithCorsProxy(workingEndpoint);
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data: ViennaParksResponse = await response.json();
    if (data.features && data.features.length > 0) {
      console.log(`✅ Success! Found ${data.features.length} parks`);
      console.log('Available properties:', Object.keys(data.features[0].properties || {}));
      return data.features;
    }
  } catch (error) {
    console.log(`Vienna API failed:`, error);
  }
  
  // If endpoint fails, return mock data
  console.log('Using mock data as fallback');
  return generateMockViennaParks();
}

/**
 * Generate mock Vienna parks data as fallback
 */
function generateMockViennaParks(): ViennaPark[] {
  const mockParks: ViennaPark[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.3738, 48.2082] },
      properties: {
        OBJECTID: 1,
        PARKNAME: 'Stadtpark',
        BEZIRK: 1,
        ADRESSE: 'Parkring, 1010 Wien',
        FLAECHE_M2: 65000,
        KATEGORIE: 'Stadtpark',
        AUSSTATTUNG: 'Kursalon, Denkmäler, Spielplatz',
        OEFFNUNGSZEITEN: '24h',
        WEBLINK: ''
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.3644, 48.2014] },
      properties: {
        OBJECTID: 2,
        PARKNAME: 'Burggarten',
        BEZIRK: 1,
        ADRESSE: 'Burgring, 1010 Wien',
        FLAECHE_M2: 38000,
        KATEGORIE: 'Schlosspark',
        AUSSTATTUNG: 'Schmetterlingshaus, Palmenhaus',
        OEFFNUNGSZEITEN: '6:00-22:00',
        WEBLINK: ''
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.3586, 48.2066] },
      properties: {
        OBJECTID: 3,
        PARKNAME: 'Volksgarten',
        BEZIRK: 1,
        ADRESSE: 'Burgring, 1010 Wien',
        FLAECHE_M2: 40000,
        KATEGORIE: 'Volksgarten',
        AUSSTATTUNG: 'Rosengarten, Theseus-Tempel',
        OEFFNUNGSZEITEN: '6:00-22:00',
        WEBLINK: ''
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.3947, 48.2318] },
      properties: {
        OBJECTID: 4,
        PARKNAME: 'Augarten',
        BEZIRK: 2,
        ADRESSE: 'Obere Augartenstraße, 1020 Wien',
        FLAECHE_M2: 520000,
        KATEGORIE: 'Barockpark',
        AUSSTATTUNG: 'Porzellanmanufaktur, Flaktürme',
        OEFFNUNGSZEITEN: '6:30-22:00',
        WEBLINK: ''
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [16.3019, 48.1858] },
      properties: {
        OBJECTID: 5,
        PARKNAME: 'Schönbrunner Schlosspark',
        BEZIRK: 13,
        ADRESSE: 'Schönbrunner Schloßstraße, 1130 Wien',
        FLAECHE_M2: 1600000,
        KATEGORIE: 'Schlosspark',
        AUSSTATTUNG: 'Tiergarten, Gloriette, Irrgarten',
        OEFFNUNGSZEITEN: '6:30-17:30',
        WEBLINK: ''
      }
    }
  ];
  
  return mockParks;
}

/**
 * Fetch Vienna parks data from Open Data API
 */
export async function fetchViennaParks(): Promise<ViennaPark[]> {
  try {
    // Try the correct PARKINFOOGD endpoint first
    return await tryMultipleEndpoints();
  } catch (error) {
    console.error('Error fetching Vienna parks data:', error);
    // Return mock data as final fallback
    return generateMockViennaParks();
  }
}

/**
 * Transform Vienna API data to our app format
 */
export function transformViennaPark(viennaPark: ViennaPark) {
  const props = viennaPark.properties;
  
  // Extract coordinates based on geometry type
  let coordinates = { lat: 0, lng: 0 };
  if (viennaPark.geometry.type === 'Point') {
    const coords = viennaPark.geometry.coordinates as number[];
    coordinates = { lng: coords[0], lat: coords[1] };
  } else if (viennaPark.geometry.type === 'Polygon') {
    // For polygons, use centroid of first ring
    const coords = viennaPark.geometry.coordinates as number[][][];
    if (coords[0] && coords[0].length > 0) {
      // Simple centroid calculation
      const ring = coords[0];
      const sumLng = ring.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = ring.reduce((sum, coord) => sum + coord[1], 0);
      coordinates = {
        lng: sumLng / ring.length,
        lat: sumLat / ring.length
      };
    }
  }

  // Handle actual Vienna API field names based on real data
  const propsAny = props as any;
  const name = propsAny.ANL_NAME || props.PARKNAME || propsAny.NAME || 'Grünfläche';
  const parkId = (props.OBJECTID || propsAny.ID || propsAny.FID || '').toString();
  
  // First check if we have manual data for this park
  const slug = slugifyParkName(name);
  const manualData = getManualParkData(parkId) || getManualParkData(slug);
  
  // Use manual district data if available, otherwise try API data
  let district = manualData?.district || props.BEZIRK || propsAny.BEZIRKSNUMMER;
  
  // If still no district, use accurate estimation based on coordinates
  if (!district || district === null) {
    district = getDistrictFromCoordinates(coordinates);
  }
  
  // FLAECHE comes as string like "7.730 m²" - need to parse it correctly for German number format
  // In German, dots are thousand separators and commas are decimal points
  let area = 0;
  const flaeche = propsAny.FLAECHE || props.FLAECHE_M2 || '0';
  if (typeof flaeche === 'string') {
    // Extract just the number part from the string (e.g., "7.730 m²" -> "7.730")
    const areaMatch = flaeche.match(/([\d.,]+)/);
    if (areaMatch) {
      // For German number format: remove dots (thousand separators) and replace commas with dots
      const cleanedNumber = areaMatch[1].replace(/\./g, '').replace(',', '.');
      area = parseFloat(cleanedNumber) || 0;
    }
  } else {
    area = parseInt(flaeche) || 0;
  }
  
  // Use manual address if available, otherwise generate from name and district
  const address = manualData?.address || `${name}, ${district}. Bezirk, Wien`;
  const category = propsAny.KATEGORIE || propsAny.TYP || 'Park';
  
  // Parse amenities from Vienna API specific fields
  const amenitiesList = [];
  if (propsAny.SPIELEN_IM_PARK === 'Ja') amenitiesList.push('Spielplatz');
  if (propsAny.WASSER_IM_PARK === 'Ja') amenitiesList.push('Wasserspiele');
  if (propsAny.HUNDE_IM_PARK === 'Ja') amenitiesList.push('Hundebereich');
  
  // Add basic amenities based on park type
  amenitiesList.push('Grünfläche');
  if (name.toLowerCase().includes('spielplatz')) amenitiesList.push('Spielplatz');
  if (name.toLowerCase().includes('park')) amenitiesList.push('Sitzgelegenheiten');
  
  const amenities = amenitiesList.length > 0 ? amenitiesList : ['Grünfläche'];

  // Merge API data with manual data if available
  const result = {
    id: parkId || Math.random().toString(),
    name: manualData?.name || name,
    address,
    district,
    area: Math.round(area) || 0,
    coordinates,
    amenities: manualData?.amenities || amenities,
    category,
    description: manualData?.description || category || 'Öffentliche Grünfläche in Wien',
    openingHours: formatOpeningHours(propsAny.OEFF_ZEITEN) || 'Täglich geöffnet',
    website: propsAny.WEBLINK1 || props.WEBLINK || '',
    phone: propsAny.TELEFON || '',
    accessibility: manualData?.accessibility || 'Barrierefreiheit nicht spezifiziert',
    publicTransport: manualData?.publicTransport || ['Öffentliche Verkehrsmittel in der Nähe verfügbar'],
    tips: manualData?.tips || []
  };
  
  console.log('Transformed park result:', result);
  return result;
}

/**
 * Get district from coordinates using more accurate boundaries
 */
function getDistrictFromCoordinates(coordinates: { lat: number; lng: number }): number {
  const { lat, lng } = coordinates;
  
  // More accurate district boundaries based on Vienna geography
  // These are simplified polygons for each district
  
  // Inner City (1st District)
  if (lng > 16.36 && lng < 16.38 && lat > 48.20 && lat < 48.22) return 1;
  
  // Leopoldstadt (2nd District)
  if (lng > 16.38 && lng < 16.43 && lat > 48.20 && lat < 48.23) return 2;
  
  // Landstraße (3rd District)
  if (lng > 16.38 && lng < 16.41 && lat > 48.18 && lat < 48.21) return 3;
  
  // Wieden (4th District)
  if (lng > 16.36 && lng < 16.38 && lat > 48.19 && lat < 48.20) return 4;
  
  // Margareten (5th District)
  if (lng > 16.34 && lng < 16.36 && lat > 48.18 && lat < 48.20) return 5;
  
  // Mariahilf (6th District)
  if (lng > 16.34 && lng < 16.36 && lat > 48.19 && lat < 48.20) return 6;
  
  // Neubau (7th District)
  if (lng > 16.33 && lng < 16.35 && lat > 48.20 && lat < 48.21) return 7;
  
  // Josefstadt (8th District)
  if (lng > 16.34 && lng < 16.36 && lat > 48.21 && lat < 48.22) return 8;
  
  // Alsergrund (9th District)
  if (lng > 16.35 && lng < 16.37 && lat > 48.22 && lat < 48.23) return 9;
  
  // Favoriten (10th District)
  if (lng > 16.36 && lng < 16.40 && lat > 48.15 && lat < 48.18) return 10;
  
  // Simmering (11th District)
  if (lng > 16.40 && lng < 16.48 && lat > 48.15 && lat < 48.18) return 11;
  
  // Meidling (12th District)
  if (lng > 16.31 && lng < 16.34 && lat > 48.16 && lat < 48.18) return 12;
  
  // Hietzing (13th District)
  if (lng > 16.25 && lng < 16.31 && lat > 48.16 && lat < 48.19) return 13;
  
  // Penzing (14th District)
  if (lng > 16.22 && lng < 16.30 && lat > 48.19 && lat < 48.22) return 14;
  
  // Rudolfsheim-Fünfhaus (15th District)
  if (lng > 16.31 && lng < 16.34 && lat > 48.19 && lat < 48.20) return 15;
  
  // Ottakring (16th District)
  if (lng > 16.29 && lng < 16.33 && lat > 48.20 && lat < 48.22) return 16;
  
  // Hernals (17th District)
  if (lng > 16.31 && lng < 16.34 && lat > 48.22 && lat < 48.24) return 17;
  
  // Währing (18th District)
  if (lng > 16.33 && lng < 16.36 && lat > 48.22 && lat < 48.24) return 18;
  
  // Döbling (19th District)
  if (lng > 16.34 && lng < 16.38 && lat > 48.24 && lat < 48.28) return 19;
  
  // Brigittenau (20th District)
  if (lng > 16.36 && lng < 16.39 && lat > 48.23 && lat < 48.25) return 20;
  
  // Floridsdorf (21st District)
  if (lng > 16.38 && lng < 16.45 && lat > 48.25 && lat < 48.32) return 21;
  
  // Donaustadt (22nd District)
  if (lng > 16.42 && lng < 16.55 && lat > 48.20 && lat < 48.25) return 22;
  
  // Liesing (23rd District)
  if (lng > 16.25 && lng < 16.35 && lat > 48.12 && lat < 48.16) return 23;
  
  // Default to 1st district if no match
  return 1;
}

/**
 * Format opening hours from Vienna API format
 */
function formatOpeningHours(hours: string): string {
  if (!hours) return 'Täglich geöffnet';
  if (hours === '0:00-24:00') return 'Täglich 24h geöffnet';
  return hours;
}

// Local storage keys
const PARKS_STORAGE_KEY = 'wbi-parks-data';
const PARKS_TIMESTAMP_KEY = 'wbi-parks-timestamp';

// Cache expiration time (7 days in milliseconds)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Fetch and transform all Vienna parks data with local storage caching
 */
export async function getViennaParksForApp() {
  try {
    // Check if we have cached parks data
    const cachedParks = localStorage.getItem(PARKS_STORAGE_KEY);
    const cachedTimestamp = localStorage.getItem(PARKS_TIMESTAMP_KEY);
    
    // If we have cached data and it's not expired, use it
    if (cachedParks && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - timestamp < CACHE_EXPIRATION) {
        console.log('Using cached parks data');
        return JSON.parse(cachedParks);
      }
    }
    
    // If no cache or expired, fetch from API
    console.log('Fetching parks data from API');
    const viennaParks = await fetchViennaParks();
    const transformedParks = viennaParks.map(transformViennaPark);
    
    // Save to local storage
    localStorage.setItem(PARKS_STORAGE_KEY, JSON.stringify(transformedParks));
    localStorage.setItem(PARKS_TIMESTAMP_KEY, Date.now().toString());
    
    return transformedParks;
  } catch (error) {
    console.error('Error fetching Vienna parks:', error);
    
    // If API fetch fails but we have cached data, use it as fallback
    const cachedParks = localStorage.getItem(PARKS_STORAGE_KEY);
    if (cachedParks) {
      console.log('API fetch failed, using cached data as fallback');
      return JSON.parse(cachedParks);
    }
    
    throw error;
  }
}

/**
 * Clear the parks data cache to force a fresh fetch from the API
 */
export function clearParksCache() {
  localStorage.removeItem(PARKS_STORAGE_KEY);
  localStorage.removeItem(PARKS_TIMESTAMP_KEY);
  console.log('Parks cache cleared');
}
