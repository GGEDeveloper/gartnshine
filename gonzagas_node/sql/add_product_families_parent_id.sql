-- Adiciona parent_id a product_families para hierarquia (cat > subcat > subsubcat...)
-- Executar se a coluna ainda não existir:
--   mysql -u USER -p DB < sql/add_product_families_parent_id.sql
-- MariaDB 10.5+: suporta IF NOT EXISTS

ALTER TABLE product_families ADD COLUMN IF NOT EXISTS parent_id INT NULL AFTER description;
ALTER TABLE product_families ADD INDEX idx_parent_id (parent_id);
