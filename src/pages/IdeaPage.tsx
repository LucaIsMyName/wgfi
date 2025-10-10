import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import STYLE from "../utils/config";
import { clearParksCache } from "../services/viennaApi";

const IdeaPage: React.FC = () => {
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    clearParksCache();
    setCacheCleared(true);

    // Reset notification after 3 seconds
    setTimeout(() => {
      setCacheCleared(false);
    }, 3000);
  };

  return (
    <div
      className="min-h-screen px-4 lg:px-6 py-6"
      style={{ background: "var(--main-bg)" }}>
      <Helmet>
        <title>Wiener Grünflächen Index | Über das Projekt</title>
        <meta
          name="description"
          content="Informationen über den Wiener Grünflächen Index, seine Funktionen und Datenquellen."
        />
      </Helmet>

      {/* Header */}
      <div className="w-full">
        <h1
          className={`${STYLE.pageTitle} mb-4`}
          style={{ color: "var(--primary-green)", fontWeight: "400", fontStyle: "italic" }}>
          Die Idee
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl">
        <div className="space-y-8">
          {/* Project Description */}
          <section
            className=""
            style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Was ist der Wiener Grünflächen Index?
            </h2>
            <div
              className="font-serif space-y-4"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400", lineHeight: "1.6" }}>
              <p>
                Der <span className="italic">Wiener Grünflächen Index</span> ist eine übersichtliche Website, die alle Parks und Grünflächen in Wien zeigt.
              </p>
              <p>Mit dieser Website kann man:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Parks nach Bezirk, Größe, Name und Ausstattung filtern und sortieren</li>
                <li>Alle wichtigen Informationen zu jedem Park auf einen Blick sehen</li>
                <li>Parks auf einer einfachen Karte finden</li>
                <li>Lieblingsparks als Favoriten speichern, um sie später schnell wiederzufinden</li>
                <li>Eine Route zum Park planen</li>
              </ul>
            </div>
          </section>

          {/* Data Sources */}
          <section
            className=""
            style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Woher kommen die Daten?
            </h2>
            <div
              className="font-serif space-y-4"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400", lineHeight: "1.6" }}>
              <p>
                Alle Parkdaten stammen direkt von der Bundesrepublik Österreich über deren offene Datenplattform (
                <a
                  href="https://data.gv.at"
                  className="underline"
                  style={{ color: "var(--primary-green)" }}>
                  https://data.wien.gv.at
                </a>
                ).
              </p>
              <p>
                Die Parks werden nicht von dieser Website ausgewählt oder kuratiert - sie zeigt alle Parks aus der offiziellen{" "}
                <a
                  href="https://data.gv.at/datasets/22add642-d849-48ff-9913-8c7ba2d99b46?locale=de"
                  target="_blank"
                  className="underline"
                  style={{ color: "var(--primary-green)" }}>
                  Datenbank der Stadt Wien
                </a>{" "}
                an.
              </p>
              <p>Bei manchen Parks werden zusätzliche Informationen hinzugefügt, wenn:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In den offiziellen Daten Informationen fehlen (z.B. Öffnungszeiten, Ausstattung, ...)</li>
                <li>Nützliche Zusatzinfos (z.B. zur Barrierefreiheit, Events, Tipps, ...)</li>
                <li>Fehler in den offiziellen Daten gefunden werden</li>
              </ul>
              <p>Ziel ist es, alle wichtigen Informationen zu den Wiener Parks auf eine einfache und übersichtliche Weise zu präsentieren.</p>
            </div>
          </section>

          {/* Features in Detail */}
          <section
            className=""
            style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Was macht diese Website so alles?
            </h2>
            <div
              className="font-serif space-y-4"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400", lineHeight: "1.6" }}>
              <div className="space-y-6">
                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Parksuche und Filter
                  </h3>
                  <p>Parks nach Namen suchen oder nach verschiedenen Kriterien filtern: nach Bezirk, nach Ausstattung (z.B. Spielplatz, Hundezone, Wasserspiele, ...) oder nach Größe sortieren.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Detaillierte Parkinformationen
                  </h3>
                  <p>Für jeden Park zeigt die Website Informationen wie Adresse, Bezirk, Größe, Ausstattung, Öffnungszeiten (falls vorhanden) und Barrierefreiheit.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Interaktive Karte
                  </h3>
                  <p>Auf der Karte siehst man alle Parks in Wien auf einen Blick. Man kann nach Bezirken filtern oder deinen Standort anzeigen lassen, um Parks in deiner Nähe zu finden.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Favoriten speichern
                  </h3>
                  <p>Lieblingsparks kann man mit einem Klick speichern und später schnell wiederfinden. Die Favoriten werden lokal auf deinem Gerät gespeichert - die Website sammelt keine persönlichen Daten.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Routenplanung
                  </h3>
                  <p>Mit einem Klick kannst du eine Route zu jedem Park planen - entweder von deinem aktuellen Standort oder von einer beliebigen Adresse aus.</p>
                </div>
              </div>
            </div>
          </section>

          {/** info about the gov data: districts are missing on most, some data fields get appended mannaully, giv might not be correct or complete */}

          <section>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Offizielle Daten
            </h2>
            <p>
              Die Daten stammen offiziell von der{" "}
              <a
                className="underline"
                href="https://www.data.gv.at/datasets/22add642-d849-48ff-9913-8c7ba2d99b46?locale=de"
                target="_blank">
                Wien Open Data
              </a>
              .
            </p>
            <p>Da die Daten für Bezirke, Beschreibungen, Barrierefreiheit, Verkehrsanbindung und Ausstattungen nicht vollständig sind, werden einige Felder mit der Zeit manuell ergänzt.</p>
            <p>
              Fehler oder Zusatzinformationen können hier eingemeldet werden:{" "}
              <a
                className="underline"
                href="https://github.com/LucaIsMyName/wgfi"
                target="_blank">
                Github
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IdeaPage;
