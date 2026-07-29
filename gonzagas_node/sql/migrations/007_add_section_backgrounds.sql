-- =====================================================
-- MIGRATION 007: Fundos das secções da página inicial
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Permite ao admin escolher uma imagem de fundo para as secções
-- "Featured Pieces" e "Do Atelier" (media strip) da página inicial.
-- Risk Level: VERY LOW — apenas duas colunas novas (nullable), idempotente.
-- NULL = sem fundo personalizado (usa o fundo do body).
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'site_settings'
  AND COLUMN_NAME = 'featured_background'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN featured_background VARCHAR(255) NULL COMMENT ''Caminho público da imagem de fundo da secção Featured (NULL = background do body)'' AFTER hero_image',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'site_settings'
  AND COLUMN_NAME = 'media_strip_background'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN media_strip_background VARCHAR(255) NULL COMMENT ''Caminho público da imagem de fundo da secção Media Strip (NULL = background do body)'' AFTER featured_background',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 007 completed: site_settings.featured_background + media_strip_background ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- ALTER TABLE `site_settings` DROP COLUMN `featured_background`;
-- ALTER TABLE `site_settings` DROP COLUMN `media_strip_background`;
