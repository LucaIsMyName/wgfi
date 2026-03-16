import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css' // Import custom fonts first
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css' // Import Mapbox GL CSS
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Set Mapbox access token globally before any React components render
import mapboxgl from 'mapbox-gl'
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

// Enable React Scan only in development mode
if (import.meta.env.DEV) {
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      log: false, // Disable console logs
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
