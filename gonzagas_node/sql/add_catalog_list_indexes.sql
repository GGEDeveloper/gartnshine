-- Índices para listagem pública do catálogo (MariaDB/MySQL).
-- Idempotente: só cria se o índice ainda não existir. Executar após backup.

SET @db = DATABASE();

-- idx_catalog_public_family
SELECT COUNT(*) INTO @ex1
FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'products' AND index_name = 'idx_catalog_public_family';

SET @sql1 = IF(@ex1 = 0,
  'ALTER TABLE `products` ADD INDEX `idx_catalog_public_family` (`is_active`, `is_catalog_visible`, `family_id`)',
  'SELECT ''skip idx_catalog_public_family'' AS note');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- idx_catalog_public_featured_ref
SELECT COUNT(*) INTO @ex2
FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'products' AND index_name = 'idx_catalog_public_featured_ref';

SET @sql2 = IF(@ex2 = 0,
  'ALTER TABLE `products` ADD INDEX `idx_catalog_public_featured_ref` (`is_active`, `is_catalog_visible`, `featured`, `reference`)',
  'SELECT ''skip idx_catalog_public_featured_ref'' AS note');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SELECT 'Catalog index migration finished' AS status;
