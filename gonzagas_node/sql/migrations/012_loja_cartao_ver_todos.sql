-- =====================================================
-- MIGRATION 012: Cartão "Ver todos" da loja
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: O cartão "Ver todos", na entrada da loja, era o único da fila
-- sem imagem nem texto configuráveis — ficava um rectângulo vazio ao lado dos
-- cartões de material, que já tinham `card_image` no admin. Estas três colunas
-- dão-lhe o mesmo tratamento.
--
-- NULL em qualquer uma = comportamento actual (sem imagem, "Ver todos",
-- contagem de peças por baixo). Nada muda até o admin escolher.
--
-- Risk Level: VERY LOW — três colunas novas (nullable) numa tabela de uma só
-- linha; não toca em produtos, encomendas, clientes nem stock. Idempotente.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'site_settings'
  AND COLUMN_NAME = 'shop_all_card_image'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN shop_all_card_image VARCHAR(255) NULL COMMENT ''Caminho público da imagem do cartão "Ver todos" da loja (NULL = sem imagem)''',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'site_settings'
  AND COLUMN_NAME = 'shop_all_card_title'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN shop_all_card_title VARCHAR(120) NULL COMMENT ''Título do cartão "Ver todos" da loja (NULL = "Ver todos")'' AFTER shop_all_card_image',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'site_settings'
  AND COLUMN_NAME = 'shop_all_card_subtitle'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN shop_all_card_subtitle VARCHAR(180) NULL COMMENT ''Legenda do cartão "Ver todos" da loja (NULL = contagem de peças)'' AFTER shop_all_card_title',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 012 completed: site_settings.shop_all_card_image + _title + _subtitle ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- ALTER TABLE `site_settings` DROP COLUMN `shop_all_card_image`;
-- ALTER TABLE `site_settings` DROP COLUMN `shop_all_card_title`;
-- ALTER TABLE `site_settings` DROP COLUMN `shop_all_card_subtitle`;
