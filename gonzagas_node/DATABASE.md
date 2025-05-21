# Estrutura do Banco de Dados - Gonzaga's Art & Shine

Este documento descreve a estrutura do banco de dados do sistema Gonzaga's Art & Shine.

## Tabelas Principais

### 1. `product_families`
Armazena as famílias de produtos (categorias).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| code | VARCHAR(50) | Código único da família |
| name | VARCHAR(100) | Nome da família |
| description | TEXT | Descrição da família |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### 2. `products`
Armazena os produtos da loja.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| reference | VARCHAR(50) | Referência única do produto |
| family_id | INT | Chave estrangeira para product_families |
| name | VARCHAR(200) | Nome do produto |
| description | TEXT | Descrição detalhada |
| sale_price | DECIMAL(10,2) | Preço de venda |
| purchase_price | DECIMAL(10,2) | Preço de custo |
| current_stock | INT | Quantidade em estoque |
| style | VARCHAR(100) | Estilo do produto |
| material | VARCHAR(100) | Material principal |
| weight | VARCHAR(50) | Peso do produto |
| dimensions | VARCHAR(100) | Dimensões do produto |
| is_active | TINYINT(1) | Se o produto está ativo |
| featured | TINYINT(1) | Se o produto é destaque |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### 3. `product_images`
Armazena as imagens dos produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| product_id | INT | Chave estrangeira para products |
| image_filename | VARCHAR(255) | Nome do arquivo da imagem |
| is_primary | TINYINT(1) | Se é a imagem principal |
| sort_order | INT | Ordem de exibição |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### 4. `inventory_transactions`
Registra as transações de estoque.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| product_id | INT | Chave estrangeira para products |
| transaction_type | ENUM | Tipo de transação (purchase, sale, adjustment) |
| quantity | INT | Quantidade movimentada |
| unit_price | DECIMAL(10,2) | Preço unitário |
| total_amount | DECIMAL(10,2) | Valor total |
| notes | TEXT | Observações |
| created_by | VARCHAR(100) | Usuário que realizou a transação |
| created_at | TIMESTAMP | Data da transação |

### 5. `checkpoints`
Armazena os pontos de verificação (backups) do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| checkpoint_name | VARCHAR(255) | Nome do checkpoint |
| description | TEXT | Descrição |
| file_path | VARCHAR(512) | Caminho do arquivo de backup |
| created_by | VARCHAR(100) | Usuário que criou o checkpoint |
| created_at | TIMESTAMP | Data de criação |

### 6. `users`
Armazena os usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| username | VARCHAR(50) | Nome de usuário único |
| password | VARCHAR(255) | Senha criptografada |
| name | VARCHAR(100) | Nome completo |
| email | VARCHAR(100) | E-mail do usuário |
| is_admin | TINYINT(1) | Se é administrador |
| last_login | TIMESTAMP | Último login |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## Scripts de Banco de Dados

### Inicialização do Banco
Para criar todas as tabelas necessárias:
```bash
npm run db:init
```

### Popular com Dados de Exemplo
Para popular o banco com dados iniciais:
```bash
npm run db:seed
```

### Reiniciar o Banco
Para recriar todas as tabelas e popular com dados iniciais:
```bash
npm run db:reset
```

## Credenciais Padrão

- **Usuário administrador:**
  - Login: admin
  - Senha: admin123

## Relacionamentos

- `products.family_id` → `product_families.id`
- `product_images.product_id` → `products.id`
- `inventory_transactions.product_id` → `products.id`

## Índices

- `product_families.code` - Índice único para códigos de família
- `products.reference` - Índice único para referências de produtos
- `products.family_id` - Índice para busca por família
- `product_images.product_id` - Índice para busca de imagens por produto
- `inventory_transactions.product_id` - Índice para busca de transações por produto
- `inventory_transactions.transaction_type` - Índice para filtro por tipo de transação
- `users.username` - Índice único para nomes de usuário
- `users.email` - Índice único para e-mails
