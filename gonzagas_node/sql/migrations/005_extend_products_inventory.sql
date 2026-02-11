-- =====================================================
-- MIGRATION 005: Extend Products & Inventory for Mobile
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Adiciona colunas extras a products e tabelas para inventário completo
-- Campos: color, tax_rate, attributes (JSON), e colunas de auditoria
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- =====================================================
-- 1. EXTEND PRODUCTS TABLE
-- =====================================================
-- Adiciona colunas que podem não existir (idempotente)

-- color
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='color');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `color` VARCHAR(100) DEFAULT NULL COMMENT ''Cor do produto'' AFTER `material`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- tax_rate
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='tax_rate');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `tax_rate` DECIMAL(5,2) DEFAULT 23.00 COMMENT ''IVA %%'' AFTER `sale_price`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- attributes (JSON para atributos flexíveis)
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='attributes');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `attributes` JSON DEFAULT NULL COMMENT ''Atributos chave-valor'' AFTER `notes`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- min_stock
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='min_stock');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `min_stock` INT DEFAULT 0 AFTER `current_stock`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- is_catalog_visible
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='is_catalog_visible');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `is_catalog_visible` TINYINT(1) DEFAULT 1 AFTER `is_active`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- created_by
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='created_by');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `created_by` INT DEFAULT NULL AFTER `updated_at`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- updated_by
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='updated_by');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `updated_by` INT DEFAULT NULL AFTER `created_by`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- barcode
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='barcode');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `barcode` VARCHAR(50) DEFAULT NULL AFTER `reference`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- location
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='location');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `location` VARCHAR(100) DEFAULT NULL COMMENT ''Localização no armazém'' AFTER `dimensions`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- last_stock_update
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='last_stock_update');
SET @sql = IF(@col=0, 'ALTER TABLE `products` ADD COLUMN `last_stock_update` TIMESTAMP NULL DEFAULT NULL AFTER `current_stock`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. INVENTORY_TRANSACTIONS (criar se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `transaction_type` ENUM('in','out','adjustment','purchase','sale') NOT NULL DEFAULT 'in',
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Se a tabela já existir com enum diferente, adicionar valores ao enum
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inventory_transactions' AND COLUMN_NAME='transaction_type');
-- Nota: alterar enum em tabela existente é complexo; a migration assume 'in' como válido

-- =====================================================
-- 3. STOCK_MOVEMENTS (histórico detalhado para mobile)
-- =====================================================
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `movement_type` ENUM('in','out','adjustment','transfer') NOT NULL,
  `quantity` INT NOT NULL,
  `balance_before` INT DEFAULT NULL,
  `balance_after` INT DEFAULT NULL,
  `reference` VARCHAR(100) DEFAULT NULL COMMENT 'Ref. documento ou operação',
  `notes` TEXT,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PRODUCT_COLORS (catalogo de cores se quiser normalizar)
-- =====================================================
CREATE TABLE IF NOT EXISTS `product_colors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `hex_code` VARCHAR(7) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir cores padrão se vazia
INSERT IGNORE INTO `product_colors` (`name`, `hex_code`, `sort_order`) VALUES
('Prata','#C0C0C0',1),
('Dourado','#FFD700',2),
('Rose','#E8B4B8',3),
('Preto','#000000',4),
('Bronze','#CD7F32',5),
('Outro','#808080',99);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SELECT 'Migration 005 completed: products extended, inventory_transactions and stock_movements ready' AS status;
