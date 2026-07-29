-- =====================================================
-- MIGRATION 006: Family Hero Image + Curated Gallery
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Permite ao admin definir uma imagem de destaque por família
-- de produto (usada em /collection/:id) e curar a galeria pública
-- (/collections) via BD em vez de listar o filesystem diretamente.
-- Risk Level: VERY LOW — apenas coluna nova (nullable) + tabela nova.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- =====================================================
-- 1. product_families.hero_image (idempotente)
-- =====================================================
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='product_families' AND COLUMN_NAME='hero_image');
SET @sql = IF(@col=0, 'ALTER TABLE `product_families` ADD COLUMN `hero_image` VARCHAR(255) DEFAULT NULL COMMENT ''Caminho relativo em public/media/gallery/'' AFTER `description`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. gallery_items — galeria curada de /collections
-- =====================================================
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(255) NOT NULL COMMENT 'Nome do ficheiro em public/media/gallery/',
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SELECT 'Migration 006 completed: product_families.hero_image + gallery_items ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- ALTER TABLE `product_families` DROP COLUMN `hero_image`;
-- DROP TABLE IF EXISTS `gallery_items`;
