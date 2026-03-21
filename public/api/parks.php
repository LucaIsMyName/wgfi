<?php
/**
 * Parks API Endpoint
 * GET /api/parks - List all parks with pagination and filtering
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils/data-loader.php';
require_once __DIR__ . '/utils/filters.php';
require_once __DIR__ . '/utils/response.php';

try {
    // Parse pagination parameters
    $page = getParam('page', 1, 'int');
    $limit = getParam('limit', DEFAULT_LIMIT, 'int');
    
    // Validate pagination
    list($page, $limit) = validatePagination($page, $limit);
    
    // Parse filter parameters
    $filters = parseFilters();
    
    // Validate all parameters
    $errors = array_merge(
        validatePaginationParams($page, $limit),
        validateFilterParams($filters)
    );
    
    if (!empty($errors)) {
        sendValidationResponse($errors);
    }
    
    // Load parks data
    $parks = loadParksData();
    
    // Apply filters
    $filteredParks = applyFilters($parks, $filters);
    
    // Apply sorting
    $sortedParks = applySorting($filteredParks, $filters['sort'], $filters['order']);
    
    // Apply pagination
    $result = applyPagination($sortedParks, $page, $limit);
    
    // Apply field filtering to results
    if (!empty($filters['fields']) || !empty($filters['exclude'])) {
        $result['data'] = array_map(function($park) use ($filters) {
            return filterFields($park, $filters['fields'] ?? [], $filters['exclude'] ?? []);
        }, $result['data']);
    }
    
    // Send response
    sendParksResponse($result['data'], $result['pagination'], $filters);
    
} catch (Exception $e) {
    sendErrorResponse('Internal server error: ' . $e->getMessage(), 500);
}
?>
