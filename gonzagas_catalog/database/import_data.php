<?php
// Import data from Excel file to database
require_once '../config/config.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

// Check if PhpSpreadsheet is installed
if (!file_exists('../vendor/autoload.php')) {
    die("Please run 'composer require phpoffice/phpspreadsheet' in the project root directory");
}

require_once '../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

// Function to sanitize data
function sanitizeData($value) {
    if (is_null($value) || $value === '') {
        return null;
    }
    if (is_numeric($value)) {
        return $value;
    }
    return trim($value);
}

// Function to get family ID from code
function getFamilyId($conn, $code) {
    $stmt = $conn->prepare("SELECT id FROM product_families WHERE code = ?");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['id'];
    } else {
        // Insert new family if not exists
        $newStmt = $conn->prepare("INSERT INTO product_families (code, name) VALUES (?, ?)");
        $name = $code; // Default name is the same as code
        $newStmt->bind_param("ss", $code, $name);
        $newStmt->execute();
        return $conn->insert_id;
    }
}

// Load the spreadsheet
$inputFileName = '/home/pixie/gonzagas/Book1_com_imagens.xlsx';
$spreadsheet = IOFactory::load($inputFileName);
$worksheet = $spreadsheet->getActiveSheet();

// Get worksheet dimensions
$highestRow = $worksheet->getHighestRow();
$highestColumn = $worksheet->getHighestColumn();

echo "Starting data import...\n";

// Find header row (Row 7 based on our analysis)
$headerRow = 7;
$dataStartRow = $headerRow + 1;

// Track import stats
$imported = 0;
$errors = 0;

// Process rows
for ($row = $dataStartRow; $row <= $highestRow; $row++) {
    // Read columns (adjusted based on Excel structure)
    $index = sanitizeData($worksheet->getCell('A' . $row)->getValue());
    $reference = sanitizeData($worksheet->getCell('B' . $row)->getValue());
    $salePrice = sanitizeData($worksheet->getCell('C' . $row)->getValue());
    $soldUnits = sanitizeData($worksheet->getCell('D' . $row)->getValue());
    $purchasePrice = sanitizeData($worksheet->getCell('F' . $row)->getValue());
    $purchasedStock = sanitizeData($worksheet->getCell('G' . $row)->getValue());
    $currentStock = sanitizeData($worksheet->getCell('I' . $row)->getValue());
    $familyCode = sanitizeData($worksheet->getCell('L' . $row)->getValue());
    $imageFilename = sanitizeData($worksheet->getCell('M' . $row)->getValue());
    
    // Skip rows with missing essential data
    if (empty($reference) || empty($familyCode)) {
        continue;
    }
    
    try {
        // Get family ID
        $familyId = getFamilyId($conn, $familyCode);
        
        // Prepare statement
        $stmt = $conn->prepare("INSERT INTO products 
            (reference, family_id, sale_price, purchase_price, current_stock, total_sold, image_filename) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        // Set null values to 0 where needed
        $salePrice = $salePrice ?? 0;
        $purchasePrice = $purchasePrice ?? 0;
        $currentStock = $currentStock ?? 0;
        $soldUnits = $soldUnits ?? 0;
        
        $stmt->bind_param("siddiss", $reference, $familyId, $salePrice, $purchasePrice, $currentStock, $soldUnits, $imageFilename);
        
        if ($stmt->execute()) {
            $productId = $conn->insert_id;
            echo "Imported product: $reference\n";
            $imported++;
            
            // Add product image if available
            if (!empty($imageFilename)) {
                $imgStmt = $conn->prepare("INSERT INTO product_images (product_id, filename, is_primary) VALUES (?, ?, 1)");
                $imgStmt->bind_param("is", $productId, $imageFilename);
                $imgStmt->execute();
            }
        } else {
            echo "Error importing product $reference: " . $stmt->error . "\n";
            $errors++;
        }
    } catch (Exception $e) {
        echo "Exception for product $reference: " . $e->getMessage() . "\n";
        $errors++;
    }
}

echo "Import complete. Imported: $imported products. Errors: $errors\n";

// Create a checkpoint after import
if ($imported > 0) {
    $checkpointName = "Initial import " . date("Y-m-d H:i:s");
    $stmt = $conn->prepare("INSERT INTO checkpoints (checkpoint_name, description, file_path, created_by) 
                           VALUES (?, 'Initial data import from Excel', 'initial_import.sql', 'System')");
    $stmt->bind_param("s", $checkpointName);
    $stmt->execute();
    
    echo "Checkpoint created: $checkpointName\n";
}

$conn->close(); 