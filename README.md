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
- Creates SEO-optimized sitemap.xml in the public folder
- Runs automatically before each build

See `scripts/README.md` for more details.

## 📝 License

This project is published and available under the MIT License.

## To Do's

- [ ] check if sluggify() function in genearte-sitem.mjs and sluggify in react are the same output when given same input (accents in french and other languages are not properly deleted)
- [ ] Make "/statistiken" route prettier in frontend on mobile with all the tables