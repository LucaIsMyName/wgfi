import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import { CommandPalette } from "./components/CommandPalette";
import Loading from "./components/Loading";

// Lazy load page components
const HomePage = lazy(() => import("./pages/HomePage"));
const ParksListPage = lazy(() => import("./pages/ParksListPage"));
const ParkDetailPage = lazy(() => import("./pages/ParkDetailPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const IdeaPage = lazy(() => import("./pages/IdeaPage"));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage"));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname.startsWith("/map");
  const isParksListPage = location.pathname === "/index";

  // Scroll to top on route change, but preserve scroll for parks list
  useEffect(() => {
    // Don't scroll to top when returning to parks list (scroll restoration handles it)
    if (isParksListPage) return;

    window.scrollTo(0, 0);
  }, [location.pathname, isParksListPage]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "var(--soft-cream)" }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100000] focus:rounded focus:bg-primary-green focus:px-4 focus:py-2 focus:font-serif focus:text-soft-cream focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2"
      >
        Zum Hauptinhalt springen
      </a>
      <Navigation />
      <CommandPalette />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={isMapPage ? "" : "lg:ml-[clamp(200px,16vw,280px)]"}
        style={
          isMapPage
            ? { minHeight: "100vh" }
            : { minHeight: "calc(100vh - 64px)" }
        }
      >
        <div className="w-full h-full">
          <ErrorBoundary>
            <Suspense fallback={<Loading showBackground />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/index" element={<ParksListPage />} />
                <Route path="/index/:idOrSlug" element={<ParkDetailPage />} />
                <Route path="/map/:parkId?" element={<MapPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/idea" element={<IdeaPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />

                {/* German Route Redirects */}
                <Route path="/karte" element={<Navigate to="/map" replace />} />

                <Route
                  path="/liste"
                  element={<Navigate to="/index" replace />}
                />

                <Route
                  path="/statistiken"
                  element={<Navigate to="/statistics" replace />}
                />

                <Route
                  path="/vergleich"
                  element={<Navigate to="/compare" replace />}
                />

                <Route
                  path="/favoriten"
                  element={<Navigate to="/favorites" replace />}
                />

                <Route path="/idee" element={<Navigate to="/idea" replace />} />

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
  );
}

export default App;
