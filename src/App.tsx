import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async';
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import ParksListPage from './pages/ParksListPage'
import ParkDetailPage from './pages/ParkDetailPage'
import MapPage from './pages/MapPage'
import FavoritesPage from './pages/FavoritesPage'
import IdeaPage from './pages/IdeaPage'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen w-full" style={{backgroundColor: 'var(--soft-cream)'}}>
          <Navigation />
          
          {/* Main Content Area */}
          <main className="lg:ml-[clamp(200px,16vw,280px)]" style={{minHeight: 'calc(100vh - 64px)'}}>
            <div className="w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/parks" element={<ParksListPage />} />
                <Route path="/park/:idOrSlug" element={<ParkDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/idea" element={<IdeaPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App
