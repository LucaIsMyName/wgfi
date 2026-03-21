<?php
/**
 * Slugification utilities
 * Port of TypeScript slugifyParkName function
 */

/**
 * Convert park name to URL-friendly slug
 * Matches the frontend slugifyParkName function exactly
 */
function slugifyParkName($name) {
    if (empty($name)) {
        return '';
    }
    
    $slug = strtolower($name)
        // Replace German characters
        .str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], $name)
        // Replace non-alphanumeric characters with hyphens
        .preg_replace('/[^a-z0-9]+/', '-', $name)
        // Remove leading/trailing hyphens
        .preg_replace('/^-|-$/', '', $name);
    
    return $slug;
}

/**
 * Generate slug for a park and add it to the park data
 */
function addSlugToPark(&$park) {
    if (!isset($park['slug'])) {
        $park['slug'] = slugifyParkName($park['name']);
    }
}

/**
 * Find park by slug or ID
 */
function findParkByIdentifier($parks, $identifier) {
    // Try direct ID match first
    if (isset($parks[$identifier])) {
        return $parks[$identifier];
    }
    
    // Try slug match
    foreach ($parks as $park) {
        if (isset($park['slug']) && $park['slug'] === $identifier) {
            return $park;
        }
        
        // Generate slug on-the-fly if not present
        $slug = slugifyParkName($park['name']);
        if ($slug === $identifier) {
            return $park;
        }
    }
    
    return null;
}
?>
