import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Park } from "@/types/park";
import { Helmet } from "react-helmet-async";
import { TreePalm, Map, Navigation, Shuffle } from "lucide-react";
import STYLE from "@/utils/config";
import { cn } from "@/utils/cn";
import { useParksData } from "@/hooks/useParksData";
import { findNearestPark } from "@/utils/geoUtils";
import LocationModal from "@/components/LocationModal";
import { slugifyParkName } from "@/data/manualParksData";
import { Button } from "@/components/ui/Button";
import ImageToAscii from "@/components/ImageToAscii";
import { useTheme } from "@/contexts/ThemeContext";

const HomePage: React.FC = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();

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
          setLocationError(true);
          setIsLoadingNearby(false);
        } finally {
          setShowLocationModal(false);
        }
      },
      (error) => {
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
      // Error handled by loading state
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
          content="Entdecke alle Parks und Grünflächen Wiens. Der umfassende Index mit über 1000 Parks, interaktiver Karte und detaillierten Informationen zu Ausstattung und Lage."
        />

        {/* Open Graph tags */}
        <meta
          property="og:title"
          content="Wiener Grünflächen Index | Entdecke alle Parks in Wien"
        />
        <meta
          property="og:description"
          content="Der umfassende Index mit über 1000 Parks, interaktiver Karte und detaillierten Informationen zu Ausstattung und Lage."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/home.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:site_name" content="Wiener Grünflächen Index" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Wiener Grünflächen Index | Entdecke alle Parks in Wien"
        />
        <meta
          name="twitter:description"
          content="Der umfassende Index mit über 1000 Parks, interaktiver Karte und detaillierten Informationen zu Ausstattung und Lage."
        />
        <meta name="twitter:image" content="/home.jpg" />

        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="de" />
        <meta name="geo.region" content="AT-9" />
        <meta name="geo.placename" content="Wien" />
        <meta name="geo.position" content="48.2082;16.3738" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* ASCII Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: effectiveTheme === "dark" ? 0.33 : 0.15 }}
      >
        <ImageToAscii
          src="/home.jpg"
          mode={effectiveTheme === "dark" ? "dither" : "dither"}
          fontSize={4}
          saturation={effectiveTheme === "dark" ? 1 : 2}
          contrast={effectiveTheme === "dark" ? 2 : 2}
          brightness={effectiveTheme === "dark" ? 0.9 : 1}
          hueShift={effectiveTheme === "dark" ? 20 : 30}
          movementSpeed={"slow"}
          colorCount={64}
          scale={effectiveTheme === "dark" ? 0.33 : 0.33}
          ditherAlgorithm="atkinson"
          ditherMatrixSize={2}
          ditherDotSize={effectiveTheme === "dark" ? 6 : 6}
          ditherDotSpacing={effectiveTheme === "dark" ? 0.1 : 0.1}
          width="100%"
          height="100%"
          objectFit="cover"
          alt="Background ASCII art"
        />
      </div>

      {/* Gradient Overlay */}
      <section
        id="gradient-layers"
        className="hidden absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: "300%",
            animation: "bgMove",
            animationDuration: "7.5s",
            animationTimingFunction: "ease",
            animationIterationCount: "infinite",
            background:
              effectiveTheme === "dark"
                ? "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 100%)"
                : "linear-gradient(135deg, rgba(123,255,255,0.15) 0%, rgba(123,123,255,0.2) 50%, rgba(255,255,123,0.1) 100%)",
            mixBlendMode: "multiply",
            filter: "saturation(1.5)"
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: "300% ",
            animation: "bgMove",
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            background:
              effectiveTheme === "dark"
                ? "linear-gradient(23deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%)"
                : "linear-gradient(24deg, rgba(123,255,123,0.15) 0%, rgba(123,255,255,0.15) 25%, rgba(190,123,123,0.15) 50%, rgba(123,255,123,0.15) 75%, rgba(123,255,255,0.15) 100%)",
            mixBlendMode: "multiply",
            filter: "saturation(1.5)"
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: "300%",
            animation: "bgMove",
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "infinite",
            background:
              effectiveTheme === "dark"
                ? "linear-gradient(74deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)"
                : "linear-gradient(74deg, rgba(123,255,123,0.15) 0%, rgba(123,255,255,0.15) 25%, rgba(190,123,123,0.15) 50%, rgba(123,255,123,0.15) 75%, rgba(123,255,255,0.15) 100%)",
            mixBlendMode: "multiply",
            filter: "saturation(1.5)"
          }}
        />
      </section>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col space-y-6 sm:space-y-8 xl:ml-32 max-w-4xl">
          {/* Headline */}
          <div>
            <h1
              className={cn(
                STYLE.pageTitle(true),
                "italic leading-tight text-primary-green",
              )}
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
              Ein Index aller Parks & Grünflächen der Stadt Wien als{" "}
              <Link
                to="/index"
                className="font-mono text-[0.9em] underline hover:text-primary-green/80 transition-colors focus:outline-none focus:ring focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-soft-cream rounded"
                aria-label="Zur Liste aller Parks"
              >
                Liste
              </Link>{" "}
              oder{" "}
              <Link
                to="/map"
                className="underline font-mono text-[0.9em] underline hover:text-primary-green/80 transition-colors focus:outline-none focus:ring focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-soft-cream rounded"
                aria-label="Zur interaktiven Karte"
              >
                Karte
              </Link>
              . Speichere Parks als{" "}
              <Link
                to="/favorites"
                className="underline font-mono text-[0.9em] underline hover:text-primary-green/80 transition-colors focus:outline-none focus:ring focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-soft-cream rounded"
                aria-label="Zu deinen Favoriten"
              >
                Favoriten
              </Link>{" "}
              oder schau dir die{" "}
              <Link
                to="/statistics"
                className="underline font-mono text-[0.9em] underline hover:text-primary-green/80 transition-colors focus:outline-none focus:ring focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-soft-cream rounded"
                aria-label="Zur Statistik-Seite"
              >
                Zahlen
              </Link>{" "}
              an.
            </p>
          </div>

          {/* Buttons */}
          <div
            className="grid grid-cols-2 sm:flex items-center justify-start gap-3 sm:gap-4 pt-0"
            role="group"
            aria-label="Hauptnavigation"
          >
            <Button
              to="/index"
              variant="primary"
              size="md"
              aria-label="Zur Liste aller Parks"
              className="touch-manipulation min-h-[44px] !justify-start sm:!justify-start !text-left"
              icon={TreePalm}
              iconPosition="left"
            >
              <span className="text-left sm:text-lg">Index</span>
            </Button>
            <Button
              to="/map"
              variant="primary"
              size="md"
              aria-label="Zur interaktiven Karte"
              className="touch-manipulation min-h-[44px] !justify-start sm:!justify-start !text-left"
              icon={Map}
              iconPosition="left"
            >
              <span className="text-left sm:text-lg">Karte</span>
            </Button>
            <Button
              onClick={handleFindNearby}
              disabled={isLoadingNearby}
              variant="secondary"
              size="md"
              loading={isLoadingNearby}
              className="bg-card-bg text-primary-green italic touch-manipulation min-h-[44px] !justify-start sm:!ustify-start !text-left"
              aria-label="Nächstgelegene Parks finden"
              aria-describedby="location-description"
              icon={Navigation}
              iconPosition="left"
            >
              <span className="text-left sm:text-lg">
                {isLoadingNearby ? "Suche..." : "In der nähe"}
              </span>
            </Button>
            <Button
              onClick={handleRandomPark}
              disabled={isLoadingRandom}
              variant="secondary"
              size="md"
              loading={isLoadingRandom}
              className="bg-card-bg text-primary-green italic touch-manipulation min-h-[44px] !justify-start sm:!justify-start !text-left"
              aria-label="Zufälligen Park auswählen"
              icon={Shuffle}
              iconPosition="left"
            >
              <span className="text-left sm:text-lg">
                {isLoadingRandom ? "Lade..." : "Zufallspark"}
              </span>
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
