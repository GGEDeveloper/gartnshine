-- Gonzaga's Art & Shine - Essential Database Import
-- Minimal script with only essential tables and data

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================
-- ESSENTIAL TABLES ONLY
-- ==============================================

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `featured_carousel_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `catalog_page_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `hide_catalog_prices` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Hide prices in catalog, show price on request instead',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_families`
--

DROP TABLE IF EXISTS `product_families`;
CREATE TABLE `product_families` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `family_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) NOT NULL,
  `current_stock` int(11) DEFAULT 0,
  `min_stock` int(11) DEFAULT 0,
  `weight` decimal(10,3) DEFAULT 0.000,
  `active` tinyint(1) DEFAULT 1,
  `weight_unit` varchar(10) DEFAULT 'g',
  `dimensions` varchar(100) DEFAULT '',
  `style` varchar(50) DEFAULT '',
  `material` varchar(100) DEFAULT '',
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `min_stock_level` int(11) DEFAULT 0,
  `max_stock_level` int(11) DEFAULT 0,
  `location` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `is_catalog_visible` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `family_id` (`family_id`)
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- INSERT ESSENTIAL DATA
-- ==============================================

--
-- Essential admin users (from original dump)
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `full_name`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrador', 1, NULL, '2025-05-22 10:02:30', '2025-05-22 10:02:30');

--
-- Essential users (from original dump)
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@gonzagas.com', '$2b$10$OpQSfinNzajl/Ze7RMsaV.jOD38f5YwpUI.aeFy6Wt7obObCxjA8a', 'admin', '2025-05-22 16:42:08', '2025-05-22 17:36:43'),
(3, 'Gonzaga', 'g.art.shine@gmail.com', 'b02IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2025-05-22 21:00:07', '2025-07-17 16:32:14'),
(4, 'mike', 'miguelmelo70@gmail.com', '$2b$10$ZXMBcvchUbbmYgwnaySSOe1pVtY5Wt4iwpK2CEDi5ytQTGWwOuC9u', 'admin', '2025-05-22 21:04:15', '2025-05-22 21:14:55'),
(5, 'Gonzaga', 'gonzaga@artnshine.pt', '$2a$10$goRYOLkXUINjrAHNIYFoZuVp06S.k.sQpsEOgC3dN9XRuzOezja46', 'admin', '2025-07-17 16:32:05', '2025-07-17 16:32:05');

--
-- Essential site settings
--

INSERT INTO `site_settings` (`id`, `featured_carousel_enabled`, `catalog_page_enabled`, `hide_catalog_prices`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 0, '2025-06-01 15:08:28', '2025-07-18 15:00:00');

--
-- Essential product families
--

INSERT INTO `product_families` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'PAN', 'Anéis', 'Anéis de prata artesanais', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(2, 'PBR', 'Brincos', 'Brincos de prata únicos', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(3, 'PVO', 'Colares', 'Colares elegantes', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(4, 'PPU', 'Pulseiras', 'Pulseiras estilosas', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(5, 'PTO', 'Tornozeleiras', 'Tornozeleiras delicadas', '2025-05-22 15:56:57', '2025-05-22 15:56:57');

-- ==============================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ==============================================

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`);

-- ==============================================
-- FINALIZE
-- ==============================================

COMMIT;

-- ✅ IMPORT COMPLETED SUCCESSFULLY!
-- 
-- 🔐 AVAILABLE USERS:
-- 👤 admin_users table: 
--   - admin / [use original password]
-- 
-- 👥 users table:
--   - admin@gonzagas.com (Administrador)
--   - g.art.shine@gmail.com (Gonzaga) 
--   - miguelmelo70@gmail.com (mike)
--   - gonzaga@artnshine.pt (Gonzaga)
-- 
-- 🚀 READY TO USE:
-- - Admin panel: /admin
-- - Settings page: /admin/settings  
-- - Catalog: /catalog or /collections
--
-- 📋 NEXT STEPS:
-- 1. Test login at /admin (use one of the users above)
-- 2. Add products via admin panel
-- 3. Configure site settings
-- 4. Upload product images to /media/products/ 