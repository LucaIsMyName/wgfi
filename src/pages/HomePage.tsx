import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";
import { useParksData } from "../hooks/useParksData";
import { findNearestPark } from "../utils/geoUtils";
import LocationModal from "../components/LocationModal";
import { slugifyParkName } from "../data/manualParksData";
import { Button } from "../components/ui/Button";

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
            parks,
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
      },
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
    <div className="h-screen max-h-screen overflow-hidden flex items-center bg-main-bg">
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
            <h1 className={`${STYLE.pageTitle(true)} not-italic leading-tight text-primary-green`}>
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
            <p className="font-serif italic text-lg sm:text-3xl leading-tight text-balance text-primary-green font-normal">
              Eine Liste aller Parks & Grünflächen der Stadt Wien als Liste oder
              Karte.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="primary" size="md" loading={isLoadingNearby}>
              <Link to="/map">Index</Link>
            </Button>
            <Button variant="primary" size="md" loading={isLoadingNearby}>
              <Link to="/map">Karte</Link>
            </Button>
            <Button
              onClick={handleFindNearby}
              disabled={isLoadingNearby}
              variant="outline"
              size="md"
              loading={isLoadingNearby}
              className="bg-card-bg text-primary-green"
            >
              {isLoadingNearby ? "Suche..." : "In der nähe"}
            </Button>
            <Button
              onClick={handleRandomPark}
              disabled={isLoadingRandom}
              variant="outline"
              size="md"
              loading={isLoadingRandom}
              className="bg-card-bg text-primary-green"
            >
              {isLoadingRandom ? "Lade..." : "Zufallspark"}
            </Button>
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
