-- ÍNDICES CRÍTICOS PARA PERFORMANCE
-- Executar estas queries na base de dados atual

-- 1. Índices para performance de produtos
-- Remover índices existentes se houver
ALTER TABLE products DROP INDEX IF EXISTS idx_active_featured;
ALTER TABLE products DROP INDEX IF EXISTS idx_family_active;
ALTER TABLE products DROP INDEX IF EXISTS idx_search_name;
ALTER TABLE products DROP INDEX IF EXISTS idx_search_reference;
ALTER TABLE products DROP INDEX IF EXISTS idx_stock_status;
ALTER TABLE products DROP INDEX IF EXISTS idx_created_date;

-- Adicionar índices
ALTER TABLE products ADD INDEX idx_active_featured (is_active, featured);
ALTER TABLE products ADD INDEX idx_family_active (family_id, is_active);
ALTER TABLE products ADD INDEX idx_search_name (name(50));
ALTER TABLE products ADD INDEX idx_search_reference (reference);
ALTER TABLE products ADD INDEX idx_stock_status (current_stock, is_active);
ALTER TABLE products ADD INDEX idx_created_date (created_at);

-- 2. Índices para product_images
ALTER TABLE product_images DROP INDEX IF EXISTS idx_product_primary;
ALTER TABLE product_images DROP INDEX IF EXISTS idx_product_sort;

ALTER TABLE product_images ADD INDEX idx_product_primary (product_id, is_primary);
ALTER TABLE product_images ADD INDEX idx_product_sort (product_id, sort_order);

-- 3. Índices para product_families
ALTER TABLE product_families DROP INDEX IF EXISTS idx_name;
ALTER TABLE product_families ADD INDEX idx_name (name);

-- 4. Índices para inventory_transactions
ALTER TABLE inventory_transactions DROP INDEX IF EXISTS idx_product_date;
ALTER TABLE inventory_transactions DROP INDEX IF EXISTS idx_transaction_type;

ALTER TABLE inventory_transactions ADD INDEX idx_product_date (product_id, created_at);
ALTER TABLE inventory_transactions ADD INDEX idx_transaction_type (transaction_type, created_at);

-- 5. View otimizada para catalog (SUBSTITUIR se já existir)
DROP VIEW IF EXISTS catalog_products_optimized;
CREATE VIEW catalog_products_optimized AS
SELECT
    p.id,
    p.reference,
    p.name,
    p.description,
    p.sale_price,
    p.style,
    p.material,
    p.featured,
    p.current_stock,
    p.created_at,
    pf.name as family_name,
    pf.id as family_id,
    (SELECT pi.image_filename
     FROM product_images pi
     WHERE pi.product_id = p.id AND pi.is_primary = 1
     LIMIT 1) as main_image,
    (SELECT COUNT(*)
     FROM product_images pi2
     WHERE pi2.product_id = p.id) as image_count
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id
WHERE p.is_active = 1
ORDER BY p.featured DESC, p.created_at DESC;

-- 6. Stored procedure para queries frequentes
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetProductsPage(
    IN page_offset INT,
    IN page_limit INT,
    IN family_filter INT,
    IN search_term VARCHAR(255)
)
BEGIN
    DECLARE search_pattern VARCHAR(255);
    SET search_pattern = CONCAT('%', IFNULL(search_term, ''), '%');

    SELECT * FROM catalog_products_optimized
    WHERE (family_filter IS NULL OR family_id = family_filter)
    AND (search_term IS NULL OR name LIKE search_pattern OR reference LIKE search_pattern)
    LIMIT page_offset, page_limit;
END //
DELIMITER ;

-- Verificar índices criados
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('products', 'product_images', 'product_families', 'inventory_transactions')
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

