# Estrutura do Banco de Dados

## Visão Geral

O banco de dados foi projetado para ser simples, eficiente e atender às necessidades de gestão de catálogo e estoque. Utiliza o sistema de gerenciamento de banco de dados MySQL/MariaDB.

## Tabelas Principais

### 1. Tabela: `products`

Armazena as informações dos produtos.

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código de referência (ex: PAN0001)',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL COMMENT 'Preço de venda',
  cost_price DECIMAL(10,2) COMMENT 'Preço de custo',
  stock_quantity INT DEFAULT 0 COMMENT 'Quantidade em estoque',
  category VARCHAR(50) COMMENT 'Categoria do produto',
  image_path VARCHAR(255) COMMENT 'Caminho da imagem principal',
  status ENUM('active', 'inactive', 'repair') DEFAULT 'active',
  notes TEXT COMMENT 'Observações adicionais',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reference (reference),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Tabela: `stock_movements`

Registra todas as movimentações de estoque.

```sql
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('purchase', 'sale', 'adjustment') NOT NULL,
  quantity INT NOT NULL COMMENT 'Quantidade movimentada (positiva para entradas, negativa para saídas)',
  unit_price DECIMAL(10,2) NOT NULL COMMENT 'Preço unitário no momento da movimentação',
  total_value DECIMAL(10,2) NOT NULL COMMENT 'Valor total da movimentação',
  reference VARCHAR(100) COMMENT 'Referência externa (nota fiscal, etc)',
  notes TEXT COMMENT 'Observações adicionais',
  created_by INT COMMENT 'ID do usuário que registrou',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Tabela: `sales`

Registra as vendas realizadas.

```sql
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_name VARCHAR(255) COMMENT 'Nome do cliente (opcional)',
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) COMMENT 'Forma de pagamento',
  notes TEXT,
  created_by INT COMMENT 'ID do usuário que registrou',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sale_date (sale_date),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Tabela: `sale_items`

Itens que compõem uma venda.

```sql
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_sale (sale_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Relacionamentos

- Um produto pode ter várias movimentações de estoque (`products` 1:N `stock_movements`)
- Uma venda pode ter vários itens (`sales` 1:N `sale_items`)
- Cada item de venda está vinculado a um produto (`sale_items` N:1 `products`)

## Índices e Otimizações

- Índices em campos de busca frequente
- Chaves estrangeiras para integridade referencial
- Timestamps para auditoria
- Tipos de dados apropriados para cada campo

## Próximos Passos

1. Implementar as migrações do banco de dados
2. Desenvolver os modelos de dados na aplicação
3. Criar os repositórios para acesso aos dados

---
[Voltar ao Ínicio](00_plano_principal.md)
