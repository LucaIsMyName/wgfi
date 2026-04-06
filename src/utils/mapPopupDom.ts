import { slugifyParkName } from "../data/manualParksData";
import type { Park } from "../types/park";

/** Mapbox Popup content for the park detail page mini-map (text-safe, no HTML injection). */
export function createParkDetailMapPopupEl(park: {
  name: string;
  address?: string;
}): HTMLDivElement {
  const root = document.createElement("div");
  root.style.padding = "12px";
  root.style.borderRadius = "8px";
  root.style.textAlign = "center";

  const title = document.createElement("h3");
  title.style.fontFamily = "'Instrument Serif', serif";
  title.style.fontStyle = "italic";
  title.style.fontWeight = "600";
  title.style.margin = "0 0 8px 0";
  title.style.color = "var(--primary-green)";
  title.style.fontSize = "24px";
  title.textContent = park.name;

  const addr = document.createElement("p");
  addr.style.fontFamily = "'Geist Mono', monospace";
  addr.style.margin = "0";
  addr.style.fontSize = "14px";
  addr.style.color = "var(--deep-charcoal)";
  addr.textContent =
    park.address?.trim() ? park.address : "Adresse nicht verfügbar";

  root.appendChild(title);
  root.appendChild(addr);
  return root;
}

/** Mapbox Popup content for main map markers (text-safe links and labels). */
export function createMapMarkerPopupEl(park: Park): HTMLDivElement {
  const root = document.createElement("div");
  root.style.padding = "16px";

  const title = document.createElement("h3");
  title.style.width = "100%";
  title.style.fontSize = "32px";
  title.style.fontStyle = "italic";
  title.style.color = "var(--primary-green)";
  title.style.fontFamily = "'Instrument Serif', serif";
  title.style.lineHeight = "0.9";
  title.style.marginRight = "0.75em";
  title.textContent = park.name;

  const district = document.createElement("p");
  district.style.margin = "0";
  district.style.fontSize = "12px";
  district.style.fontFamily = "'Geist Mono', monospace";
  district.textContent = `${park.district}. BEZIRK`;

  const link = document.createElement("a");
  link.href = `/index/${slugifyParkName(park.name)}`;
  link.style.backgroundColor = "var(--primary-green)";
  link.style.color = "var(--soft-cream)";
  link.style.padding = "6px 12px";
  link.style.display = "inline-block";
  link.style.marginTop = "16px";
  link.style.textDecoration = "none";
  link.style.fontFamily = "'Geist Mono', sans-serif";
  link.style.fontWeight = "500";
  link.style.fontSize = "12px";
  link.textContent = "DETAILS";

  root.appendChild(title);
  root.appendChild(district);
  root.appendChild(link);
  return root;
}
