-- Gonzaga's Art & Shine - Production Database Dump
-- Generated on: 2025-07-17T19:28:04.923Z
-- Source: gonzagas_local

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
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
  KEY `idx_activity_logs_user_id` (`user_id`),
  KEY `idx_activity_logs_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de atividades dos usuários administrativos';

-- No data for table `activity_logs`

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários com acesso à área administrativa';

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `full_name`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrador', 1, NULL, '2025-05-22 10:02:30', '2025-05-22 10:02:30');

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
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

-- No data for table `audit_logs`

--
-- Table structure for table `cookie_consents`
--

DROP TABLE IF EXISTS `cookie_consents`;
CREATE TABLE `cookie_consents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `necessary` tinyint(1) DEFAULT 1,
  `analytics` tinyint(1) DEFAULT 0,
  `marketing` tinyint(1) DEFAULT 0,
  `preferences` tinyint(1) DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session` (`session_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cookie_consents`
--

INSERT INTO `cookie_consents` (`id`, `session_id`, `necessary`, `analytics`, `marketing`, `preferences`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 'fJIzg0REGjo2xmbosIDYTCsTCUGJ_ECI', 1, 0, 0, 0, '127.0.0.1', 'curl/8.5.0', '2025-07-16 13:34:48', '2025-07-16 13:34:48');

--
-- Table structure for table `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
CREATE TABLE `customer_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `address_type` enum('billing','shipping') NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'Portugal',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_customer_address_customer` (`customer_id`),
  KEY `idx_customer_address_type` (`address_type`),
  CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `customer_addresses`

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `tax_number` varchar(20) DEFAULT NULL COMMENT 'NIF',
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Portugal',
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `password_hash` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(100) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_customers_created_by` (`created_by`),
  KEY `idx_customers_updated_by` (`updated_by`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_customers_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_customers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes da loja';

-- No data for table `customers`

--
-- Table structure for table `database_migrations`
--

DROP TABLE IF EXISTS `database_migrations`;
CREATE TABLE `database_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `database_migrations`
--

INSERT INTO `database_migrations` (`id`, `name`, `executed_at`) VALUES
(1, '001_add_admin_features.sql', '2025-05-22 10:08:46');

--
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
CREATE TABLE `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('purchase','sale','adjustment','return','loss') NOT NULL,
  `quantity` decimal(10,3) NOT NULL COMMENT 'Pode ser fracionado para itens que usam casas decimais',
  `reference_id` int(11) DEFAULT NULL COMMENT 'ID da transação relacionada',
  `reference_type` varchar(50) DEFAULT NULL COMMENT 'Tipo de transação relacionada',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL COMMENT 'ID do usuário que realizou o movimento',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `inventory_movements`

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `transaction_type` enum('in','out') NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_inventory_transactions_product_id` (`product_id`),
  KEY `idx_inventory_transactions_created_at` (`created_at`),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_transactions`
--

INSERT INTO `inventory_transactions` (`id`, `product_id`, `transaction_type`, `quantity`, `unit_price`, `total_amount`, `notes`, `created_by`, `created_at`) VALUES
(1, 1, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(2, 4, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(3, 5, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(4, 6, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(5, 7, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(6, 8, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(7, 9, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(8, 10, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(9, 11, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(10, 12, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(11, 13, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(12, 14, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(13, 15, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(14, 17, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(15, 18, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(16, 19, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(17, 22, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(18, 24, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(19, 25, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(20, 27, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(21, 28, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(22, 29, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(23, 30, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(24, 31, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(25, 32, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(26, 33, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(27, 34, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(28, 35, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(29, 36, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(30, 37, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(31, 38, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(32, 39, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(33, 40, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(34, 42, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(35, 43, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(36, 44, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(37, 45, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(38, 46, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(39, 47, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(40, 48, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(41, 49, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(42, 50, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(43, 51, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(44, 52, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(45, 53, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(46, 54, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(47, 55, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(48, 56, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(49, 57, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(50, 58, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(51, 60, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(52, 61, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(53, 62, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(54, 63, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(55, 64, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(56, 66, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(57, 67, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(58, 68, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(59, 69, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(60, 71, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(61, 72, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(62, 73, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(63, 76, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(64, 77, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(65, 78, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(66, 79, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(67, 80, 'in', 1, '5.18', '5.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(68, 81, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(69, 82, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(70, 83, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(71, 84, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(72, 85, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(73, 86, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(74, 87, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(75, 88, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(76, 89, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(77, 90, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(78, 91, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(79, 92, 'in', 1, '7.77', '7.77', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(80, 93, 'in', 1, '10.35', '10.35', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(81, 94, 'in', 1, '10.35', '10.35', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(82, 96, 'in', 1, '10.35', '10.35', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(83, 97, 'in', 1, '10.35', '10.35', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(84, 98, 'in', 1, '18.12', '18.12', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(85, 100, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(86, 101, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(87, 102, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(88, 103, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(89, 104, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(90, 106, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(91, 107, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(92, 108, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(93, 109, 'in', 1, '93.18', '93.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(94, 110, 'in', 1, '93.18', '93.18', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(95, 111, 'in', 1, '28.47', '28.47', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(96, 113, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(97, 114, 'in', 1, '62.12', '62.12', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(98, 116, 'in', 1, '23.30', '23.30', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(99, 117, 'in', 1, '10.35', '10.35', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(100, 118, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(101, 119, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(102, 120, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(103, 121, 'in', 1, '18.12', '18.12', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(104, 122, 'in', 1, '28.47', '28.47', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(105, 123, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(106, 125, 'in', 1, '31.06', '31.06', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(107, 127, 'in', 1, '31.06', '31.06', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(108, 128, 'in', 1, '31.06', '31.06', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(109, 129, 'in', 1, '20.71', '20.71', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(110, 131, 'in', 1, '18.12', '18.12', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(111, 132, 'in', 1, '15.53', '15.53', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(112, 133, 'in', 1, '19.41', '19.41', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(113, 134, 'in', 1, '36.24', '36.24', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(114, 135, 'in', 1, '33.65', '33.65', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(115, 136, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(116, 138, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(117, 139, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(118, 140, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(119, 141, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(120, 143, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(121, 144, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(122, 145, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(123, 146, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(124, 148, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(125, 150, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(126, 151, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(127, 152, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(128, 153, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(129, 154, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(130, 155, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(131, 157, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(132, 158, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(133, 159, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(134, 160, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(135, 162, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(136, 163, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(137, 164, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(138, 165, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(139, 166, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(140, 167, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(141, 168, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(142, 169, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(143, 170, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(144, 171, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(145, 172, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(146, 174, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(147, 175, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(148, 176, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(149, 177, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(150, 178, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(151, 179, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(152, 180, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(153, 181, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(154, 183, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(155, 184, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(156, 185, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(157, 186, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(158, 187, 'in', 2, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56'),
(159, 188, 'in', 1, '0.00', '0.00', 'Estoque inicial após importação', 1, '2025-05-22 16:57:56');

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `name`, `executed_at`) VALUES
(1, '20240522000001_create_customers_table.sql', '2025-05-22 11:56:33');

--
-- Table structure for table `product_families`
--

DROP TABLE IF EXISTS `product_families`;
CREATE TABLE `product_families` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_families`
--

INSERT INTO `product_families` (`id`, `code`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PAN', 'Aneis', NULL, 1, '2025-05-22 22:39:09', '2025-05-22 22:39:09'),
(2, 'PPB', 'Brincos', NULL, 1, '2025-05-22 22:39:09', '2025-05-22 22:39:09'),
(3, 'PVO', 'Colares', NULL, 1, '2025-05-22 22:39:09', '2025-05-22 22:39:09'),
(4, 'PPU', 'Pulseiras', NULL, 1, '2025-05-22 22:39:09', '2025-05-22 22:39:09'),
(5, '5', 'Pedras Naturais', '', 1, '2025-05-28 20:23:52', '2025-05-28 20:24:09');

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_filename` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_filename`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, 'PAN0001.jpg', 1, 0, '2025-05-22 21:50:25'),
(2, 2, 'PAN0002.jpg', 1, 0, '2025-05-22 21:50:25'),
(3, 3, 'PAN0003.jpg', 1, 0, '2025-05-22 21:50:25'),
(4, 4, 'PAN0004.jpg', 1, 0, '2025-05-22 21:50:25'),
(5, 5, 'PAN0005.jpg', 1, 0, '2025-05-22 21:50:25'),
(6, 6, 'PAN0006.jpg', 1, 0, '2025-05-22 21:50:25'),
(7, 7, 'PAN0007.jpg', 1, 0, '2025-05-22 21:50:25'),
(8, 8, 'PAN0008.jpg', 1, 0, '2025-05-22 21:50:25'),
(9, 9, 'PAN0009.jpg', 1, 0, '2025-05-22 21:50:25'),
(10, 10, 'PAN0010.jpg', 1, 0, '2025-05-22 21:50:25'),
(11, 11, 'PAN0011.jpg', 1, 0, '2025-05-22 21:50:25'),
(12, 12, 'PAN0012.jpg', 1, 0, '2025-05-22 21:50:25'),
(13, 13, 'PAN0013.jpg', 1, 0, '2025-05-22 21:50:25'),
(14, 14, 'PAN0014.jpg', 1, 0, '2025-05-22 21:50:25'),
(15, 15, 'PAN0015.jpg', 1, 0, '2025-05-22 21:50:25'),
(16, 16, 'PAN0016.jpg', 1, 0, '2025-05-22 21:50:25'),
(17, 17, 'PAN0017.jpg', 1, 0, '2025-05-22 21:50:25'),
(18, 18, 'PAN0018.jpg', 1, 0, '2025-05-22 21:50:25'),
(19, 19, 'PAN0019.jpg', 1, 0, '2025-05-22 21:50:25'),
(20, 20, 'PAN0020.jpg', 1, 0, '2025-05-22 21:50:25'),
(21, 21, 'PAN0021.jpg', 1, 0, '2025-05-22 21:50:25'),
(22, 22, 'PAN0022.jpg', 1, 0, '2025-05-22 21:50:25'),
(23, 23, 'PAN0023.jpg', 1, 0, '2025-05-22 21:50:25'),
(24, 24, 'PAN0024.jpg', 1, 0, '2025-05-22 21:50:25'),
(25, 25, 'PAN0025.jpg', 1, 0, '2025-05-22 21:50:25'),
(26, 26, 'PAN0026.jpg', 1, 0, '2025-05-22 21:50:25'),
(27, 27, 'PAN0027.jpg', 1, 0, '2025-05-22 21:50:25'),
(28, 28, 'PAN0028.jpg', 1, 0, '2025-05-22 21:50:25'),
(29, 29, 'PAN0029.jpg', 1, 0, '2025-05-22 21:50:25'),
(30, 30, 'PAN0030.jpg', 1, 0, '2025-05-22 21:50:25'),
(31, 31, 'PAN0031.jpg', 1, 0, '2025-05-22 21:50:25'),
(32, 32, 'PAN0032.jpg', 1, 0, '2025-05-22 21:50:25'),
(33, 33, 'PAN0033.jpg', 1, 0, '2025-05-22 21:50:25'),
(34, 34, 'PAN0034.jpg', 1, 0, '2025-05-22 21:50:25'),
(35, 35, 'PAN0035.jpg', 1, 0, '2025-05-22 21:50:25'),
(36, 36, 'PAN0036.jpg', 1, 0, '2025-05-22 21:50:25'),
(37, 37, 'PAN0037.jpg', 1, 0, '2025-05-22 21:50:25'),
(38, 38, 'PAN0038.jpg', 1, 0, '2025-05-22 21:50:25'),
(39, 39, 'PAN0039.jpg', 1, 0, '2025-05-22 21:50:25'),
(40, 40, 'PAN0040.jpg', 1, 0, '2025-05-22 21:50:25'),
(41, 41, 'PAN0041.jpg', 1, 0, '2025-05-22 21:50:25'),
(42, 42, 'PAN0042.jpg', 1, 0, '2025-05-22 21:50:25'),
(43, 43, 'PAN0043.jpg', 1, 0, '2025-05-22 21:50:25'),
(44, 44, 'PAN0044.jpg', 1, 0, '2025-05-22 21:50:25'),
(45, 45, 'PAN0045.jpg', 1, 0, '2025-05-22 21:50:25'),
(46, 46, 'PAN0046.jpg', 1, 0, '2025-05-22 21:50:25'),
(47, 47, 'PAN0047.jpg', 1, 0, '2025-05-22 21:50:25'),
(48, 48, 'PAN0048.jpg', 1, 0, '2025-05-22 21:50:25'),
(49, 49, 'PAN0049.jpg', 1, 0, '2025-05-22 21:50:25'),
(50, 50, 'PAN0050.jpg', 1, 0, '2025-05-22 21:50:25'),
(51, 51, 'PAN0051.jpg', 1, 0, '2025-05-22 21:50:25'),
(52, 52, 'PAN0052.jpg', 1, 0, '2025-05-22 21:50:25'),
(53, 53, 'PAN0053.jpg', 1, 0, '2025-05-22 21:50:25'),
(54, 54, 'PAN0054.jpg', 1, 0, '2025-05-22 21:50:25'),
(55, 55, 'PAN0055.jpg', 1, 0, '2025-05-22 21:50:25'),
(56, 56, 'PAN0056.jpg', 1, 0, '2025-05-22 21:50:25'),
(57, 57, 'PAN0057.jpg', 1, 0, '2025-05-22 21:50:25'),
(58, 58, 'PAN0058.jpg', 1, 0, '2025-05-22 21:50:25'),
(59, 59, 'PAN0059.jpg', 1, 0, '2025-05-22 21:50:25'),
(60, 60, 'PAN0060.jpg', 1, 0, '2025-05-22 21:50:25'),
(61, 61, 'PAN0061.jpg', 1, 0, '2025-05-22 21:50:25'),
(62, 62, 'PAN0062.jpg', 1, 0, '2025-05-22 21:50:25'),
(63, 63, 'PAN0063.jpg', 1, 0, '2025-05-22 21:50:25'),
(64, 64, 'PAN0064.jpg', 1, 0, '2025-05-22 21:50:25'),
(65, 65, 'PAN0065.jpg', 1, 0, '2025-05-22 21:50:25'),
(66, 66, 'PAN0066.jpg', 1, 0, '2025-05-22 21:50:25'),
(67, 67, 'PAN0067.jpg', 1, 0, '2025-05-22 21:50:25'),
(68, 68, 'PAN0068.jpg', 1, 0, '2025-05-22 21:50:25'),
(69, 69, 'PAN0069.jpg', 1, 0, '2025-05-22 21:50:25'),
(70, 70, 'PAN0070.jpg', 1, 0, '2025-05-22 21:50:25'),
(71, 71, 'PAN0071.jpg', 1, 0, '2025-05-22 21:50:25'),
(72, 72, 'PAN0072.jpg', 1, 0, '2025-05-22 21:50:25'),
(73, 73, 'PAN0073.jpg', 1, 0, '2025-05-22 21:50:25'),
(74, 74, 'PAN0074.jpg', 1, 0, '2025-05-22 21:50:25'),
(75, 75, 'PAN0075.jpg', 1, 0, '2025-05-22 21:50:25'),
(76, 76, 'PPB0001.jpg', 1, 0, '2025-05-22 21:50:25'),
(77, 77, 'PPB0002.jpg', 1, 0, '2025-05-22 21:50:25'),
(78, 78, 'PPB0003.jpg', 1, 0, '2025-05-22 21:50:25'),
(79, 79, 'PPB0004.jpg', 1, 0, '2025-05-22 21:50:25'),
(80, 80, 'PPB0005.jpg', 1, 0, '2025-05-22 21:50:25'),
(81, 81, 'PPB0006.jpg', 1, 0, '2025-05-22 21:50:25'),
(82, 82, 'PPB0007.jpg', 1, 0, '2025-05-22 21:50:25'),
(83, 83, 'PPB0008.jpg', 1, 0, '2025-05-22 21:50:25'),
(84, 84, 'PPB0009.jpg', 1, 0, '2025-05-22 21:50:25'),
(85, 85, 'PPB0010.jpg', 1, 0, '2025-05-22 21:50:25'),
(86, 86, 'PPB0011.jpg', 1, 0, '2025-05-22 21:50:25'),
(87, 87, 'PPB0012.jpg', 1, 0, '2025-05-22 21:50:25'),
(88, 88, 'PPB0013.jpg', 1, 0, '2025-05-22 21:50:25'),
(89, 89, 'PPB0014.jpg', 1, 0, '2025-05-22 21:50:25'),
(90, 90, 'PPB0015.jpg', 1, 0, '2025-05-22 21:50:25'),
(91, 91, 'PPB0016.jpg', 1, 0, '2025-05-22 21:50:25'),
(92, 92, 'PPB0017.jpg', 1, 0, '2025-05-22 21:50:25'),
(93, 93, 'PPB0018.jpg', 1, 0, '2025-05-22 21:50:25'),
(94, 94, 'PPB0019.jpg', 1, 0, '2025-05-22 21:50:25'),
(95, 95, 'PPB0020.jpg', 1, 0, '2025-05-22 21:50:25'),
(96, 96, 'PPB0021.jpg', 1, 0, '2025-05-22 21:50:25'),
(97, 97, 'PPB0022.jpg', 1, 0, '2025-05-22 21:50:25'),
(98, 98, 'PPB0023.jpg', 1, 0, '2025-05-22 21:50:25'),
(99, 99, 'PPB0024.jpg', 1, 0, '2025-05-22 21:50:25'),
(100, 100, 'PPB0025.jpg', 1, 0, '2025-05-22 21:50:25'),
(101, 101, 'PPB0026.jpg', 1, 0, '2025-05-22 21:50:25'),
(102, 102, 'PPB0027.jpg', 1, 0, '2025-05-22 21:50:25'),
(103, 103, 'PPB0028.jpg', 1, 0, '2025-05-22 21:50:25'),
(104, 104, 'PPB0029.jpg', 1, 0, '2025-05-22 21:50:25'),
(105, 105, 'PPB0030.jpg', 1, 0, '2025-05-22 21:50:25'),
(106, 106, 'PPB0031.jpg', 1, 0, '2025-05-22 21:50:25'),
(107, 107, 'PPB0032.jpg', 1, 0, '2025-05-22 21:50:25'),
(108, 108, 'PPB0033.jpg', 1, 0, '2025-05-22 21:50:25'),
(109, 109, 'PPU0001.jpg', 1, 0, '2025-05-22 21:50:25'),
(110, 110, 'PPU0002.jpg', 1, 0, '2025-05-22 21:50:25'),
(111, 111, 'PPU0003.jpg', 1, 0, '2025-05-22 21:50:25'),
(112, 112, 'PPU0004.jpg', 1, 0, '2025-05-22 21:50:25'),
(113, 113, 'PPU0005.jpg', 1, 0, '2025-05-22 21:50:25'),
(114, 114, 'PPU0006.jpg', 1, 0, '2025-05-22 21:50:25'),
(115, 115, 'PPU0007.jpg', 1, 0, '2025-05-22 21:50:25'),
(116, 116, 'PPU0008.jpg', 1, 0, '2025-05-22 21:50:25'),
(117, 117, 'PPU0009.jpg', 1, 0, '2025-05-22 21:50:25'),
(118, 118, 'PPU0010.jpg', 1, 0, '2025-05-22 21:50:25'),
(119, 119, 'PPU0011.jpg', 1, 0, '2025-05-22 21:50:25'),
(120, 120, 'PPU0012.jpg', 1, 0, '2025-05-22 21:50:25'),
(121, 121, 'PPU0013.jpg', 1, 0, '2025-05-22 21:50:25'),
(122, 122, 'PPU0014.jpg', 1, 0, '2025-05-22 21:50:25'),
(123, 123, 'PPU0015.jpg', 1, 0, '2025-05-22 21:50:25'),
(124, 124, 'PPU0016.jpg', 1, 0, '2025-05-22 21:50:25'),
(125, 125, 'PPU0017.jpg', 1, 0, '2025-05-22 21:50:25'),
(126, 126, 'PPU0018.jpg', 1, 0, '2025-05-22 21:50:25'),
(127, 127, 'PPU0019.jpg', 1, 0, '2025-05-22 21:50:25'),
(128, 128, 'PPU0020.jpg', 1, 0, '2025-05-22 21:50:25'),
(129, 129, 'PPU0021.jpg', 1, 0, '2025-05-22 21:50:25'),
(130, 130, 'PPU0022.jpg', 1, 0, '2025-05-22 21:50:25'),
(131, 131, 'PPU0023.jpg', 1, 0, '2025-05-22 21:50:25'),
(132, 132, 'PPU0024.jpg', 1, 0, '2025-05-22 21:50:25'),
(133, 133, 'PPU0025.jpg', 1, 0, '2025-05-22 21:50:25'),
(134, 134, 'PPU0026.jpg', 1, 0, '2025-05-22 21:50:25'),
(135, 135, 'PPU0027.jpg', 1, 0, '2025-05-22 21:50:25'),
(136, 136, 'PVO0001.jpg', 1, 0, '2025-05-22 21:50:25'),
(137, 137, 'PPU0000.jpg', 1, 0, '2025-05-22 21:50:25'),
(138, 138, 'PPU0028.jpg', 1, 0, '2025-05-22 21:50:25'),
(139, 139, 'PPU0029.jpg', 1, 0, '2025-05-22 21:50:25'),
(140, 140, 'PPU0030.jpg', 1, 0, '2025-05-22 21:50:25'),
(141, 141, 'PPU0031.jpg', 1, 0, '2025-05-22 21:50:25'),
(142, 142, 'PPU0032.jpg', 1, 0, '2025-05-22 21:50:25'),
(143, 143, 'PPU0033.jpg', 1, 0, '2025-05-22 21:50:25'),
(144, 144, 'PPU0034.jpg', 1, 0, '2025-05-22 21:50:25'),
(145, 145, 'PPU0035.jpg', 1, 0, '2025-05-22 21:50:25'),
(146, 146, 'PPU0036.jpg', 1, 0, '2025-05-22 21:50:25'),
(147, 147, 'PPU0037.jpg', 1, 0, '2025-05-22 21:50:25'),
(148, 148, 'PPU0038.jpg', 1, 0, '2025-05-22 21:50:25'),
(149, 149, 'PPU0039.jpg', 1, 0, '2025-05-22 21:50:25'),
(150, 150, 'PPU0040.jpg', 1, 0, '2025-05-22 21:50:25'),
(151, 151, 'PPU0041.jpg', 1, 0, '2025-05-22 21:50:25'),
(152, 152, 'PPU0042.jpg', 1, 0, '2025-05-22 21:50:25'),
(153, 153, 'PPU0043.jpg', 1, 0, '2025-05-22 21:50:25'),
(154, 154, 'PPU0044.jpg', 1, 0, '2025-05-22 21:50:25'),
(155, 155, 'PPU0045.jpg', 1, 0, '2025-05-22 21:50:25'),
(156, 156, 'PPU0046.jpg', 1, 0, '2025-05-22 21:50:25'),
(157, 157, 'PPU0047.jpg', 1, 0, '2025-05-22 21:50:25'),
(158, 158, 'PPU0048.jpg', 1, 0, '2025-05-22 21:50:25'),
(159, 159, 'PPU0049.jpg', 1, 0, '2025-05-22 21:50:25'),
(160, 160, 'PPU0050.jpg', 1, 0, '2025-05-22 21:50:25'),
(161, 161, 'PPU0051.jpg', 1, 0, '2025-05-22 21:50:25'),
(162, 162, 'PPU0052.jpg', 1, 0, '2025-05-22 21:50:25'),
(163, 163, 'PPU0053.jpg', 1, 0, '2025-05-22 21:50:25'),
(164, 164, 'PPU0054.jpg', 1, 0, '2025-05-22 21:50:25'),
(165, 165, 'PPU0055.jpg', 1, 0, '2025-05-22 21:50:25'),
(166, 166, 'PPU0056.jpg', 1, 0, '2025-05-22 21:50:25'),
(167, 167, 'PPU0057.jpg', 1, 0, '2025-05-22 21:50:25'),
(168, 168, 'PPU0058.jpg', 1, 0, '2025-05-22 21:50:25'),
(169, 169, 'PPU0059.jpg', 1, 0, '2025-05-22 21:50:25'),
(170, 170, 'PPU0060.jpg', 1, 0, '2025-05-22 21:50:25'),
(171, 171, 'PPU0061.jpg', 1, 0, '2025-05-22 21:50:25'),
(172, 172, 'PPU0062.jpg', 1, 0, '2025-05-22 21:50:25'),
(173, 173, 'PPU0063.jpg', 1, 0, '2025-05-22 21:50:25'),
(174, 174, 'PPU0064.jpg', 1, 0, '2025-05-22 21:50:25'),
(175, 175, 'PPU0065.jpg', 1, 0, '2025-05-22 21:50:25'),
(176, 176, 'PPU0066.jpg', 1, 0, '2025-05-22 21:50:25'),
(177, 177, 'PPU0067.jpg', 1, 0, '2025-05-22 21:50:25'),
(178, 178, 'PPU0068.jpg', 1, 0, '2025-05-22 21:50:25'),
(179, 179, 'PPU0069.jpg', 1, 0, '2025-05-22 21:50:25'),
(180, 180, 'PPU0070.jpg', 1, 0, '2025-05-22 21:50:25'),
(181, 181, 'PPU0071.jpg', 1, 0, '2025-05-22 21:50:25'),
(182, 182, 'PVO0002.jpg', 1, 0, '2025-05-22 21:50:25'),
(183, 183, 'PVO0003.jpg', 1, 0, '2025-05-22 21:50:25'),
(184, 184, 'PVO0004.jpg', 1, 0, '2025-05-22 21:50:25'),
(185, 185, 'PVO0005.jpg', 1, 0, '2025-05-22 21:50:25'),
(186, 186, 'PVO0006.jpg', 1, 0, '2025-05-22 21:50:25'),
(187, 187, 'PVO0007.jpg', 1, 0, '2025-05-22 21:50:25'),
(188, 188, 'PVO0008.jpg', 1, 0, '2025-05-22 21:50:25');

--
-- Table structure for table `product_price_history`
--

DROP TABLE IF EXISTS `product_price_history`;
CREATE TABLE `product_price_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_price_history_product_id` (`product_id`),
  CONSTRAINT `product_price_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_price_history`
--

INSERT INTO `product_price_history` (`id`, `product_id`, `price`, `created_at`) VALUES
(1, 1, '10.00', '2025-05-22 16:57:56'),
(2, 2, '10.00', '2025-05-22 16:57:56'),
(3, 3, '10.00', '2025-05-22 16:57:56'),
(4, 4, '10.00', '2025-05-22 16:57:56'),
(5, 5, '15.00', '2025-05-22 16:57:56'),
(6, 6, '15.00', '2025-05-22 16:57:56'),
(7, 7, '15.00', '2025-05-22 16:57:56'),
(8, 8, '15.00', '2025-05-22 16:57:56'),
(9, 9, '15.00', '2025-05-22 16:57:56'),
(10, 10, '15.00', '2025-05-22 16:57:56'),
(11, 11, '15.00', '2025-05-22 16:57:56'),
(12, 12, '15.00', '2025-05-22 16:57:56'),
(13, 13, '15.00', '2025-05-22 16:57:56'),
(14, 14, '15.00', '2025-05-22 16:57:56'),
(15, 15, '15.00', '2025-05-22 16:57:56'),
(16, 16, '15.00', '2025-05-22 16:57:56'),
(17, 17, '15.00', '2025-05-22 16:57:56'),
(18, 18, '15.00', '2025-05-22 16:57:56'),
(19, 19, '30.00', '2025-05-22 16:57:56'),
(20, 20, '30.00', '2025-05-22 16:57:56'),
(21, 21, '30.00', '2025-05-22 16:57:56'),
(22, 22, '30.00', '2025-05-22 16:57:56'),
(23, 23, '30.00', '2025-05-22 16:57:56'),
(24, 24, '30.00', '2025-05-22 16:57:56'),
(25, 25, '30.00', '2025-05-22 16:57:56'),
(26, 26, '15.00', '2025-05-22 16:57:56'),
(27, 27, '30.00', '2025-05-22 16:57:56'),
(28, 28, '30.00', '2025-05-22 16:57:56'),
(29, 29, '30.00', '2025-05-22 16:57:56'),
(30, 30, '15.00', '2025-05-22 16:57:56'),
(31, 31, '15.00', '2025-05-22 16:57:56'),
(32, 32, '15.00', '2025-05-22 16:57:56'),
(33, 33, '15.00', '2025-05-22 16:57:56'),
(34, 34, '15.00', '2025-05-22 16:57:56'),
(35, 35, '15.00', '2025-05-22 16:57:56'),
(36, 36, '15.00', '2025-05-22 16:57:56'),
(37, 37, '15.00', '2025-05-22 16:57:56'),
(38, 38, '15.00', '2025-05-22 16:57:56'),
(39, 39, '15.00', '2025-05-22 16:57:56'),
(40, 40, '15.00', '2025-05-22 16:57:56'),
(41, 41, '15.00', '2025-05-22 16:57:56'),
(42, 42, '20.00', '2025-05-22 16:57:56'),
(43, 43, '15.00', '2025-05-22 16:57:56'),
(44, 44, '25.00', '2025-05-22 16:57:56'),
(45, 45, '25.00', '2025-05-22 16:57:56'),
(46, 46, '25.00', '2025-05-22 16:57:56'),
(47, 47, '30.00', '2025-05-22 16:57:56'),
(48, 48, '30.00', '2025-05-22 16:57:56'),
(49, 49, '30.00', '2025-05-22 16:57:56'),
(50, 50, '25.00', '2025-05-22 16:57:56'),
(51, 51, '30.00', '2025-05-22 16:57:56'),
(52, 52, '35.00', '2025-05-22 16:57:56'),
(53, 53, '35.00', '2025-05-22 16:57:56'),
(54, 54, '35.00', '2025-05-22 16:57:56'),
(55, 55, '35.00', '2025-05-22 16:57:56'),
(56, 56, '35.00', '2025-05-22 16:57:56'),
(57, 57, '35.00', '2025-05-22 16:57:56'),
(58, 58, '30.00', '2025-05-22 16:57:56'),
(59, 59, '30.00', '2025-05-22 16:57:56'),
(60, 60, '35.00', '2025-05-22 16:57:56'),
(61, 61, '30.00', '2025-05-22 16:57:56'),
(62, 62, '35.00', '2025-05-22 16:57:56'),
(63, 63, '30.00', '2025-05-22 16:57:56'),
(64, 64, '30.00', '2025-05-22 16:57:56'),
(65, 65, '30.00', '2025-05-22 16:57:56'),
(66, 66, '50.00', '2025-05-22 16:57:56'),
(67, 67, '50.00', '2025-05-22 16:57:56'),
(68, 68, '50.00', '2025-05-22 16:57:56'),
(69, 69, '0.00', '2025-05-22 16:57:56'),
(70, 70, '30.00', '2025-05-22 16:57:56'),
(71, 71, '15.00', '2025-05-22 16:57:56'),
(72, 72, '25.00', '2025-05-22 16:57:56'),
(73, 73, '15.00', '2025-05-22 16:57:56'),
(74, 74, '0.00', '2025-05-22 16:57:56'),
(75, 75, '0.00', '2025-05-22 16:57:56'),
(76, 76, '10.00', '2025-05-22 16:57:56'),
(77, 77, '10.00', '2025-05-22 16:57:56'),
(78, 78, '10.00', '2025-05-22 16:57:56'),
(79, 79, '10.00', '2025-05-22 16:57:56'),
(80, 80, '10.00', '2025-05-22 16:57:56'),
(81, 81, '15.00', '2025-05-22 16:57:56'),
(82, 82, '15.00', '2025-05-22 16:57:56'),
(83, 83, '15.00', '2025-05-22 16:57:56'),
(84, 84, '15.00', '2025-05-22 16:57:56'),
(85, 85, '15.00', '2025-05-22 16:57:56'),
(86, 86, '15.00', '2025-05-22 16:57:56'),
(87, 87, '15.00', '2025-05-22 16:57:56'),
(88, 88, '15.00', '2025-05-22 16:57:56'),
(89, 89, '15.00', '2025-05-22 16:57:56'),
(90, 90, '15.00', '2025-05-22 16:57:56'),
(91, 91, '15.00', '2025-05-22 16:57:56'),
(92, 92, '15.00', '2025-05-22 16:57:56'),
(93, 93, '20.00', '2025-05-22 16:57:56'),
(94, 94, '20.00', '2025-05-22 16:57:56'),
(95, 95, '20.00', '2025-05-22 16:57:56'),
(96, 96, '20.00', '2025-05-22 16:57:56'),
(97, 97, '20.00', '2025-05-22 16:57:56'),
(98, 98, '35.00', '2025-05-22 16:57:56'),
(99, 99, '35.00', '2025-05-22 16:57:56'),
(100, 100, '40.00', '2025-05-22 16:57:56'),
(101, 101, '20.00', '2025-05-22 16:57:56'),
(102, 102, '25.00', '2025-05-22 16:57:56'),
(103, 103, '25.00', '2025-05-22 16:57:56'),
(104, 104, '25.00', '2025-05-22 16:57:56'),
(105, 105, '25.00', '2025-05-22 16:57:56'),
(106, 106, '30.00', '2025-05-22 16:57:56'),
(107, 107, '35.00', '2025-05-22 16:57:56'),
(108, 108, '40.00', '2025-05-22 16:57:56'),
(109, 109, '180.00', '2025-05-22 16:57:56'),
(110, 110, '180.00', '2025-05-22 16:57:56'),
(111, 111, '55.00', '2025-05-22 16:57:56'),
(112, 112, '190.00', '2025-05-22 16:57:56'),
(113, 113, '40.00', '2025-05-22 16:57:56'),
(114, 114, '140.00', '2025-05-22 16:57:56'),
(115, 115, '130.00', '2025-05-22 16:57:56'),
(116, 116, '35.00', '2025-05-22 16:57:56'),
(117, 117, '20.00', '2025-05-22 16:57:56'),
(118, 118, '30.00', '2025-05-22 16:57:56'),
(119, 119, '30.00', '2025-05-22 16:57:56'),
(120, 120, '35.00', '2025-05-22 16:57:56'),
(121, 121, '35.00', '2025-05-22 16:57:56'),
(122, 122, '55.00', '2025-05-22 16:57:56'),
(123, 123, '40.00', '2025-05-22 16:57:56'),
(124, 124, '60.00', '2025-05-22 16:57:56'),
(125, 125, '60.00', '2025-05-22 16:57:56'),
(126, 126, '130.00', '2025-05-22 16:57:56'),
(127, 127, '60.00', '2025-05-22 16:57:56'),
(128, 128, '60.00', '2025-05-22 16:57:56'),
(129, 129, '40.00', '2025-05-22 16:57:56'),
(130, 130, '20.00', '2025-05-22 16:57:56'),
(131, 131, '35.00', '2025-05-22 16:57:56'),
(132, 132, '30.00', '2025-05-22 16:57:56'),
(133, 133, '37.50', '2025-05-22 16:57:56'),
(134, 134, '70.00', '2025-05-22 16:57:56'),
(135, 135, '65.00', '2025-05-22 16:57:56'),
(136, 136, '160.00', '2025-05-22 16:57:56'),
(137, 137, '75.00', '2025-05-22 16:57:56'),
(138, 138, '110.00', '2025-05-22 16:57:56'),
(139, 139, '110.00', '2025-05-22 16:57:56'),
(140, 140, '125.00', '2025-05-22 16:57:56'),
(141, 141, '135.00', '2025-05-22 16:57:56'),
(142, 142, '135.00', '2025-05-22 16:57:56'),
(143, 143, '135.00', '2025-05-22 16:57:56'),
(144, 144, '135.00', '2025-05-22 16:57:56'),
(145, 145, '140.00', '2025-05-22 16:57:56'),
(146, 146, '15.00', '2025-05-22 16:57:56'),
(147, 147, '180.00', '2025-05-22 16:57:56'),
(148, 148, '185.00', '2025-05-22 16:57:56'),
(149, 149, '20.00', '2025-05-22 16:57:56'),
(150, 150, '20.00', '2025-05-22 16:57:56'),
(151, 151, '25.00', '2025-05-22 16:57:56'),
(152, 152, '25.00', '2025-05-22 16:57:56'),
(153, 153, '30.00', '2025-05-22 16:57:56'),
(154, 154, '30.00', '2025-05-22 16:57:56'),
(155, 155, '30.00', '2025-05-22 16:57:56'),
(156, 156, '30.00', '2025-05-22 16:57:56'),
(157, 157, '30.00', '2025-05-22 16:57:56'),
(158, 158, '30.00', '2025-05-22 16:57:56'),
(159, 159, '30.00', '2025-05-22 16:57:56'),
(160, 160, '30.00', '2025-05-22 16:57:56'),
(161, 161, '30.00', '2025-05-22 16:57:56'),
(162, 162, '35.00', '2025-05-22 16:57:56'),
(163, 163, '40.00', '2025-05-22 16:57:56'),
(164, 164, '30.00', '2025-05-22 16:57:56'),
(165, 165, '40.00', '2025-05-22 16:57:56'),
(166, 166, '40.00', '2025-05-22 16:57:56'),
(167, 167, '40.00', '2025-05-22 16:57:56'),
(168, 168, '90.00', '2025-05-22 16:57:56'),
(169, 169, '40.00', '2025-05-22 16:57:56'),
(170, 170, '75.00', '2025-05-22 16:57:56'),
(171, 171, '60.00', '2025-05-22 16:57:56'),
(172, 172, '40.00', '2025-05-22 16:57:56'),
(173, 173, '60.00', '2025-05-22 16:57:56'),
(174, 174, '60.00', '2025-05-22 16:57:56'),
(175, 175, '25.00', '2025-05-22 16:57:56'),
(176, 176, '60.00', '2025-05-22 16:57:56'),
(177, 177, '15.00', '2025-05-22 16:57:56'),
(178, 178, '15.00', '2025-05-22 16:57:56'),
(179, 179, '10.00', '2025-05-22 16:57:56'),
(180, 180, '10.00', '2025-05-22 16:57:56'),
(181, 181, '10.00', '2025-05-22 16:57:56'),
(182, 182, '150.00', '2025-05-22 16:57:56'),
(183, 183, '30.00', '2025-05-22 16:57:56'),
(184, 184, '30.00', '2025-05-22 16:57:56'),
(185, 185, '50.00', '2025-05-22 16:57:56'),
(186, 186, '10.00', '2025-05-22 16:57:56'),
(187, 187, '15.00', '2025-05-22 16:57:56'),
(188, 188, '30.00', '2025-05-22 16:57:56');

--
-- Table structure for table `product_pricing`
--

DROP TABLE IF EXISTS `product_pricing`;
CREATE TABLE `product_pricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `pvp_price` decimal(10,2) NOT NULL COMMENT 'Preço de venda ao público',
  `wholesale_price` decimal(10,2) DEFAULT NULL COMMENT 'Preço de atacado',
  `special_price` decimal(10,2) DEFAULT NULL COMMENT 'Preço promocional',
  `special_price_start` date DEFAULT NULL,
  `special_price_end` date DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT 'Custo médio',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_pricing_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `product_pricing`

--
-- Table structure for table `product_purchases`
--

DROP TABLE IF EXISTS `product_purchases`;
CREATE TABLE `product_purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchase_date` date NOT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `product_purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_purchases_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `product_purchases`

--
-- Table structure for table `product_sales`
--

DROP TABLE IF EXISTS `product_sales`;
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
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `product_sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_sales_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `product_sales`

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `current_stock` int(11) DEFAULT 0,
  `min_stock` int(11) DEFAULT 5,
  `weight` decimal(10,3) DEFAULT 0.000,
  `active` tinyint(1) DEFAULT 1,
  `weight_unit` enum('g','kg') DEFAULT 'g',
  `dimensions` varchar(50) DEFAULT NULL COMMENT 'LxAxP em mm',
  `style` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `min_stock_level` int(11) DEFAULT 0,
  `max_stock_level` int(11) DEFAULT 0,
  `location` varchar(50) DEFAULT NULL COMMENT 'Localização no armazém',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `is_catalog_visible` tinyint(1) DEFAULT 1 COMMENT 'Whether the product is visible in the public catalog',
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `family_id` (`family_id`),
  KEY `idx_products_created_by` (`created_by`),
  KEY `idx_products_updated_by` (`updated_by`),
  KEY `idx_products_reference` (`reference`),
  KEY `idx_products_name` (`name`),
  CONSTRAINT `fk_products_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Produtos disponíveis para venda';

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `reference`, `barcode`, `family_id`, `name`, `description`, `purchase_price`, `sale_price`, `current_stock`, `min_stock`, `weight`, `active`, `weight_unit`, `dimensions`, `style`, `material`, `notes`, `is_active`, `min_stock_level`, `max_stock_level`, `location`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `featured`, `is_catalog_visible`) VALUES
(1, 'PAN0001', 'PAN0001', 1, 'Produto PAN0001', 'Produto PAN0001', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 15:45:54', 1, 4, NULL, 0, 1),
(2, 'PAN0002', 'PAN0002', 1, 'Produto PAN0002', 'Produto PAN0002 - PAN', '5.18', '10.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-29 00:35:54', 1, 1, NULL, 0, 1),
(3, 'PAN0003', 'PAN0003', 1, 'Produto PAN0003', 'Produto PAN0003 - PAN', '5.18', '10.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(4, 'PAN0004', 'PAN0004', 1, 'Produto PAN0004', 'Produto PAN0004 - PAN', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-01 18:36:19', 1, 4, NULL, 1, 1),
(5, 'PAN0005', 'PAN0005', 1, 'Produto PAN0005', 'Produto PAN0005 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(6, 'PAN0006', 'PAN0006', 1, 'Produto PAN0006', 'Produto PAN0006 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-01 18:36:25', 1, 4, NULL, 1, 1),
(7, 'PAN0007', 'PAN0007', 1, 'Produto PAN0007', 'Produto PAN0007 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(8, 'PAN0008', 'PAN0008', 1, 'Produto PAN0008', 'Produto PAN0008 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(9, 'PAN0009', 'PAN0009', 1, 'Produto PAN0009', 'Produto PAN0009 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(10, 'PAN0010', 'PAN0010', 1, 'Produto PAN0010', 'Produto PAN0010 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(11, 'PAN0011', 'PAN0011', 1, 'Produto PAN0011', 'Produto PAN0011 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(12, 'PAN0012', 'PAN0012', 1, 'Produto PAN0012', 'Produto PAN0012 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(13, 'PAN0013', 'PAN0013', 1, 'Produto PAN0013', 'Produto PAN0013 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(14, 'PAN0014', 'PAN0014', 1, 'Produto PAN0014', 'Produto PAN0014 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(15, 'PAN0015', 'PAN0015', 1, 'Produto PAN0015', 'Produto PAN0015 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(16, 'PAN0016', 'PAN0016', 1, 'Produto PAN0016', 'Produto PAN0016 - PAN', '7.77', '15.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(17, 'PAN0017', 'PAN0017', 1, 'Produto PAN0017', 'Produto PAN0017 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(18, 'PAN0018', 'PAN0018', 1, 'Produto PAN0018', 'Produto PAN0018 - PAN', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(19, 'PAN0019', 'PAN0019', 1, 'Produto PAN0019', 'Produto PAN0019 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(20, 'PAN0020', 'PAN0020', 1, 'Produto PAN0020', 'Produto PAN0020 - PAN', '15.53', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(21, 'PAN0021', 'PAN0021', 1, 'Produto PAN0021', 'Produto PAN0021 - PAN', '15.53', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(22, 'PAN0022', 'PAN0022', 1, 'Produto PAN0022', 'Produto PAN0022 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(23, 'PAN0023', 'PAN0023', 1, 'Produto PAN0023', 'Produto PAN0023 - PAN', '15.53', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(24, 'PAN0024', 'PAN0024', 1, 'Produto PAN0024', 'Produto PAN0024 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(25, 'PAN0025', 'PAN0025', 1, 'Produto PAN0025', 'Produto PAN0025 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(26, 'PAN0026', 'PAN0026', 1, 'Produto PAN0026', 'Produto PAN0026 - PAN', '7.77', '15.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(27, 'PAN0027', 'PAN0027', 1, 'Produto PAN0027', 'Produto PAN0027 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(28, 'PAN0028', 'PAN0028', 1, 'Produto PAN0028', 'Produto PAN0028 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(29, 'PAN0029', 'PAN0029', 1, 'Produto PAN0029', 'Produto PAN0029 - PAN', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(30, 'PAN0030', 'PAN0030', 1, 'Produto PAN0030', 'Produto PAN0030 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(31, 'PAN0031', 'PAN0031', 1, 'Produto PAN0031', 'Produto PAN0031 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(32, 'PAN0032', 'PAN0032', 1, 'Produto PAN0032', 'Produto PAN0032 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(33, 'PAN0033', 'PAN0033', 1, 'Produto PAN0033', 'Produto PAN0033 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(34, 'PAN0034', 'PAN0034', 1, 'Produto PAN0034', 'Produto PAN0034 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(35, 'PAN0035', 'PAN0035', 1, 'Produto PAN0035', 'Produto PAN0035 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(36, 'PAN0036', 'PAN0036', 1, 'Produto PAN0036', 'Produto PAN0036 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(37, 'PAN0037', 'PAN0037', 1, 'Produto PAN0037', 'Produto PAN0037 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(38, 'PAN0038', 'PAN0038', 1, 'Produto PAN0038', 'Produto PAN0038 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(39, 'PAN0039', 'PAN0039', 1, 'Produto PAN0039', 'Produto PAN0039 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(40, 'PAN0040', 'PAN0040', 1, 'Produto PAN0040', 'Produto PAN0040 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(41, 'PAN0041', 'PAN0041', 1, 'Produto PAN0041', 'Produto PAN0041 - PAN', '0.00', '15.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(42, 'PAN0042', 'PAN0042', 1, 'Produto PAN0042', 'Produto PAN0042 - PAN', '0.00', '20.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(43, 'PAN0043', 'PAN0043', 1, 'Produto PAN0043', 'Produto PAN0043 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(44, 'PAN0044', 'PAN0044', 1, 'Produto PAN0044', 'Produto PAN0044 - PAN', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(45, 'PAN0045', 'PAN0045', 1, 'Produto PAN0045', 'Produto PAN0045 - PAN', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(46, 'PAN0046', 'PAN0046', 1, 'Produto PAN0046', 'Produto PAN0046 - PAN', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(47, 'PAN0047', 'PAN0047', 1, 'Produto PAN0047', 'Produto PAN0047 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(48, 'PAN0048', 'PAN0048', 1, 'Produto PAN0048', 'Produto PAN0048 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(49, 'PAN0049', 'PAN0049', 1, 'Produto PAN0049', 'Produto PAN0049 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(50, 'PAN0050', 'PAN0050', 1, 'Produto PAN0050', 'Produto PAN0050 - PAN', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(51, 'PAN0051', 'PAN0051', 1, 'Produto PAN0051', 'Produto PAN0051 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(52, 'PAN0052', 'PAN0052', 1, 'Produto PAN0052', 'Produto PAN0052 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(53, 'PAN0053', 'PAN0053', 1, 'Produto PAN0053', 'Produto PAN0053 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(54, 'PAN0054', 'PAN0054', 1, 'Produto PAN0054', 'Produto PAN0054 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(55, 'PAN0055', 'PAN0055', 1, 'Produto PAN0055', 'Produto PAN0055 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(56, 'PAN0056', 'PAN0056', 1, 'Produto PAN0056', 'Produto PAN0056 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(57, 'PAN0057', 'PAN0057', 1, 'Produto PAN0057', 'Produto PAN0057 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(58, 'PAN0058', 'PAN0058', 1, 'Produto PAN0058', 'Produto PAN0058 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(59, 'PAN0059', 'PAN0059', 1, 'Produto PAN0059', 'Produto PAN0059 - PAN', '0.00', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(60, 'PAN0060', 'PAN0060', 1, 'Produto PAN0060', 'Produto PAN0060 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(61, 'PAN0061', 'PAN0061', 1, 'Produto PAN0061', 'Produto PAN0061 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(62, 'PAN0062', 'PAN0062', 1, 'Produto PAN0062', 'Produto PAN0062 - PAN', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(63, 'PAN0063', 'PAN0063', 1, 'Produto PAN0063', 'Produto PAN0063 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(64, 'PAN0064', 'PAN0064', 1, 'Produto PAN0064', 'Produto PAN0064 - PAN', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(65, 'PAN0065', 'PAN0065', 1, 'Produto PAN0065', 'Produto PAN0065 - PAN', '0.00', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(66, 'PAN0066', 'PAN0066', 1, 'Produto PAN0066', 'Produto PAN0066 - PAN', '0.00', '50.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(67, 'PAN0067', 'PAN0067', 1, 'Produto PAN0067', 'Produto PAN0067 - PAN', '0.00', '50.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(68, 'PAN0068', 'PAN0068', 1, 'Produto PAN0068', 'Produto PAN0068 - PAN', '0.00', '50.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(69, 'PAN0069', 'PAN0069', 1, 'Produto PAN0069', 'Produto PAN0069 - PAN', '0.00', '0.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(70, 'PAN0070', 'PAN0070', 1, 'Produto PAN0070', 'Produto PAN0070 - PAN', '0.00', '30.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(71, 'PAN0071', 'PAN0071', 1, 'Produto PAN0071', 'Produto PAN0071 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(72, 'PAN0072', 'PAN0072', 1, 'Produto PAN0072', 'Produto PAN0072 - PAN', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(73, 'PAN0073', 'PAN0073', 1, 'Produto PAN0073', 'Produto PAN0073 - PAN', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(74, 'PAN0074', 'PAN0074', 1, 'Produto PAN0074', 'Produto PAN0074 - PAN', '0.00', '0.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(75, 'PAN0075', 'PAN0075', 1, 'Produto PAN0075', 'Produto PAN0075 - PAN', '0.00', '0.00', 0, 0, '0.000', 1, 'g', '', 'PAN', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(76, 'PPB0001', 'PPB0001', 2, 'Produto PPB0001', 'Produto PPB0001 - PPB', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(77, 'PPB0002', 'PPB0002', 2, 'Produto PPB0002', 'Produto PPB0002 - PPB', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(78, 'PPB0003', 'PPB0003', 2, 'Produto PPB0003', 'Produto PPB0003 - PPB', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(79, 'PPB0004', 'PPB0004', 2, 'Produto PPB0004', 'Produto PPB0004 - PPB', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(80, 'PPB0005', 'PPB0005', 2, 'Produto PPB0005', 'Produto PPB0005 - PPB', '5.18', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(81, 'PPB0006', 'PPB0006', 2, 'Produto PPB0006', 'Produto PPB0006 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(82, 'PPB0007', 'PPB0007', 2, 'Produto PPB0007', 'Produto PPB0007 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(83, 'PPB0008', 'PPB0008', 2, 'Produto PPB0008', 'Produto PPB0008 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(84, 'PPB0009', 'PPB0009', 2, 'Produto PPB0009', 'Produto PPB0009 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(85, 'PPB0010', 'PPB0010', 2, 'Produto PPB0010', 'Produto PPB0010 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(86, 'PPB0011', 'PPB0011', 2, 'Produto PPB0011', 'Produto PPB0011 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(87, 'PPB0012', 'PPB0012', 2, 'Produto PPB0012', 'Produto PPB0012 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(88, 'PPB0013', 'PPB0013', 2, 'Produto PPB0013', 'Produto PPB0013 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(89, 'PPB0014', 'PPB0014', 2, 'Produto PPB0014', 'Produto PPB0014 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(90, 'PPB0015', 'PPB0015', 2, 'Produto PPB0015', 'Produto PPB0015 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(91, 'PPB0016', 'PPB0016', 2, 'Produto PPB0016', 'Produto PPB0016 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(92, 'PPB0017', 'PPB0017', 2, 'Produto PPB0017', 'Produto PPB0017 - PPB', '7.77', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(93, 'PPB0018', 'PPB0018', 2, 'Produto PPB0018', 'Produto PPB0018 - PPB', '10.35', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(94, 'PPB0019', 'PPB0019', 2, 'Produto PPB0019', 'Produto PPB0019 - PPB', '10.35', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(95, 'PPB0020', 'PPB0020', 2, 'Produto PPB0020', 'Produto PPB0020 - PPB', '10.35', '20.00', 0, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(96, 'PPB0021', 'PPB0021', 2, 'Produto PPB0021', 'Produto PPB0021 - PPB', '10.35', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(97, 'PPB0022', 'PPB0022', 2, 'Produto PPB0022', 'Produto PPB0022 - PPB', '10.35', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(98, 'PPB0023', 'PPB0023', 2, 'Produto PPB0023', 'Produto PPB0023 - PPB', '18.12', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(99, 'PPB0024', 'PPB0024', 2, 'Produto PPB0024', 'Produto PPB0024 - PPB', '18.12', '35.00', 0, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(100, 'PPB0025', 'PPB0025', 2, 'Produto PPB0025', 'Produto PPB0025 - PPB', '20.71', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(101, 'PPB0026', 'PPB0026', 2, 'Produto PPB0026', 'Produto PPB0026 - PPB', '0.00', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(102, 'PPB0027', 'PPB0027', 2, 'Produto PPB0027', 'Produto PPB0027 - PPB', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(103, 'PPB0028', 'PPB0028', 2, 'Produto PPB0028', 'Produto PPB0028 - PPB', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(104, 'PPB0029', 'PPB0029', 2, 'Produto PPB0029', 'Produto PPB0029 - PPB', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(105, 'PPB0030', 'PPB0030', 2, 'Produto PPB0030', 'Produto PPB0030 - PPB', '0.00', '25.00', 0, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(106, 'PPB0031', 'PPB0031', 2, 'Produto PPB0031', 'Produto PPB0031 - PPB', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(107, 'PPB0032', 'PPB0032', 2, 'Produto PPB0032', 'Produto PPB0032 - PPB', '0.00', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(108, 'PPB0033', 'PPB0033', 2, 'Produto PPB0033', 'Produto PPB0033 - PPB', '0.00', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPB', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(109, 'PPU0001', 'PPU0001', 4, 'Produto PPU0001', 'Produto PPU0001 - PPU', '93.18', '180.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(110, 'PPU0002', 'PPU0002', 4, 'Produto PPU0002', 'Produto PPU0002 - PPU', '93.18', '180.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(111, 'PPU0003', 'PPU0003', 4, 'Produto PPU0003', 'Produto PPU0003 - PPU', '28.47', '55.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(112, 'PPU0004', 'PPU0004', 4, 'Produto PPU0004', 'Produto PPU0004 - PPU', '98.36', '190.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(113, 'PPU0005', 'PPU0005', 4, 'Produto PPU0005', 'Produto PPU0005 - PPU', '20.71', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(114, 'PPU0006', 'PPU0006', 4, 'Produto PPU0006', 'Produto PPU0006 - PPU', '62.12', '140.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(115, 'PPU0007', 'PPU0007', 4, 'Produto PPU0007', 'Produto PPU0007 - PPU', '67.30', '130.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 15:48:35', 1, 4, NULL, 1, 1),
(116, 'PPU0008', 'PPU0008', 4, 'Produto PPU0008', 'Produto PPU0008 - PPU', '23.30', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(117, 'PPU0009', 'PPU0009', 4, 'Produto PPU0009', 'Produto PPU0009 - PPU', '10.35', '20.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 21:45:00', 1, 4, NULL, 1, 1),
(118, 'PPU0010', 'PPU0010', 4, 'Produto PPU0010', 'Produto PPU0010 - PPU', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(119, 'PPU0011', 'PPU0011', 4, 'Produto PPU0011', 'Produto PPU0011 - PPU', '20.71', '30.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(120, 'PPU0012', 'PPU0012', 4, 'Produto PPU0012', 'Produto PPU0012 - PPU', '20.71', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(121, 'PPU0013', 'PPU0013', 4, 'Produto PPU0013', 'Produto PPU0013 - PPU', '18.12', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(122, 'PPU0014', 'PPU0014', 4, 'Produto PPU0014', 'Produto PPU0014 - PPU', '28.47', '55.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(123, 'PPU0015', 'PPU0015', 4, 'Produto PPU0015', 'Produto PPU0015 - PPU', '20.71', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(124, 'PPU0016', 'PPU0016', 4, 'Produto PPU0016', 'Produto PPU0016 - PPU', '38.83', '60.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(125, 'PPU0017', 'PPU0017', 4, 'Produto PPU0017', 'Produto PPU0017 - PPU', '31.06', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(126, 'PPU0018', 'PPU0018', 4, 'Produto PPU0018', 'Produto PPU0018 - PPU', '62.12', '130.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(127, 'PPU0019', 'PPU0019', 4, 'Produto PPU0019', 'Produto PPU0019 - PPU', '31.06', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(128, 'PPU0020', 'PPU0020', 4, 'Produto PPU0020', 'Produto PPU0020 - PPU', '31.06', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(129, 'PPU0021', 'PPU0021', 4, 'Produto PPU0021', 'Produto PPU0021 - PPU', '20.71', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(130, 'PPU0022', 'PPU0022', 4, 'Produto PPU0022', 'Produto PPU0022 - PPU', '10.35', '20.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(131, 'PPU0023', 'PPU0023', 4, 'Produto PPU0023', 'Produto PPU0023 - PPU', '18.12', '35.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(132, 'PPU0024', 'PPU0024', 4, 'Produto PPU0024', 'Produto PPU0024 - PPU', '15.53', '30.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(133, 'PPU0025', 'PPU0025', 4, 'Produto PPU0025', 'Produto PPU0025 - PPU', '19.41', '37.50', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(134, 'PPU0026', 'PPU0026', 4, 'Produto PPU0026', 'Produto PPU0026 - PPU', '36.24', '70.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(135, 'PPU0027', 'PPU0027', 4, 'Produto PPU0027', 'Produto PPU0027 - PPU', '33.65', '65.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(136, 'PVO0001', 'PVO0001', 3, 'Produto PVO0001', 'Produto PVO0001 - PVO', '0.00', '160.00', 1, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(137, 'PPU0000', 'PPU0000', 4, 'Produto PPU0000', 'Produto PPU0000 - PPU', '38.83', '75.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(138, 'PPU0028', 'PPU0028', 4, 'Produto PPU0028', 'Produto PPU0028 - PPU', '0.00', '110.00', 1, 0, '36.000', 1, 'g', '21', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(139, 'PPU0029', 'PPU0029', 4, 'Produto PPU0029', 'Produto PPU0029 - PPU', '0.00', '110.00', 1, 0, '34.000', 1, 'g', '20.5', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(140, 'PPU0030', 'PPU0030', 4, 'Produto PPU0030', 'Produto PPU0030 - PPU', '0.00', '125.00', 1, 0, '41.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(141, 'PPU0031', 'PPU0031', 4, 'Produto PPU0031', 'Produto PPU0031 - PPU', '0.00', '135.00', 2, 0, '43.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(142, 'PPU0032', 'PPU0032', 4, 'Produto PPU0032', 'Produto PPU0032 - PPU', '0.00', '135.00', 0, 0, '45.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(143, 'PPU0033', 'PPU0033', 4, 'Produto PPU0033', 'Produto PPU0033 - PPU', '0.00', '135.00', 1, 0, '45.000', 1, 'g', '21', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(144, 'PPU0034', 'PPU0034', 4, 'Produto PPU0034', 'Produto PPU0034 - PPU', '0.00', '135.00', 1, 0, '46.000', 1, 'g', '21.5', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(145, 'PPU0035', 'PPU0035', 4, 'Produto PPU0035', 'Produto PPU0035 - PPU', '0.00', '140.00', 1, 0, '46.000', 1, 'g', '20.5', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(146, 'PPU0036', 'PPU0036', 4, 'Produto PPU0036', 'Produto PPU0036 - PPU', '0.00', '15.00', 2, 0, '45752.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(147, 'PPU0037', 'PPU0037', 4, 'Produto PPU0037', 'Produto PPU0037 - PPU', '0.00', '180.00', 0, 0, '60.000', 1, 'g', '21', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(148, 'PPU0038', 'PPU0038', 4, 'Produto PPU0038', 'Produto PPU0038 - PPU', '0.00', '185.00', 1, 0, '62.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(149, 'PPU0039', 'PPU0039', 4, 'Produto PPU0039', 'Produto PPU0039 - PPU', '0.00', '20.00', 0, 0, '6.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(150, 'PPU0040', 'PPU0040', 4, 'Produto PPU0040', 'Produto PPU0040 - PPU', '0.00', '20.00', 1, 0, '7.000', 1, 'g', '18', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(151, 'PPU0041', 'PPU0041', 4, 'Produto PPU0041', 'Produto PPU0041 - PPU', '0.00', '25.00', 2, 0, '8.000', 1, 'g', '18', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(152, 'PPU0042', 'PPU0042', 4, 'Produto PPU0042', 'Produto PPU0042 - PPU', '0.00', '25.00', 1, 0, '8.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(153, 'PPU0043', 'PPU0043', 4, 'Produto PPU0043', 'Produto PPU0043 - PPU', '0.00', '30.00', 1, 0, '10.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(154, 'PPU0044', 'PPU0044', 4, 'Produto PPU0044', 'Produto PPU0044 - PPU', '0.00', '30.00', 1, 0, '10.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(155, 'PPU0045', 'PPU0045', 4, 'Produto PPU0045', 'Produto PPU0045 - PPU', '0.00', '30.00', 1, 0, '10.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(156, 'PPU0046', 'PPU0046', 4, 'Produto PPU0046', 'Produto PPU0046 - PPU', '0.00', '30.00', 0, 0, '10.000', 1, 'g', '22', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(157, 'PPU0047', 'PPU0047', 4, 'Produto PPU0047', 'Produto PPU0047 - PPU', '0.00', '30.00', 1, 0, '9.000', 1, 'g', '17', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(158, 'PPU0048', 'PPU0048', 4, 'Produto PPU0048', 'Produto PPU0048 - PPU', '0.00', '30.00', 1, 0, '9.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(159, 'PPU0049', 'PPU0049', 4, 'Produto PPU0049', 'Produto PPU0049 - PPU', '0.00', '30.00', 1, 0, '9.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(160, 'PPU0050', 'PPU0050', 4, 'Produto PPU0050', 'Produto PPU0050 - PPU', '0.00', '30.00', 1, 0, '9.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(161, 'PPU0051', 'PPU0051', 4, 'Produto PPU0051', 'Produto PPU0051 - PPU', '0.00', '30.00', 0, 0, '12.000', 1, 'g', '18.5', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(162, 'PPU0052', 'PPU0052', 4, 'Produto PPU0052', 'Produto PPU0052 - PPU', '0.00', '35.00', 1, 0, '12.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(163, 'PPU0053', 'PPU0053', 4, 'Produto PPU0053', 'Produto PPU0053 - PPU', '0.00', '40.00', 1, 0, '12.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(164, 'PPU0054', 'PPU0054', 4, 'Produto PPU0054', 'Produto PPU0054 - PPU', '0.00', '30.00', 1, 0, '13.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(165, 'PPU0055', 'PPU0055', 4, 'Produto PPU0055', 'Produto PPU0055 - PPU', '0.00', '40.00', 1, 0, '13.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(166, 'PPU0056', 'PPU0056', 4, 'Produto PPU0056', 'Produto PPU0056 - PPU', '0.00', '40.00', 1, 0, '13.000', 1, 'g', '20', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(167, 'PPU0057', 'PPU0057', 4, 'Produto PPU0057', 'Produto PPU0057 - PPU', '0.00', '40.00', 1, 0, '13.000', 1, 'g', '22', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(168, 'PPU0058', 'PPU0058', 4, 'Produto PPU0058', 'Produto PPU0058 - PPU', '0.00', '90.00', 1, 0, '29.000', 1, 'g', '20.5', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(169, 'PPU0059', 'PPU0059', 4, 'Produto PPU0059', 'Produto PPU0059 - PPU', '0.00', '40.00', 1, 0, '0.000', 1, 'g', '19', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(170, 'PPU0060', 'PPU0060', 4, 'Produto PPU0060', 'Produto PPU0060 - PPU', '0.00', '75.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(171, 'PPU0061', 'PPU0061', 4, 'Produto PPU0061', 'Produto PPU0061 - PPU', '0.00', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(172, 'PPU0062', 'PPU0062', 4, 'Produto PPU0062', 'Produto PPU0062 - PPU', '0.00', '40.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(173, 'PPU0063', 'PPU0063', 4, 'Produto PPU0063', 'Produto PPU0063 - PPU', '0.00', '60.00', 0, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(174, 'PPU0064', 'PPU0064', 4, 'Produto PPU0064', 'Produto PPU0064 - PPU', '0.00', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(175, 'PPU0065', 'PPU0065', 4, 'Produto PPU0065', 'Produto PPU0065 - PPU', '0.00', '25.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(176, 'PPU0066', 'PPU0066', 4, 'Produto PPU0066', 'Produto PPU0066 - PPU', '0.00', '60.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 16:16:38', 1, 1, NULL, 1, 1),
(177, 'PPU0067', 'PPU0067', 4, 'Produto PPU0067', 'Produto PPU0067 - PPU', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(178, 'PPU0068', 'PPU0068', 4, 'Produto PPU0068', 'Produto PPU0068 - PPU', '0.00', '15.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 16:16:48', 1, 1, NULL, 1, 1),
(179, 'PPU0069', 'PPU0069', 4, 'Produto PPU0069', 'Produto PPU0069 - PPU', '0.00', '10.00', 2, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(180, 'PPU0070', 'PPU0070', 4, 'Produto PPU0070', 'Produto PPU0070 - PPU', '0.00', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 16:16:10', 1, 1, NULL, 1, 1),
(181, 'PPU0071', 'PPU0071', 4, 'Produto PPU0071', 'Produto PPU0071 - PPU', '0.00', '10.00', 1, 0, '0.000', 1, 'g', '', 'PPU', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(182, 'PVO0002', 'PVO0002', 3, 'Produto PVO0002', 'Produto PVO0002 - PVO', '0.00', '150.00', 0, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 16:16:17', 1, 1, NULL, 1, 1),
(183, 'PVO0003', 'PVO0003', 3, 'Produto PVO0003', 'Produto PVO0003 - PVO', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(184, 'PVO0004', 'PVO0004', 3, 'Produto PVO0004', 'Produto PVO0004 - PVO', '0.00', '30.00', 2, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 16:16:19', 1, 1, NULL, 1, 1),
(185, 'PVO0005', 'PVO0005', 3, 'Produto PVO0005', 'Produto PVO0005 - PVO', '0.00', '50.00', 1, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-06-02 15:47:39', 1, 4, NULL, 1, 1),
(186, 'PVO0006', 'PVO0006', 3, 'Produto PVO0006', 'Produto PVO0006 - PVO', '0.00', '10.00', 1, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(187, 'PVO0007', 'PVO0007', 3, 'Produto PVO0007', 'Produto PVO0007 - PVO', '0.00', '15.00', 2, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1),
(188, 'PVO0008', 'PVO0008', 3, 'Produto PVO0008', 'Produto PVO0008 - PVO', '0.00', '30.00', 1, 0, '0.000', 1, 'g', '', 'PVO', 'Prata 925', NULL, 1, 0, 0, '', '2025-05-22 15:56:57', '2025-05-22 22:39:09', 1, 1, NULL, 0, 1);

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
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `featured_carousel_enabled`, `catalog_page_enabled`, `hide_catalog_prices`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-06-01 15:08:28', '2025-07-17 19:20:42');

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `tax_number` varchar(20) DEFAULT NULL COMMENT 'NIF',
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Portugal',
  `payment_terms` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_suppliers_created_by` (`created_by`),
  KEY `idx_suppliers_updated_by` (`updated_by`),
  CONSTRAINT `fk_suppliers_created_by` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_suppliers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `suppliers_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fornecedores de produtos';

-- No data for table `suppliers`

--
-- Table structure for table `user_rights_requests`
--

DROP TABLE IF EXISTS `user_rights_requests`;
CREATE TABLE `user_rights_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `request_type` enum('access','deletion','rectification','portability','objection','limitation') NOT NULL,
  `details` text DEFAULT NULL,
  `request_token` varchar(255) NOT NULL,
  `status` enum('pending','processing','completed','rejected','expired') DEFAULT 'pending',
  `response_data` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_token` (`request_token`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_email` (`email`),
  KEY `idx_request_token` (`request_token`),
  KEY `idx_status` (`status`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data for table `user_rights_requests`

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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@gonzagas.com', '$2b$10$OpQSfinNzajl/Ze7RMsaV.jOD38f5YwpUI.aeFy6Wt7obObCxjA8a', 'admin', '2025-05-22 16:42:08', '2025-05-22 17:36:43'),
(3, 'Gonzaga', 'g.art.shine@gmail.com', 'b02IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2025-05-22 21:00:07', '2025-07-17 16:32:14'),
(4, 'mike', 'miguelmelo70@gmail.com', '$2b$10$ZXMBcvchUbbmYgwnaySSOe1pVtY5Wt4iwpK2CEDi5ytQTGWwOuC9u', 'admin', '2025-05-22 21:04:15', '2025-05-22 21:14:55'),
(5, 'Gonzaga', 'gonzaga@artnshine.pt', '$2a$10$goRYOLkXUINjrAHNIYFoZuVp06S.k.sQpsEOgC3dN9XRuzOezja46', 'admin', '2025-07-17 16:32:05', '2025-07-17 16:32:05');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
