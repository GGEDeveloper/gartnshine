-- Usar o banco de dados
USE gonzagas_db;

-- Verificar e adicionar colunas ausentes na tabela products
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'reference';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN reference VARCHAR(50) UNIQUE AFTER id",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar outras colunas necessárias
SET @columnname = 'purchase_price';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER description",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna sale_price
SET @columnname = 'sale_price';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN sale_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER purchase_price",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna current_stock
SET @columnname = 'current_stock';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN current_stock INT DEFAULT 0 AFTER sale_price",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna min_stock
SET @columnname = 'min_stock';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN min_stock INT DEFAULT 5 AFTER current_stock",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna weight
SET @columnname = 'weight';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN weight DECIMAL(10, 2) DEFAULT 0.00 AFTER min_stock",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna active
SET @columnname = 'active';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ),
  "ALTER TABLE products ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER weight",
  'SELECT 1;'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Criar tabela de histórico de preços se não existir
CREATE TABLE IF NOT EXISTS product_price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de transações de inventário se não existir
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('in', 'out') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir um usuário administrador padrão (senha: admin123) se não existir
INSERT INTO users (name, email, password, role, created_at, updated_at) 
SELECT 'Administrador', 'admin@gonzagas.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gonzagas.com' LIMIT 1);

-- Atualizar a senha do administrador se já existir
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    role = 'admin', 
    updated_at = NOW()
WHERE email = 'admin@gonzagas.com';

-- Criar índices para melhorar o desempenho (versão compatível com MySQL mais antigo)
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @indexname = 'idx_products_reference';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM information_schema.statistics
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname)
  ),
  "CREATE INDEX idx_products_reference ON products(reference)",
  'SELECT 1;'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Índice para o nome do produto
SET @indexname = 'idx_products_name';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM information_schema.statistics
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname)
  ),
  "CREATE INDEX idx_products_name ON products(name)",
  'SELECT 1;'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Índices para a tabela inventory_transactions
SET @tablename = 'inventory_transactions';
SET @indexname = 'idx_inventory_transactions_product_id';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM information_schema.statistics
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname)
  ),
  "CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id)",
  'SELECT 1;'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_inventory_transactions_created_at';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM information_schema.statistics
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname)
  ),
  "CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at)",
  'SELECT 1;'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Índice para a tabela product_price_history
SET @tablename = 'product_price_history';
SET @indexname = 'idx_product_price_history_product_id';
SET @preparedStatement = (SELECT IF(
  NOT EXISTS(
    SELECT * FROM information_schema.statistics
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname)
  ),
  "CREATE INDEX idx_product_price_history_product_id ON product_price_history(product_id)",
  'SELECT 1;'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Inserir histórico de preços para produtos existentes que não têm histórico
INSERT INTO product_price_history (product_id, price, created_at)
SELECT id, sale_price, created_at 
FROM products p
WHERE NOT EXISTS (
    SELECT 1 
    FROM product_price_history pph 
    WHERE pph.product_id = p.id 
    LIMIT 1
);
