-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS gonzagas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usuário para a aplicação
CREATE USER IF NOT EXISTS 'gonzagas_user'@'localhost' IDENTIFIED BY 'gonzagas_pass';
GRANT ALL PRIVILEGES ON gonzagas_db.* TO 'gonzagas_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar o banco de dados
USE gonzagas_db;

-- Remover tabelas existentes (se houver) na ordem correta para evitar erros de chave estrangeira
DROP TABLE IF EXISTS product_price_history;
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_families;
DROP TABLE IF EXISTS users;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purchase_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    current_stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    weight DECIMAL(10, 2) DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de transações de inventário
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

-- Tabela de histórico de preços
CREATE TABLE IF NOT EXISTS product_price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir um usuário administrador padrão (senha: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@gonzagas.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE role='admin';

-- Inserir alguns produtos de exemplo
INSERT INTO products (reference, name, description, purchase_price, sale_price, current_stock, weight) VALUES 
('BRC001', 'Brinco de Prata', 'Brinco folheado a ouro 18k', 25.90, 49.90, 10, 5.5),
('ANL002', 'Anel Lua e Estrela', 'Anel em prata 925 com detalhes em zircônia', 35.50, 79.90, 5, 8.2),
('COL003', 'Colar Coração', 'Colar em prata com pingente de coração', 45.75, 99.90, 8, 12.0),
('PUL004', 'Pulseira Infinity', 'Pulseira em prata com detalhe infinito', 30.25, 69.90, 15, 10.5)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    purchase_price = VALUES(purchase_price),
    sale_price = VALUES(sale_price),
    current_stock = VALUES(current_stock),
    weight = VALUES(weight);

-- Inserir algumas transações de estoque de exemplo
INSERT INTO inventory_transactions (product_id, transaction_type, quantity, unit_price, total_amount, notes) VALUES
(1, 'in', 10, 25.90, 259.00, 'Estoque inicial'),
(2, 'in', 5, 35.50, 177.50, 'Estoque inicial'),
(3, 'in', 8, 45.75, 366.00, 'Estoque inicial'),
(4, 'in', 15, 30.25, 453.75, 'Estoque inicial'),
(1, 'out', 2, 49.90, 99.80, 'Venda para cliente');

-- Inserir histórico de preços
INSERT INTO product_price_history (product_id, price)
SELECT id, purchase_price FROM products;

-- Criar índices para melhorar o desempenho
CREATE INDEX idx_products_reference ON products(reference);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);
CREATE INDEX idx_product_price_history_product_id ON product_price_history(product_id);
