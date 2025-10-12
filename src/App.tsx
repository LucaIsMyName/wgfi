import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const ParksListPage = lazy(() => import('./pages/ParksListPage'));
const ParkDetailPage = lazy(() => import('./pages/ParkDetailPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const IdeaPage = lazy(() => import('./pages/IdeaPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component
const LoadingFallback = () => (
  <div style={{backgroundColor: 'var(--soft-cream)'}} className="flex items-center justify-center h-screen bg-soft-cream w-full">
    {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> */}
  </div>
);

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname.startsWith('/map');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full" style={{backgroundColor: 'var(--soft-cream)'}}>
      <Navigation />
      
      {/* Main Content Area */}
      <main 
        className={isMapPage ? '' : 'lg:ml-[clamp(200px,16vw,280px)]'} 
        style={isMapPage ? {minHeight: '100vh'} : {minHeight: 'calc(100vh - 64px)'}}
      >
        <div className="w-full h-full">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/index" element={<ParksListPage />} />
                <Route path="/index/:idOrSlug" element={<ParkDetailPage />} />
                <Route path="/map/:parkId?" element={<MapPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/idea" element={<IdeaPage />} />
                {/* 404 Route - no path means it matches when no other routes do */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  )
}

export default App
