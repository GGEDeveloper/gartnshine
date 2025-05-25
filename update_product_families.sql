-- Criar as famílias de produtos se não existirem
INSERT IGNORE INTO product_families (code, name) VALUES 
('PAN', 'Aneis'),
('PPB', 'Brincos'),
('PVO', 'Colares'),
('PPU', 'Pulseiras');

-- Atualizar os produtos com os IDs das famílias
UPDATE products p
JOIN product_families pf ON p.style = pf.code
SET p.family_id = pf.id
WHERE p.style IN ('PAN', 'PPB', 'PVO', 'PPU');

-- Verificar os resultados
SELECT 
    p.id,
    p.reference,
    p.name,
    p.style,
    p.family_id,
    pf.code as family_code,
    pf.name as family_name
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id
WHERE p.style IN ('PAN', 'PPB', 'PVO', 'PPU')
LIMIT 10;
