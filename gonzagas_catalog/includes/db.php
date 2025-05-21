<?php
/**
 * Database connection file
 * This file is included by other files to establish a database connection
 */

// Include configuration files
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Return the connection object
return $conn; 