# Estrutura do Banco de Dados

Este diretório contém os scripts de migração do banco de dados, organizados em módulos funcionais para facilitar a manutenção e evolução do esquema.

## Estrutura de Diretórios

```text
database/
├── migrations/
│   ├── core/               # Tabelas principais do sistema
│   │   └── 001_create_admin_users.sql
│   │
│   ├── inventory/         # Módulo de inventário e estoque
│   │   ├── 001_create_products.sql
│   │   └── 002_create_inventory.sql
│   │
│   ├── purchasing/        # Módulo de compras e fornecedores
│   │   └── 001_create_suppliers.sql
│   │
│   └── sales/             # Módulo de vendas e clientes
│       └── 001_create_customers.sql
│
└── README.md              # Esta documentação
```

## Módulos

### Core

Tabelas fundamentais do sistema:

- `admin_users`: Usuários administradores do sistema
- `activity_logs`: Registro de atividades do sistema

### Inventory

Gestão de produtos e estoque:

- `product_families`: Categorias de produtos
- `products`: Cadastro de produtos
- `product_images`: Imagens dos produtos
- `product_price_history`: Histórico de preços
- `warehouses`: Armazéns
- `stock_locations`: Localizações de estoque (prateleiras, corredores, etc.)
- `stock_lots`: Lotes de produtos
- `stock_quant`: Quantidades em estoque por localização
- `stock_moves`: Movimentações de estoque
- `stock_operations`: Operações de estoque
- `stock_replenishment_rules`: Regras de reabastecimento
- `stock_inventory`: Contagens de inventário

### Purchasing

Gestão de compras e fornecedores:

- `suppliers`: Cadastro de fornecedores
- `product_suppliers`: Relacionamento entre produtos e fornecedores
- `purchase_orders`: Ordens de compra
- `purchase_order_items`: Itens das ordens de compra
- `goods_receipts`: Recebimento de mercadorias
- `goods_receipt_items`: Itens recebidos

### Sales

Gestão de vendas e clientes:

- `customers`: Cadastro de clientes
- `customer_orders`: Pedidos de clientes
- `customer_order_items`: Itens dos pedidos
- `invoices`: Faturas
- `invoice_items`: Itens das faturas
- `payments`: Pagamentos

## Convenções

### Nomes de Tabelas

- Usar plural em inglês (ex: `products`, `customers`)
- Usar snake_case
- Prefixo para tabelas relacionadas (ex: `product_` para tabelas relacionadas a produtos)

### Colunas Comuns

Todas as tabelas devem conter:

- `id`: Identificador único (UUID)
- `created_at`: Data de criação
- `updated_at`: Data de atualização
- `deleted_at`: Data de remoção (soft delete)
- `created_by`: ID do usuário que criou
- `updated_by`: ID do último usuário que atualizou
- `deleted_by`: ID do usuário que removeu

### Chaves Estrangeiras

- Nome no formato `fk_[tabela_atual]_[tabela_referenciada]`
- Exemplo: `fk_products_product_families`

### Índices

- Índices para campos frequentemente consultados
- Índices compostos para consultas com múltiplas condições
- Índices únicos para campos que devem ser únicos

## Executando as Migrações

1. Certifique-se de que o banco de dados está configurado no arquivo `.env`
2. Instale as dependências: `npm install`
3. Execute as migrações: `npm run migrate`

## Sistema de Migrações

O sistema de migrações permite gerenciar as alterações no esquema do banco de dados de forma controlada e reversível.

### Estrutura das Migrações

Cada arquivo de migração deve seguir o padrão `[NÚMERO]_[NOME_DESCRITIVO].sql` e conter instruções SQL para aplicar e reverter a migração.

Exemplo de estrutura de migração:

```sql
-- +migrate Up
-- Aqui vão as instruções SQL para aplicar a migração
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- +migrate Down
-- Aqui vão as instruções SQL para reverter a migração
DROP TABLE IF EXISTS products;
```

### Comandos Disponíveis

```bash
# Executar todas as migrações pendentes
node scripts/run-migrations.js

# Executar migrações de um módulo específico
node scripts/run-migrations.js --module=inventory

# Modo de simulação (não aplica alterações)
node scripts/run-migrations.js --dry-run

# Continuar em caso de erros
node scripts/run-migrations.js --force

# Saída detalhada
node scripts/run-migrations.js --verbose
```

### Opções da Linha de Comando

| Opção           | Atalho | Descrição                                       |
|----------------|--------|-----------------------------------------------|
| --module=MOD   | -m     | Executa apenas as migrações do módulo especificado |
| --dry-run      | -d     | Executa em modo de simulação                    |
| --force        | -f     | Continua a execução mesmo em caso de erros      |
| --verbose      | -v     | Exibe informações detalhadas de depuração       |
| --help         | -h     | Exibe a mensagem de ajuda                      |

## Boas Práticas

1. **Versionamento**
   - Cada alteração no banco de dados deve ter sua própria migração
   - Use números sequenciais para nomear os arquivos de migração
   - Documente as alterações no cabeçalho do arquivo

2. **Transações**
   - Agrupe operações relacionadas em transações
   - Certifique-se de que cada migração pode ser revertida com segurança

3. **Desempenho**
   - Para grandes volumes de dados, considere usar operações em lotes
   - Adicione índices para melhorar o desempenho de consultas frequentes

4. **Segurança**
   - Nunca armazene senhas em texto puro
   - Use tipos de dados apropriados para cada coluna
   - Aplique restrições de integridade referencial

5. **Documentação**
   - Adicione comentários explicativos para tabelas e colunas
   - Documente restrições e regras de negócio
   - Mantenha um registro de alterações (CHANGELOG.md)

6. **Testes**
   - Teste as migrações em um ambiente de desenvolvimento antes de aplicar em produção
   - Verifique se as migrações podem ser revertidas com segurança
   - Considere criar um ambiente de staging idêntico à produção para testes

## Solução de Problemas

### Erros Comuns

1. **Migração falha**
   - Verifique os logs para mensagens de erro detalhadas
   - Certifique-se de que todas as dependências foram criadas
   - Use `--verbose` para obter mais informações de depuração

2. **Conflitos de Bloqueio**
   - Verifique se não há outras conexões ativas no banco de dados
   - Considere executar migrações fora do horário de pico

3. **Problemas de Permissão**
   - Verifique se o usuário do banco de dados tem permissões suficientes
   - Consulte a documentação do MySQL para configurações de permissão

### Recuperação de Falhas

1. **Backup Antes de Migrar**

   ```bash
   mysqldump -u [usuario] -p[senha] [banco] > backup_$(date +%Y%m%d).sql
   ```

2. **Revertendo uma Migração**
   - Implemente a lógica de reversão na seção `-- +migrate Down`
   - Teste a reversão em um ambiente de desenvolvimento primeiro

3. **Migrações Quebradas**
   - Corrija o script de migração
   - Use `--force` para continuar após corrigir o problema
   - Documente as alterações feitas

## Próximos Passos

1. Configurar migrações automatizadas no pipeline de CI/CD
2. Implementar sistema de rollback automatizado
3. Criar documentação mais detalhada para cada módulo
4. Desenvolver ferramentas adicionais para gerenciamento de banco de dados
5. Usar tipos de dados apropriados para cada coluna
6. Definir valores padrão quando apropriado
7. Adicionar restrições de chave estrangeira para manter a integridade referencial
8. Criar índices para campos frequentemente consultados
9. Documentar alterações significativas no esquema

## 7. Versionamento

1. **Estratégia de Numeração**
   - Use números sequenciais de 3 dígitos (001, 002, etc.)
   - Cada módulo tem sua própria sequência de migrações
   - Exemplo: `core/001_initial_schema.sql`, `inventory/001_initial_products.sql`

2. **Idempotência**
   - As migrações devem poder ser executadas várias vezes sem efeitos colaterais
   - Use `CREATE TABLE IF NOT EXISTS` em vez de apenas `CREATE TABLE`
   - Para alterações de esquema, use `ALTER TABLE` com verificações de existência

3. **Documentação**
   - Inclua um cabeçalho com descrição da migração
   - Documente alterações quebradiças ou que necessitem de atenção especial
   - Atualize o CHANGELOG.md com as alterações significativas

4. **Boas Práticas**
   - Mantenha as migrações atômicas (uma mudança lógica por migração)
   - Inclua rollback seguro na seção `-- +migrate Down`
   - Teste as migrações em um ambiente de desenvolvimento antes de aplicar em produção
