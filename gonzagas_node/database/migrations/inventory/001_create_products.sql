-- =============================================
-- Tabela de famílias de produtos
-- =============================================

CREATE TABLE IF NOT EXISTS `product_families` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `meta_title` VARCHAR(100) NULL,
  `meta_description` VARCHAR(255) NULL,
  `meta_keywords` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  UNIQUE KEY `uk_product_families_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de produtos
-- =============================================

CREATE TABLE IF NOT EXISTS `products` (
  `id` CHAR(36) PRIMARY KEY,
  `reference` VARCHAR(50) NOT NULL,
  `barcode` VARCHAR(50) NULL,
  `family_id` CHAR(36) NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `weight` DECIMAL(10,3) DEFAULT 0,
  `weight_unit` ENUM('g', 'kg') DEFAULT 'g',
  `dimensions` VARCHAR(50) NULL COMMENT 'LxAxP em mm',
  `style` VARCHAR(100) NULL,
  `material` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `min_stock_level` INT DEFAULT 0,
  `max_stock_level` INT DEFAULT 0,
  `current_stock` INT DEFAULT 0,
  `reserved_stock` INT DEFAULT 0,
  `available_stock` INT GENERATED ALWAYS AS (GREATEST(0, `current_stock` - `reserved_stock`)) STORED,
  `purchase_price` DECIMAL(10,2) DEFAULT 0.00,
  `sale_price` DECIMAL(10,2) DEFAULT 0.00,
  `cost_price` DECIMAL(10,2) DEFAULT 0.00,
  `tax_rate` DECIMAL(5,2) DEFAULT 23.00 COMMENT 'Taxa de IVA em %',
  `location` VARCHAR(50) NULL COMMENT 'Localização no armazém',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`family_id`) REFERENCES `product_families`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_products_reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de imagens de produtos
-- =============================================

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de histórico de preços de produtos
-- =============================================

CREATE TABLE IF NOT EXISTS `product_price_history` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `sale_price` DECIMAL(10,2) NULL,
  `cost_price` DECIMAL(10,2) NULL,
  `tax_rate` DECIMAL(5,2) NULL,
  `effective_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `end_date` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
