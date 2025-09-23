import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navigation from './components/Navigation';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const ParksListPage = lazy(() => import('./pages/ParksListPage'));
const ParkDetailPage = lazy(() => import('./pages/ParkDetailPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const IdeaPage = lazy(() => import('./pages/IdeaPage'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen w-full" style={{backgroundColor: 'var(--soft-cream)'}}>
          <Navigation />
          
          {/* Main Content Area */}
          <main className="lg:ml-[clamp(200px,16vw,280px)]" style={{minHeight: 'calc(100vh - 64px)'}}>
            <div className="w-full">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/parks" element={<ParksListPage />} />
                  <Route path="/park/:idOrSlug" element={<ParkDetailPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/idea" element={<IdeaPage />} />
                </Routes>
              </Suspense>
            </div>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App
