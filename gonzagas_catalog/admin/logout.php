<?php
// Start session
session_start();

// Include configuration
require_once '../config/config.php';
require_once '../config/database.php';

// Clear session from database if exists
if (isset($_SESSION['user_id']) && session_id()) {
    $userId = $_SESSION['user_id'];
    $sessionId = session_id();
    
    $stmt = $conn->prepare("DELETE FROM user_sessions WHERE user_id = ? AND session_id = ?");
    $stmt->bind_param("ss", $userId, $sessionId);
    $stmt->execute();
}

// Destroy the session
session_unset();
session_destroy();

// Redirect to login page
header('Location: index.php');
exit; 