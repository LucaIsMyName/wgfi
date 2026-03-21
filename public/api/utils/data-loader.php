<?php
/**
 * Data loading and caching utilities
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/slugify.php';

/**
 * Load parks data with caching
 */
function loadParksData() {
    $cacheFile = CACHE_DIR . '/parks-data.json';
    $sourceFile = PARKS_DATA_FILE;
    
    // Check if cache exists and is valid
    if (file_exists($cacheFile) && file_exists($sourceFile)) {
        $cacheTime = filemtime($cacheFile);
        $sourceTime = filemtime($sourceFile);
        
        if ($cacheTime > $sourceTime && (time() - $cacheTime) < CACHE_TTL) {
            // Cache is valid
            $data = json_decode(file_get_contents($cacheFile), true);
            if ($data !== false) {
                return $data;
            }
        }
    }
    
    // Cache is invalid or doesn't exist, parse source file
    $data = parseGeneratedParks($sourceFile);
    
    // Save to cache
    if (!is_dir(CACHE_DIR)) {
        mkdir(CACHE_DIR, 0755, true);
    }
    file_put_contents($cacheFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    return $data;
}

/**
 * Parse the generated TypeScript parks file
 */
function parseGeneratedParks($file) {
    if (!file_exists($file)) {
        throw new Exception("Parks data file not found: $file");
    }
    
    $content = file_get_contents($file);
    if ($content === false) {
        throw new Exception("Failed to read parks data file");
    }
    
    // Extract the PARKS_DATA array
    if (!preg_match('/export const PARKS_DATA: Park\[\] = (\[[\s\S]*?\]);/', $content, $matches)) {
        throw new Exception("Could not find PARKS_DATA array in file");
    }
    
    $arrayString = $matches[1];
    
    // Convert TypeScript array to PHP array
    $parks = parseTypeScriptArray($arrayString);
    
    // Add slugs to all parks
    foreach ($parks as &$park) {
        addSlugToPark($park);
    }
    
    return $parks;
}

/**
 * Parse TypeScript array syntax to PHP array
 */
function parseTypeScriptArray($arrayString) {
    // Simple parser for the specific format we have
    $arrayString = trim($arrayString);
    
    if ($arrayString[0] !== '[' || $arrayString[-1] !== ']') {
        throw new Exception("Invalid array format");
    }
    
    // Remove outer brackets
    $inner = substr($arrayString, 1, -1);
    
    $parks = [];
    $currentPark = '';
    $inString = false;
    $escapeNext = false;
    $braceLevel = 0;
    $bracketLevel = 0;
    
    $chars = str_split($inner);
    foreach ($chars as $i => $char) {
        if ($escapeNext) {
            $currentPark .= $char;
            $escapeNext = false;
            continue;
        }
        
        if ($char === '\\') {
            $escapeNext = true;
            $currentPark .= $char;
            continue;
        }
        
        if ($char === '"' && !$escapeNext) {
            $inString = !$inString;
            $currentPark .= $char;
            continue;
        }
        
        if (!$inString) {
            if ($char === '{') {
                $braceLevel++;
            } elseif ($char === '}') {
                $braceLevel--;
            } elseif ($char === '[') {
                $bracketLevel++;
            } elseif ($char === ']') {
                $bracketLevel--;
            } elseif ($char === ',' && $braceLevel === 0 && $bracketLevel === 0) {
                // End of park object
                $parkJson = '{' . trim($currentPark) . '}';
                $park = json_decode($parkJson, true);
                if ($park !== null) {
                    $parks[] = $park;
                }
                $currentPark = '';
                continue;
            }
        }
        
        $currentPark .= $char;
    }
    
    // Add the last park
    if (!empty(trim($currentPark))) {
        $parkJson = '{' . trim($currentPark) . '}';
        $park = json_decode($parkJson, true);
        if ($park !== null) {
            $parks[] = $park;
        }
    }
    
    return $parks;
}

/**
 * Get parks data as associative array by ID
 */
function getParksIndex() {
    $parks = loadParksData();
    $indexed = [];
    
    foreach ($parks as $park) {
        $indexed[$park['id']] = $park;
    }
    
    return $indexed;
}

/**
 * Clear cache
 */
function clearCache() {
    $cacheFile = CACHE_DIR . '/parks-data.json';
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
        return true;
    }
    return false;
}
?>
