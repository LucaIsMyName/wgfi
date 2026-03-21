<?php
/**
 * Single Park API Endpoint
 * GET /api/park/{slugOrId} - Get single park by ID or slug
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils/data-loader.php';
require_once __DIR__ . '/utils/filters.php';
require_once __DIR__ . '/utils/response.php';

try {
    // Get park identifier from URL
    $identifier = $_GET['id'] ?? null;
    
    if (empty($identifier)) {
        sendErrorResponse('Park ID or slug is required', 400);
    }
    
    // Parse filter parameters (for field selection/exclusion)
    $filters = parseFilters();
    
    // Validate filter parameters
    $errors = validateFilterParams($filters);
    
    if (!empty($errors)) {
        sendValidationResponse($errors);
    }
    
    // Load parks data
    $parksIndex = getParksIndex();
    
    // Find park by ID or slug
    $park = findParkByIdentifier($parksIndex, $identifier);
    
    if ($park === null) {
        sendNotFoundResponse('Park');
    }
    
    // Send response
    sendParkResponse($park, $filters);
    
} catch (Exception $e) {
    sendErrorResponse('Internal server error: ' . $e->getMessage(), 500);
}
?>
