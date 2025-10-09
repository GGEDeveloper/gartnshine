-- =============================================
-- ADICIONAR COLUNAS NECESSÁRIAS PARA PDP
-- Execute este script ANTES de inserir os produtos de teste
-- =============================================

-- Verificar estrutura atual
DESCRIBE products;

-- Adicionar colunas para PDP (se não existirem)
-- O script ignora erros se a coluna já existir

-- Slug (para URLs amigáveis)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL DEFAULT NULL,
ADD UNIQUE INDEX IF NOT EXISTS idx_slug (slug);

-- Stone data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stone_type VARCHAR(50) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stone_name VARCHAR(100) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stone_origin VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stone_properties TEXT NULL DEFAULT NULL;

-- Metal data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metal_name VARCHAR(100) NULL DEFAULT 'Prata 925',
ADD COLUMN IF NOT EXISTS metal_finish VARCHAR(50) NULL DEFAULT 'prata_925',
ADD COLUMN IF NOT EXISTS metal_purity VARCHAR(20) NULL DEFAULT '925';

-- Artisan data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS artisan_name VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS artisan_workshop VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS artisan_specialty TEXT NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS crafting_technique TEXT NULL DEFAULT NULL;

-- Additional specs
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight VARCHAR(50) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100) NULL DEFAULT NULL;

-- SEO
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS meta_description TEXT NULL DEFAULT NULL;

-- Analytics
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- Criar índices para performance
ALTER TABLE products
ADD INDEX IF NOT EXISTS idx_stone_type (stone_type),
ADD INDEX IF NOT EXISTS idx_metal_finish (metal_finish),
ADD INDEX IF NOT EXISTS idx_featured_active (featured, is_active);

-- =============================================
-- VERIFICAR COLUNAS ADICIONADAS
-- =============================================

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products'
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'slug', 'stone_type', 'stone_name', 'stone_origin', 'stone_properties',
        'metal_name', 'metal_finish', 'metal_purity',
        'artisan_name', 'artisan_workshop', 'artisan_specialty', 'crafting_technique',
        'weight', 'dimensions', 'meta_title', 'meta_description', 'views'
    )
ORDER BY COLUMN_NAME;

-- =============================================
-- GERAR SLUGS PARA PRODUTOS EXISTENTES
-- =============================================

-- Gerar slugs automáticos baseados no nome para produtos que não têm
UPDATE products 
SET slug = LOWER(
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

-- =============================================
-- RESULTADO ESPERADO
-- =============================================

SELECT 
    'Colunas adicionadas com sucesso!' as status,
    COUNT(*) as total_colunas
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products'
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'slug', 'stone_type', 'stone_name', 'artisan_name'
    );

