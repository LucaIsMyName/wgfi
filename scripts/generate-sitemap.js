import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to slugify park names (same logic as in the app)
function slugifyParkName(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get manual parks from the TypeScript file
function getManualParks() {
  try {
    // Read the manualParksData.ts file
    const manualDataPath = path.join(__dirname, '..', 'src', 'data', 'manualParksData.ts');
    const fileContent = fs.readFileSync(manualDataPath, 'utf-8');
    
    // Extract the manualParksDB object using regex
    // This is a simple parser - looks for the exported object
    const dbMatch = fileContent.match(/export const manualParksDB[^=]*=\s*\{([\s\S]*?)\n\};/);
    
    if (!dbMatch) {
      console.log('⚠️  Could not parse manual parks database');
      return [];
    }
    
    const dbContent = dbMatch[1];
    
    // Improved parsing: Find all park entries with isFullPark: true
    // Split by top-level keys and check each entry
    const manualParks = [];
    
    // Match park key followed by object content, looking for isFullPark: true
    const parkEntryRegex = /(?:^|\n)\s*["']?([a-z0-9-]+)["']?\s*:\s*\{([\s\S]*?)\n\s*\},?(?=\n|$)/gm;
    let match;
    
    while ((match = parkEntryRegex.exec(dbContent)) !== null) {
      const slug = match[1];
      const parkContent = match[2];
      
      // Check if this entry has isFullPark: true
      if (/isFullPark\s*:\s*true/.test(parkContent)) {
        // Extract the name
        const nameMatch = parkContent.match(/name\s*:\s*["']([^"']+)["']/);
        if (nameMatch) {
          manualParks.push({ slug, name: nameMatch[1] });
        }
      }
    }
    
    return manualParks;
  } catch (error) {
    console.error('⚠️  Error reading manual parks:', error.message);
    return [];
  }
}

// Fetch parks data
async function fetchParks() {
  try {
    const response = await fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Check if response is JSON
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      const data = JSON.parse(text);
      return data.features || [];
    } else {
      console.error('Received non-JSON response (likely XML)');
      console.error('Response sample:', text.substring(0, 200));
      return [];
    }
  } catch (error) {
    console.error('Error fetching parks:', error);
    return [];
  }
}

// Generate sitemap XML
async function generateSitemap() {
  console.log('🌳 Fetching parks data...');
  const parks = await fetchParks();
  
  console.log(`✅ Found ${parks.length} API parks`);
  
  // Get manual parks
  console.log('🔍 Checking for manual parks...');
  const manualParks = getManualParks();
  console.log(`✅ Found ${manualParks.length} manual parks`);
  
  const baseUrl = 'https://wgfi.lucamack.at';
  const currentDate = new Date().toISOString();
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/index', priority: '0.9', changefreq: 'daily' },
    { url: '/map', priority: '0.8', changefreq: 'weekly' },
    { url: '/statistics', priority: '0.7', changefreq: 'weekly' },
    { url: '/favorites', priority: '0.6', changefreq: 'monthly' },
    { url: '/idea', priority: '0.5', changefreq: 'monthly' },
  ];
  
  // Generate park URLs from API
  const parkUrls = parks.map((park) => {
    const name = park.properties?.ANL_NAME || park.properties?.PARKNAME || park.properties?.NAME;
    if (!name) return null;
    
    const slug = slugifyParkName(name);
    return {
      url: `/index/${slug}`,
      priority: '0.8',
      changefreq: 'monthly'
    };
  }).filter(Boolean);
  
  // Generate URLs for manual parks
  const manualParkUrls = manualParks.map(park => ({
    url: `/index/${park.slug}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));
  
  // Combine all park URLs
  const allParkUrls = [...parkUrls, ...manualParkUrls];
  
  console.log(`📝 Generating sitemap with ${allParkUrls.length} park URLs (${parkUrls.length} API + ${manualParkUrls.length} manual)...`);
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${allParkUrls.map(park => `  <url>
    <loc>${baseUrl}${park.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${park.changefreq}</changefreq>
    <priority>${park.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  // Write to public folder
  const publicDir = path.join(__dirname, '..', 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${sitemapPath}`);
  console.log(`📊 Total URLs: ${staticPages.length + allParkUrls.length}`);
  console.log(`   - Static pages: ${staticPages.length}`);
  console.log(`   - Park pages: ${allParkUrls.length} (${parkUrls.length} API + ${manualParkUrls.length} manual)`);
}

// Run the script
generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
