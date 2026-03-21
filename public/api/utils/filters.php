<?php
/**
 * Filtering and sorting utilities
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/slugify.php';

/**
 * Apply filters to parks array
 */
function applyFilters($parks, $filters) {
    $filtered = $parks;
    
    // District filter
    if (!empty($filters['district'])) {
        $districts = array_map('intval', $filters['district']);
        $filtered = array_filter($filtered, function($park) use ($districts) {
            return in_array($park['district'], $districts);
        });
    }
    
    // Area range filter
    if (isset($filters['area_min']) && $filters['area_min'] > 0) {
        $minArea = $filters['area_min'];
        $filtered = array_filter($filtered, function($park) use ($minArea) {
            return $park['area'] >= $minArea;
        });
    }
    
    if (isset($filters['area_max']) && $filters['area_max'] > 0) {
        $maxArea = $filters['area_max'];
        $filtered = array_filter($filtered, function($park) use ($maxArea) {
            return $park['area'] <= $maxArea;
        });
    }
    
    // Name search filter
    if (!empty($filters['name'])) {
        $searchTerm = strtolower($filters['name']);
        $filtered = array_filter($filtered, function($park) use ($searchTerm) {
            return strpos(strtolower($park['name']), $searchTerm) !== false;
        });
    }
    
    return array_values($filtered); // Re-index array
}

/**
 * Apply sorting to parks array
 */
function applySorting($parks, $sortField = 'name', $order = 'asc') {
    if (empty($parks)) {
        return $parks;
    }
    
    $order = strtolower($order);
    $ascending = $order !== 'desc';
    
    usort($parks, function($a, $b) use ($sortField, $ascending) {
        $valueA = getSortValue($a, $sortField);
        $valueB = getSortValue($b, $sortField);
        
        if ($valueA === $valueB) {
            return 0;
        }
        
        $comparison = $valueA < $valueB ? -1 : 1;
        return $ascending ? $comparison : -$comparison;
    });
    
    return $parks;
}

/**
 * Get value for sorting
 */
function getSortValue($park, $field) {
    switch ($field) {
        case 'name':
            return strtolower($park['name']);
        case 'area':
            return $park['area'];
        case 'district':
            return $park['district'];
        case 'id':
            return $park['id'];
        default:
            return $park[$field] ?? '';
    }
}

/**
 * Apply pagination
 */
function applyPagination($parks, $page, $limit) {
    $total = count($parks);
    $pages = ceil($total / $limit);
    $offset = ($page - 1) * $limit;
    
    $pagedParks = array_slice($parks, $offset, $limit);
    
    return [
        'data' => $pagedParks,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => $pages
        ]
    ];
}

/**
 * Filter fields in park data
 */
function filterFields($park, $fields, $exclude) {
    if (!empty($fields)) {
        $filtered = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $park)) {
                $filtered[$field] = $park[$field];
            }
        }
        $park = $filtered;
    }
    
    if (!empty($exclude)) {
        foreach ($exclude as $field) {
            unset($park[$field]);
        }
    }
    
    return $park;
}

/**
 * Parse filter parameters from request
 */
function parseFilters() {
    $filters = [];
    
    // District filter (comma-separated)
    $district = getParam('district');
    if ($district !== null) {
        $filters['district'] = parseCommaSeparated($district);
        $filters['district'] = array_filter($filters['district'], 'is_numeric');
    }
    
    // Area range
    $filters['area_min'] = getParam('area_min', 0, 'int');
    $filters['area_max'] = getParam('area_max', 0, 'int');
    
    // Name search
    $filters['name'] = getParam('name');
    
    // Sort options
    $sortField = getParam('sort', 'name');
    $allowedSorts = ['name', 'area', 'district', 'id'];
    $filters['sort'] = in_array($sortField, $allowedSorts) ? $sortField : 'name';
    
    $order = getParam('order', 'asc');
    $filters['order'] = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'asc';
    
    // Field selection
    $fields = getParam('fields');
    if ($fields !== null) {
        $filters['fields'] = parseCommaSeparated($fields);
    }
    
    $exclude = getParam('exclude');
    if ($exclude !== null) {
        $filters['exclude'] = parseCommaSeparated($exclude);
    }
    
    return $filters;
}

/**
 * Build filter metadata for response
 */
function buildFilterMetadata($filters) {
    $metadata = [];
    
    if (!empty($filters['district'])) {
        $metadata['district'] = array_map('intval', $filters['district']);
    }
    
    if ($filters['area_min'] > 0) {
        $metadata['area_min'] = $filters['area_min'];
    }
    
    if ($filters['area_max'] > 0) {
        $metadata['area_max'] = $filters['area_max'];
    }
    
    if (!empty($filters['name'])) {
        $metadata['name'] = $filters['name'];
    }
    
    if (!empty($filters['sort'])) {
        $metadata['sort'] = $filters['sort'];
        $metadata['order'] = $filters['order'];
    }
    
    return $metadata;
}
?>
