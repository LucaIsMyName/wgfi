# Manual Parks Guide

This guide explains how to add completely new parks to the database that don't exist in the Vienna Open Data API.

## Overview

The app supports two types of manual park data:

1. **Enrichment Data**: Adds/supplements information for existing API parks (e.g., adding amenities, descriptions)
2. **Full Park Definitions**: Adds completely new parks not found in the Vienna API

## Adding a Complete New Park

### Required Fields

When adding a full park (`isFullPark: true`), you must provide:

- `isFullPark: true` - Flag to indicate this is a complete park
- `name` - Park name (string)
- `district` - District number (1-23)
- `area` - Area in square meters (number)
- `coordinates` - Exact coordinates `{ lat: number, lng: number }`

### Optional Fields

- `address` - Full address (auto-generated if not provided)
- `category` - Park type (default: "Park")
- `amenities` - Array of amenities (default: ["Grünfläche"])
- `description` - Park description
- `descriptionLicense` - Source of description (e.g., "Wikipedia")
- `openingHours` - Opening hours (default: "Täglich geöffnet")
- `website` - Official website URL
- `phone` - Contact phone number
- `accessibility` - Accessibility information
- `publicTransport` - Array of public transport options
- `tips` - Array of visitor tips
- `links` - Array of related links

### Example: Adding a New Park

Edit `/src/data/manualParksData.ts` and add to the `manualParksDB` object:

```typescript
export const manualParksDB: Record<string, ManualParkData> = {
  // ... existing parks ...
  
  // Example: Adding Bundesgarten Belvedere
  "bundesgarten-belvedere": {
    isFullPark: true,
    name: "Bundesgarten Belvedere",
    district: 3,
    address: "Prinz-Eugen-Straße 27, 1030 Wien",
    area: 460000, // 46 hectares in square meters
    coordinates: {
      lat: 48.1914,
      lng: 16.3805
    },
    category: "Bundesgarten",
    amenities: ["Grünfläche", "Springbrunnen", "Barockgarten", "Aussichtspunkt"],
    description: "Der Belvedere-Garten ist ein barocker Schlosspark zwischen Oberem und Unterem Belvedere. Er wurde von Dominique Girard im französischen Stil angelegt und beherbergt zahlreiche Skulpturen und Springbrunnen.",
    descriptionLicense: "Wikipedia",
    openingHours: "Täglich 6:30 bis Einbruch der Dunkelheit",
    website: "https://www.belvedere.at/",
    accessibility: "Barrierefreier Zugang teilweise möglich",
    publicTransport: [
      "Straßenbahn D: Belvedere",
      "Straßenbahn 18: Quartier Belvedere",
      "Straßenbahn 71: Unteres Belvedere"
    ],
    tips: [
      "Besuchen Sie das Obere Belvedere Museum",
      "Fotografieren Sie den Springbrunnen im Zentrum"
    ],
    links: [
      {
        title: "Offizielle Website",
        url: "https://www.belvedere.at/",
        type: "official"
      },
      {
        title: "Wikipedia",
        url: "https://de.wikipedia.org/wiki/Belvedere_(Wien)",
        type: "wiki"
      }
    ]
  },
};
```

### Key Points

1. **Unique Key**: Use a slugified version of the park name as the key (lowercase, hyphens)
2. **Coordinates**: Must be accurate (use Google Maps or similar to get exact coordinates)
3. **Area**: In square meters (1 hectare = 10,000 m²)
4. **ID Generation**: System automatically generates unique IDs with `manual-` prefix
5. **No Conflicts**: Manual park IDs won't conflict with API parks

## After Adding a Park

1. **Clear Cache**: The app caches park data for 7 days. Clear browser local storage or wait for cache expiration to see new parks.
2. **Reload App**: Refresh the browser to fetch and display the new park.
3. **Verify**: Check the parks list and statistics page to ensure the park appears correctly.

## Debugging

If a manual park doesn't appear:

1. Check browser console for validation warnings
2. Ensure all required fields are provided
3. Verify coordinates are in Vienna (lat ~48.2, lng ~16.3)
4. Clear local storage: `localStorage.clear()` in browser console

## Converting Enrichment to Full Park

If you have an enrichment entry and want to convert it to a full park:

```typescript
// Before (enrichment only)
"park-name": {
  amenities: ["Toiletten"],
  description: "A nice park"
},

// After (full park)
"park-name": {
  isFullPark: true,
  name: "Park Name",
  district: 10,
  area: 15000,
  coordinates: { lat: 48.2082, lng: 16.3738 },
  amenities: ["Toiletten", "Grünfläche"],
  description: "A nice park"
}
```

## Best Practices

- **Verify Data**: Double-check all information before adding
- **Use Official Sources**: Get data from official websites when possible
- **Consistent Naming**: Follow Vienna's naming conventions
- **Attribution**: Always credit sources in `descriptionLicense`
- **Coordinate Precision**: Use at least 4 decimal places for accuracy
