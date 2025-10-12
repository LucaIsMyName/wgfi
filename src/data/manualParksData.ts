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
}

const praterDescription = "Der Wiener Prater liegt im südöstlichen Teil der Flussinsel, die seit der 1875 beendeten Donauregulierung von Donau und Donaukanal gebildet wird. Eine offiziell definierte Begrenzung des Pratergebiets existiert nicht. Durch Verbauung hat sich im Lauf der Zeit die als „Prater“ bezeichnete Fläche deutlich verringert; so wird heute das verbaute Stuwerviertel (früher Schwimmschulmais, Feuerwerksmais) nicht mehr als Teil des Praters bezeichnet, ebenso der ganz im Südosten der Insel gelegene Hafen Freudenau, der auch als Winterhafen bezeichnet wird.";
const praterLinks = [
  {
    title: "Wikipedia",
    url: "https://de.wikipedia.org/wiki/Prater",
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
  },
  /** Augarten */
  augarten: {
    name: "Augarten",
    district: 2,
    address: "Obere Augartenstraße, 1020 Wien",
    description: "Der Augarten ist der älteste Barockgarten Wiens und wurde 1712 für die Öffentlichkeit zugänglich gemacht. Neben der historischen Porzellanmanufaktur beherbergt der Park auch die markanten Flaktürme aus dem Zweiten Weltkrieg.",
    publicTransport: ["U2 Taborstraße", "Straßenbahn 5, 31"],
    accessibility: "Größtenteils barrierefrei zugänglich",
    links: [
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Augarten",
        type: "wiki",
      },
      {
        title: "Stadt Wien",
        url: "https://www.wien.gv.at/umwelt/parks/anlagen/augarten.html",
        type: "official",
      },
    ],
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
  },
  /** Prater */
  "prater-jesuitenwiese": {
    publicTransport: ["U2 Messe-Prater"],
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
    tips: ["Volksstimme-Fest am letzten Wochenende in den Sommerferien"],
  },
  "prater-sulzwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-gross-enzersdorfer-wiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-fasangarten": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-rustenschacher": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-grafenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-pelzmais": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-rosenbachl": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-sonnenscheinwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-feuerwehrwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-wasserwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-avenue": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-golfwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-epplwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-arenawiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-forstwiesen-nord": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-forstwiesen-sued": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-seitenhafenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-ameiswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-laufbergwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-zirkuswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-spenadlwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-untere-heustadlwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-bluemnwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-kaiserwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-meiereiwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-lusthauswiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-konstantinhuegel": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-schulverkehrsgartenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-rennbahnstrassenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
  },
  "prater-rotundenwiese": {
    description: praterDescription,
    descriptionLicense: "Wikipedia",
    links: praterLinks as any,
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
        url: "https://de.wikipedia.org/wiki/Teich_Hirschstetten",
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
      }
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
  },
  wasserpark: {
    description: "Der Floridsdorfer Wasserpark ist ein kleiner, als Parkanlage gestalteter Teil der Alten Donau im 21. Wiener Gemeindebezirk, Floridsdorf. Der Park wurde von 1928 bis 1929 angelegt und hat eine Fläche von 143.000 m², rund ein Drittel davon wird von Wasserflächen eingenommen.",
  },
  "pa-roter-berg": {
    description: "Der Rote Berg liegt im Süden des Bezirksteils Ober-St.-Veit an der Grenze zum Bezirksteil Lainz. Der nur am Rand verbaute, wenig bewaldete Hügel bildet mit den nordwestlich anschließenden, unwesentlich höheren Hügeln Girzenberg und Trazerberg einen nicht von Straßen durchquerten Grünraum. Unter den drei Bergen verläuft von Nordwest nach Südost der in den 2000er Jahren gebaute Lainzer Tunnel, der von den ÖBB Ende 2012 in Betrieb genommen wurde (Sicherheitsausstieg gegenüber Veitingergasse 59). In der Senke östlich des Roten Bergs verlaufen in Nord-Süd-Richtung die Verbindungsbahn zwischen West- und Südbahn sowie der verrohrte Lainzerbach, dann steigt das Gelände nach Osten zum Küniglberg an.",
  },
  draschepark: {
    description: "Der Draschepark ist eine 13 Hektar große Parkanlage in Inzersdorf im 23. Wiener Gemeindebezirk Liesing. Er ging aus dem Park rund um die beiden als Schloss Inzersdorf bezeichneten Schlösser hervor. Der Name des Parks verweist auf die Familie Drasche von Wartinberg, die ab 1857 die beiden Schlösser auf dem Gelände besaß.",
  },
  schweizergarten: {
    description: "Der Schweizergarten ist eine Parkanlage im 3. Wiener Gemeindebezirk, Landstraße, zwischen dem Park des Belvederes bzw. dem Landstraßer Gürtel im Norden, dem Quartier Belvedere (dem Areal des früheren Südbahnhofs) bzw. der Arsenalstraße im Westen und dem Arsenal bzw. der Ghegastraße im Südosten.",
  },
  "auer-welsbach-park": {
    description: "Der Auer-Welsbach-Park ist eine Parkanlage im 15. Wiener Gemeindebezirk Rudolfsheim-Fünfhaus und wird von Linker Wienzeile, Schönbrunner Schlossallee, Mariahilfer Straße und Winckelmannstraße begrenzt. Mit einer Fläche von rund 110.000 m² ist er der größte Park des 15. Bezirks. Benannt ist er nach dem österreichischen Chemiker Carl Auer von Welsbach.",
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
