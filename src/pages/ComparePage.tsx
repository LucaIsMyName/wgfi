import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParksData } from "../hooks/useParksData";
import {
  getComparisonParks,
  removeFromComparison,
  clearComparison,
} from "../utils/comparisonManager";
import { slugifyParkName } from "../data/manualParksData";
import { Building, Ruler, X, Trash2, ArrowLeft } from "lucide-react";
import { getAmenityIcon } from "../utils/amenityIcons";
import STYLE from "../utils/config";
import type { Park } from "../types/park";
import { Button } from "../components/ui/Button";

const ComparePage = () => {
  const { parks } = useParksData();
  const navigate = useNavigate();
  const [comparisonParks, setComparisonParks] = useState<Park[]>([]);

  useEffect(() => {
    const comparisonIds = getComparisonParks();
    const parksToCompare = comparisonIds
      .map((id) => parks.find((p) => p.id === id))
      .filter((p): p is Park => p !== undefined);
    setComparisonParks(parksToCompare);
  }, [parks]);

  const handleRemove = (parkId: string) => {
    removeFromComparison(parkId);
    setComparisonParks((prev) => prev.filter((p) => p.id !== parkId));
  };

  const handleClearAll = () => {
    clearComparison();
    setComparisonParks([]);
  };

  const allAmenities = Array.from(
    new Set(comparisonParks.flatMap((p) => p.amenities || [])),
  ).sort();

  if (comparisonParks.length === 0) {
    return (
      <div className="min-h-screen px-4 lg:px-6 py-6 bg-main-bg">
        <Helmet>
          <title>Wiener Grünflächen Index | Parkvergleich</title>
          <meta
            name="description"
            content="Vergleichen Sie Parks in Wien nebeneinander"
          />
        </Helmet>

        <div className="max-w-3xl">
          <h1
            className={`${STYLE.pageTitle(false)} mb-4 text-primary-green italic`}
          >
            Parkvergleich
          </h1>

          <div className="p-8 border border-border-color bg-card-bg">
            <p className="font-serif text-lg mb-4 text-deep-charcoal">
              Keine Parks zum Vergleichen ausgewählt.
            </p>
            <p className="font-serif text-base mb-6 text-deep-charcoal opacity-70">
              Fügen Sie Parks zum Vergleich hinzu, indem Sie auf den
              Vergleichen-Button auf Parkdetailseiten oder in der Parkliste
              klicken.
            </p>
            <Button to="/index" variant="primary" size="md">
              Zur Parkliste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 lg:px-6 py-6 bg-main-bg">
      <Helmet>
        <title>{`Wiener Grünflächen Index | Parkvergleich (${comparisonParks.length} Parks)`}</title>
        <meta
          name="description"
          content={`Vergleich von ${comparisonParks.map((p) => p.name).join(", ")}`}
        />
      </Helmet>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className={`${STYLE.pageTitle(false)} text-primary-green italic`}>
            Parkvergleich
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              className="sr-only"
            >
              Zurück
            </Button>
            {comparisonParks.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="secondary"
                size="sm"
                icon={Trash2}
                className="w-9 h-9"
              ></Button>
            )}
          </div>
        </div>
        <p className="sr-only font-mono text-xs text-primary-green">
          {comparisonParks.length}{" "}
          {comparisonParks.length === 1 ? "PARK" : "PARKS"} IM VERGLEICH
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible">
        <table className="w-full border-collapse min-w-max">
          <thead className="">
            <tr className="border-b-2 border-primary-green ">
              <th className="text-left py-3 px-4 font-mono text-xs text-primary-green sticky left-0 bg-main-bg z-10">
                EIGENSCHAFT
              </th>
              {comparisonParks.map((park) => (
                <th key={park.id} className="py-3 px-4 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/index/${slugifyParkName(park.name)}`}
                      className="truncate font-serif text-lg italic text-primary-green hover:underline text-left"
                    >
                      {park.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(park.id)}
                      className="p-1 hover:bg-light-sage transition-colors text-copper"
                      aria-label="Entfernen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Bezirk */}
            <tr className="border-b border-border-color">
              <td className="py-3 px-4 font-mono text-xs text-primary-green sticky left-0 bg-main-bg">
                BEZIRK
              </td>
              {comparisonParks.map((park) => (
                <td
                  key={park.id}
                  className="py-3 px-4 font-serif text-sm text-deep-charcoal"
                >
                  {park.district}. Bezirk
                </td>
              ))}
            </tr>

            {/* Fläche */}
            <tr className="border-b border-border-color bg-light-sage bg-opacity-30">
              <td className="py-3 px-4 font-mono text-xs text-primary-green sticky left-0 bg-main-bg">
                FLÄCHE
              </td>
              {comparisonParks.map((park) => (
                <td
                  key={park.id}
                  className="py-3 px-4 font-serif text-sm text-deep-charcoal"
                >
                  {park.area.toLocaleString()} m²
                </td>
              ))}
            </tr>

            {/* Adresse */}
            <tr className="border-b border-border-color">
              <td className="py-3 px-4 font-mono text-xs text-primary-green sticky left-0 bg-main-bg">
                ADRESSE
              </td>
              {comparisonParks.map((park) => (
                <td
                  key={park.id}
                  className="py-3 px-4 font-serif text-sm text-deep-charcoal"
                >
                  {park.address || "Nicht verfügbar"}
                </td>
              ))}
            </tr>

            {/* Kategorie */}
            <tr className="border-b border-border-color bg-light-sage bg-opacity-30">
              <td className="py-3 px-4 font-mono text-xs text-primary-green sticky left-0 bg-main-bg">
                KATEGORIE
              </td>
              {comparisonParks.map((park) => (
                <td
                  key={park.id}
                  className="py-3 px-4 font-serif text-sm text-deep-charcoal"
                >
                  {park.category || "Park"}
                </td>
              ))}
            </tr>

            {/* Amenities Header */}
            <tr className="border-b-2 border-primary-green">
              <td
                colSpan={comparisonParks.length + 1}
                className="py-3 px-4 bg-light-sage font-mono text-xs text-primary-green"
              >
                AUSSTATTUNG
              </td>
            </tr>

            {/* Individual Amenities */}
            {allAmenities.map((amenity, index) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <tr
                  key={amenity}
                  className={`border-b border-border-color ${index % 2 === 0 ? "bg-light-sage bg-opacity-30" : ""}`}
                >
                  <td className="py-3 px-4 sticky left-0 bg-main-bg">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary-green" />
                      <span className="font-mono text-xs text-deep-charcoal">
                        {amenity}
                      </span>
                    </div>
                  </td>
                  {comparisonParks.map((park) => (
                    <td key={park.id} className="py-3 px-4 text-center">
                      {park.amenities?.includes(amenity) ? (
                        <span className="inline-block w-5 h-5 bg-primary-green text-soft-cream flex items-center justify-center text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-block w-5 h-5 bg-border-color opacity-30 flex items-center justify-center text-xs">
                          −
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {comparisonParks.map((park) => (
          <div
            key={park.id}
            className="p-4 border border-border-color bg-card-bg"
          >
            <div className="flex items-start justify-between mb-4">
              <Link
                to={`/index/${slugifyParkName(park.name)}`}
                className="font-serif text-xl italic text-primary-green hover:underline flex-1"
              >
                {park.name}
              </Link>
              <button
                onClick={() => handleRemove(park.id)}
                className="p-2 hover:bg-light-sage transition-colors text-copper ml-2"
                aria-label="Entfernen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary-green" />
                <span className="font-mono text-xs text-deep-charcoal">
                  {park.district}. BEZIRK
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary-green" />
                <span className="font-mono text-xs text-deep-charcoal">
                  {park.area.toLocaleString()} M²
                </span>
              </div>
              {park.amenities && park.amenities.length > 0 && (
                <div className="pt-2 border-t border-border-color">
                  <p className="font-mono text-xs text-primary-green mb-2">
                    AUSSTATTUNG
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {park.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-1 px-2 py-1 bg-light-sage"
                        >
                          <Icon className="w-3 h-3 text-primary-green" />
                          <span className="font-mono text-xs text-deep-charcoal">
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparePage;
