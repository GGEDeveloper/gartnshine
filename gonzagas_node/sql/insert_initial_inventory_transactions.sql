-- Selecionar o banco de dados
USE gonzagas_db;

-- Inserir transações de inventário iniciais para produtos com estoque
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
    p.id,
    'in',
    p.current_stock,
    p.purchase_price,
    (p.current_stock * p.purchase_price) as total_amount,
    'Estoque inicial após importação',
    (SELECT id FROM users WHERE email = 'admin@gonzagas.com' LIMIT 1),
    NOW()
FROM 
    products p
WHERE 
    p.current_stock > 0
    AND NOT EXISTS (
        SELECT 1 
        FROM inventory_transactions it 
        WHERE it.product_id = p.id
    );

-- Atualizar o histórico de preços para os produtos
INSERT INTO product_price_history (product_id, price, created_at)
SELECT 
    p.id, 
    p.sale_price, 
    NOW()
FROM 
    products p
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM product_price_history pph 
        WHERE pph.product_id = p.id
    );

-- Atualizar o estoque atual com base nas transações
UPDATE products p
SET current_stock = COALESCE(
    (
        SELECT 
            SUM(CASE 
                WHEN it.transaction_type = 'in' THEN it.quantity 
                ELSE -it.quantity 
            END)
        FROM inventory_transactions it
        WHERE it.product_id = p.id
    ), 
    0
);
