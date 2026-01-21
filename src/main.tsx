import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css' // Import custom fonts first
import 'mapbox-gl/dist/mapbox-gl.css' // Import Mapbox CSS locally
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

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
