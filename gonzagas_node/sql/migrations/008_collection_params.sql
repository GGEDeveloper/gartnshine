-- =====================================================
-- MIGRATION 008: Parâmetros por coleção
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Permite parametrizar cada coleção no admin — imagem própria
-- para o cartão da página inicial (separada da imagem do cabeçalho, que
-- continua em hero_image) e textos próprios para SEO.
-- Risk Level: VERY LOW — só colunas novas (nullable), idempotente.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;

-- card_image — imagem do cartão na página inicial.
-- hero_image (migração 006) fica reservada ao cabeçalho da página da coleção.
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='product_families' AND COLUMN_NAME='card_image');
SET @sql = IF(@col=0, 'ALTER TABLE `product_families` ADD COLUMN `card_image` VARCHAR(255) DEFAULT NULL COMMENT ''Imagem do cartão na página inicial'' AFTER `hero_image`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- seo_title — título para o Google, quando se quer diferente do nome.
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='product_families' AND COLUMN_NAME='seo_title');
SET @sql = IF(@col=0, 'ALTER TABLE `product_families` ADD COLUMN `seo_title` VARCHAR(255) DEFAULT NULL COMMENT ''Título para SEO (vazio = usa o nome)'' AFTER `card_image`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- seo_description — meta description própria.
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='product_families' AND COLUMN_NAME='seo_description');
SET @sql = IF(@col=0, 'ALTER TABLE `product_families` ADD COLUMN `seo_description` VARCHAR(320) DEFAULT NULL COMMENT ''Meta description (vazio = derivada da descrição)'' AFTER `seo_title`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SELECT 'Migration 008 completed: product_families.card_image + seo_title + seo_description ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- ALTER TABLE `product_families` DROP COLUMN `card_image`;
-- ALTER TABLE `product_families` DROP COLUMN `seo_title`;
-- ALTER TABLE `product_families` DROP COLUMN `seo_description`;
