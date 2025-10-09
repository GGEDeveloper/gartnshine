-- =============================================
-- PDP MIGRATION - SAFE VERSION
-- Adds columns only if they don't exist
-- =============================================

USE gonzagas_local;

-- Disable warnings temporarily
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- Add slug
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'slug';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN slug VARCHAR(255) NULL COMMENT "URL-friendly identifier"',
    'SELECT "slug already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add stone_type
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stone_type';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN stone_type VARCHAR(50) NULL COMMENT "Type of stone"',
    'SELECT "stone_type already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add stone_name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stone_name';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN stone_name VARCHAR(100) NULL COMMENT "Display name of stone"',
    'SELECT "stone_name already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add stone_origin
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stone_origin';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN stone_origin VARCHAR(255) NULL COMMENT "Geographic origin"',
    'SELECT "stone_origin already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add stone_properties
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stone_properties';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN stone_properties TEXT NULL COMMENT "Metaphysical properties"',
    'SELECT "stone_properties already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add metal_name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'metal_name';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN metal_name VARCHAR(100) NULL DEFAULT "Prata 925" COMMENT "Metal name"',
    'SELECT "metal_name already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add metal_finish
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'metal_finish';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN metal_finish VARCHAR(50) NULL DEFAULT "prata_925" COMMENT "Metal finish"',
    'SELECT "metal_finish already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add metal_purity
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'metal_purity';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN metal_purity VARCHAR(20) NULL DEFAULT "925" COMMENT "Metal purity"',
    'SELECT "metal_purity already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add artisan_name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'artisan_name';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN artisan_name VARCHAR(255) NULL COMMENT "Artisan name"',
    'SELECT "artisan_name already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add artisan_workshop
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'artisan_workshop';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN artisan_workshop VARCHAR(255) NULL COMMENT "Workshop name"',
    'SELECT "artisan_workshop already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add artisan_specialty
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'artisan_specialty';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN artisan_specialty TEXT NULL COMMENT "Artisan specialty"',
    'SELECT "artisan_specialty already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add crafting_technique
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'crafting_technique';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN crafting_technique TEXT NULL COMMENT "Crafting technique"',
    'SELECT "crafting_technique already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add meta_title
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'meta_title';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) NULL COMMENT "SEO title"',
    'SELECT "meta_title already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add meta_description
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'meta_description';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN meta_description TEXT NULL COMMENT "SEO description"',
    'SELECT "meta_description already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add views
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gonzagas_local' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'views';
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN views INT NULL DEFAULT 0 COMMENT "View counter"',
    'SELECT "views already exists" as status');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes (safe - will fail silently if exists)
ALTER TABLE products ADD INDEX idx_slug (slug);
ALTER TABLE products ADD INDEX idx_stone_type (stone_type);
ALTER TABLE products ADD INDEX idx_metal_finish (metal_finish);
ALTER TABLE products ADD INDEX idx_featured_active (featured, is_active);

-- Generate slugs for existing products
UPDATE products 
SET slug = LOWER(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(name, 'ã', 'a'),
                            'õ', 'o'
                        ),
                        'é', 'e'
                    ),
                    'í', 'i'
                ),
                'ó', 'o'
            ),
            ' ', '-'
        ),
        'ç', 'c'
    )
)
WHERE slug IS NULL OR slug = '';

-- Restore SQL notes
SET SQL_NOTES=@OLD_SQL_NOTES;

-- Verification
SELECT '✓ Migration complete!' as status;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as products_with_slug FROM products WHERE slug IS NOT NULL;
SELECT COUNT(*) as products_with_stone_type FROM products WHERE stone_type IS NOT NULL;

