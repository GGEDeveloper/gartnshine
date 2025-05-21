<?php
// Utility functions for Gonzaga's Art & Shine Catalog

// Authenticate user with site password
function checkSitePassword($password) {
    return $password === SITE_PASSWORD;
}

// Authenticate admin user
function checkAdminLogin($username, $password) {
    return ($username === ADMIN_USER && $password === ADMIN_PASS);
}

// Create secure session
function createSecureSession($userId, $isAdmin = false) {
    global $conn;
    
    session_start();
    $sessionId = session_id();
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    
    // Store session in database
    $stmt = $conn->prepare("INSERT INTO user_sessions (user_id, session_id, ip_address) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $userId, $sessionId, $ipAddress);
    $stmt->execute();
    
    // Set session variables
    $_SESSION['user_id'] = $userId;
    $_SESSION['is_admin'] = $isAdmin;
    $_SESSION['authenticated'] = true;
    
    return true;
}

// Verify session is valid
function validateSession() {
    global $conn;
    
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        return false;
    }
    
    $sessionId = session_id();
    $userId = $_SESSION['user_id'];
    
    // Check if session exists in database
    $stmt = $conn->prepare("SELECT * FROM user_sessions WHERE user_id = ? AND session_id = ?");
    $stmt->bind_param("ss", $userId, $sessionId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update last activity
        $updateStmt = $conn->prepare("UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = ?");
        $updateStmt->bind_param("s", $sessionId);
        $updateStmt->execute();
        return true;
    }
    
    return false;
}

// Process and save uploaded product images
function saveProductImage($file, $productId) {
    global $conn;
    
    // Create directory if it doesn't exist
    if (!file_exists(MEDIA_PATH)) {
        mkdir(MEDIA_PATH, 0755, true);
    }
    
    $filename = $file['name'];
    $tmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileType = $file['type'];
    
    // Generate a unique filename
    $newFilename = uniqid() . '_' . $filename;
    $uploadPath = MEDIA_PATH . '/' . $newFilename;
    
    // Move uploaded file
    if (move_uploaded_file($tmpName, $uploadPath)) {
        // Insert into database
        $stmt = $conn->prepare("INSERT INTO product_images (product_id, filename) VALUES (?, ?)");
        $stmt->bind_param("is", $productId, $newFilename);
        
        if ($stmt->execute()) {
            return $newFilename;
        }
    }
    
    return false;
}

// Create a database backup checkpoint
function createCheckpoint($name, $description = null) {
    global $conn;
    
    // Create checkpoint directory if needed
    if (!file_exists(CHECKPOINT_DIR)) {
        mkdir(CHECKPOINT_DIR, 0755, true);
    }
    
    $timestamp = date('Y-m-d_H-i-s');
    $filename = "checkpoint_{$timestamp}.sql";
    $filepath = CHECKPOINT_DIR . '/' . $filename;
    
    // Generate backup SQL file
    $command = "mysqldump -u " . escapeshellarg(DB_USER) . " -p" . escapeshellarg(DB_PASS) . " " . escapeshellarg(DB_NAME) . " > " . escapeshellarg($filepath);
    exec($command, $output, $returnVar);
    
    if ($returnVar !== 0) {
        return false;
    }
    
    // Record checkpoint in database
    $stmt = $conn->prepare("INSERT INTO checkpoints (checkpoint_name, description, file_path, created_by) VALUES (?, ?, ?, ?)");
    $createdBy = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'System';
    $stmt->bind_param("ssss", $name, $description, $filename, $createdBy);
    
    if ($stmt->execute()) {
        // Check if we need to remove old checkpoints
        $query = "SELECT id, file_path FROM checkpoints ORDER BY created_at DESC LIMIT " . MAX_CHECKPOINTS . ", 100";
        $result = $conn->query($query);
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Delete old checkpoint file
                $oldFilePath = CHECKPOINT_DIR . '/' . $row['file_path'];
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
                
                // Delete database record
                $conn->query("DELETE FROM checkpoints WHERE id = " . $row['id']);
            }
        }
        
        return true;
    }
    
    return false;
}

// Restore from a checkpoint
function restoreCheckpoint($checkpointId) {
    global $conn;
    
    // Get checkpoint info
    $stmt = $conn->prepare("SELECT file_path FROM checkpoints WHERE id = ?");
    $stmt->bind_param("i", $checkpointId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $filepath = CHECKPOINT_DIR . '/' . $row['file_path'];
        
        if (file_exists($filepath)) {
            // Restore the database from SQL file
            $command = "mysql -u " . escapeshellarg(DB_USER) . " -p" . escapeshellarg(DB_PASS) . " " . escapeshellarg(DB_NAME) . " < " . escapeshellarg($filepath);
            exec($command, $output, $returnVar);
            
            return ($returnVar === 0);
        }
    }
    
    return false;
}

// Get product list with pagination
function getProducts($page = 1, $perPage = 12, $familyId = null, $search = null) {
    global $conn;
    
    $offset = ($page - 1) * $perPage;
    $where = [];
    $params = [];
    $types = "";
    
    if ($familyId) {
        $where[] = "p.family_id = ?";
        $params[] = $familyId;
        $types .= "i";
    }
    
    if ($search) {
        $search = "%$search%";
        $where[] = "(p.reference LIKE ? OR p.name LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $types .= "ss";
    }
    
    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    
    // Count total records
    $countQuery = "SELECT COUNT(*) as total FROM products p $whereClause";
    
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalRow = $countResult->fetch_assoc();
        $total = $totalRow['total'];
    } else {
        $countResult = $conn->query($countQuery);
        $totalRow = $countResult->fetch_assoc();
        $total = $totalRow['total'];
    }
    
    // Get products
    $query = "SELECT p.*, f.code as family_code, f.name as family_name 
              FROM products p 
              LEFT JOIN product_families f ON p.family_id = f.id 
              $whereClause 
              ORDER BY p.reference 
              LIMIT ?, ?";
    
    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $params[] = $offset;
        $params[] = $perPage;
        $types .= "ii";
        $stmt->bind_param($types, ...$params);
    } else {
        $stmt->bind_param("ii", $offset, $perPage);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    return [
        'total' => $total,
        'page' => $page,
        'perPage' => $perPage,
        'totalPages' => ceil($total / $perPage),
        'products' => $products
    ];
}

// Format currency
function formatCurrency($amount) {
    return '€' . number_format($amount, 2, ',', '.');
}

// Clean input data
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
} 