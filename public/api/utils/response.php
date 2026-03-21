<?php
/**
 * Response formatting utilities
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/filters.php';

/**
 * Send paginated parks response
 */
function sendParksResponse($data, $pagination, $filters = []) {
    $response = [
        'data' => $data,
        'pagination' => $pagination,
        'meta' => [
            'api_version' => API_VERSION,
            'timestamp' => date('c'),
            'total_parks' => $pagination['total']
        ]
    ];
    
    if (!empty($filters)) {
        $response['filters'] = buildFilterMetadata($filters);
    }
    
    sendResponse($response);
}

/**
 * Send single park response
 */
function sendParkResponse($park, $filters = []) {
    // Apply field filtering
    if (!empty($filters['fields']) || !empty($filters['exclude'])) {
        $park = filterFields($park, $filters['fields'] ?? [], $filters['exclude'] ?? []);
    }
    
    $response = [
        'data' => $park,
        'meta' => [
            'type' => 'park',
            'id' => $park['id'],
            'slug' => $park['slug'] ?? null,
            'api_version' => API_VERSION,
            'timestamp' => date('c')
        ]
    ];
    
    sendResponse($response);
}

/**
 * Send error response with context
 */
function sendErrorResponse($message, $code = 400, $context = []) {
    $response = [
        'error' => true,
        'message' => $message,
        'code' => $code,
        'meta' => [
            'api_version' => API_VERSION,
            'timestamp' => date('c')
        ]
    ];
    
    if (!empty($context)) {
        $response['context'] = $context;
    }
    
    sendResponse($response, $code);
}

/**
 * Send not found response
 */
function sendNotFoundResponse($resource = 'Resource') {
    sendErrorResponse("$resource not found", 404);
}

/**
 * Send validation error response
 */
function sendValidationResponse($errors) {
    $response = [
        'error' => true,
        'message' => 'Validation failed',
        'errors' => $errors,
        'meta' => [
            'api_version' => API_VERSION,
            'timestamp' => date('c')
        ]
    ];
    
    sendResponse($response, 422);
}

/**
 * Validate pagination parameters
 */
function validatePaginationParams($page, $limit) {
    $errors = [];
    
    if ($page < 1) {
        $errors[] = 'Page must be greater than 0';
    }
    
    if ($limit < 1 || $limit > MAX_LIMIT) {
        $errors[] = "Limit must be between 1 and " . MAX_LIMIT;
    }
    
    return $errors;
}

/**
 * Validate filter parameters
 */
function validateFilterParams($filters) {
    $errors = [];
    
    // Validate district numbers
    if (!empty($filters['district'])) {
        foreach ($filters['district'] as $district) {
            if (!is_numeric($district) || $district < 1 || $district > 23) {
                $errors[] = "Invalid district: $district. Must be between 1 and 23.";
            }
        }
    }
    
    // Validate area range
    if ($filters['area_min'] > 0 && $filters['area_max'] > 0) {
        if ($filters['area_min'] >= $filters['area_max']) {
            $errors[] = 'area_min must be less than area_max';
        }
    }
    
    // Validate field names
    $allowedFields = [
        'id', 'name', 'district', 'address', 'area', 'coordinates', 
        'amenities', 'category', 'openingHours', 'website', 'phone', 
        'description', 'descriptionLicense', 'accessibility', 'publicTransport', 
        'tips', 'links', 'slug', 'districtAreaSplit', 'rawMetadata'
    ];
    
    if (!empty($filters['fields'])) {
        foreach ($filters['fields'] as $field) {
            if (!in_array($field, $allowedFields)) {
                $errors[] = "Invalid field: $field";
            }
        }
    }
    
    if (!empty($filters['exclude'])) {
        foreach ($filters['exclude'] as $field) {
            if (!in_array($field, $allowedFields)) {
                $errors[] = "Invalid field to exclude: $field";
            }
        }
    }
    
    return $errors;
}
?>
