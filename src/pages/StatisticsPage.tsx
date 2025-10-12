import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getViennaParksForApp } from "../services/viennaApi";
import { slugifyParkName } from "../data/manualParksData";
import { BarChart3, TrendingUp, MapPin, Sprout, Compass, Ruler } from "lucide-react";
import Loading from "../components/Loading";
import STYLE from "../utils/config";

interface Park {
  id: string;
  name: string;
  district: number;
  address: string;
  area: number;
  coordinates: { lat: number; lng: number };
  amenities: string[];
}

interface DistrictStats {
  district: number;
  totalArea: number;
  parkCount: number;
  percentage: number;
  avgParkSize: number;
}

// Vienna district areas in square meters (approximate)
const DISTRICT_AREAS: Record<number, number> = {
  1: 3.0e6,
  2: 19.2e6,
  3: 7.4e6,
  4: 1.8e6,
  5: 2.2e6,
  6: 1.5e6,
  7: 2.1e6,
  8: 1.1e6,
  9: 1.6e6,
  10: 31.8e6,
  11: 23.7e6,
  12: 8.2e6,
  13: 37.7e6,
  14: 33.8e6,
  15: 3.8e6,
  16: 7.3e6,
  17: 11.3e6,
  18: 6.3e6,
  19: 24.9e6,
  20: 5.6e6,
  21: 44.5e6,
  22: 102.2e6,
  23: 32.0e6,
};

const VIENNA_TOTAL_AREA = (): number => {
  let area = 0;
  for (let i = 1; i <= 23; i++) {
    area += DISTRICT_AREAS[i];
  }
  return area;
}; // Vienna total area in square meters

const StatisticsPage = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [viennaCoverage, setViennaCoverage] = useState(0);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const data = await getViennaParksForApp();
        setParks(data);
        calculateStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parks:", error);
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  const calculateStats = (parkData: Park[]) => {
    // Calculate total park area in Vienna
    const totalParkArea = parkData.reduce((sum, park) => sum + park.area, 0);
    const coverage = (totalParkArea / VIENNA_TOTAL_AREA()) * 100;
    setViennaCoverage(coverage);

    // Calculate stats per district
    const statsMap = new Map<number, { totalArea: number; count: number }>();

    parkData.forEach((park) => {
      const existing = statsMap.get(park.district) || { totalArea: 0, count: 0 };
      statsMap.set(park.district, {
        totalArea: existing.totalArea + park.area,
        count: existing.count + 1,
      });
    });

    const stats: DistrictStats[] = Array.from(statsMap.entries()).map(([district, data]) => {
      const districtArea = DISTRICT_AREAS[district] || 1;
      return {
        district,
        totalArea: data.totalArea,
        parkCount: data.count,
        percentage: (data.totalArea / districtArea) * 100,
        avgParkSize: data.totalArea / data.count,
      };
    });

    setDistrictStats(stats);
  };

  const topDistrictsByPercentage = [...districtStats].sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const topDistrictsByArea = [...districtStats].sort((a, b) => b.totalArea - a.totalArea).slice(0, 5);

  const largestParks = [...parks].sort((a, b) => b.area - a.area).slice(0, 5);

  // Geographical extremes
  const northernmostPark = parks.reduce((max, park) => (park.coordinates.lat > max.coordinates.lat ? park : max), parks[0]);
  const southernmostPark = parks.reduce((min, park) => (park.coordinates.lat < min.coordinates.lat ? park : min), parks[0]);
  const easternmostPark = parks.reduce((max, park) => (park.coordinates.lng > max.coordinates.lng ? park : max), parks[0]);
  const westernmostPark = parks.reduce((min, park) => (park.coordinates.lng < min.coordinates.lng ? park : min), parks[0]);
  
  // Most centered park (closest to geographic center of all parks)
  const centerLat = parks.reduce((sum, park) => sum + park.coordinates.lat, 0) / parks.length;
  const centerLng = parks.reduce((sum, park) => sum + park.coordinates.lng, 0) / parks.length;
  const mostCenteredPark = parks.reduce((closest, park) => {
    const distToCurrent = Math.sqrt(
      Math.pow(park.coordinates.lat - centerLat, 2) + 
      Math.pow(park.coordinates.lng - centerLng, 2)
    );
    const distToClosest = Math.sqrt(
      Math.pow(closest.coordinates.lat - centerLat, 2) + 
      Math.pow(closest.coordinates.lng - centerLng, 2)
    );
    return distToCurrent < distToClosest ? park : closest;
  }, parks[0]);

  // Size extremes
  const smallestPark = parks.reduce((min, park) => (park.area < min.area ? park : min), parks[0]);
  const largestPark = parks.reduce((max, park) => (park.area > max.area ? park : max), parks[0]);
  const sortedByArea = [...parks].sort((a, b) => a.area - b.area);
  const medianPark = sortedByArea.length % 2 === 0
    ? sortedByArea[Math.floor(sortedByArea.length / 2) - 1]
    : sortedByArea[Math.floor(sortedByArea.length / 2)];

  const formatArea = (area: number) => {
    if (area >= 1e6) return `${(area / 1e6).toFixed(2)} km²`;
    if (area >= 1e4) return `${(area / 1e4).toFixed(2)} ha`;
    return `${area.toFixed(0)} m²`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--soft-cream)" }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Statistiken</title>
        <meta
          name="description"
          content="Statistische Auswertungen über Parks und Grünflächen in Wien."
        />
      </Helmet>

      <main className="px-4 lg:px-8 pb-8 lg:pb-12 pt-6">
        {/* Header */}
        <div className="mb-12">
          <h1
            className={`${STYLE.pageTitle} mb-4`}
            style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
            Statistiken
          </h1>
          <p
            className="font-mono text-sm max-w-[65ch]"
            style={{ color: "var(--deep-charcoal)" }}>
            Beachten Sie dass die Daten der Stadt Wien nicht alle Grünflächen ausweisen und eine vollständige Statistik nicht möglich ist. Bundesforste und Bundesgärten werden manuell nach Möglichkeit hinzugefügt.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--light-sage)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-3 mb-2">
              <Sprout
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <p
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                GESAMTABDECKUNG
              </p>
            </div>
            <p
              className="font-serif text-4xl"
              style={{ color: "var(--primary-green)" }}>
              {viennaCoverage.toFixed(2)}%
            </p>
            <p
              className="font-mono text-xs mt-1"
              style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}>
              von Wien sind Parks
            </p>
          </div>

          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--light-sage)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-3 mb-2">
              <MapPin
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <p
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                ANZAHL PARKS
              </p>
            </div>
            <p
              className="font-serif text-4xl"
              style={{ color: "var(--primary-green)" }}>
              {parks.length}
            </p>
            <p
              className="font-mono text-xs mt-1"
              style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}>
              Parks in ganz Wien
            </p>
          </div>

          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--light-sage)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <p
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                GESAMTFLÄCHE
              </p>
            </div>
            <p
              className="font-serif text-4xl"
              style={{ color: "var(--primary-green)" }}>
              {formatArea(parks.reduce((sum, p) => sum + p.area, 0))}
            </p>
            <p
              className="font-mono text-xs mt-1"
              style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}>
              Grünfläche gesamt
            </p>
          </div>

          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--light-sage)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <p
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                Ø GRÖẞE
              </p>
            </div>
            <p
              className="font-serif text-4xl"
              style={{ color: "var(--primary-green)" }}>
              {formatArea(parks.reduce((sum, p) => sum + p.area, 0) / parks.length)}
            </p>
            <p
              className="font-mono text-xs mt-1"
              style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}>
              Durchschnittliche Parkgröße
            </p>
          </div>
        </div>

        {/* District Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Districts by Percentage */}
          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}>
            <h2
              className="font-serif text-2xl mb-6"
              style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
              Top Bezirke (Relativer Anteil)
            </h2>
            <div className="space-y-4">
              {topDistrictsByPercentage.map((stat, index) => (
                <div key={stat.district}>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--deep-charcoal)" }}>
                      #{index + 1} · {stat.district}. BEZIRK
                    </span>
                    <span
                      className="font-serif text-lg font-bold"
                      style={{ color: "var(--primary-green)" }}>
                      {stat.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: "var(--light-sage)" }}>
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, stat.percentage)}%`,
                        backgroundColor: "var(--primary-green)",
                      }}
                    />
                  </div>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {stat.parkCount} Parks · {formatArea(stat.totalArea)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Districts by Absolute Area */}
          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}>
            <h2
              className="font-serif text-2xl mb-6"
              style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
              Top Bezirke (Absolute Fläche)
            </h2>
            <div className="space-y-4">
              {topDistrictsByArea.map((stat, index) => {
                const maxArea = topDistrictsByArea[0].totalArea;
                return (
                  <div key={stat.district}>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="font-mono text-xs"
                        style={{ color: "var(--deep-charcoal)" }}>
                        #{index + 1} · {stat.district}. BEZIRK
                      </span>
                      <span
                        className="font-serif text-lg font-bold"
                        style={{ color: "var(--accent-gold)" }}>
                        {formatArea(stat.totalArea)}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: "var(--light-sage)" }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${(stat.totalArea / maxArea) * 100}%`,
                          backgroundColor: "var(--accent-gold)",
                        }}
                      />
                    </div>
                    <p
                      className="font-mono text-xs mt-1"
                      style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                      {stat.parkCount} Parks · Ø {formatArea(stat.avgParkSize)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Largest Parks */}
        <div
          className="p-6 border mb-12"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}>
          <h2
            className="font-serif text-2xl mb-6"
            style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
            Die größten Parks in Wien
          </h2>
          <div className="space-y-4">
            {largestParks.map((park, index) => (
              <div
                key={park.id}
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <span
                    className="font-mono text-xs mr-3"
                    style={{ color: "var(--accent-gold)" }}>
                    #{index + 1}
                  </span>
                  <Link
                    to={`/index/${slugifyParkName(park.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {park.name}
                  </Link>
                  <span
                    className="font-mono text-xs ml-3"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {park.district}. Bezirk
                  </span>
                </div>
                <span
                  className="font-serif text-xl font-bold"
                  style={{ color: "var(--primary-green)" }}>
                  {formatArea(park.area)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographical & Size Extremes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Geographical Extremes */}
          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-2 mb-6">
              <Compass
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <h2
                className="font-serif text-2xl"
                style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
                Geografie
              </h2>
            </div>
            <div className="space-y-4">
              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    NÖRDLICHSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(northernmostPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {northernmostPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {northernmostPark.district}. Bezirk · {northernmostPark.coordinates.lat.toFixed(4)}°N
                  </p>
                </div>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    SÜDLICHSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(southernmostPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {southernmostPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {southernmostPark.district}. Bezirk · {southernmostPark.coordinates.lat.toFixed(4)}°N
                  </p>
                </div>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    ÖSTLICHSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(easternmostPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {easternmostPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {easternmostPark.district}. Bezirk · {easternmostPark.coordinates.lng.toFixed(4)}°E
                  </p>
                </div>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    WESTLICHSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(westernmostPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {westernmostPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {westernmostPark.district}. Bezirk · {westernmostPark.coordinates.lng.toFixed(4)}°E
                  </p>
                </div>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    ZENTRALSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(mostCenteredPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {mostCenteredPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {mostCenteredPark.district}. Bezirk · Zentrum aller Parks
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Size Extremes */}
          <div
            className="p-6 border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}>
            <div className="flex items-center gap-2 mb-6">
              <Ruler
                className="w-6 h-6"
                style={{ color: "var(--primary-green)" }}
              />
              <h2
                className="font-serif text-2xl"
                style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
                Größe
              </h2>
            </div>
            <div className="space-y-4">
              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div className="flex-1">
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    GRÖẞTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(largestPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {largestPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {largestPark.district}. Bezirk
                  </p>
                </div>
                <span
                  className="font-serif text-lg font-bold ml-4"
                  style={{ color: "var(--primary-green)" }}>
                  {formatArea(largestPark.area)}
                </span>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div className="flex-1">
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    MEDIAN PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(medianPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {medianPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {medianPark.district}. Bezirk
                  </p>
                </div>
                <span
                  className="font-serif text-lg font-bold ml-4"
                  style={{ color: "var(--primary-green)" }}>
                  {formatArea(medianPark.area)}
                </span>
              </div>

              <div
                className="flex justify-between items-center py-3 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <div className="flex-1">
                  <p
                    className="font-mono text-xs mb-1"
                    style={{ color: "var(--accent-gold)" }}>
                    KLEINSTER PARK
                  </p>
                  <Link
                    to={`/index/${slugifyParkName(smallestPark.name)}`}
                    className="font-serif text-lg hover:underline"
                    style={{ color: "var(--primary-green)" }}>
                    {smallestPark.name}
                  </Link>
                  <p
                    className="font-mono text-xs mt-1"
                    style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}>
                    {smallestPark.district}. Bezirk
                  </p>
                </div>
                <span
                  className="font-serif text-lg font-bold ml-4"
                  style={{ color: "var(--primary-green)" }}>
                  {formatArea(smallestPark.area)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Districts Table */}
        <div
          className="mt-12 p-6 border"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}>
          <h2
            className="font-serif text-2xl mb-6"
            style={{ color: "var(--primary-green)", fontStyle: "italic" }}>
            Alle Bezirke im Überblick
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b-2"
                  style={{ borderColor: "var(--primary-green)" }}>
                  <th
                    className="text-left py-3 px-2 font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    BEZIRK
                  </th>
                  <th
                    className="text-right py-3 px-2 font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    PARKS
                  </th>
                  <th
                    className="text-right py-3 px-2 font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    FLÄCHE
                  </th>
                  <th
                    className="text-right py-3 px-2 font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    ANTEIL
                  </th>
                  <th
                    className="text-right py-3 px-2 font-mono text-xs"
                    style={{ color: "var(--primary-green)" }}>
                    Ø GRÖẞE
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...districtStats]
                  .sort((a, b) => a.district - b.district)
                  .map((stat) => (
                    <tr
                      key={stat.district}
                      className="border-b hover:bg-opacity-50"
                      style={{ borderColor: "var(--border-color)" }}>
                      <td
                        className="py-3 px-2 font-serif"
                        style={{ color: "var(--primary-green)" }}>
                        {stat.district}. Bezirk
                      </td>
                      <td
                        className="text-right py-3 px-2 font-mono text-sm"
                        style={{ color: "var(--deep-charcoal)" }}>
                        {stat.parkCount}
                      </td>
                      <td
                        className="text-right py-3 px-2 font-mono text-sm"
                        style={{ color: "var(--deep-charcoal)" }}>
                        {formatArea(stat.totalArea)}
                      </td>
                      <td
                        className="text-right py-3 px-2 font-mono text-sm font-bold"
                        style={{ color: "var(--primary-green)" }}>
                        {stat.percentage.toFixed(2)}%
                      </td>
                      <td
                        className="text-right py-3 px-2 font-mono text-sm"
                        style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}>
                        {formatArea(stat.avgParkSize)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatisticsPage;
