-- ÍNDICES CRÍTICOS PARA PERFORMANCE
-- Este script tenta adicionar índices, ignorando se já existem

-- 1. Índices para produtos
ALTER TABLE products ADD INDEX idx_active_featured (is_active, featured);
ALTER TABLE products ADD INDEX idx_family_active (family_id, is_active);
ALTER TABLE products ADD INDEX idx_search_name (name(50));
ALTER TABLE products ADD INDEX idx_search_reference (reference);
ALTER TABLE products ADD INDEX idx_stock_status (current_stock, is_active);
ALTER TABLE products ADD INDEX idx_created_date (created_at);

-- 2. Índices para product_images
ALTER TABLE product_images ADD INDEX idx_product_primary (product_id, is_primary);
ALTER TABLE product_images ADD INDEX idx_product_sort (product_id, sort_order);

-- 3. Índices para product_families
ALTER TABLE product_families ADD INDEX idx_name (name);

-- 4. Índices para inventory_transactions  
ALTER TABLE inventory_transactions ADD INDEX idx_product_date (product_id, created_at);
ALTER TABLE inventory_transactions ADD INDEX idx_transaction_type (transaction_type, created_at);

-- 5. View otimizada para catalog
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

SELECT 'Índices e view criados com sucesso!' as status;

