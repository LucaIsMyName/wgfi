# Vienna Parks API

## 🌳 Overview

This is a RESTful PHP API that provides access to Vienna parks data with pagination, filtering, and caching capabilities.

## 🚀 Quick Start

### Prerequisites

- PHP 8.0+ 
- Web server (Apache/Nginx) with PHP support
- Mod_rewrite enabled for clean URLs

### Installation

1. Deploy the `/public/api/` folder to your web server
2. Ensure PHP files are executable
3. Configure URL rewriting (`.htaccess` included)
4. Test endpoints

## 📁 API Endpoints

### `GET /api/`

**Purpose**: API information and available endpoints

**Response**:
```json
{
  "api": {
    "name": "Wiener Grünflächen Index API",
    "version": "1.0.0",
    "description": "Public API for Vienna Parks and Green Spaces",
    "base_url": "/api",
    "timestamp": "2026-03-21T10:30:00+00:00",
    "total_parks": 1052
  },
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/parks",
      "description": "List all parks with pagination and filtering"
    },
    {
      "method": "GET", 
      "path": "/api/park/{slugOrId}",
      "description": "Get single park by ID or slug"
    }
  ],
  "examples": [...],
  "field_reference": {...}
}
```

### `GET /api/parks`

**Purpose**: List all parks with pagination and filtering

**Parameters**:
- `page` (int, default: 1) - Page number
- `limit` (int, default: 50, max: 200) - Items per page
- `district` (string) - Filter by districts: `?district=1,2,3`
- `area_min` (int) - Minimum area in m²
- `area_max` (int) - Maximum area in m²
- `name` (string) - Search by park name (partial match)
- `sort` (string) - Sort field: `name`, `area`, `district`, `id`
- `order` (string) - Sort order: `asc`, `desc`
- `fields` (string) - Include only specified fields: `?fields=id,name,district`
- `exclude` (string) - Exclude specified fields: `?exclude=rawMetadata,description`

**Examples**:
```bash
# Get first 10 parks from districts 1, 2, 3
GET /api/parks?limit=10&district=1,2,3

# Search for parks with "garten" in name
GET /api/parks?name=garten

# Get parks larger than 100,000 m², sorted by area
GET /api/parks?area_min=100000&sort=area&order=desc

# Get only basic fields
GET /api/parks?fields=id,name,district,area
```

### `GET /api/park/{slugOrId}`

**Purpose**: Get single park by ID or slug

**Parameters**:
- `fields` (string) - Include only specified fields
- `exclude` (string) - Exclude specified fields

**Examples**:
```bash
# Get park by ID
GET /api/park/3538666

# Get park by slug
GET /api/park/stadtpark

# Get only basic fields
GET /api/park/prater?fields=id,name,district,area
```

## 🔧 Configuration

### Server Requirements

**Apache (.htaccess included)**:
```apache
RewriteEngine On
RewriteBase /api/

# Parks list endpoint
RewriteRule ^parks/?$ parks.php [L,QSA]

# Single park endpoint
RewriteRule ^park/([^/]+)/?$ park.php?id=$1 [L,QSA]
```

**Nginx**:
```nginx
location /api/ {
    try_files $uri $uri/ =404;
    location ~ ^/api/parks?$ {
        fastcgi_param SCRIPT_FILENAME $document_root/api/parks.php;
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }
    location ~ ^/api/park/([^/]+)$ {
        fastcgi_param SCRIPT_FILENAME $document_root/api/park.php;
        fastcgi_param QUERY_STRING id=$1&$args;
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }
}
```

### Performance Settings

- **Caching**: 1-hour file-based cache
- **Memory**: ~2MB for all parks data
- **Pagination**: 50 items default, 200 max
- **Compression**: Enable gzip for responses

## 📊 Data Source

The API reads from the generated parks data file:
- **Source**: `src/data/generatedParks.ts`
- **Format**: TypeScript array → PHP array
- **Update**: Run `npm run generate:parks` to refresh data
- **Cache**: Automatic caching with TTL validation

## 🛠️ Development

### File Structure

```
api/
├── index.php              # Main router and documentation
├── parks.php              # Parks list endpoint
├── park.php               # Single park endpoint
├── config.php             # Configuration constants
├── utils/
│   ├── data-loader.php     # Data loading and caching
│   ├── slugify.php        # Slugification logic
│   ├── filters.php         # Filtering and sorting
│   └── response.php        # Response formatting
├── cache/
│   └── parks-data.json    # Cached parks data
├── .htaccess              # URL rewriting
└── README.md              # This file
```

### Testing

```bash
# Test API structure (requires PHP CLI)
php test-api.php

# Test endpoints
curl "http://yourdomain.com/api/parks?limit=5"
curl "http://yourdomain.com/api/park/3538666"
```

## 🔒 Security

### Recommendations

1. **Rate Limiting**: Configure at web server level
2. **HTTPS**: Use SSL in production
3. **Input Validation**: All parameters are validated
4. **CORS**: Configured for development, restrict in production
5. **Error Handling**: No sensitive information in error messages

## 🚀 Deployment

### Production Setup

1. **Web Server**: Apache/Nginx with PHP-FPM
2. **Permissions**: Ensure web server can write to `cache/` directory
3. **URL Rewriting**: Enable mod_rewrite (Apache) or proper location blocks (Nginx)
4. **PHP Version**: PHP 8.0+ recommended for performance

### Environment Variables

```bash
# Production
export APP_ENV=production

# Development  
export APP_ENV=development
```

## 📈 Monitoring

### Response Headers

All responses include:
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`
- `X-API-Version: 1.0.0`

### Error Responses

```json
{
  "error": true,
  "message": "Error description",
  "code": 400,
  "meta": {
    "api_version": "1.0.0",
    "timestamp": "2026-03-21T10:30:00+00:00"
  }
}
```

## 🤝 Integration

### Frontend Usage

```javascript
// Fetch parks with filtering
const response = await fetch('/api/parks?district=1,2,3&limit=10');
const data = await response.json();

// Get single park
const parkResponse = await fetch('/api/park/stadtpark');
const park = await parkResponse.json();
```

### External Applications

The API can be used by:
- Mobile applications
- Other websites
- Data analysis tools
- Third-party integrations

## 📞 Troubleshooting

### Common Issues

1. **404 Errors**: Check `.htaccess` and URL rewriting
2. **500 Errors**: Check PHP error logs and file permissions
3. **Empty Responses**: Verify cache directory is writable
4. **CORS Issues**: Check server configuration

### Debug Mode

Set `error_reporting(E_ALL)` and `ini_set('display_errors', 1)` in development to see PHP errors.

## 📝 License

This API is part of the WGFI project and available under the same MIT License.
