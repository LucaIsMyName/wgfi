import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTheme } from '../contexts/ThemeContext';
import { useParksData } from '../hooks/useParksData';
import { useParksFilters } from '../hooks/useParksFilters';
import ParksFilterSidebar from '../components/parks/ParksFilterSidebar';
import MobileFiltersPanel from '../components/parks/MobileFiltersPanel';
import ParksList from '../components/parks/ParksList';
import { toggleFavorite } from '../utils/favoritesManager';

const ParksListPage = () => {
  const { isHighContrast } = useTheme();
  const { parks, availableAmenities, districts } = useParksData();
  
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
    handleNearestSort,
    filteredAndSortedParks,
  } = useParksFilters(parks);

  // Local state to trigger re-renders without unmounting components
  const [, forceUpdate] = useState({});

  // Handle favorite toggle
  const handleToggleFavorite = (parkId: string) => {
    toggleFavorite(parkId);
    forceUpdate({});
  };

  // Clear saved scroll position when filters change
  // This ensures we start at top when list content changes
  useEffect(() => {
    sessionStorage.removeItem('wgfi:parks-list-scroll');
  }, [searchTerm, selectedDistrict, sortOrder, selectedAmenities]);

  return (
    <div
      className="lg:px-6 bg-main-bg h-screen flex flex-col">
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
