-- Migração para adicionar recursos de administração
-- Executar com: mysql -u username -p database_name < 001_add_admin_features.sql

USE gonzagas_db;

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar campos de auditoria nas tabelas existentes
-- Adicionar colunas na tabela products (com verificações manuais)
SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER id;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar updated_by
SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER created_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar deleted_at
SET @columnname = 'deleted_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL AFTER updated_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar chaves estrangeiras para products
ALTER TABLE products
ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Adicionar campos na tabela customers
SET @tablename = 'customers';

-- Adicionar created_by
SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER id;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar updated_by
SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER created_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar deleted_at
SET @columnname = 'deleted_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL AFTER updated_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar chaves estrangeiras para customers
ALTER TABLE customers
ADD CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_customers_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Adicionar campos na tabela suppliers
SET @tablename = 'suppliers';

-- Adicionar created_by
SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER id;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar updated_by
SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER created_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar deleted_at
SET @columnname = 'deleted_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL AFTER updated_by;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar chaves estrangeiras para suppliers
ALTER TABLE suppliers
ADD CONSTRAINT fk_suppliers_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_suppliers_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Criar usuário administrador padrão (senha: admin123)
-- IMPORTANTE: Alterar a senha após o primeiro login
INSERT IGNORE INTO admin_users 
  (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'Administrador', TRUE);

-- Criar índices para melhorar desempenho
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_updated_by ON products(updated_by);
CREATE INDEX idx_customers_created_by ON customers(created_by);
CREATE INDEX idx_customers_updated_by ON customers(updated_by);
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);
CREATE INDEX idx_suppliers_updated_by ON suppliers(updated_by);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Adicionar comentários para documentação
ALTER TABLE admin_users COMMENT 'Usuários com acesso à área administrativa';
ALTER TABLE activity_logs COMMENT 'Registro de atividades dos usuários administrativos';

-- Atualizar comentários das tabelas existentes
ALTER TABLE products COMMENT 'Produtos disponíveis para venda';
ALTER TABLE customers COMMENT 'Clientes da loja';
ALTER TABLE suppliers COMMENT 'Fornecedores de produtos';

-- Criar view para auditoria de produtos
CREATE OR REPLACE VIEW vw_product_audit AS
SELECT 
  p.id,
  p.reference,
  p.name,
  p.description,
  p.family_id,
  p.is_active,
  p.featured,
  p.sort_order,
  p.created_by,
  creator.username AS created_by_username,
  p.created_at,
  p.updated_by,
  updater.username AS updated_by_username,
  p.updated_at,
  p.deleted_at
FROM products p
LEFT JOIN admin_users creator ON p.created_by = creator.id
LEFT JOIN admin_users updater ON p.updated_by = updater.id;

-- Criar view para relatório de atividades
CREATE OR REPLACE VIEW vw_activity_report AS
SELECT 
  al.id,
  al.created_at,
  au.username,
  au.email,
  al.action,
  al.entity_type,
  al.entity_id,
  al.ip_address
FROM activity_logs al
LEFT JOIN admin_users au ON al.user_id = au.id
ORDER BY al.created_at DESC;

-- Adicionar permissões para o usuário da aplicação
GRANT SELECT, INSERT, UPDATE, DELETE ON gonzagas_db.* TO 'gonzagas_user'@'%';
FLUSH PRIVILEGES;
