-- =============================================
-- PDP MIGRATION - Generated 2025-10-09T09:25:40.019Z
-- Missing columns: 15
-- =============================================

USE gonzagas_local;

-- Add slug (URL-friendly identifier)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL COMMENT 'URL-friendly identifier';

-- Add stone_type (Type of stone (onix, olho-de-tigre, etc))
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_type VARCHAR(50) NULL COMMENT 'Type of stone (onix, olho-de-tigre, etc)';

-- Add stone_name (Display name of stone)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_name VARCHAR(100) NULL COMMENT 'Display name of stone';

-- Add stone_origin (Geographic origin of stone)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_origin VARCHAR(255) NULL COMMENT 'Geographic origin of stone';

-- Add stone_properties (Metaphysical properties)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stone_properties TEXT NULL COMMENT 'Metaphysical properties';

-- Add metal_name (Display name of metal)
ALTER TABLE products ADD COLUMN IF NOT EXISTS metal_name VARCHAR(100) NULL DEFAULT 'Prata 925' COMMENT 'Display name of metal';

-- Add metal_finish (Metal finish code)
ALTER TABLE products ADD COLUMN IF NOT EXISTS metal_finish VARCHAR(50) NULL DEFAULT 'prata_925' COMMENT 'Metal finish code';

-- Add metal_purity (Metal purity level)
ALTER TABLE products ADD COLUMN IF NOT EXISTS metal_purity VARCHAR(20) NULL DEFAULT '925' COMMENT 'Metal purity level';

-- Add artisan_name (Artisan creator name)
ALTER TABLE products ADD COLUMN IF NOT EXISTS artisan_name VARCHAR(255) NULL COMMENT 'Artisan creator name';

-- Add artisan_workshop (Workshop name)
ALTER TABLE products ADD COLUMN IF NOT EXISTS artisan_workshop VARCHAR(255) NULL COMMENT 'Workshop name';

-- Add artisan_specialty (Artisan specialty description)
ALTER TABLE products ADD COLUMN IF NOT EXISTS artisan_specialty TEXT NULL COMMENT 'Artisan specialty description';

-- Add crafting_technique (Crafting technique used)
ALTER TABLE products ADD COLUMN IF NOT EXISTS crafting_technique TEXT NULL COMMENT 'Crafting technique used';

-- Add meta_title (SEO meta title)
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) NULL COMMENT 'SEO meta title';

-- Add meta_description (SEO meta description)
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT NULL COMMENT 'SEO meta description';

-- Add views (Page view counter)
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INT NULL DEFAULT 0 COMMENT 'Page view counter';

-- Add indexes for performance
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_slug (slug);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_stone_type (stone_type);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_metal_finish (metal_finish);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_featured_active (featured, is_active);

-- Generate slugs for existing products
UPDATE products SET slug = LOWER(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(name, 'ã', 'a'),
                    'õ', 'o'
                ),
                'é', 'e'
            ),
            ' ', '-'
        ),
        'ç', 'c'
    )
)
WHERE slug IS NULL OR slug = '';

-- Verification
SELECT 'Migration complete!' as status;
SELECT COUNT(*) as products_with_slug FROM products WHERE slug IS NOT NULL;
