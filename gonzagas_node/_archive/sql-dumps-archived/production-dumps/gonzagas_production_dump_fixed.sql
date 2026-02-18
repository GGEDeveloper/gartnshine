-- Gonzaga's Art & Shine - Production Database Dump (FIXED)
-- Generated on: 2025-07-18T15:00:00.000Z
-- Source: gonzagas_local
-- Fixed: Table creation order to respect foreign key dependencies

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Disable foreign key checks during table creation
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================
-- STEP 1: DROP ALL TABLES (to ensure clean import)
-- ==============================================

DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `cookie_consents`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `customer_addresses`;
DROP TABLE IF EXISTS `database_migrations`;
DROP TABLE IF EXISTS `inventory_movements`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `migrations`;
DROP TABLE IF EXISTS `product_families`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `product_price_history`;
DROP TABLE IF EXISTS `product_pricing`;
DROP TABLE IF EXISTS `product_purchases`;
DROP TABLE IF EXISTS `product_sales`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `admin_users`;

-- ==============================================
-- STEP 2: CREATE TABLES WITHOUT FOREIGN KEYS FIRST
-- ==============================================

--
-- Table structure for table `admin_users` (NO DEPENDENCIES)
--

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários com acesso à área administrativa';

--
-- Table structure for table `users` (NO DEPENDENCIES)
--

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_families` (NO DEPENDENCIES)
--

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
-- Table structure for table `customers` (NO DEPENDENCIES)
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `suppliers` (NO DEPENDENCIES)
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `site_settings` (NO DEPENDENCIES)
--

CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `featured_carousel_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `catalog_page_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `hide_catalog_prices` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Hide prices in catalog, show price on request instead',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- STEP 3: CREATE TABLES WITH DEPENDENCIES
-- ==============================================

--
-- Table structure for table `products` (DEPENDS ON: product_families, users)
--

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
  KEY `family_id` (`family_id`),
  KEY `idx_products_created_by` (`created_by`),
  KEY `idx_products_updated_by` (`updated_by`),
  KEY `idx_products_reference` (`reference`),
  KEY `idx_products_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `activity_logs` (DEPENDS ON: admin_users)
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de atividades dos usuários administrativos';

--
-- Table structure for table `inventory_transactions` (DEPENDS ON: products, users)
--

CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `transaction_type` enum('in','out','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `previous_stock` int(11) NOT NULL,
  `new_stock` int(11) NOT NULL,
  `reference_type` enum('purchase','sale','adjustment','transfer','return') DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_price_history` (DEPENDS ON: products)
--

CREATE TABLE `product_price_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `old_purchase_price` decimal(10,2) DEFAULT NULL,
  `new_purchase_price` decimal(10,2) DEFAULT NULL,
  `old_sale_price` decimal(10,2) DEFAULT NULL,
  `new_sale_price` decimal(10,2) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `change_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_price_history_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_images` (DEPENDS ON: products)
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Other dependent tables
--

CREATE TABLE `customer_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `type` enum('billing','shipping') NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'Portugal',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `action` enum('data_access','consent_change','user_right_request','data_deletion','data_export','admin_access') NOT NULL,
  `resource` varchar(255) NOT NULL,
  `resource_id` varchar(255) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `consent_changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`consent_changes`)),
  `legal_basis` enum('consent','contract','legal_obligation','vital_interests','public_task','legitimate_interest') NOT NULL,
  `retention_period` enum('1 year','2 years','3 years','5 years','6 years') NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource`),
  KEY `idx_legal_basis` (`legal_basis`),
  KEY `idx_retention_period` (`retention_period`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_action_created` (`action`,`created_at`),
  KEY `idx_session_created` (`session_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cookie_consents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `necessary` tinyint(1) DEFAULT 1,
  `analytics` tinyint(1) DEFAULT 0,
  `marketing` tinyint(1) DEFAULT 0,
  `preferences` tinyint(1) DEFAULT 0,
  `consent_timestamp` datetime NOT NULL,
  `expiry_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_consent` (`session_id`,`consent_timestamp`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_consent_timestamp` (`consent_timestamp`),
  KEY `idx_expiry_date` (`expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `database_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('in','out','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_pricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `tier` varchar(50) NOT NULL,
  `min_quantity` int(11) DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `purchase_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `supplier_id` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `sale_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sale_date` timestamp NULL DEFAULT current_timestamp(),
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- STEP 4: INSERT DATA
-- ==============================================

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `full_name`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrador', 1, NULL, '2025-05-22 10:02:30', '2025-05-22 10:02:30');

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `featured_carousel_enabled`, `catalog_page_enabled`, `hide_catalog_prices`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-06-01 15:08:28', '2025-07-17 19:20:42');

--
-- Dumping data for table `product_families`
--

INSERT INTO `product_families` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'PAN', 'Anéis', 'Anéis de prata artesanais', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(2, 'PBR', 'Brincos', 'Brincos de prata únicos', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(3, 'PVO', 'Colares', 'Colares elegantes', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(4, 'PPU', 'Pulseiras', 'Pulseiras estilosas', '2025-05-22 15:56:57', '2025-05-22 15:56:57'),
(5, 'PTO', 'Tornozeleiras', 'Tornozeleiras delicadas', '2025-05-22 15:56:57', '2025-05-22 15:56:57');

--
-- Add sample product data (you can extend this with actual product data from your original dump)
--

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@gonzagas.com', '$2b$10$OpQSfinNzajl/Ze7RMsaV.jOD38f5YwpUI.aeFy6Wt7obObCxjA8a', 'admin', '2025-05-22 16:42:08', '2025-05-22 17:36:43'),
(3, 'Gonzaga', 'g.art.shine@gmail.com', 'b02IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2025-05-22 21:00:07', '2025-07-17 16:32:14'),
(4, 'mike', 'miguelmelo70@gmail.com', '$2b$10$ZXMBcvchUbbmYgwnaySSOe1pVtY5Wt4iwpK2CEDi5ytQTGWwOuC9u', 'admin', '2025-05-22 21:04:15', '2025-05-22 21:14:55'),
(5, 'Gonzaga', 'gonzaga@artnshine.pt', '$2a$10$goRYOLkXUINjrAHNIYFoZuVp06S.k.sQpsEOgC3dN9XRuzOezja46', 'admin', '2025-07-17 16:32:05', '2025-07-17 16:32:05');

--
-- Add sample product data (you can extend this with actual product data from your original dump)
--

INSERT INTO `products` (`id`, `reference`, `barcode`, `family_id`, `name`, `description`, `purchase_price`, `sale_price`, `current_stock`, `min_stock`, `weight`, `active`, `weight_unit`, `dimensions`, `style`, `material`, `notes`, `is_active`, `min_stock_level`, `max_stock_level`, `location`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `featured`, `is_catalog_visible`) VALUES
(1, 'PAN0001', 'PAN0001', 1, 'Anel Prata 925 - Modelo 001', 'Anel artesanal em prata 925', '15.50', '35.00', 5, 1, '2.500', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 15:56:57', 1, 1, NULL, 1, 1),
(2, 'PBR0001', 'PBR0001', 2, 'Brincos Prata 925 - Modelo 001', 'Brincos elegantes em prata 925', '12.00', '28.00', 3, 1, '1.800', 1, 'g', '', 'PBR', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 15:56:57', 1, 1, NULL, 1, 1);

-- ==============================================
-- STEP 5: ADD FOREIGN KEY CONSTRAINTS
-- ==============================================

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Add foreign key constraints
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`);
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `product_price_history` ADD CONSTRAINT `product_price_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `product_pricing` ADD CONSTRAINT `product_pricing_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `product_purchases` ADD CONSTRAINT `product_purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `product_purchases` ADD CONSTRAINT `product_purchases_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;
ALTER TABLE `product_sales` ADD CONSTRAINT `product_sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
ALTER TABLE `product_sales` ADD CONSTRAINT `product_sales_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

-- ==============================================
-- FINALIZE
-- ==============================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Import completed successfully!
-- Tables created: admin_users, users, product_families, customers, suppliers, site_settings, products, activity_logs, and all dependent tables
--
-- AVAILABLE USERS:
-- admin_users table: admin / [check admin panel for password]
-- users table: 
--   - Administrador (admin@gonzagas.com)
--   - Gonzaga (g.art.shine@gmail.com) 
--   - mike (miguelmelo70@gmail.com)
--   - Gonzaga (gonzaga@artnshine.pt)
-- 
-- Default settings: carousel enabled, catalog enabled, prices hidden 