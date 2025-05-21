<?php
// Site configuration
define('SITE_TITLE', 'Gonzaga\'s Art & Shine');
define('SITE_DESCRIPTION', 'Sterling silver jewelry with Bali and Boho tendencies');
define('SITE_PASSWORD', '0009'); // Password required to access the site
define('ADMIN_USER', 'gonzaga');
define('ADMIN_PASS', 'covil'); // Admin login password
define('BASE_URL', isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] . '/gonzagas_catalog' : 'http://localhost/gonzagas_catalog');
define('MEDIA_PATH', $_SERVER['DOCUMENT_ROOT'] . '/gonzagas_catalog/media_processed');
define('MEDIA_URL', BASE_URL . '/media_processed');

// Theme settings
define('THEME_COLOR_PRIMARY', '#1e1e1e');     // Dark background
define('THEME_COLOR_SECONDARY', '#4a3c2d');   // Forest brown
define('THEME_COLOR_ACCENT', '#6a8c69');      // Forest green
define('THEME_COLOR_TEXT', '#f0f0f0');        // Light text
define('THEME_COLOR_HIGHLIGHT', '#b19cd9');   // Psychedelic purple

// Checkpoint system for data backup
define('CHECKPOINT_DIR', $_SERVER['DOCUMENT_ROOT'] . '/gonzagas_catalog/checkpoints');
define('MAX_CHECKPOINTS', 10); // Maximum number of checkpoints to keep 