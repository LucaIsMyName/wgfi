import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParksData } from "../hooks/useParksData";
import { Heart } from "lucide-react";
import { getFavorites, toggleFavorite } from "../utils/favoritesManager";
import { toggleComparison } from "../utils/comparisonManager";
import STYLE from "../utils/config";
import ParkCard from "../components/parks/ParkCard";
import type { Park } from "../types/park";

const FavoritesPage = () => {
  const { parks } = useParksData();
  const [favoriteParks, setFavoriteParks] = useState<Park[]>([]);

  // Load favorite parks
  useEffect(() => {
    if (parks.length > 0) {
      // Get favorite park IDs from local storage
      const favoriteIds = getFavorites();

      // Filter parks to only include favorites
      const favorites = parks.filter((park: { id: string }) => favoriteIds.includes(park.id));

      setFavoriteParks(favorites);
    }
  }, [parks]);

  const handleToggleFavorite = (parkId: string) => {
    toggleFavorite(parkId);
    setFavoriteParks((prevFavorites) =>
      prevFavorites.filter((park: { id: string }) => park.id !== parkId)
    );
  };

  // Handle toggle compare (for ParkCard compatibility)
  const handleToggleCompare = (parkId: string) => {
    toggleComparison(parkId);
  };


  return (
    <div className="min-h-screen px-4 lg:px-6 bg-main-bg">
      <Helmet>
        <title>Wiener Grünflächen Index | Favoriten</title>
        <meta
          name="description"
          content="Deine gespeicherten Lieblingsparks in Wien. Verwalte deine favorisierten Grünflächen und finde sie schnell wieder."
        />
      </Helmet>
      {/* Header */}
      <div className="pt-6 ">
        <div className="w-full">
          <h1 className={`${STYLE.pageTitle(true)} mb-4 text-primary-green font-normal italic`}>
            Favoriten
          </h1>
          <p className="sr-only font-serif italic text-lg text-deep-charcoal font-normal">
            {favoriteParks.length > 0 ? `${favoriteParks.length} gespeicherte Lieblingsparks` : "Keine Favoriten gespeichert"}
          </p>
        </div>
      </div>

      {/* Parks List */}
      <div className="py-6">
        <div className="w-full mx-auto">
          {favoriteParks.length === 0 ? (
            <div className="py-8 px-6 text-left bg-card-bg rounded-lg">
              <div className="flex items-start gap-4">
                <Heart
                  className="w-12 h-12 flex-shrink-0"
                  stroke="var(--primary-green)"
                />
                <div>
                  <h3 className="font-serif italic text-xl mb-2 text-primary-green">
                    Keine Favoriten gespeichert
                  </h3>
                  <p className="font-serif text-base mb-5 text-deep-charcoal max-w-[500px] leading-relaxed">
                    Du hast noch keine Parks zu deinen Favoriten hinzugefügt. Entdecke Parks in der Übersicht und speichere deine Lieblingsparks für schnellen Zugriff.
                  </p>
                  <Link
                    to="/index"
                    className="px-4 py-2 inline-block font-mono text-xs bg-primary-green text-soft-cream rounded-md">
                    Parks durchstöbern
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteParks.map((park) => (
                <ParkCard
                  key={park.id}
                  park={park}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleCompare={handleToggleCompare}
                  isHighContrast={false}
                  isFavorited={true}
                  showTrashForFavorite={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
