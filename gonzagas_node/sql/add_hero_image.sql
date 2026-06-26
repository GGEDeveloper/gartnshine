-- Adiciona hero_image em site_settings
-- Caminho público (ex: /media/gallery/foto.jpg) da imagem escolhida no admin
-- para o fundo do hero da homepage. NULL = usa a primeira imagem da galeria
-- (comportamento antigo, mantido como fallback).

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_image');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE site_settings ADD COLUMN hero_image VARCHAR(255) NULL COMMENT ''Caminho público da imagem de fundo do hero (NULL = primeira imagem da galeria)'' AFTER hide_out_of_stock',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Coluna hero_image verificada/adicionada.' as status;
