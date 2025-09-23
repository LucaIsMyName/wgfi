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
                Der <span className="italic">Wiener Grünflächen Index</span> ist eine übersichtliche Website, die alle Parks und Grünflächen in Wien zeigt. Hier findest du schnell und einfach den perfekten Park für deinen nächsten Ausflug, egal ob du einen ruhigen Platz zum Lesen, einen Spielplatz für Kinder oder eine große Wiese für ein Picknick suchst.
              </p>
              <p>Mit unserer Website kannst du:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Parks nach Bezirk, Größe, Name und Ausstattung filtern und sortieren</li>
                <li>Alle wichtigen Informationen zu jedem Park auf einen Blick sehen</li>
                <li>Parks auf einer einfachen Karte finden</li>
                <li>Deine Lieblingsparks speichern, um sie später schnell wiederzufinden</li>
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
                Alle Parkdaten stammen direkt von der Stadt Wien über deren offene Datenplattform (
                <a
                  href="https://data.gv.at"
                  className="underline"
                  style={{ color: "var(--primary-green)" }}>
                  data.gv.at
                </a>
                ). Wir verwenden den offiziellen Datensatz "Parkanlagen Standorte Wien", der regelmäßig aktualisiert wird.
              </p>
              <p>
                <strong>Wichtig:</strong> Die Parks werden nicht von uns ausgewählt oder kuratiert - wir zeigen alle Parks aus der offiziellen Datenbank der Stadt Wien an.
              </p>
              <p>Bei wichtigen Parks ergänzen wir manchmal zusätzliche Informationen, wenn:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In den offiziellen Daten Informationen fehlen (z.B. Öffnungszeiten)</li>
                <li>Wir nützliche Zusatzinfos haben (z.B. zur Barrierefreiheit)</li>
                <li>Wir hilfreiche Tipps für Besucher haben (z.B. zu besonderen Veranstaltungen)</li>
                <li>Wir Fehler in den offiziellen Daten entdecken</li>
              </ul>
              <p>Unser Ziel ist es, dir alle wichtigen Informationen zu den Wiener Parks auf eine einfache und übersichtliche Weise zu präsentieren.</p>
            </div>
          </section>

          {/* Features in Detail */}
          <section
            className=""
            style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Was kann die Website alles?
            </h2>
            <div
              className="font-serif space-y-4"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400", lineHeight: "1.6" }}>
              <p>Der Wiener Grünflächen Index bietet dir viele nützliche Funktionen:</p>
              <div className="space-y-6">
                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Parksuche und Filter
                  </h3>
                  <p>Du kannst Parks nach Namen suchen oder nach verschiedenen Kriterien filtern: nach Bezirk, nach Ausstattung (z.B. Spielplatz, Hundezone, Wasserspiele) oder nach Größe sortieren. So findest du genau den Park, der zu deinen Wünschen passt.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Detaillierte Parkinformationen
                  </h3>
                  <p>Für jeden Park zeigen wir dir wichtige Informationen wie Adresse, Bezirk, Größe, Ausstattung, Öffnungszeiten (falls vorhanden) und Barrierefreiheit. Du siehst auch, welche öffentlichen Verkehrsmittel in der Nähe sind.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Interaktive Karte
                  </h3>
                  <p>Auf unserer Karte siehst du alle Parks in Wien auf einen Blick. Du kannst nach Bezirken filtern oder deinen Standort anzeigen lassen, um Parks in deiner Nähe zu finden.</p>
                </div>

                <div>
                  <h3
                    className="font-serif text-lg font-medium mb-2"
                    style={{ color: "var(--primary-green)" }}>
                    Favoriten speichern
                  </h3>
                  <p>Deine Lieblingsparks kannst du mit einem Klick speichern und später schnell wiederfinden. Die Favoriten werden lokal auf deinem Gerät gespeichert - wir sammeln keine persönlichen Daten.</p>
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
            <h2 className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>Offizielle Daten
            </h2>
            <p>Die Daten stammen offiziell von der <a className="underline" href="https://www.wien.gv.at/" target="_blank">Wien Open Data</a>.</p>
            <p>Da die Daten für Bezirke, Beschreibungen, Barrierefreiheit, Verkehrsanbindung und Ausstattungen nicht vollständig sind, werden einige Felder mit der Zeit manuell ergänzt.</p>
            <p>Fehler können hier eingemeldet werden: <a className="underline" href="https://github.com/LucaIsMyName/wgfi" target="_blank">Github</a>.</p>
          </section>

          {/* Technical Info */}
          <section
            className=""
            style={{ backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
            <h2
              className="font-serif italic text-xl mb-4"
              style={{ color: "var(--primary-green)", fontWeight: "500" }}>
              Technische Details
            </h2>
            <div
              className="font-serif space-y-4"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400", lineHeight: "1.6" }}>
              <p>Der Wiener Grünflächen Index wurde mit modernen Webtechnologien entwickelt:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>React für eine schnelle und reaktionsschnelle Benutzeroberfläche</li>
                <li>Mapbox für die interaktiven Karten</li>
                <li>Lokaler Speicher für deine Favoriten und Einstellungen</li>
              </ul>
              <p>Die Website funktioniert auf allen Geräten - egal ob Computer, Tablet oder Smartphone.</p>
              <p>Wir speichern keine persönlichen Daten und verwenden keine Tracking-Cookies. Deine Favoriten und Einstellungen werden nur lokal auf deinem Gerät gespeichert.</p>

              <div
                className="mt-6 pt-4 border-t border-opacity-20"
                style={{ borderColor: "var(--border-color)" }}>
                <h3
                  className="font-serif text-lg font-medium mb-3"
                  style={{ color: "var(--primary-green)" }}>
                  Offline-Modus
                </h3>
                <p className="mb-4">Diese Website speichert alle Parkdaten lokal auf deinem Gerät, sodass du sie auch offline nutzen kannst. Die Daten werden für 7 Tage gespeichert und dann automatisch aktualisiert.</p>

                <div className="flex items-center">
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 font-mono text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--light-sage)",
                      color: "var(--deep-charcoal)",
                      borderRadius: "4px",
                    }}>
                    Parkdaten aktualisieren
                  </button>

                  {cacheCleared && (
                    <span
                      className="ml-3 font-mono text-xs"
                      style={{ color: "var(--primary-green)" }}>
                      ✓ Daten wurden aktualisiert
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IdeaPage;
