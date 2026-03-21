<?php
/**
 * API Index and Documentation
 * GET /api/ - API information and endpoints
 */

require_once __DIR__ . '/config.php';

$endpoints = [
    [
        'method' => 'GET',
        'path' => '/api/parks',
        'description' => 'List all parks with pagination and filtering',
        'parameters' => [
            'page' => ['type' => 'integer', 'default' => 1, 'description' => 'Page number'],
            'limit' => ['type' => 'integer', 'default' => 50, 'max' => 200, 'description' => 'Items per page'],
            'district' => ['type' => 'string', 'example' => '1,2,3', 'description' => 'Filter by districts (comma-separated)'],
            'area_min' => ['type' => 'integer', 'description' => 'Minimum area in m²'],
            'area_max' => ['type' => 'integer', 'description' => 'Maximum area in m²'],
            'name' => ['type' => 'string', 'description' => 'Search by park name (partial match)'],
            'sort' => ['type' => 'string', 'default' => 'name', 'options' => ['name', 'area', 'district', 'id'], 'description' => 'Sort field'],
            'order' => ['type' => 'string', 'default' => 'asc', 'options' => ['asc', 'desc'], 'description' => 'Sort order'],
            'fields' => ['type' => 'string', 'example' => 'id,name,district', 'description' => 'Include only specified fields'],
            'exclude' => ['type' => 'string', 'example' => 'rawMetadata,description', 'description' => 'Exclude specified fields']
        ]
    ],
    [
        'method' => 'GET',
        'path' => '/api/park/{slugOrId}',
        'description' => 'Get single park by ID or slug',
        'parameters' => [
            'fields' => ['type' => 'string', 'example' => 'id,name,district', 'description' => 'Include only specified fields'],
            'exclude' => ['type' => 'string', 'example' => 'rawMetadata,description', 'description' => 'Exclude specified fields']
        ]
    ]
];

$examples = [
    'parks' => [
        'description' => 'Get first 10 parks from districts 1, 2, and 3',
        'url' => '/api/parks?limit=10&district=1,2,3',
        'method' => 'GET'
    ],
    'large_parks' => [
        'description' => 'Get parks larger than 100,000 m², sorted by area descending',
        'url' => '/api/parks?area_min=100000&sort=area&order=desc',
        'method' => 'GET'
    ],
    'search' => [
        'description' => 'Search for parks with "stadtpark" in name',
        'url' => '/api/parks?name=stadtpark',
        'method' => 'GET'
    ],
    'minimal' => [
        'description' => 'Get only basic fields for all parks',
        'url' => '/api/parks?fields=id,name,district,area',
        'method' => 'GET'
    ],
    'single_park' => [
        'description' => 'Get specific park by ID',
        'url' => '/api/park/3538666',
        'method' => 'GET'
    ],
    'single_park_slug' => [
        'description' => 'Get specific park by slug',
        'url' => '/api/park/stadtpark',
        'method' => 'GET'
    ]
];

$response = [
    'api' => [
        'name' => API_NAME,
        'version' => API_VERSION,
        'description' => 'Public API for Vienna Parks and Green Spaces',
        'base_url' => '/api',
        'timestamp' => date('c'),
        'total_parks' => function() {
            try {
                $parks = loadParksData();
                return count($parks);
            } catch (Exception $e) {
                return 'Unknown';
            }
        }
    ],
    'endpoints' => $endpoints,
    'examples' => $examples,
    'field_reference' => [
        'id' => 'Unique park identifier',
        'name' => 'Park name',
        'district' => 'Vienna district number (1-23)',
        'address' => 'Full address',
        'area' => 'Area in square meters',
        'coordinates' => ['lat' => 'Latitude', 'lng' => 'Longitude'],
        'amenities' => 'List of available amenities',
        'category' => 'Park category',
        'openingHours' => 'Opening hours',
        'website' => 'Park website URL',
        'phone' => 'Contact phone number',
        'description' => 'Park description',
        'descriptionLicense' => 'Description license',
        'accessibility' => 'Accessibility information',
        'publicTransport' => 'Public transport options',
        'tips' => 'Additional tips',
        'links' => 'Related links',
        'slug' => 'URL-friendly slug',
        'districtAreaSplit' => 'District area distribution',
        'rawMetadata' => 'Original API metadata'
    ],
    'usage_notes' => [
        'All endpoints are public and require no authentication',
        'Pagination defaults to 50 items per page, maximum 200',
        'Use fields parameter to reduce response size',
        'Use exclude parameter to remove unwanted fields',
        'District numbers range from 1 to 23 for Vienna',
        'Area is specified in square meters (m²)',
        'Slugs are generated from park names and are URL-friendly',
        'Responses include timestamps and API version information'
    ]
];

sendResponse($response);
?>
