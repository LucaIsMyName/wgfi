import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTheme } from '../contexts/ThemeContext';
import { useParksData } from '../hooks/useParksData';
import { useParksFilters } from '../hooks/useParksFilters';
import ParksFilterSidebar from '../components/parks/ParksFilterSidebar';
import MobileFiltersPanel from '../components/parks/MobileFiltersPanel';
import ParksList from '../components/parks/ParksList';
import { toggleFavorite } from '../utils/favoritesManager';
import { toggleComparison } from '../utils/comparisonManager';
import type { Park } from '../types/park';

const ParksListPage = () => {
  const { isHighContrast } = useTheme();
  const { parks, loading, error, availableAmenities, districts } = useParksData();
  
  const {
    searchTerm,
    selectedDistrict,
    sortOrder,
    selectedAmenities,
    userLocation,
    locationPermission,
    updateSearchTerm,
    updateSelectedDistrict,
    updateSortOrder,
    updateSelectedAmenities,
    resetAllFilters,
    requestLocationPermission,
    handleNearestSort,
    filteredAndSortedParks,
  } = useParksFilters(parks);

  // Force re-render when favorites or comparison change
  const [refreshKey, setRefreshKey] = useState(0);

  // Using the favoritesManager utility for favorites functionality
  const handleToggleFavorite = (parkId: string) => {
    toggleFavorite(parkId);
    setRefreshKey(prev => prev + 1);
  };

  // Handle comparison toggle
  const handleToggleCompare = (parkId: string) => {
    setRefreshKey(prev => prev + 1);
  };

  // Clear saved scroll position when filters change
  // This ensures we start at top when list content changes
  useEffect(() => {
    sessionStorage.removeItem('wgfi:parks-list-scroll');
  }, [searchTerm, selectedDistrict, sortOrder, selectedAmenities]);

  return (
    <div
      className="lg:px-6 bg-main-bg h-screen flex flex-col"
      key={refreshKey}>
      <Helmet>
        <title>Wiener Grünflächen Index | Alle Parks</title>
        <meta
          name="description"
          content={`Entdecken Sie ${filteredAndSortedParks.length} Parks in Wien mit detaillierten Informationen zu Lage, Ausstattung und Größe.`}
        />
      </Helmet>
      {/* Screen reader only H1 for both mobile and desktop */}
      <h1 className="sr-only">Index - Wiener Grünflächen</h1>

      {/* Main Content with Sidebar Layout */}
      <div className="px-0 lg:px-0 flex-1 overflow-hidden h-full">
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Desktop Sidebar for Search and Filters */}
          <ParksFilterSidebar
            searchTerm={searchTerm}
            selectedDistrict={selectedDistrict}
            selectedAmenities={selectedAmenities}
            sortOrder={sortOrder}
            availableAmenities={availableAmenities}
            districts={districts}
            locationPermission={locationPermission}
            userLocation={userLocation}
            onSearchChange={updateSearchTerm}
            onDistrictChange={updateSelectedDistrict}
            onAmenitiesChange={updateSelectedAmenities}
            onSortChange={updateSortOrder}
            onNearestSort={handleNearestSort}
            onResetFilters={resetAllFilters}
            isHighContrast={isHighContrast}
          />

          {/* Parks List - Virtualized */}
          <div className="flex-1 overflow-hidden h-full">
            <ParksList
              parks={filteredAndSortedParks}
              onToggleFavorite={handleToggleFavorite}
              onToggleCompare={handleToggleCompare}
              isHighContrast={isHighContrast}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel - Accordion at Bottom */}
      <MobileFiltersPanel
        searchTerm={searchTerm}
        selectedDistrict={selectedDistrict}
        selectedAmenities={selectedAmenities}
        sortOrder={sortOrder}
        availableAmenities={availableAmenities}
        districts={districts}
        locationPermission={locationPermission}
        onSearchChange={updateSearchTerm}
        onDistrictChange={updateSelectedDistrict}
        onAmenitiesChange={updateSelectedAmenities}
        onSortChange={updateSortOrder}
        onNearestSort={handleNearestSort}
        onResetFilters={resetAllFilters}
        isHighContrast={isHighContrast}
      />
    </div>
  );
};

export default ParksListPage;
