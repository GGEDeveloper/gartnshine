-- Adiciona hide_out_of_stock em site_settings
-- Esconde produtos sem stock do catálogo público quando ativado

USE gonzagas_db;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hide_out_of_stock');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE site_settings ADD COLUMN hide_out_of_stock TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Hide out of stock products from public catalog'' AFTER hide_catalog_prices',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Coluna hide_out_of_stock verificada/adicionada.' as status;
