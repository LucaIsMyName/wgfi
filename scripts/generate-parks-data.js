/**
 * Build-time script to fetch Vienna parks data and generate static TypeScript module
 * This runs during the build process to eliminate runtime API calls
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vienna API configuration
const VIENNA_API_BASE = 'https://data.wien.gv.at/daten/geo';
const VIENNA_ENDPOINT = `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json`;

// CORS proxies for fallback
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

// Output paths
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generatedParks.ts');
const FALLBACK_FILE = path.join(OUTPUT_DIR, 'generatedParks.fallback.ts');

/**
 * Fetch Vienna parks from API
 */
async function fetchViennaParks() {
  console.log('Fetching Vienna parks from API...');
  
  // Try direct fetch first (works in Node.js build environment)
  try {
    console.log('Trying direct API call...');
    const response = await fetch(VIENNA_ENDPOINT, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        console.log(`✓ Direct fetch succeeded: ${data.features.length} parks`);
        return data.features;
      }
    }
  } catch (error) {
    console.log(`✗ Direct fetch failed: ${error.message}`);
  }
  
  // Try CORS proxies as fallback
  for (const proxy of CORS_PROXIES) {
    const proxyUrl = proxy.includes('?url=') 
      ? `${proxy}${encodeURIComponent(VIENNA_ENDPOINT)}`
      : `${proxy}${VIENNA_ENDPOINT}`;
    
    try {
      console.log(`Trying proxy: ${proxy.substring(0, 30)}...`);
      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          console.log(`✓ Proxy succeeded: ${data.features.length} parks`);
          return data.features;
        }
      }
    } catch (error) {
      console.log(`✗ Proxy failed: ${error.message}`);
    }
  }
  
  throw new Error('All fetch attempts failed (direct + proxies)');
}

/**
 * Get district from coordinates
 */
function getDistrictFromCoordinates(coordinates) {
  const { lat, lng } = coordinates;
  
  if (lng > 16.36 && lng < 16.38 && lat > 48.20 && lat < 48.22) return 1;
  if (lng > 16.38 && lng < 16.43 && lat > 48.20 && lat < 48.23) return 2;
  if (lng > 16.38 && lng < 16.41 && lat > 48.18 && lat < 48.21) return 3;
  if (lng > 16.36 && lng < 16.38 && lat > 48.19 && lat < 48.20) return 4;
  if (lng > 16.34 && lng < 16.36 && lat > 48.18 && lat < 48.20) return 5;
  if (lng > 16.34 && lng < 16.36 && lat > 48.19 && lat < 48.20) return 6;
  if (lng > 16.33 && lng < 16.35 && lat > 48.20 && lat < 48.21) return 7;
  if (lng > 16.34 && lng < 16.36 && lat > 48.21 && lat < 48.22) return 8;
  if (lng > 16.35 && lng < 16.37 && lat > 48.22 && lat < 48.23) return 9;
  if (lng > 16.36 && lng < 16.40 && lat > 48.15 && lat < 48.18) return 10;
  if (lng > 16.40 && lng < 16.48 && lat > 48.15 && lat < 48.18) return 11;
  if (lng > 16.31 && lng < 16.34 && lat > 48.16 && lat < 48.18) return 12;
  if (lng > 16.25 && lng < 16.31 && lat > 48.16 && lat < 48.19) return 13;
  if (lng > 16.22 && lng < 16.30 && lat > 48.19 && lat < 48.22) return 14;
  if (lng > 16.31 && lng < 16.34 && lat > 48.19 && lat < 48.20) return 15;
  if (lng > 16.29 && lng < 16.33 && lat > 48.20 && lat < 48.22) return 16;
  if (lng > 16.31 && lng < 16.34 && lat > 48.22 && lat < 48.24) return 17;
  if (lng > 16.33 && lng < 16.36 && lat > 48.22 && lat < 48.24) return 18;
  if (lng > 16.34 && lng < 16.38 && lat > 48.24 && lat < 48.28) return 19;
  if (lng > 16.36 && lng < 16.39 && lat > 48.23 && lat < 48.25) return 20;
  if (lng > 16.38 && lng < 16.45 && lat > 48.25 && lat < 48.32) return 21;
  if (lng > 16.42 && lng < 16.55 && lat > 48.20 && lat < 48.25) return 22;
  if (lng > 16.25 && lng < 16.35 && lat > 48.12 && lat < 48.16) return 23;
  
  return 1;
}

/**
 * Transform Vienna park to app format
 */
function transformViennaPark(viennaPark, manualParksData) {
  const props = viennaPark.properties;
  
  // Extract coordinates
  let coordinates = { lat: 0, lng: 0 };
  if (viennaPark.geometry.type === 'Point') {
    const coords = viennaPark.geometry.coordinates;
    coordinates = { lng: coords[0], lat: coords[1] };
  } else if (viennaPark.geometry.type === 'Polygon') {
    const coords = viennaPark.geometry.coordinates;
    if (coords[0] && coords[0].length > 0) {
      const ring = coords[0];
      const sumLng = ring.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = ring.reduce((sum, coord) => sum + coord[1], 0);
      coordinates = {
        lng: sumLng / ring.length,
        lat: sumLat / ring.length
      };
    }
  }

  const name = props.ANL_NAME || props.PARKNAME || props.NAME || 'Grünfläche';
  const parkId = (props.OBJECTID || props.ID || props.FID || '').toString();
  
  // Slugify for manual data lookup
  const slug = name.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  const manualData = manualParksData[parkId] || manualParksData[slug];
  
  let district = manualData?.district || props.BEZIRK || props.BEZIRKSNUMMER;
  if (!district || district === null) {
    district = getDistrictFromCoordinates(coordinates);
  }
  
  // Parse area - handle null, undefined, and various formats
  let area = 0;
  const flaeche = props.FLAECHE || props.FLAECHE_M2;
  
  if (flaeche === null || flaeche === undefined || flaeche === '') {
    area = 0;
  } else if (typeof flaeche === 'string') {
    const areaMatch = flaeche.match(/([\d.,]+)/);
    if (areaMatch) {
      const cleanedNumber = areaMatch[1].replace(/\./g, '').replace(',', '.');
      area = parseFloat(cleanedNumber) || 0;
    }
  } else if (typeof flaeche === 'number') {
    area = flaeche;
  } else {
    area = parseInt(String(flaeche)) || 0;
  }
  
  const address = manualData?.address || `${name}, ${district}. Bezirk, Wien`;
  const category = props.KATEGORIE || props.TYP || 'Park';
  
  // Parse amenities
  const amenitiesList = [];
  if (props.SPIELEN_IM_PARK === 'Ja') amenitiesList.push('Spielplatz');
  if (props.WASSER_IM_PARK === 'Ja') amenitiesList.push('Wasserspiele');
  if (props.HUNDE_IM_PARK === 'Ja') amenitiesList.push('Hundebereich');
  
  amenitiesList.push('Grünfläche');
  if (name.toLowerCase().includes('spielplatz')) amenitiesList.push('Spielplatz');
  if (name.toLowerCase().includes('park')) amenitiesList.push('Sitzgelegenheiten');
  
  const amenities = amenitiesList.length > 0 ? amenitiesList : ['Grünfläche'];
  
  // Merge with manual amenities - APPEND mode for arrays
  const mergedAmenities = manualData?.amenities 
    ? [...new Set([...amenities, ...manualData.amenities])]
    : amenities;

  // publicTransport - OVERWRITE mode (manual data replaces API data)
  const mergedPublicTransport = manualData?.publicTransport
    ? manualData.publicTransport
    : ['Öffentliche Verkehrsmittel in der Nähe verfügbar'];

  // tips - OVERWRITE mode (manual data replaces API data)
  const mergedTips = manualData?.tips
    ? manualData.tips
    : [];

  const openingHours = props.OEFF_ZEITEN || 'Täglich geöffnet';

  // Ensure area is always a valid number, never null or NaN
  const finalArea = (area && !isNaN(area)) ? Math.round(area) : 0;
  
  const result = {
    id: parkId || Math.random().toString(),
    // OVERWRITE mode for primitives (strings, numbers)
    name: manualData?.name || name,
    address: manualData?.address || address,
    district: manualData?.district || district,
    area: finalArea,
    coordinates,
    amenities: mergedAmenities,
    category,
    description: manualData?.description || category || 'Öffentliche Grünfläche in Wien',
    openingHours: manualData?.openingHours || (openingHours === '0:00-24:00' ? 'Täglich 24h geöffnet' : openingHours),
    website: props.WEBLINK1 || props.WEBLINK || '',
    phone: props.TELEFON || '',
    accessibility: manualData?.accessibility || 'Barrierefreiheit nicht spezifiziert',
    publicTransport: mergedPublicTransport,
    tips: mergedTips,
    // Preserve all raw API metadata for transparency
    rawMetadata: props
  };
  
  if (manualData?.districtAreaSplit) {
    result.districtAreaSplit = manualData.districtAreaSplit;
  }
  
  if (manualData?.links) {
    result.links = manualData.links;
  }
  
  if (manualData?.descriptionLicense) {
    result.descriptionLicense = manualData.descriptionLicense;
  }
  
  return result;
}

/**
 * Extract a balanced object from content starting at a position
 */
function extractBalancedObject(content, startPos) {
  let braceCount = 0;
  let inString = false;
  let stringChar = null;
  let escaped = false;
  
  for (let i = startPos; i < content.length; i++) {
    const char = content[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if ((char === '"' || char === "'" || char === '`') && !inString) {
      inString = true;
      stringChar = char;
      continue;
    }
    
    if (char === stringChar && inString) {
      inString = false;
      stringChar = null;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') braceCount++;
    if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        return content.substring(startPos, i + 1);
      }
    }
  }
  
  return null;
}

/**
 * Load manual parks data using getManualOnlyParks function from the source
 */
async function loadManualParksData() {
  try {
    const manualDataPath = path.join(__dirname, '../src/data/manualParksData.ts');
    const content = fs.readFileSync(manualDataPath, 'utf-8');
    
    console.log('✓ Manual parks data file found, extracting full parks...');
    
    const fullParks = [];
    const enrichmentDataMap = {};
    
    // Find manualParksDB object
    const dbStart = content.indexOf('export const manualParksDB');
    if (dbStart === -1) {
      console.log('⚠ Could not find manualParksDB export');
      return { enrichmentData: {}, fullParks: [] };
    }
    
    // Find all park entries by looking for key: { pattern
    const parkKeyPattern = /\n\s*["']?([a-z0-9-]+)["']?\s*:\s*\{/g;
    let match;
    
    while ((match = parkKeyPattern.exec(content)) !== null) {
      const key = match[1];
      const objectStart = match.index + match[0].indexOf('{');
      
      // Extract the full object using brace counting
      const parkObject = extractBalancedObject(content, objectStart);
      
      if (!parkObject) continue;
      
      // Check if it's a full park (check both quoted and unquoted versions)
      const isFullPark = /["']?isFullPark["']?\s*:\s*true/.test(parkObject);
      
      if (isFullPark) {
        // Extract required fields
        const nameMatch = parkObject.match(/["']?name["']?\s*:\s*["']([^"']+)["']/);
        const districtMatch = parkObject.match(/["']?district["']?\s*:\s*(\d+)/);
        
        // Extract area - match until comma (end of property) or closing brace
        // This handles complex expressions like (9.5e+7 - (1920000 + 2.45e+7))
        const areaMatch = parkObject.match(/["']?area["']?\s*:\s*([^,}]+?)(?:,|\s*\/\/)/);
        
        // Extract coordinates
        const latMatch = parkObject.match(/["']?lat["']?\s*:\s*([\d.]+)/);
        const lngMatch = parkObject.match(/["']?lng["']?\s*:\s*([\d.]+)/);
        
        if (nameMatch && districtMatch && areaMatch && latMatch && lngMatch) {
          // Evaluate area expression if it contains operators
          let area = areaMatch[1].trim();
          
          // Always try to evaluate as it might be a complex expression
          try {
            // Use eval for mathematical expressions
            area = eval(area);
          } catch {
            // If eval fails, try to parse as float
            area = parseFloat(area) || 0;
          }
          
          // Extract amenities array if present
          const amenitiesMatch = parkObject.match(/["']?amenities["']?\s*:\s*\[([^\]]+)\]/);
          let amenities = ['Grünfläche']; // Default
          if (amenitiesMatch) {
            // Parse the amenities array
            const amenitiesStr = amenitiesMatch[1];
            amenities = amenitiesStr
              .split(',')
              .map(a => a.trim().replace(/^["']|["']$/g, ''))
              .filter(a => a.length > 0);
          }
          
          // Extract districtAreaSplit if present
          const districtSplitMatch = parkObject.match(/["']?districtAreaSplit["']?\s*:\s*\{([^}]+)\}/);
          let districtAreaSplit = null;
          if (districtSplitMatch) {
            try {
              // Parse the district split object
              const splitStr = districtSplitMatch[1];
              const splitObj = {};
              // Match patterns like: 13: 10, 14: 35, etc.
              const pairPattern = /(\d+)\s*:\s*([\d.]+)/g;
              let pairMatch;
              while ((pairMatch = pairPattern.exec(splitStr)) !== null) {
                splitObj[parseInt(pairMatch[1])] = parseFloat(pairMatch[2]);
              }
              if (Object.keys(splitObj).length > 0) {
                districtAreaSplit = splitObj;
              }
            } catch (e) {
              console.log(`  ⚠ Could not parse districtAreaSplit for ${key}`);
            }
          }
          
          const parkData = {
            key,
            name: nameMatch[1],
            district: parseInt(districtMatch[1]),
            area: area,
            coordinates: {
              lat: parseFloat(latMatch[1]),
              lng: parseFloat(lngMatch[1])
            },
            amenities: amenities
          };
          
          // Add districtAreaSplit if present
          if (districtAreaSplit) {
            parkData.districtAreaSplit = districtAreaSplit;
          }
          
          fullParks.push(parkData);
        }
      } else {
        // This is an enrichment park (not isFullPark)
        // Extract all available fields for merging with API data
        const enrichmentData = {};
        
        // Extract simple fields
        const nameMatch = parkObject.match(/["']?name["']?\s*:\s*["']([^"']+)["']/);
        if (nameMatch) enrichmentData.name = nameMatch[1];
        
        const descriptionMatch = parkObject.match(/["']?description["']?\s*:\s*["']([^"']+)["']/);
        if (descriptionMatch) enrichmentData.description = descriptionMatch[1];
        
        const descLicenseMatch = parkObject.match(/["']?descriptionLicense["']?\s*:\s*["']([^"']+)["']/);
        if (descLicenseMatch) enrichmentData.descriptionLicense = descLicenseMatch[1];
        
        const addressMatch = parkObject.match(/["']?address["']?\s*:\s*["']([^"']+)["']/);
        if (addressMatch) enrichmentData.address = addressMatch[1];
        
        const accessibilityMatch = parkObject.match(/["']?accessibility["']?\s*:\s*["']([^"']+)["']/);
        if (accessibilityMatch) enrichmentData.accessibility = accessibilityMatch[1];
        
        const openingHoursMatch = parkObject.match(/["']?openingHours["']?\s*:\s*["']([^"']+)["']/);
        if (openingHoursMatch) enrichmentData.openingHours = openingHoursMatch[1];
        
        // Extract arrays (publicTransport, amenities, tips)
        const publicTransportMatch = parkObject.match(/["']?publicTransport["']?\s*:\s*\[([^\]]+)\]/);
        if (publicTransportMatch) {
          enrichmentData.publicTransport = publicTransportMatch[1]
            .split(',')
            .map(a => a.trim().replace(/^["']|["']$/g, ''))
            .filter(a => a.length > 0);
        }
        
        const amenitiesMatch = parkObject.match(/["']?amenities["']?\s*:\s*\[([^\]]+)\]/);
        if (amenitiesMatch) {
          enrichmentData.amenities = amenitiesMatch[1]
            .split(',')
            .map(a => a.trim().replace(/^["']|["']$/g, ''))
            .filter(a => a.length > 0);
        }
        
        const tipsMatch = parkObject.match(/["']?tips["']?\s*:\s*\[([^\]]+)\]/);
        if (tipsMatch) {
          enrichmentData.tips = tipsMatch[1]
            .split(',')
            .map(a => a.trim().replace(/^["']|["']$/g, ''))
            .filter(a => a.length > 0);
        }
        
        // Extract links array (more complex structure)
        const linksMatch = parkObject.match(/["']?links["']?\s*:\s*\[([^\]]+(?:\{[^}]*\}[^\]]*)*)\]/s);
        if (linksMatch) {
          // Store raw links for now - will be parsed if needed
          enrichmentData.hasLinks = true;
        }
        
        // Store enrichment data by key
        enrichmentDataMap[key] = enrichmentData;
      }
    }
    
    console.log(`✓ Found ${fullParks.length} full parks in manual data`);
    console.log(`✓ Found ${Object.keys(enrichmentDataMap).length} enrichment entries`);
    
    return { enrichmentData: enrichmentDataMap, fullParks };
    
  } catch (error) {
    console.log('⚠ Could not load manual parks data:', error.message);
    return { enrichmentData: {}, fullParks: [] };
  }
}

/**
 * Generate TypeScript module with parks data
 */
function generateTypeScriptModule(parks) {
  const timestamp = new Date().toISOString();
  
  const content = `/**
 * Auto-generated parks data - DO NOT EDIT MANUALLY
 * Generated at: ${timestamp}
 * Source: Vienna Open Data API
 * 
 * This file is generated during build time by scripts/generate-parks-data.js
 * To regenerate, run: npm run generate:parks
 */

import type { Park } from '../types/park';

export const PARKS_DATA: Park[] = ${JSON.stringify(parks, null, 2)};

export const PARKS_METADATA = {
  generatedAt: '${timestamp}',
  totalParks: ${parks.length},
  source: 'Vienna Open Data API',
  apiEndpoint: 'ogdwien:PARKINFOOGD'
};
`;

  return content;
}

/**
 * Transform a manual-only park to app format
 */
function transformManualOnlyPark(manualPark) {
  const parkId = `manual-${manualPark.key}`;
  
  // Ensure area is always a valid number
  const area = (manualPark.area && !isNaN(manualPark.area)) ? Math.round(manualPark.area) : 0;
  
  // Use amenities from manual park data, or default to Grünfläche
  const amenities = (manualPark.amenities && manualPark.amenities.length > 0) 
    ? manualPark.amenities 
    : ['Grünfläche'];
  
  const result = {
    id: parkId,
    name: manualPark.name,
    address: `${manualPark.name}, ${manualPark.district}. Bezirk, Wien`,
    district: manualPark.district,
    area: area,
    coordinates: manualPark.coordinates,
    amenities: amenities,
    category: 'Park',
    description: `${manualPark.name} im ${manualPark.district}. Bezirk`,
    openingHours: 'Täglich geöffnet',
    website: '',
    phone: '',
    accessibility: 'Barrierefreiheit nicht spezifiziert',
    publicTransport: ['Öffentliche Verkehrsmittel in der Nähe verfügbar'],
    tips: []
  };
  
  // Add districtAreaSplit if present
  if (manualPark.districtAreaSplit) {
    result.districtAreaSplit = manualPark.districtAreaSplit;
  }
  
  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Generating static parks data for build...');
  console.log('='.repeat(60));
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Load manual parks data
    const { enrichmentData, fullParks } = await loadManualParksData();
    
    // Fetch parks from Vienna API
    const viennaParks = await fetchViennaParks();
    
    // Transform parks
    console.log('Transforming parks data...');
    const transformedParks = viennaParks.map(park => transformViennaPark(park, enrichmentData));
    
    console.log(`✓ Transformed ${transformedParks.length} parks from API`);
    
    // Add manual-only parks (full parks not in Vienna API)
    const manualOnlyParks = fullParks.map(transformManualOnlyPark);
    console.log(`✓ Added ${manualOnlyParks.length} manual-only parks`);
    
    // Combine all parks
    const allParks = [...transformedParks, ...manualOnlyParks];
    
    console.log(`✓ Total parks: ${allParks.length} (${transformedParks.length} API + ${manualOnlyParks.length} manual)`);
    
    // Generate TypeScript module
    const tsContent = generateTypeScriptModule(allParks);
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
    console.log(`✓ Generated: ${OUTPUT_FILE}`);
    
    // Also save as fallback
    fs.writeFileSync(FALLBACK_FILE, tsContent, 'utf-8');
    console.log(`✓ Saved fallback: ${FALLBACK_FILE}`);
    
    console.log('='.repeat(60));
    console.log('✓ Parks data generation complete!');
    console.log(`  Total parks: ${allParks.length}`);
    console.log(`  API parks: ${transformedParks.length}`);
    console.log(`  Manual parks: ${manualOnlyParks.length}`);
    console.log(`  Output: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('='.repeat(60));
    console.error('✗ Error generating parks data:', error.message);
    console.error('='.repeat(60));
    
    // Try to use fallback file if it exists
    if (fs.existsSync(FALLBACK_FILE)) {
      console.log('Using fallback data from previous successful build...');
      const fallbackContent = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      fs.writeFileSync(OUTPUT_FILE, fallbackContent, 'utf-8');
      console.log('✓ Fallback data restored');
      process.exit(0);
    }
    
    console.error('No fallback data available. Build will fail.');
    process.exit(1);
  }
}

main();
