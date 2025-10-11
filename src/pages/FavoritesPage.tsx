import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getViennaParksForApp } from "../services/viennaApi";
import { slugifyParkName } from "../data/manualParksData";
import { Building, Ruler, AlertTriangle, TreePine, Heart, Trash2 } from "lucide-react";
import { getAmenityIcon } from "../utils/amenityIcons";
import { getFavorites, removeFavorite } from "../utils/favoritesManager";
import STYLE from "../utils/config";
import Loading from "../components/Loading";

interface Park {
  id: string;
  name: string;
  district: number;
  address: string;
  area: number;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  category?: string;
  openingHours?: string;
  website?: string;
}

const FavoritesPage = () => {
  const [favoriteParks, setFavoriteParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorite parks
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);

        // Get all parks
        const allParks = await getViennaParksForApp();

        // Get favorite park IDs from local storage
        const favoriteIds = getFavorites();

        // Filter parks to only include favorites
        const favorites = allParks.filter((park: { id: string }) => favoriteIds.includes(park.id));

        setFavoriteParks(favorites);
        setError(null);
      } catch (err) {
        setError("Fehler beim Laden der Favoriten");
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Handle removing a park from favorites
  const handleRemoveFavorite = (parkId: string) => {
    removeFavorite(parkId);
    setFavoriteParks((prevFavorites) => prevFavorites.filter((park: { id: string }) => park.id !== parkId));
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}>
        <div
          className="p-6"
          style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--main-bg)" }}>
        <div
          className="p-6"
          style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
          <AlertTriangle
            className="w-16 h-16 mb-5"
            stroke="var(--accent-gold)"
          />
          <p
            className="font-serif italic text-lg"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 lg:px-6"
      style={{ background: "var(--main-bg)" }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Favoriten</title>
        <meta
          name="description"
          content="Ihre gespeicherten Lieblingsparks in Wien. Verwalten Sie Ihre favorisierten Grünflächen und finden Sie sie schnell wieder."
        />
      </Helmet>
      {/* Header */}
      <div className="pt-6 ">
        <div className="w-full">
          <h1
            className={`${STYLE.pageTitle} mb-4`}
            style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
            Favoriten
          </h1>
          <p
            className="sr-only font-serif italic text-lg"
            style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
            {favoriteParks.length > 0 ? `${favoriteParks.length} gespeicherte Lieblingsparks` : "Keine Favoriten gespeichert"}
          </p>
        </div>
      </div>

      {/* Parks List */}
      <div className="py-6">
        <div className="w-full mx-auto">
          {favoriteParks.length === 0 ? (
            <div
              className="py-8 px-6 text-left"
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <div className="flex items-start gap-4">
                <Heart
                  className="w-12 h-12 flex-shrink-0"
                  stroke="var(--primary-green)"
                />
                <div>
                  <h3
                    className="font-serif italic text-xl mb-2"
                    style={{ color: "var(--primary-green)", fontWeight: "500" }}>
                    Keine Favoriten gespeichert
                  </h3>
                  <p
                    className="font-serif text-base mb-5"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400", maxWidth: "500px", lineHeight: "1.6" }}>
                    Sie haben noch keine Parks zu Ihren Favoriten hinzugefügt. Entdecken Sie Parks in der Übersicht und speichern Sie Ihre Lieblingsparks für schnellen Zugriff.
                  </p>
                  <Link
                    to="/index"
                    className="px-4 py-2 inline-block font-mono text-xs"
                    style={{
                      backgroundColor: "var(--primary-green)",
                      color: "var(--soft-cream)",
                      borderRadius: "6px",
                    }}>
                    Parks durchstöbern
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteParks.map((park) => (
                <div
                  key={park.id}
                  className="py-4 relative"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderRadius: "8px",
                  }}>
                  <button
                    onClick={() => handleRemoveFavorite(park.id)}
                    className="absolute top-0 bottom-0 right-4 my-auto flex items-center justify-center p-2 rounded-full hover:bg-light-sage transition-colors"
                    style={{ color: "var(--primary-green)" }}
                    aria-label="Aus Favoriten entfernen">
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <Link
                    to={`/index/${slugifyParkName(park.name)}`}
                    className="block">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3
                          className="font-serif text-2xl mb-3"
                          style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
                          {park.name}
                        </h3>
                        <div className="flex flex-wrap gap-6 text-body">
                          <span
                            className="flex items-center gap-2 font-mono text-xs"
                            style={{ color: "var(--primary-green)" }}>
                            <Building className="w-4 h-4" /> {park.district}. BEZIRK
                          </span>
                          <span
                            className="flex items-center gap-2 font-mono text-xs"
                            style={{ color: "var(--deep-charcoal)" }}>
                            <Ruler className="w-4 h-4" /> {park.area.toLocaleString()} M²
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
