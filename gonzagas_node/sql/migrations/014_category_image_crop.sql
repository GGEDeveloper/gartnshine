-- =====================================================
-- MIGRATION 014: Recorte e enquadramento das imagens de categoria
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: As categorias já tinham `hero_image` e `card_image`, mas o
-- admin só conseguia APONTAR para um ficheiro — o enquadramento era o que
-- desse. Uma foto de anel na horizontal usada como hero 16:9 ficava cortada
-- pelo meio, e a mesma foto no cartão 4:5 cortava noutro sítio.
--
-- Estas quatro colunas guardam a ORIGEM e o RECTÂNGULO DE RECORTE escolhidos
-- no admin, para dois fins:
--   1. poder voltar a abrir o editor com o enquadramento anterior, em vez de
--      recomeçar do zero a cada ajuste;
--   2. poder regerar as variantes (se mudarem os tamanhos de saída) sem
--      perder a decisão de enquadramento.
--
-- As colunas `hero_image`/`card_image` continuam a guardar o caminho público
-- da imagem JÁ RECORTADA, que é o que as views usam. Nada nas views muda.
--
-- NULL em todas = comportamento actual (imagem usada inteira, sem recorte).
--
-- Risk Level: VERY LOW — quatro colunas novas (nullable) numa tabela de
-- categorias; não toca em produtos, encomendas, clientes nem stock.
-- Idempotente: pode correr as vezes que forem precisas.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

-- hero_source: ficheiro ORIGINAL (caminho público) de onde a hero foi cortada
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'hero_source'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE product_families ADD COLUMN hero_source VARCHAR(255) NULL COMMENT ''Imagem original de onde a hero foi recortada (NULL = hero usada tal como está)'' AFTER hero_image',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- hero_crop: JSON {"x":0,"y":0,"w":0,"h":0} em pixéis do ORIGINAL
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'hero_crop'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE product_families ADD COLUMN hero_crop VARCHAR(160) NULL COMMENT ''Rectângulo de recorte da hero, em pixeis do original: {"x":..,"y":..,"w":..,"h":..}'' AFTER hero_source',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- card_source
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'card_source'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE product_families ADD COLUMN card_source VARCHAR(255) NULL COMMENT ''Imagem original de onde o cartão foi recortado (NULL = imagem usada tal como está)'' AFTER card_image',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- card_crop
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'card_crop'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE product_families ADD COLUMN card_crop VARCHAR(160) NULL COMMENT ''Rectângulo de recorte do cartão, em pixeis do original: {"x":..,"y":..,"w":..,"h":..}'' AFTER card_source',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Migration 014 completed: product_families.hero_source/hero_crop/card_source/card_crop ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- ALTER TABLE `product_families` DROP COLUMN `hero_source`;
-- ALTER TABLE `product_families` DROP COLUMN `hero_crop`;
-- ALTER TABLE `product_families` DROP COLUMN `card_source`;
-- ALTER TABLE `product_families` DROP COLUMN `card_crop`;
