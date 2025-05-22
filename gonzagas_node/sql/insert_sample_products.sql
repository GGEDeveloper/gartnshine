-- Inserir produtos de exemplo
INSERT INTO products (
    reference, 
    name, 
    description, 
    purchase_price, 
    sale_price, 
    current_stock, 
    min_stock,
    weight,
    material,
    style,
    created_at,
    updated_at
) VALUES 
('BRC001', 'Brinco de Prata 925', 'Brinco folheado a ouro 18k com detalhes em zircônia', 25.90, 49.90, 10, 5, 5.5, 'Prata 925', 'Boho', NOW(), NOW()),
('ANL002', 'Anel Lua e Estrela', 'Anel em prata 925 com detalhes em zircônia', 35.50, 79.90, 5, 3, 8.2, 'Prata 925', 'Boho', NOW(), NOW()),
('COL003', 'Colar Coração', 'Colar em prata com pingente de coração', 45.75, 99.90, 8, 2, 12.0, 'Prata 925', 'Clássico', NOW(), NOW()),
('PUL004', 'Pulseira Infinity', 'Pulseira em prata com detalhe infinito', 30.25, 69.90, 15, 5, 10.5, 'Prata 925', 'Minimalista', NOW(), NOW()),
('BRC005', 'Brinco Argola Pequeno', 'Brinco de argola em prata 925', 18.90, 39.90, 20, 10, 4.2, 'Prata 925', 'Clássico', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    purchase_price = VALUES(purchase_price),
    sale_price = VALUES(sale_price),
    current_stock = VALUES(current_stock),
    min_stock = VALUES(min_stock),
    weight = VALUES(weight),
    material = VALUES(material),
    style = VALUES(style),
    updated_at = NOW();

-- Inserir histórico de preços para os produtos
INSERT IGNORE INTO product_price_history (product_id, price, created_at)
SELECT p.id, p.sale_price, p.created_at
FROM products p
LEFT JOIN product_price_history pph ON p.id = pph.product_id
WHERE pph.id IS NULL;

-- Inserir algumas transações de estoque de exemplo
INSERT INTO inventory_transactions (
    product_id, 
    transaction_type, 
    quantity, 
    unit_price, 
    total_amount, 
    notes,
    created_by,
    created_at
)
SELECT 
    id, 
    'in', 
    current_stock, 
    purchase_price, 
    (current_stock * purchase_price) as total,
    'Estoque inicial',
    (SELECT id FROM users WHERE email = 'admin@gonzagas.com' LIMIT 1),
    NOW()
FROM products
WHERE id NOT IN (SELECT DISTINCT product_id FROM inventory_transactions);

-- Atualizar o estoque atual com base nas transações
UPDATE products p
SET current_stock = (
    SELECT 
        SUM(CASE 
            WHEN it.transaction_type = 'in' THEN it.quantity 
            ELSE -it.quantity 
        END) as stock
    FROM inventory_transactions it
    WHERE it.product_id = p.id
    GROUP BY it.product_id
)
WHERE EXISTS (
    SELECT 1 
    FROM inventory_transactions it 
    WHERE it.product_id = p.id
);
