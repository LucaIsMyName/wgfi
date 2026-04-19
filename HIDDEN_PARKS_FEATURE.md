# Hidden Parks Feature - Implementation Complete

## Overview

The `hidden` field has been successfully implemented to allow excluding parks from the application.

## Usage

To hide any park, add `hidden: true` to its entry in `src/data/manualParksData.ts`:

### Hide an API park (enrichment mode):
```typescript
"donaupark": {
  hidden: true,  // Park won't appear in app, map, statistics, or sitemap
  publicTransport: ["U1 VIC/UNO City"],
  description: "...",
}
```

### Hide a manual park (full park mode):
```typescript
"burggarten": {
  isFullPark: true,
  hidden: true,  // Park won't appear anywhere
  name: "Burggarten",
  district: 1,
  area: 23000,
  // ... rest of fields
}
```

## What Was Changed

### 1. TypeScript Interface
**File:** `src/data/manualParksData.ts`
- Added `hidden?: boolean` field to `ManualParkData` interface

### 2. Parks Generation Script
**File:** `scripts/generate-parks-data.js`
- Extracts `hidden` field from enrichment entries (line 430-431)
- Extracts `hidden` field from full park entries (line 327-329)
- Skips hidden full parks during parsing (line 331)
- Filters out hidden API parks after transformation (lines 580-591)

### 3. Sitemap Generator
**File:** `scripts/generate-sitemap.js`
- Added `getEnrichmentData()` function to load hidden park data (lines 22-54)
- Filters hidden manual parks (lines 53-61)
- Filters hidden API parks (lines 170-173)

## How It Works

1. **Build Time Processing**: The `hidden` field is processed during `npm run build`
2. **Complete Exclusion**: Hidden parks are filtered out before data generation
3. **No Runtime Impact**: Hidden parks never make it into the generated data files
4. **Works Everywhere**: Affects listings, map, statistics, and sitemap

## Testing

After hiding a park, run:
```bash
npm run build
```

Then verify:
- Park doesn't appear in `/index` (park list)
- Park doesn't appear on `/map`
- Park doesn't appear in `/statistics`
- Park doesn't appear in `public/sitemap.xml`

## Notes

- Changes require rebuilding: `npm run build`
- Hidden parks are completely excluded from generated files
- Works for both API parks and manual parks
- The field is optional - parks without it are shown normally
