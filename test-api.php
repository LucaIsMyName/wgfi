<?php
/**
 * Simple test script to validate API structure
 */

// Include API files
require_once 'public/api/config.php';
require_once 'public/api/utils/data-loader.php';
require_once 'public/api/utils/filters.php';
require_once 'public/api/utils/response.php';

echo "=== Testing API Structure ===\n";

// Test 1: Data loading
try {
    $parks = loadParksData();
    echo "✓ Data loading: " . count($parks) . " parks loaded\n";
} catch (Exception $e) {
    echo "✗ Data loading failed: " . $e->getMessage() . "\n";
}

// Test 2: Slugification
$testNames = ['Prater', 'Schönbrunn Park', 'Donauinsel'];
foreach ($testNames as $name) {
    $slug = slugifyParkName($name);
    echo "✓ Slugification: '$name' -> '$slug'\n";
}

// Test 3: Filtering
$filters = [
    'district' => [1, 2, 3],
    'area_min' => 1000,
    'name' => 'garten'
];
$filtered = applyFilters($parks ?? [], $filters);
echo "✓ Filtering: " . count($filtered) . " parks match criteria\n";

// Test 4: Sorting
$sorted = applySorting($filtered ?? [], 'area', 'desc');
echo "✓ Sorting: Parks sorted by area descending\n";

// Test 5: Pagination
$result = applyPagination($sorted ?? [], 1, 10);
echo "✓ Pagination: " . count($result['data']) . " items on page 1\n";

echo "=== API Structure Test Complete ===\n";
?>
