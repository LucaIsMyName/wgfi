<?php
/**
 * API Configuration
 */

// API Settings
define('API_VERSION', '1.0.0');
define('API_NAME', 'Wiener Grünflächen Index API');

// Pagination Settings
define('DEFAULT_LIMIT', 50);
define('MAX_LIMIT', 200);

// Cache Settings
define('CACHE_DIR', __DIR__ . '/cache');
define('CACHE_TTL', 3600); // 1 hour in seconds

// Data Source
define('PARKS_DATA_FILE', __DIR__ . '/../../src/data/generatedParks.ts');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendResponse([
        'error' => true,
        'message' => $message,
        'timestamp' => date('c')
    ], $statusCode);
}

/**
 * Validate and sanitize input parameters
 */
function getParam($name, $default = null, $type = 'string') {
    if (!isset($_GET[$name])) {
        return $default;
    }
    
    $value = $_GET[$name];
    
    switch ($type) {
        case 'int':
            return is_numeric($value) ? (int)$value : $default;
        case 'array':
            return is_array($value) ? $value : explode(',', $value);
        case 'string':
        default:
            return is_string($value) ? trim($value) : $default;
    }
}

/**
 * Parse comma-separated string into array
 */
function parseCommaSeparated($value) {
    if (is_array($value)) {
        return $value;
    }
    
    if (empty($value)) {
        return [];
    }
    
    return array_map('trim', explode(',', $value));
}

/**
 * Validate pagination parameters
 */
function validatePagination($page, $limit) {
    $page = max(1, $page);
    $limit = max(1, min($limit, MAX_LIMIT));
    
    return [$page, $limit];
}
?>
