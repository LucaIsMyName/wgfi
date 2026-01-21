# Build Scripts

## generate-sitemap.js

This script generates a dynamic sitemap.xml by fetching all parks from the Vienna Open Data API at build time.

### Usage

```bash
# Generate sitemap
npm run generate:sitemap

# Build project (automatically generates sitemap first)
npm run build
```

### What it does

1. Fetches all parks from Vienna Open Data API
2. Generates slugs for each park using the same logic as the app
3. Creates a sitemap.xml with:
   - All static pages (/, /index, /map, /statistics, /favorites, /idea)
   - Individual park detail pages (/park/[slug])
4. Saves the sitemap to `public/sitemap.xml`

### Output

The script generates a sitemap with:
- Priority values for SEO optimization
- Change frequency hints for search engines
- Last modified dates
- Proper XML formatting according to sitemap protocol

The sitemap is automatically included in your build and will be available at `https://yourdomain.com/sitemap.xml`
