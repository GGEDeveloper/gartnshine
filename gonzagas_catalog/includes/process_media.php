<?php
// Process media files for the catalog
require_once '../config/config.php';
require_once '../config/database.php';

// Source media directory
$sourceDir = '/home/pixie/gonzagas/media/';
// Destination media directory
$destDir = '/home/pixie/gonzagas/gonzagas_catalog/media_processed/';

// Create the destination directory if it doesn't exist
if (!file_exists($destDir)) {
    mkdir($destDir, 0755, true);
    echo "Created destination directory: $destDir\n";
}

// Get all image files from the source directory
$imageFiles = glob($sourceDir . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);
$videoFiles = glob($sourceDir . '*.{mp4,webm,mov}', GLOB_BRACE);

// Process image files
$processedCount = 0;
$skippedCount = 0;
$errorCount = 0;

echo "Starting to process " . count($imageFiles) . " image files...\n";

foreach ($imageFiles as $srcFile) {
    $filename = basename($srcFile);
    $destFile = $destDir . $filename;
    
    // Skip if file already exists in destination
    if (file_exists($destFile)) {
        echo "File already exists, skipping: $filename\n";
        $skippedCount++;
        continue;
    }
    
    try {
        // Simply copy for now
        if (copy($srcFile, $destFile)) {
            echo "Processed: $filename\n";
            $processedCount++;
        } else {
            echo "Error processing: $filename\n";
            $errorCount++;
        }
    } catch (Exception $e) {
        echo "Exception processing $filename: " . $e->getMessage() . "\n";
        $errorCount++;
    }
}

// Process video files
echo "Starting to process " . count($videoFiles) . " video files...\n";

foreach ($videoFiles as $srcFile) {
    $filename = basename($srcFile);
    $destFile = $destDir . $filename;
    
    // Skip if file already exists in destination
    if (file_exists($destFile)) {
        echo "File already exists, skipping: $filename\n";
        $skippedCount++;
        continue;
    }
    
    try {
        // Simply copy for now
        if (copy($srcFile, $destFile)) {
            echo "Processed: $filename\n";
            $processedCount++;
        } else {
            echo "Error processing: $filename\n";
            $errorCount++;
        }
    } catch (Exception $e) {
        echo "Exception processing $filename: " . $e->getMessage() . "\n";
        $errorCount++;
    }
}

echo "Processing complete.\n";
echo "Processed: $processedCount files\n";
echo "Skipped: $skippedCount files\n";
echo "Errors: $errorCount files\n"; 