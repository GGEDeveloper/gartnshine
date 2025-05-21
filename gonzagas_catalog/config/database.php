<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'geko_admin');
define('DB_PASS', 'gekopass');
define('DB_NAME', 'gonzagas_catalog');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4"); 