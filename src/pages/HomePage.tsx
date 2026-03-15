import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";
import { useParksData } from "../hooks/useParksData";
import { findNearestPark } from "../utils/geoUtils";
import LocationModal from "../components/LocationModal";
import { slugifyParkName } from "../data/manualParksData";
import { Button } from "../components/ui/Button";
import ImageToAscii from "../components/ImageToAscii";
import { useTheme } from "../contexts/ThemeContext";

const HomePage: React.FC = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const navigate = useNavigate();
  const { effectiveTheme, isHighContrast } = useTheme();

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
    <div className="h-screen max-h-screen overflow-hidden flex items-center bg-main-bg relative">
      <Helmet>
        <title>Wiener Grünflächen Index | Home</title>
        <meta
          name="description"
          content="Eine Liste und Karte aller Parks und Grünflächen in Wien mit allen wichtigen Informationen für deinen Parkbesuch."
        />
      </Helmet>

      {/* ASCII Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: effectiveTheme === "dark" ? 0.2 : 1 }}
      >
        <ImageToAscii
          src="/home.jpg"
          mode={effectiveTheme === "dark" ? "dither" : "dither"}
          fontSize={4}
          saturation={effectiveTheme === "dark" ? 1 : 3}
          contrast={effectiveTheme === "dark" ? 3 : 1}
          brightness={effectiveTheme === "dark" ? 1 : 1}
          // hueShift={300}
          colorCount={16}
          scale={effectiveTheme === "dark" ? 0.2 : 0.33}
          ditherAlgorithm="atkinson"
          ditherMatrixSize={8}
          ditherDotSize={effectiveTheme === "dark" ? 4 : 3}
          ditherDotSpacing={effectiveTheme === "dark" ? -2 : 0}
          width="100%"
          height="100%"
          objectFit="cover"
          alt="Background ASCII art"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col space-y-8">
          {/* Headline */}
          <div>
            <h1
              className={`${STYLE.pageTitle(true)} italic leading-tight text-primary-green`}
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
            <p className="font-serif text-lg sm:text-2xl leading-tight text-balance text-primary-green font-normal">
              Eine Index aller Parks & Grünflächen der Stadt Wien als{" "}
              <Link to="/index" className="underline italic">
                Liste
              </Link>{" "}
              oder{" "}
              <Link to="/map" className="underline italic">
                Karte
              </Link>
              . Speichere Parks als{" "}
              <Link to="/favorites" className="underline italic">
                Favoriten
              </Link>{" "}
              oder schau dir die{" "}
              <Link to="statistics" className="underline italic">
                Zahlen
              </Link>{" "}
              an.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-0">
            <Button variant="primary" size="md" loading={isLoadingNearby}>
              <Link to="/index">Index</Link>
            </Button>
            <Button
              to="/map"
              variant="primary"
              size="md"
              loading={isLoadingNearby}
            >
              Karte
            </Button>
            <Button
              onClick={handleFindNearby}
              disabled={isLoadingNearby}
              variant="secondary"
              size="md"
              loading={isLoadingNearby}
              className="bg-card-bg text-primary-green italic"
            >
              {isLoadingNearby ? "Suche..." : "In der nähe"}
            </Button>
            <Button
              onClick={handleRandomPark}
              disabled={isLoadingRandom}
              variant="secondary"
              size="md"
              loading={isLoadingRandom}
              className="bg-card-bg text-primary-green italic"
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
