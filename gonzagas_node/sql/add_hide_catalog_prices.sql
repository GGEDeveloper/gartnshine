-- Script para adicionar funcionalidade de ocultar preços no catálogo
-- Adiciona a coluna hide_catalog_prices na tabela site_settings

USE gonzagas_db;

-- Verificar se a coluna já existe antes de adicionar
SET @dbname = DATABASE();
SET @tablename = 'site_settings';
SET @columnname = 'hide_catalog_prices';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE site_settings ADD COLUMN hide_catalog_prices TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Hide prices in catalog, show price on request instead' AFTER catalog_page_enabled",
  'SELECT 1 as column_exists;'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar se a tabela site_settings existe e tem pelo menos um registro
INSERT IGNORE INTO site_settings (id, featured_carousel_enabled, catalog_page_enabled, hide_catalog_prices) 
VALUES (1, 1, 1, 0);

SELECT 'Script executado com sucesso! Coluna hide_catalog_prices adicionada.' as status; 