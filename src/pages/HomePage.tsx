import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";
import { useParksData } from "../hooks/useParksData";
import { findNearestPark } from "../utils/geoUtils";
import LocationModal from "../components/LocationModal";
import { slugifyParkName } from "../data/manualParksData";

const HomePage: React.FC = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const navigate = useNavigate();
  
  const { parks } = useParksData();

  const handleFindNearby = () => {
    setShowLocationModal(true);
    setLocationError(false);
  };

  const handleRequestLocation = () => {
    setIsLoadingNearby(true);

    if (!navigator.geolocation) {
      setLocationError(true);
      setIsLoadingNearby(false);
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
          setIsLoadingNearby(false);
          setShowLocationModal(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(true);
        setIsLoadingNearby(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCloseModal = () => {
    setShowLocationModal(false);
    setLocationError(false);
  };

  const handleRandomPark = () => {
    setIsLoadingRandom(true);

    try {
      // Select random park
      if (parks.length > 0) {
        const randomIndex = Math.floor(Math.random() * parks.length);
        const randomPark = parks[randomIndex];
        navigate(`/index/${slugifyParkName(randomPark.name)}`);
      }
    } catch (error) {
      console.error("Error selecting random park:", error);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div
      className="h-screen max-h-screen overflow-hidden flex items-center"
      style={{ background: "var(--main-bg)" }}
    >
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
              className={`${STYLE.pageTitle(true)} not-italic leading-tight`}
              style={{ color: "var(--primary-green)" }}
            >
              Wiener
              <br /> Grünflächen
              <br />
              <span className="uppercase font-mono not-italic text-[0.85em] font-[300] bg-[var(--primary-green)] text-[var(--soft-cream)] px-3 ">
                index
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="max-w-2xl">
            <p
              className="font-serif italic text-lg sm:text-3xl leading-tight text-balance"
              style={{ color: "var(--primary-green)", fontWeight: "400" }}
            >
              Eine Liste aller Parks & Grünflächen der Stadt Wien als Liste oder
              Karte.
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
              }}
            >
              INDEX
            </Link>
            <Link
              to="/map"
              className="px-8 py-4 border border-[var(--primary-green)] font-mono text-sm inline-flex items-center justify-center"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--primary-green)",
              }}
            >
              KARTE
            </Link>
            <button
              onClick={handleFindNearby}
              disabled={isLoadingNearby}
              className="px-8 py-4 border border-[var(--primary-green)] font-mono text-sm inline-flex items-center justify-center disabled:opacity-50"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--primary-green)",
                borderRadius: "6px",
              }}
            >
              {isLoadingNearby ? "SUCHE..." : "IN DER NÄHE"}
            </button>
            <button
              onClick={handleRandomPark}
              disabled={isLoadingRandom}
              className="px-8 py-4 border border-[var(--primary-green)] font-mono text-sm inline-flex items-center justify-center disabled:opacity-50"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--primary-green)",
                borderRadius: "6px",
              }}
            >
              {isLoadingRandom ? "LADE..." : "ZUFALLSPARK"}
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
