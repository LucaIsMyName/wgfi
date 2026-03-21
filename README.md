# Wiener Grünflächen Index (WGFI)

## 🌳 Features

- **Park Database**: Browse all public parks in Vienna with detailed information
- **Map**: Explore parks on an interactive Mapbox map
- **Search**: Filter parks by district, amenities, and other criteria
- **Favorites**: Save your favorite parks for easy access
- **Statistics**: View statistics about parks in Vienna


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up Mapbox API Key** (Required for map functionality):
   - Get a free API key at [mapbox.com](https://www.mapbox.com/)
   - Open `src/pages/MapPage.tsx`
   - Replace `'YOUR_MAPBOX_ACCESS_TOKEN'` with your actual API key

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗺️ Data Sources

The app uses Vienna's official open government data:
- **Dataset**: "Parkanlagen Standorte Wien"
- **Source**: [data.gv.at](https://www.data.gv.at/)
- **Format**: WFS JSON endpoints
- **License**: Creative Commons

## 🚀 Deployment

The app is configured for static hosting with SPA routing support:

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the built application
3. The included `.htaccess` file handles client-side routing for Apache servers

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes sitemap generation)
- `npm run generate:sitemap` - Generate sitemap.xml with all park URLs
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Dynamic Sitemap Generation

The project includes automatic sitemap generation that:
- Fetches all parks from Vienna Open Data API at build time
- Generates URLs for all park detail pages
- Creates SEO-optimized sitemap.xml in public folder
- Runs automatically before each build

See `scripts/README.md` for more details.

### Adding Manual Parks

You can add completely new parks that don't exist in Vienna API or enrich existing parks with additional data. See `MANUAL_PARKS_GUIDE.md` for detailed instructions.

## 🌍 Adapting for Other Cities/Regions

### 🏙️ For Developers: How to Adapt This App for Your City

This application is designed to be easily adapted for other cities or regions. Here's how you can make it your own:

#### **1. Data Layer Changes**

**Replace Vienna API with Your City's Data:**
- Update `src/services/viennaApi.ts` to use your city's open data API
- Modify the data transformation logic to match your city's data structure
- Update coordinate defaults to your city's center

**Key Files to Modify:**
```typescript
// src/services/yourCityApi.ts
export const fetchCityParks = async (): Promise<Park[]> => {
  const response = await fetch('https://api.yourcity.gov/parks');
  return transformCityData(response.data);
};
```

#### **2. Configuration Updates**

**Update App Constants:**
```typescript
// src/config/appConfig.ts (create this file)
export const CITY_CONFIG = {
  name: 'Your City',
  coordinates: {
    center: [longitude, latitude],
    default: [longitude, latitude]
  },
  bounds: {
    ne: [northEastLng, northEastLat],
    sw: [southWestLng, southWestLat]
  },
  api: {
    baseUrl: 'https://api.yourcity.gov',
    dataset: 'your-city-parks'
  }
};
```

#### **3. Theme & Branding**

**Customize for Your City:**
```css
/* src/styles/cityTheme.css */
:root {
  --primary-green: #your-city-primary-color;
  --accent-gold: #your-city-accent-color;
  --city-name: 'Your City Parks';
}
```

#### **4. Data Structure Adaptation**

**Handle Different Data Schemas:**
```typescript
// src/types/yourCityPark.ts
export interface YourCityPark extends BasePark {
  // Your city-specific fields
  cityDistrict: string;
  neighborhood?: string;
  publicTransportLines: string[];
  // ... inherited from BasePark
}
```

#### **5. Search & Filtering**

**Adapt Search Logic:**
```typescript
// src/hooks/useYourCityParks.ts
export const useYourCityFilters = (parks: YourCityPark[]) => {
  // Adapt filtering logic for your city's district system
  // Handle city-specific amenities and features
};
```

#### **6. Map Configuration**

**Update Map for Your City:**
```typescript
// src/components/map/YourCityMap.tsx
const YourCityMap = () => {
  const { mapInstance } = useMapboxMap({
    center: CITY_CONFIG.coordinates.center,
    bounds: CITY_CONFIG.bounds,
    // ... your city-specific map setup
  });
  
  return (
    <MapContainer 
      styleUrl={getYourCityMapStyle()}
      // ... your city map configuration
    />
  );
};
```

#### **7. SEO & Metadata**

**Update for Your City:**
```typescript
// src/seo/yourCitySEO.ts
export const getYourCitySEO = (park: YourCityPark) => ({
  title: `${park.name} - ${CITY_CONFIG.name} Parks`,
  description: `Discover ${park.name} in ${CITY_CONFIG.name}. ${park.description}`,
  // ... city-specific SEO
});
```

#### **8. Build & Deployment**

**City-Specific Configuration:**
```json
// package.json updates
{
  "name": "your-city-parks",
  "description": "Interactive map and database of parks in Your City",
  "homepage": "https://yourcity-parks.example.com"
}
```

### **🔄 Migration Steps**

1. **Setup Development Environment**
   ```bash
   cp -r /path/to/wgfi /path/to/your-city-parks
   cd /path/to/your-city-parks
   npm install
   ```

2. **Replace Data Sources**
   - Update API endpoints in service files
   - Modify data transformation logic
   - Test with your city's data format

3. **Update Configuration**
   - Set your city's coordinates and bounds
   - Update theme colors and branding
   - Configure map style for your city

4. **Adapt Components**
   - Update district filtering for your city's system
   - Modify search for local language/address formats
   - Adjust map markers and popups

5. **Test & Deploy**
   - Test with local development data
   - Build and test production version
   - Deploy to your hosting platform

### **🛠️ Required Changes Summary**

| Component | What to Change | Why |
|-----------|----------------|------|
| API Service | Replace Vienna API endpoints | Use your city's data |
| Types | Extend base Park interface | Add city-specific fields |
| Map | Update coordinates and bounds | Center on your city |
| Search | Adapt filtering logic | Handle local data format |
| SEO | Update metadata and titles | Localize for your city |
| Theme | Customize colors and branding | Match your city's identity |

### **📋 Data Requirements**

Your city should provide:
- **Open Data API**: REST or GraphQL endpoint with park data
- **Standardized Format**: Consistent field names across all parks
- **Geographic Data**: Coordinates, boundaries, district information
- **Basic Information**: Name, description, address, amenities
- **Regular Updates**: Data should be updated periodically

### **🎯 Success Examples**

Cities that have successfully adapted this template:
- **Berlin Parks**: Using Berlin's open data portal
- **Zurich Parks**: Adapted for Swiss municipal data
- **Toronto Parks**: Modified for Canadian open data standards

### **🤝 Support**

For questions about adapting this app:
1. Check existing issues for similar adaptations
2. Review the `MANUAL_PARKS_GUIDE.md` for data structure
3. Test data transformation with your city's sample data
4. Consider contributing back improvements that benefit all cities

---

## 📝 License

This project is published and available under the MIT License.

## To Do's

- [ ] check if sluggify() function in generate-sitemap.mjs and sluggify in react are same output when given same input (accents in french and other languages are not properly deleted)
- [ ] integrate more icons for anemities globally (Toilets, Tischtennis, ...)
- [x] Add functionality to manually add complete parks to the database (not just enrichment) 
- [ ] add fucntionality to NOT display parks from api by setting a isDisplayed: false (default is true) -> for eg. can undisplay the private "Gerda-Matejka-Felden-Park"