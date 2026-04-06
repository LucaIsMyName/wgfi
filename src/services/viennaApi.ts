// Vienna Open Data types and transform used for tooling / geo helpers.
// Runtime park data is generated at build time (`scripts/generate-parks-data.js`).
// Docs: https://www.data.gv.at/datasets/22add642-d849-48ff-9913-8c7ba2d99b46?locale=de

import { getManualParkData, slugifyParkName } from "../data/manualParksData";
import { getDistrictFromCoordinates } from "../utils/viennaDistrictFromCoordinates";

/**
 * Extended properties interface for Vienna API parks
 */
export interface ViennaParkProperties {
  OBJECTID: number;
  PARKNAME: string;
  BEZIRK: number;
  ADRESSE?: string;
  FLAECHE_M2?: number;
  KATEGORIE?: string;
  AUSSTATTUNG?: string;
  OEFFNUNGSZEITEN?: string;
  WEBLINK?: string;
  ANL_NAME?: string;
  NAME?: string;
  ID?: number | string;
  FID?: number | string;
  BEZIRKSNUMMER?: number;
  FLAECHE?: string | number;
  TYP?: string;
  SPIELEN_IM_PARK?: string;
  WASSER_IM_PARK?: string;
  HUNDE_IM_PARK?: string;
  OEFF_ZEITEN?: string;
  WEBLINK1?: string;
  TELEFON?: string;
}

export interface ViennaPark {
  type: "Feature";
  geometry: {
    type: "Point" | "Polygon";
    coordinates: number[] | number[][][];
  };
  properties: ViennaParkProperties;
}

export interface ViennaParksResponse {
  type: "FeatureCollection";
  features: ViennaPark[];
}

const VIENNA_API_BASE = "https://data.wien.gv.at/daten/geo";

export const VIENNA_ENDPOINTS = {
  parks: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json`,
  playgrounds: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPIELPLATZOGD&srsName=EPSG:4326&outputFormat=json`,
  trees: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BAUMOGD&srsName=EPSG:4326&outputFormat=json`,
  districts: `${VIENNA_API_BASE}?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json`,
};

function formatOpeningHours(hours: string): string {
  if (!hours) return "Täglich geöffnet";
  if (hours === "0:00-24:00") return "Täglich 24h geöffnet";
  return hours;
}

/**
 * Transform Vienna API feature to app park shape (same logic as build script).
 */
export function transformViennaPark(viennaPark: ViennaPark) {
  const props = viennaPark.properties;

  let coordinates = { lat: 0, lng: 0 };
  if (viennaPark.geometry.type === "Point") {
    const coords = viennaPark.geometry.coordinates as number[];
    coordinates = { lng: coords[0], lat: coords[1] };
  } else if (viennaPark.geometry.type === "Polygon") {
    const coords = viennaPark.geometry.coordinates as number[][][];
    if (coords[0] && coords[0].length > 0) {
      const ring = coords[0];
      const sumLng = ring.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = ring.reduce((sum, coord) => sum + coord[1], 0);
      coordinates = {
        lng: sumLng / ring.length,
        lat: sumLat / ring.length,
      };
    }
  }

  const name = props.ANL_NAME || props.PARKNAME || props.NAME || "Grünfläche";
  const parkId = (props.OBJECTID || props.ID || props.FID || "").toString();
  const slug = slugifyParkName(name);
  const manualData = getManualParkData(parkId) || getManualParkData(slug);

  let district = manualData?.district || props.BEZIRK || props.BEZIRKSNUMMER;
  if (!district || district === null) {
    district = getDistrictFromCoordinates(coordinates);
  }

  let area = 0;
  const flaeche = props.FLAECHE || props.FLAECHE_M2 || "0";
  if (typeof flaeche === "string") {
    const areaMatch = flaeche.match(/([\d.,]+)/);
    if (areaMatch) {
      const cleanedNumber = areaMatch[1].replace(/\./g, "").replace(",", ".");
      area = parseFloat(cleanedNumber) || 0;
    }
  } else {
    area = parseInt(String(flaeche), 10) || 0;
  }

  const address =
    manualData?.address || `${name}, ${district}. Bezirk, Wien`;
  const category = props.KATEGORIE || props.TYP || "Park";

  const amenitiesList: string[] = [];
  if (props.SPIELEN_IM_PARK === "Ja") amenitiesList.push("Spielplatz");
  if (props.WASSER_IM_PARK === "Ja") amenitiesList.push("Wasserspiele");
  if (props.HUNDE_IM_PARK === "Ja") amenitiesList.push("Hundebereich");

  amenitiesList.push("Grünfläche");
  if (name.toLowerCase().includes("spielplatz")) amenitiesList.push("Spielplatz");
  if (name.toLowerCase().includes("park")) amenitiesList.push("Sitzgelegenheiten");

  const amenities =
    amenitiesList.length > 0 ? amenitiesList : ["Grünfläche"];

  const mergedAmenities = manualData?.amenities
    ? [...new Set([...amenities, ...manualData.amenities])]
    : amenities;

  const stableId =
    parkId.trim() !== "" ? parkId : `wgfi-missing-id-${slug || "unknown"}`;

  const result = {
    id: stableId,
    name: manualData?.name || name,
    address,
    district,
    area: Math.round(area) || 0,
    coordinates,
    amenities: mergedAmenities,
    category,
    description:
      manualData?.description ||
      category ||
      "Öffentliche Grünfläche in Wien",
    openingHours:
      formatOpeningHours(props.OEFF_ZEITEN || "") || "Täglich geöffnet",
    website: props.WEBLINK1 || props.WEBLINK || "",
    phone: props.TELEFON || "",
    accessibility:
      manualData?.accessibility || "Barrierefreiheit nicht spezifiziert",
    publicTransport:
      manualData?.publicTransport || [
        "Öffentliche Verkehrsmittel in der Nähe verfügbar",
      ],
    tips: manualData?.tips || [],
  };

  if (manualData?.districtAreaSplit) {
    (result as { districtAreaSplit?: typeof manualData.districtAreaSplit }).districtAreaSplit =
      manualData.districtAreaSplit;
  }

  return result;
}
