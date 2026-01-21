/**
 * Manual database for enriching Vienna parks data
 *
 * This file contains additional information about parks that may be missing from the API
 * or needs manual correction. Data is indexed by either park ID or slug.
 */

export interface ManualParkData {
  id?: string;
  slug?: string;
  name?: string;
  district?: number;
  address?: string;
  /**
   * Amenities are ADDED to API amenities, not replaced.
   * Use this to supplement the Vienna API data with additional amenities
   * like "Toiletten" or "Tischtennis" that you know exist in the park.
   */
  amenities?: string[];
  description?: string;
  descriptionLicense?: string;
  publicTransport?: string[];
  accessibility?: string;
  tips?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  links?: Array<{
    title: string;
    url: string;
    type?: "official" | "wiki" | "info" | "event";
  }>;
  /**
   * Set to true if this is a complete park definition not found in the Vienna API.
   * When true, this park will be added to the dataset as a standalone entry.
   * Requires: name, district, address, area, coordinates
   */
  isFullPark?: boolean;
  /**
   * Area in square meters (required if isFullPark is true)
   */
  area?: number;
  /**
   * Park category (e.g., "Park", "Schlosspark", "Bundesgarten")
   */
  category?: string;
  /**
   * Opening hours (optional)
   */
  openingHours?: string;
  /**
   * Website URL (optional)
   */
  website?: string;
  /**
   * Phone number (optional)
   */
  phone?: string;
  /**
   * Optional area split across multiple districts (for parks spanning district boundaries).
   * Keys are district numbers (1-23), values are percentages (0-100).
   * Remaining area stays in primary district.
   * Example: { 2: 70, 22: 30 } means 70% in district 2, 30% in district 22.
   */
  districtAreaSplit?: Record<number, number>;
}

const praterDescription = "Der Wiener Prater ist ein weitläufiges, etwa 6 km² umfassendes, großteils öffentliches Areal im 2. Wiener Gemeindebezirk, Leopoldstadt, das noch heute zu großen Teilen aus ursprünglich von der Donau geprägten Aulandschaften besteht. ";
const praterLinks: Array<{
  title: string;
  url: string;
  type?: "official" | "wiki" | "info" | "event";
}> = [
    {
      title: "Wikipedia",
      url: "https://de.wikipedia.org/wiki/Wiener_Prater",
      type: "wiki",
    },
    {
      title: "Stadt Wien",
      url: "https://www.wien.gv.at/umwelt/parks/anlagen/prater.html",
      type: "official",
    },
  ];
/**
 * Manual database of park information
 * Keys can be either park IDs or slugs
 *
 * Two modes of operation:
 * 1. Enrichment Mode (default): Adds/supplements data for existing API parks
 * 2. Full Park Mode (isFullPark: true): Adds completely new parks not in the Vienna API
 *
 * For detailed instructions on adding full parks, see MANUAL_PARKS_GUIDE.md
 */
export const manualParksDB: Record<string, ManualParkData> = {

  /** Donaupark */
  donaupark: {
    publicTransport: ["U1 VIC/UNO City"],
    description: 'Der Donaupark wurde 1964 im Zuge der "Wiener Internationalen Gartenschau 1964" (WIG 1964) unter der Gesamtplanung des damaligen Stadtgartendirektors Prof. Ing. Alfred Auer (1922 bis 2002) von einer ehemaligen Mülldeponie zu einer Parkanlage umgestaltet.',
    accessibility: "Gut zugänglich, größtenteils ebene Wege",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Donaupark",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/donaupark.html",
        type: "official",
      },
    ],
  },
  /** Stadtpark */
  stadtpark: {
    name: "Stadtpark",
    district: 1,
    description: "Der Wiener Stadtpark erstreckt sich vom Parkring im 1. Wiener Gemeindebezirk bis zum Heumarkt im 3. Wiener Gemeindebezirk.",
    descriptionLicense: "Wikipedia",
    publicTransport: ["U4 Stadtpark", "Straßenbahn D, 71"],
    accessibility: "Gut zugänglich, größtenteils ebene Wege",
    tips: ["Johann-Strauss-Denkmal"],
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Wiener_Stadtpark",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/stadtpark.html",
        type: "official",
      },
    ],
    amenities: ["Toiletten", "Tischtennis"],
  },
  /** Augarten */
  augarten: {
    name: "Augarten",
    district: 2,
    address: "Obere Augartenstraße, 1020 Wien",
    description: "Auf dem Gelände des heutigen Augartens wurde bereits 1614 ein Jagdschloss für Kaiser Maximilian errichtet. In den folgenden Jahrzehnten wurde das Gelände regelmäßig vergrößert. Es ist die älteste erhaltene barocke Anlage Wiens, die heute wertvollen Grünraum mitten in Wien bietet.",
    publicTransport: ["U2 Taborstraße", "Straßenbahn 5, 31"],
    accessibility: "Größtenteils barrierefrei zugänglich",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Augarten",
        type: "wiki",
      },
      {
        title: "Bundesgärten",
        url: "https://www.bundesgaerten.at/augarten/Augarten-.html",
        type: "official",
      },
    ],
    amenities: ["Grünfläche", "Toiletten"],
    isFullPark: true,
    area: 522000,
    coordinates: {
      lat: 48.226121792463, 
      lng: 16.376688355191
    },
  },
  /** Türkenschanzpark */
  tuerkenschanzpark: {
    address: "Türkenschanzstraße, 1190 Wien",
    description: "Der Türkenschanzpark ist eine Parkanlage im 18. Wiener Gemeindebezirk Währing. Der Park wurde 1888 auf der Türkenschanze eröffnet.",
    publicTransport: ["Straßenbahn 9", "S45"],
    accessibility: "Hügelig jedoch mit betonierten Wege",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/T%C3%BCrkenschanzpark",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/tuerkenschanzpark.html",
        type: "official",
      },
    ],
    amenities: ["Toiletten"],
  },
  /** Prater */
  "prater-jesuitenwiese": {
    publicTransport: ["U2 Messe-Prater"],
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
    tips: ["Volksstimme-Fest am letzten Wochenende in den Sommerferien"],
  },
  "prater-sulzwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-gross-enzersdorfer-wiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-fasangarten": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-rustenschacher": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-grafenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-pelzmais": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-rosenbachl": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-sonnenscheinwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-feuerwehrwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-wasserwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-avenue": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-golfwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-epplwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-arenawiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-forstwiesen-nord": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-forstwiesen-sued": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-seitenhafenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-ameiswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-laufbergwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-zirkuswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-spenadlwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-untere-heustadlwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-bluemnwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-kaiserwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-meiereiwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-lusthauswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-konstantinhuegel": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-schulverkehrsgartenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-rennbahnstrassenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  "prater-rotundenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks,
  },
  /** Oberlaa */
  "kurpark-oberlaa": {
    publicTransport: ["U1 Oberlaa"],
    description: "Der Kurpark Oberlaa ist eine Parkanlage im 10. Wiener Gemeindebezirk Favoriten, am Südosthang des Laaer Berges bei Oberlaa. Seine Fläche beträgt rund 608.000 m². Gartenbaudenkmale, Wegsysteme und künstliche Bodenformationen stehen unter Denkmalschutz.",
    descriptionLicense: "Wikipedia",
  },
  /** HIrschstetten */
  "teich-hirschstetten": {
    description: "Der Badeteich Hirschstetten (auch Ziegelhofteich genannt) ist einer von vielen Naturbadeplätzen im 22. Wiener Gemeindebezirk Donaustadt. Er befindet sich in der Nähe der Blumengärten Hirschstetten. Die Wasserfläche beträgt ca. 127.500 m² bei einer Breite von ca. 280 m und einer Länge von 540 m. Die maximale Tiefe wurde bereits Mitte der 1970er Jahre mit etwa 10 Meter beziffert[2], wobei exakte Angaben dazu bisher fehlen, zumal der Grundwasserspiegel später durch eine längere Regenperiode ansteigen sollte, was zumindest zu einer vorübergehenden Erhöhung der Wassertiefe geführt haben dürfte.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Badeteich_Hirschstetten",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/teich-hirschstetten.html",
        type: "official",
      },
    ],
  },
  "friedhof-st-marx": {
    description: "Der Sankt Marxer Friedhof im 3. Wiener Gemeindebezirk Landstraße wurde 1874 geschlossen und steht heute unter Denkmalschutz. Die wohl bekannteste Grabstätte auf diesem Friedhof ist jene des Komponisten Wolfgang Amadeus Mozart. Die Stadt Wien führt den Sankt Marxer Friedhof als öffentlich zugängliche Parkanlage.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Sankt_Marxer_Friedhof",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/friedhof-st-marx.html",
        type: "official",
      },
    ],
  },
  "poetzleinsdorfer-schlosspark": {
    description: "Der Park liegt im Währinger Bezirksteil Pötzleinsdorf und dehnt sich entlang des Nordhanges des Schafbergs ellipsenförmig zwischen Pötzleinsdorfer Straße und Geymüllergasse im Norden sowie Ladenburghöhe und Schafberggasse im Osten und Süden aus. Im Westen wird er durch einen nicht benannten Weg, der vom Westende der Ladenburghöhe zum Westende der Pötzleinsdorfer Straße führt, begrenzt.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Pötzleinsdorfer_Schlosspark",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/poezleinsdorfer-schlosspark.html",
        type: "official",
      },
    ],
  },
  "pa-loewygrube": {
    description: "Die Parkanlage Löwygrube ist eine ca. 164.000 m² naturnahe Parkanlage im Bezirksteil Oberlaa. Die Parkanlage liegt zwischen Bitterlichstraße, An der Ostbahn, Donabaumgasse und Löwyweg. Sie wird extensiv gepflegt und ist fast vollständig als Hundezone gewidmet. Neben weitläufigen Wiesenflächen und einem alten Baumbestand verfügt sie über einen Kinderspielplatz, Fußballplatz, öffentliche Toilette, Sitzmöglichkeiten und einen Trinkbrunnen. Die Löwygrube gehört mit dem Kurpark Oberlaa, dem Volkspark Laaerberg, dem Böhmischen Prater und dem Laaerwald zum Großerholungsraum Laaerberg.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Löwygrube",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/loewygrube.html",
        type: "official",
      },
    ],
  },
  "laaer-berg": {
    description: "Der Laaer Berg bildet mit dem westlich gelegenen Wienerberg (244 m ü. A.) und dem dazwischenliegenden Boschberg den weitesten Vorsprung des Wienerwalds in das Wiener Becken und gehört zur Terrassenlandschaft am Beckenrand. Der Hügelzug liegt zwischen dem Tal der Wien (zum Donaukanal) und der Donau im Norden und der Niederung der Liesing (zur Schwechat) im Süden. Er bildet den östlichsten Ausläufer der Nordalpen im Raum Wien und den Sporn zwischen dem Donautal und dem Talungstrichter des südlichen Wiener Beckens und des Steinfelds.",
    descriptionLicense: "Wikipedia",
  },
  wasserpark: {
    description: "Der Floridsdorfer Wasserpark ist ein kleiner, als Parkanlage gestalteter Teil der Alten Donau im 21. Wiener Gemeindebezirk, Floridsdorf. Der Park wurde von 1928 bis 1929 angelegt und hat eine Fläche von 143.000 m², rund ein Drittel davon wird von Wasserflächen eingenommen.",
    descriptionLicense: "Wikipedia",
  },
  "pa-roter-berg": {
    description: "Der Rote Berg liegt im Süden des Bezirksteils Ober-St.-Veit an der Grenze zum Bezirksteil Lainz. Der nur am Rand verbaute, wenig bewaldete Hügel bildet mit den nordwestlich anschließenden, unwesentlich höheren Hügeln Girzenberg und Trazerberg einen nicht von Straßen durchquerten Grünraum. Unter den drei Bergen verläuft von Nordwest nach Südost der in den 2000er Jahren gebaute Lainzer Tunnel, der von den ÖBB Ende 2012 in Betrieb genommen wurde (Sicherheitsausstieg gegenüber Veitingergasse 59). In der Senke östlich des Roten Bergs verlaufen in Nord-Süd-Richtung die Verbindungsbahn zwischen West- und Südbahn sowie der verrohrte Lainzerbach, dann steigt das Gelände nach Osten zum Küniglberg an.",
    descriptionLicense: "Wikipedia",
  },
  draschepark: {
    description: "Der Draschepark ist eine 13 Hektar große Parkanlage in Inzersdorf im 23. Wiener Gemeindebezirk Liesing. Er ging aus dem Park rund um die beiden als Schloss Inzersdorf bezeichneten Schlösser hervor. Der Name des Parks verweist auf die Familie Drasche von Wartinberg, die ab 1857 die beiden Schlösser auf dem Gelände besaß.",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Draschepark",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/draschepark.html",
        type: "official",
      },
    ],
  },
  schweizergarten: {
    description: "Der Schweizergarten ist eine Parkanlage im 3. Wiener Gemeindebezirk, Landstraße, zwischen dem Park des Belvederes bzw. dem Landstraßer Gürtel im Norden, dem Quartier Belvedere (dem Areal des früheren Südbahnhofs) bzw. der Arsenalstraße im Westen und dem Arsenal bzw. der Ghegastraße im Südosten.",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Schweizergarten",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/schweizergarten.html",
        type: "official",
      },
    ],
  },
  "auer-welsbach-park": {
    description: "Der Auer-Welsbach-Park ist eine Parkanlage im 15. Wiener Gemeindebezirk Rudolfsheim-Fünfhaus und wird von Linker Wienzeile, Schönbrunner Schlossallee, Mariahilfer Straße und Winckelmannstraße begrenzt. Mit einer Fläche von rund 110.000 m² ist er der größte Park des 15. Bezirks. Benannt ist er nach dem österreichischen Chemiker Carl Auer von Welsbach.",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Auer-Welsbach-Park",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/auer-welsbach-park.html",
        type: "official",
      },
    ],
    amenities: ["Toiletten", "Tischtennis"],
  },
  "blumengaerten-hirschstetten": {
    description: "Auf einer Fläche von 60.000 Quadratmetern geben unterschiedliche Themengärten, der Zoo Hirschstetten, ein historischer Bauernhof oder das Palmenhaus einen Einblick in die vielfältige Blumen- und Pflanzenwelt unserer Erde.",
    descriptionLicense: "Stadt Wien",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Blumengärten_Hirschstetten",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/freizeit/blumengaerten-hirschstetten",
        type: "official",
      },
    ],
    // amenities: ["Toiletten"],
  },
  rathauspark: {
    description: "Der Rathauspark ist eine symmetrisch angeordnete Anlage mit dem Nordpark zur Universität und dem Südpark zum Parlament hin. Die beiden Parkhälften sind durch den Rathausplatz getrennt, auf dem ganzjährig Kultur- und Sportveranstaltungen abgehalten werden, wie zum Beispiel der Christkindlmarkt und der Wiener Eistraum im Winter oder das Filmfestival im Sommer.",
    descriptionLicense: "Stadt Wien",
    accessibility: "Großteils Flach mit betonierten Wegen.",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Rathauspark_(Wien)",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/freizeit/rathauspark",
        type: "official",
      },
      {
        title: "Historie",
        url: "https://www.geschichtewiki.wien.gv.at/Rathauspark",
        type: "official",
      },
      {
        title: "Filmfestival",
        url: "https://filmfestival-rathausplatz.at/",
        type: "event",
      },
    ],
    tips: ["Winter: Christkindlmarkt & Eistraum", "Sommer: Filmfestival"],
    amenities: ["Toiletten"],
  },
  reithofferpark: {
    amenities: ["Tischtennis", "Toiletten"],
    description: "Reithofferpark (15, Reithofferplatz), benannt (13. Februar 1991 Gemeinderatsausschuss für Kultur) nach Johann Nepomuk Reithoffer.",
    descriptionLicense: "Stadt Wien",
    links: [
      {
        title: "Wiener Kultursommer",
        url: "https://www.kultursommer.wien/buehnen/reithofferpark",
        type: "event",
      },
    ],
  },
  "waehringer-park": {
    description: "Der Waehringer Park ist eine Parkanlage im 18. Wiener Gemeindebezirk.",
    // descriptionLicense: "Stadt Wien",
    // accessibility: "Großteils Flach mit betonierten Wegen.",
    links: [
      {
        title: "Wiener Kultursommer",
        url: "https://www.kultursommer.wien/buehnen/waehringer_park",
        type: "event",
      },
    ],
    amenities: ["Toiletten"],
  },
  "venediger-au-park": {
    amenities: ["Tischtennis"],
  },

  /**
   * EXAMPLE: How to add a completely new park not in the Vienna API
   * Uncomment and modify this template to add your own park
   * See MANUAL_PARKS_GUIDE.md for detailed instructions
   */

  burggarten: {
    isFullPark: true,
    name: "Burggarten",
    district: 1, // District number (1-23)
    address: "Burgring, 1010 Wien",
    area: 40000, // Area in square meters
    // website: "https://www.bundesgaerten.at/hofburggaerten/Burggarten.html",
    coordinates: {
      lat: 48.2044454288165,
      lng: 16.365833598010685, // Longitude
    },
    // category: "Park", // e.g., "Park", "Schlosspark", "Bundesgarten"
    amenities: ["Grünfläche", "Sitzgelegenheiten"], // Array of amenities
    description: "Der ehemalige Hof- oder Kaisergarten wurde um 1818/1819 von Hofgärtner Franz Antoine d. Ä. für den botanisch interessierten Kaiser Franz I. als Privatgarten angelegt. Ab 1847 wurde der Garten von Franz Antiune d. J. unter Kaiser Ferdinand I. vergrößert und landschaftlich umgestaltet. Im Zuge der Schleifung der Wallanlagen erfolgte unter Kaiser Franz Joseph I. ab 1863 eine erneute Erweiterung und Umgestaltung.",
    descriptionLicense: "Österreichische Bundesgärten", // Optional: source of description
    openingHours: "1. März - 31. März: 8:00 - 19:00; 1. April - 31. Oktober: 6:00 - 22:00; 1. November - 28. Februar: 7:00 - 17:30", // Optional
    accessibility: "Parkanlage hat Gehwege, jedoch hügelig", // Optional
    publicTransport: ["U3 Volkstheater"], // Optional
    links: [
      {
        title: "Österreichische Bundesgärten",
        url: "https://www.bundesgaerten.at/hofburggaerten/Burggarten.html",
        type: "official",
      },
    ],
  },
  volksgarten: {
    isFullPark: true,
    name: "Volksgarten",
    district: 1,
    area: 50000,
    coordinates: {
      lat: 48.20813887445002,
      lng: 16.36139692102694
    },
    openingHours: "1. März - 31. März: 8:00 - 19:00; 1. April - 31. Oktober: 6:00 - 22:00; 1. November - 28. Februar: 7:00 - 17:30", // Optional
    address: "Burgring, 1010 Wien",
    description: "Im Auftrag von Kaiser Franz I. entstand der Volksgarten, der 1823 eröffnet wurde. Er war die erste Gartenanlage in Österreich, die vom Kaiserhaus explizit für die Öffentlichkeit errichtet wurde.",
    descriptionLicense: "Österreichische Bundesgärten",
    accessibility: "Parkanlage hat Gehwege",
    publicTransport: ["U3 Volkstheater"],
    amenities: ["Grünfläche", "Sitzgelegenheiten", "Wasserspiele"],
    links: [
      {
        title: "Österreichische Bundesgärten",
        url: "https://www.bundesgaerten.at/hofburggaerten/Volksgarten.html",
        type: "official",
      },
    ],
  },
  "lainzer-tiergarten": {
    isFullPark: true,
    name: "Lainzer Tiergarten",
    district: 13,
    area: 2.45e+7,
    coordinates: {
      lat: 48.16983242265272,
      lng: 16.22053632684539
    },
    amenities: ["Grünfläche"],
    description: "Der Lainzer Tiergarten ist ein öffentlich zugängliches Naturschutzgebiet in Wien und zum Teil auch in Niederösterreich, das von der Magistratsabteilung 49 – Forstamt und Landwirtschaftsbetrieb der Stadt Wien verwaltet und betreut wird. Er ist ein Tiergarten im Sinne eines weitläufigen Waldgebietes mit reichem, innerhalb des Gartens frei lebendem Wildbestand. Als dieses Schutzgebiet ist es auch Bestandteil des Biosphärenparks Wienerwald. Der Lainzer Tiergarten liegt größtenteils im Westen Wiens, ein kleiner Teil liegt in der niederösterreichischen Gemeinde Laab im Walde.",
    descriptionLicense: "Österreichische Bundesgärten",
    accessibility: "Parkanlage hat Gehwege",
    publicTransport: ["56B Lainzer Tor"],
    links: [
      {
        title: "Lainzer Tiergarten",
        url: "https://www.lainzer-tiergarten.at/",
        type: "official",
      },
    ],
  },
  "erholungsgebiet-wienerberg": {
    isFullPark: true,
    name: "Erholungsgebiet Wienerberg",
    district: 10,
    area: 117000,
    coordinates: {
      lat: 48.160970817931954,
      lng: 16.35186664440599
    },
    description: "Das Erholungsgebiet Wienerberg in Wien ist eine große Grünfläche auf ehemaligem Ziegeleigelände am südlichen Abhang des Wienerbergs. Es liegt im Süden der Stadt, im 10. Bezirk (Favoriten), zwischen Triester Straße im Westen, Raxstraße im Norden, Neilreichgasse im Osten sowie Otto-Probst-Straße und Friedrich-Adler-Weg im Süden.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/freizeit/naherholungsgebiet-wienerberg",
        type: "official",
      },
    ],
    amenities: ["Hundebereich", "Toiletten"]
  },
  "schlosspark-schoenbrunn": {
    isFullPark: true,
    name: "Schlosspark Schönbrunn",
    district: 13,
    area: 1862800,
    coordinates: {
      lat: 48.180726503524376,
      lng: 16.309724404545165
    },
    description: "Das Schloss Schönbrunn ist die ehemalige Sommerresidenz der Habsburger in der österreichischen Hauptstadt Wien. Die barocke Dreiflügelanlage wurde ab 1695 durch Leopold I. von Johann Bernhard Fischer von Erlach begonnen und ab 1743 durch Maria Theresia von Nikolaus von Pacassi vollendet. Hervorzuheben sind die Berglzimmer, die Große Galerie, das Vieux-Laque-Zimmer, die Schlosskapelle und das Schlosstheater. Zum Ensemble des „österreichischen Versailles“ gehört auch der Park mit dem Neptunbrunnen, der Gloriette und dem namensgebenden Schönen Brunnen. Als „außergewöhnliches Beispiel eines Gesamtkunstwerks“ wurden das Schloss und die Gärten von Schönbrunn 1996 ins UNESCO-Welterbe aufgenommen.",
    descriptionLicense: "Wikipedia",
    links: [
      {
        title: "Bundesgärten",
        url: "https://www.bundesgaerten.at/schlosspark-schoenbrunn.html",
        type: "official",
      },
    ],
    amenities: ["Grünfläche", "Hundebereich", "Toiletten"]
  },
  "nationlpark-donau-auen": {
    name: "Nationalpark Donau-Auen (Lobau)",
    description: 'Der Nationalpark Donau-Auen bewahrt eine der letzten großen Flussauenlandschaften Mitteleuropas zwischen Wien und Bratislava. Auf einer Fläche von rund 9.615 Hektar zeigt er eine einzigartige Vielfalt aus Auwald, Wiesen, Altarmen und Flusslandschaften, die Lebensraum für zahlreiche bedrohte Tier- und Pflanzenarten bietet.',
    descriptionLicense: "Nationalparks Austria",
    accessibility: "Im Schloss Orth Nationalparkzentrum sind viele Bereiche ohne Barrieren zugänglich. Einige Wege nahe Orth an der Donau sind bei gutem Wetter auch mit Rollstuhl befahrbar.",
    publicTransport: ["S-Bahn S7", "VOR Bus 550", "Bus 92B", "Bus 93A", "VOR Bus 552", "VOR Bus 553"],
    links: [
      {
        title: "Nationalparks Austria",
        url: "https://www.nationalparksaustria.at/de/nationalpark-donau-auen.html",
        type: "official",
      },

    ],
    coordinates: {
      lat: 48.18937016887611,
      lng: 16.51273421924633
    },
    area: 23000000,
    district: 22,
    isFullPark: true,
    amenities: ["Grünfläche", "Sitzgelegenheiten"]
  },
  wienerwald: {
    name: "Wienerwald",
    description: "Der Wienerwald oder Wiener Wald als östlichster Ausläufer der Nordalpen ist eine Gebirgsgruppe in Niederösterreich und Wien und bildet damit das Nordostende der Alpen. Das 45 km lange und 20 bis 30 km breite Mittelgebirge ist großteils bewaldet und ein beliebtes Naherholungsgebiet für Wiener. Es ist heute – unter Einschluss der Randgebiete in der Millionenstadt Wien selbst – weitgehend vollständig als UNESCO-Biosphärenpark Wienerwald ausgewiesen. ",
    descriptionLicense: "Wikipedia",
    accessibility: "Barrierefreiheit nicht spezifiziert",
    publicTransport: [],
    coordinates: {
      lat: 48.25130595135,
      lng: 16.21372853390
    },
    district: 14,
    districtAreaSplit: {
      13: 10,
      14: 35,
      16: 5,
      17: 12.5,
      18: 5,
      19: 17.5,
      23: 15,
    },
    area: (9.5e+7 - (1920000 + 2.45e+7)), // ww - ottakringer wald - lainzer tiergarten
    openingHours: "Immer geöffnet", // Optional
    isFullPark: true,
    amenities: ["Grünfläche"],
    links: [
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/freizeit/wienerwald-als-biosphaerenpark",
        type: "official",
      },
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Wienerwald",
        type: "wiki",
      },
    ],
  },
  "steinhofgruende": {
    "name": "Steinhofgründe",
    "description": "Die Steinhofgründe sind ein naturbelassenes Erholungsgebiet mit vielen Freizeitmöglichkeiten. Sie zeichnen sich aus durch Wanderwege, kleine Tümpel und Lagerwiesen mit einem herrlichen Blick auf Wien. Sehenswert sind die Fundamente des Mittelwellensenders 'Rot-Weiß-Rot', der von der amerikanischen Armee in Österreich Anfang der 1950er-Jahre errichtet wurde, sowie die Kopfweiden am Tümpel.",
    "descriptionLicense": "Stadt Wien",
    "accessibility": "Die Hauptwege sind gut begehbar, jedoch großteils unbefestigt und teils steil. Für Rollstühle nur eingeschränkt geeignet, einzelne Randbereiche sind barrierearm erreichbar.",
    "publicTransport": [
      "Bus 46A",
      "Bus 46B"
    ],
    "links": [
      {
        "title": "Stadt Wien",
        "url": "https://www.wien.gv.at/freizeit/naherholungsgebiet-steinhof",
        "type": "official"
      },
      {
        "title": "Geschichte der Steinhofgründe",
        "url": "https://www.geschichtewiki.wien.gv.at/Steinhofgr%C3%BCnde_(Erholungsgebiet)",
        "type": "official"
      },
      {
        "title": "Wikipedia",
        "url": "https://de.wikipedia.org/wiki/Steinhofgr%C3%BCnde",
        "type": "wiki"
      },
      {
        "title": "Otto-Wagner-Kirche",
        "url": "https://www.wienmuseum.at/otto_wagner_kirche_am_steinhof",
        "type": "official"
      },
      {
        "title": "Karte (PDF)",
        "url": "https://www.wien.gv.at/freizeit/naherholungsgebiet-steinhof/pdf/steinhofgruende_karte.pdf",
        "type": "info"
      }
    ],
    "coordinates": {
      "lat": 48.2121264194,
      "lng": 16.2783931840
    },
    "area": 430000,
    "district": 14,
    "isFullPark": true,
    "amenities": ["Grünfläche", "Spielplatz", "Toiletten"]
  },
  "ottakringer-wald": {
    "name": "Ottakringer Wald",
    "description": "Der Ottakringer Wald war über Jahrhunderte ein Holz- und Wasserlieferant für die Ottakringer Bevölkerung. Heute dient er hauptsächlich als Erholungsgebiet. Die Wälder sind außerdem wichtiger Lebensraum vieler wild lebender Waldtiere.",
    "descriptionLicense": "Stadt Wien",
    "accessibility": "Barrierefreiheit nicht spezifiziert",
    "publicTransport": ["Bus 462A", "Bus 46B"],
    "links": [
      {
        "title": "Stadt Wien",
        "url": "https://www.wien.gv.at/freizeit/naherholungsgebiet-ottakringer-wald",
        "type": "official"
      },
      {
        "title": "Wikipedia",
        "url": "https://de.wikipedia.org/wiki/Ottakringer-Wald",
        "type": "wiki"
      },
      {
        "title": "Grillen in Wien",
        "url": "https://www.wien.gv.at/freizeit/grillen",
        "type": "official"
      }
    ],
    "coordinates": {
      "lat": 48.2240030744,
      "lng": 16.2723529975
    },
    "area": 1.92e+6,
    "district": 16,
    "isFullPark": true,
    "amenities": ["Grünfläche", "Grillen"]
  },
  "norbert-scheed-wald": {
    "name": "Norbert-Scheed-Wald",
    "description": "Ein wachsendes Wien braucht auch neue Grün- und Erholungsflächen. 15 Millionen Quadratmeter wird die Stadt in den nächsten Jahren schaffen. Einen zentralen Anteil daran wird der Norbert-Scheed-Wald in der Donaustadt mit rund 1.000 Hektar Fläche einnehmen. Denn gerade der Nordosten Wiens ist arm an Grünräumen.",
    "descriptionLicense": "Stadt Wien",
    "accessibility": "Barrierefreiheit nicht spezifiziert",
    "publicTransport": ["U2 Aspern Nord"],
    "links": [
      {
        "title": "Stadt Wien",
        "url": "https://www.wien.gv.at/freizeit/naherholungsgebiet-norbert-scheed-wald",
        "type": "official"
      },
      {
        "title": "Wikipedia",
        "url": "https://de.wikipedia.org/wiki/Norbert-Scheed-Wald",
        "type": "wiki"
      }
    ],
    "coordinates": {
      "lat": 48.25624027359,
      "lng": 16.50322909421
    },
    "area": 1e+7,
    "district": 22,
    "isFullPark": true,
    "amenities": ["Grünfläche"]
  },
  "jedleseer-aupark": {
    isFullPark: true,
    name: "Jedleseer Aupark",
    district: 21,
    area: 110000,
    coordinates: {
      lat: 48.2671083604,
      lng: 16.3791290211
    },
    description: "Die Lorettowiese und der Jedleseer Aupark sind eine kleine Freizeitoase in Floridsdorf im 21. Wiener Gemeindebezirk. Genauer betrachtet handelt es sich um Reste der alten Donauauen bzw der Schwarzen Lacke. Diese war ein stehendes Gewässer an der Donau und wurde im Zuge deren Regulierung in den 1870er Jahren zugeschüttet und begrünt. Das so gewonnene Land wurde verbaut oder, wie in unserem Fall, als Erholungsgebiet erhalten.",
    descriptionLicense: "Freizeit Info",
    publicTransport: ["Bus 34A"],
    links: [
      {
        title: "Freizeit Info",
        url: "https://www.freizeitferien.info/de/gruenraeume-erholung-wien/donau/lorettowiese-aupark-jedlesee",
        type: "info"
      },
    ],
    amenities: ["Grünfläche"]
  },
  "donauinsel": {
    "name": "Donauinsel",
    "description": "Die Donauinsel ist eine zwischen 1972 und 1988 errichtete, 21,1 km lange und bis zu 250 m breite künstliche Insel zwischen der Donau und der einige Meter tiefer liegenden Neuen Donau im Stadtgebiet von Wien und Klosterneuburg.",
    "descriptionLicense": "Wikipedia",
    "publicTransport": ["U1 Donuainsel", "U6 Neue Donau"],
    "links": [
      {
        "title": "Stadt Wien",
        "url": "https://www.wien.gv.at/umwelt/donauinsel",
        "type": "official"
      },
      {
        "title": "Wikipedia",
        "url": "https://de.wikipedia.org/wiki/Donauinsel",
        "type": "wiki"
      },
      {
        "title": "Geschichte",
        "url": "https://www.geschichtewiki.wien.gv.at/Donauinsel",
        "type": "official"
      },
      {
        "title": "Grillen in Wien",
        "url": "https://www.wien.gv.at/freizeit/grillen",
        "type": "official"
      },
    ],
    "coordinates": {
      "lat": 48.22854668962,
      "lng": 16.40969390030
    },
    "area": 3.9e+6,
    "district": 22,
    "districtAreaSplit": {
      22: 50,
      21: 50,
    },
    "isFullPark": true,
    "amenities": ["Grünfläche", "Toiletten", "Spielplatz", "Grillen", "Tischtennis", "Hundebereich"]
  },
  
};

/**
 * Generate a slug from a park name
 * @param name Park name
 * @returns Slugified name
 */
export function slugifyParkName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Get manual data for a park by ID or slug
 * @param idOrSlug Park ID or slug
 * @returns Manual park data if available
 */
export function getManualParkData(idOrSlug: string): ManualParkData | undefined {
  // Try direct lookup first
  if (manualParksDB[idOrSlug]) {
    return manualParksDB[idOrSlug];
  }

  // If not found and could be a slug, try to normalize it
  const normalizedSlug = slugifyParkName(idOrSlug);
  return manualParksDB[normalizedSlug];
}

/**
 * Get all manual parks marked as full park definitions
 * @returns Array of manual park data entries that are complete parks
 */
export function getManualOnlyParks(): Array<{ key: string; data: ManualParkData }> {
  const manualParks: Array<{ key: string; data: ManualParkData }> = [];

  for (const [key, data] of Object.entries(manualParksDB)) {
    if (data.isFullPark === true) {
      manualParks.push({ key, data });
    }
  }

  return manualParks;
}
