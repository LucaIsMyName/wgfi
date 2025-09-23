import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";

const HomePage: React.FC = () => {
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
              to="/parks"
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
                borderRadius: "6px",
              }}>
              KARTE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
