# Wiener Beserl Park Index (WBI)

A brutalist/art nouveau inspired web application for exploring all parks and green spaces in Vienna, Austria. Built with React, TypeScript, and Tailwind CSS.

## 🌳 Features

- **Comprehensive Park Database**: Browse all public parks in Vienna with detailed information
- **Interactive Map**: Explore parks on an interactive Mapbox map
- **Advanced Search**: Filter parks by district, amenities, and other criteria
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Brutalist Design**: Bold, geometric design with Geist font and green/gold color scheme
- **German Localization**: Full German language interface

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

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router DOM
- **Maps**: Mapbox GL JS
- **Font**: Geist (Google Fonts)
- **Build Tool**: Vite
- **Data Source**: Vienna Open Government Data (data.gv.at)

## 🎨 Design System

### Colors
- **Primary Green**: `#2d5016` (Dark forest green)
- **Light Green**: `#4a7c59` (Hover states)
- **Gold**: `#d4af37` (Accent color)
- **Dark Gold**: `#b8941f` (Hover states)
- **Black**: `#1a1a1a` (Text and borders)
- **White**: `#ffffff` (Backgrounds)
- **Gray**: `#f5f5f5` (Secondary backgrounds)

### Typography
- **Font**: Geist (monospace fallback)
- **Style**: All caps for headings, monospace for consistency
- **Weights**: Regular (400), Bold (700)

### Design Principles
- **No rounded corners**: Everything uses sharp, geometric edges
- **Borders over shadows**: 3px solid borders instead of drop shadows
- **High contrast**: Strong color contrasts for accessibility
- **Brutalist aesthetic**: Bold, functional, uncompromising design

## 📁 Project Structure

```
src/
├── components/
│   └── Navigation.tsx          # Responsive sidebar/mobile menu
├── pages/
│   ├── HomePage.tsx           # Landing page with features
│   ├── ParksListPage.tsx      # Park listing with search/filter
│   ├── ParkDetailPage.tsx     # Individual park details
│   └── MapPage.tsx            # Interactive Mapbox map
├── App.tsx                    # Main app component with routing
├── index.css                  # Global styles and CSS variables
└── main.tsx                   # App entry point
```

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

### Adding New Features

1. Follow the established brutalist design patterns
2. Use the CSS custom properties for colors
3. Maintain German language for all UI text
4. Ensure responsive design works on all screen sizes

## 📝 License

This project is open source and available under the MIT License.

## To Do's

- Make Map Pins correspond with the Parks Area and make the bigger or smaller based on the area of the park
- 