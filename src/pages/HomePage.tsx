import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";
import { getViennaParksForApp } from "../services/viennaApi";
import { findNearestPark } from "../utils/geoUtils";
import LocationModal from "../components/LocationModal";
import { slugifyParkName } from "../data/manualParksData";

const HomePage: React.FC = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [parks, setParks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load parks data
  useEffect(() => {
    const loadParks = async () => {
      try {
        const parksData = await getViennaParksForApp();
        setParks(parksData);
      } catch (error) {
        console.error("Error loading parks:", error);
      }
    };

    loadParks();
  }, []);

  const handleFindNearby = () => {
    setShowLocationModal(true);
    setLocationError(false);
  };

  const handleRequestLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      setLocationError(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const nearestPark = findNearestPark(
            position.coords.latitude,
            position.coords.longitude,
            parks
          );
          
          if (nearestPark) {
            navigate(`/index/${slugifyParkName(nearestPark.name)}`);
          } else {
            setLocationError(true);
          }
        } catch (error) {
          console.error("Error finding nearest park:", error);
          setLocationError(true);
        } finally {
          setIsLoading(false);
          setShowLocationModal(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(true);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCloseModal = () => {
    setShowLocationModal(false);
    setLocationError(false);
  };

  return (
    <div
      className="h-screen max-h-screen overflow-hidden flex items-center"
      style={{ background: "var(--main-bg)" }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Startseite</title>
        <meta
          name="description"
          content="Eine kuratierte Sammlung der schönsten Parks und Grünflächen in Wien mit allen wichtigen Informationen für Ihren Besuch."
        />
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Headline */}
          <div>
            <h1
              className={`${STYLE.pageTitle} leading-tight`}
              style={{ color: "var(--primary-green)" }}>
              Wiener
              <br /> Grünflächen
              <br />
              <span className="uppercase font-mono not-italic text-[0.75em] font-[300] bg-[var(--light-gold)] px-3 ">index</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="max-w-2xl">
            <p
              className="font-mono text-sm lg:text-base text-balance"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
              Eine Liste aller Parks & Grünflächen der Stadt Wien als Liste oder Karte.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/index"
              className="px-8 py-4 font-mono text-sm inline-flex items-center justify-center"
              style={{
                backgroundColor: "var(--primary-green)",
                color: "var(--soft-cream)",
              }}>
              INDEX
            </Link>
            <Link
              to="/map"
              className="px-8 py-4 border border-[var(--primary-green)] font-mono text-sm inline-flex items-center justify-center"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--primary-green)",
              }}>
              KARTE
            </Link>
            <button
              onClick={handleFindNearby}
              disabled={isLoading}
              className="px-8 py-4 border border-[var(--primary-green)] font-mono text-sm inline-flex items-center justify-center disabled:opacity-50"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--primary-green)",
                borderRadius: "6px",
              }}>
              {isLoading ? 'SUCHE...' : 'IN DER NÄHE'}
            </button>
          </div>

          {/* Location Modal */}
          <LocationModal
            isOpen={showLocationModal}
            onClose={handleCloseModal}
            onRequestLocation={handleRequestLocation}
            isError={locationError}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
