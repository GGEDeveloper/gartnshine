-- =====================================================
-- MIGRATION 013: Recuperação de password dos clientes
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: O checkout passa a exigir conta. Até agora as contas eram
-- opcionais e toda a gente entrou por Google, por isso nunca fez falta um
-- "esqueci-me da password" — não existe nenhum no módulo. A partir do momento
-- em que a conta é obrigatória para comprar, quem perde a password fica sem
-- forma de comprar. Estas duas colunas guardam o token de recuperação (só o
-- hash, nunca o token em claro) e a sua validade.
--
-- `password_reset_token` guarda um SHA-256 do token enviado por email. Mesmo
-- com acesso de leitura à base de dados, não é possível reconstruir o link.
-- NULL em ambas = nenhum pedido de recuperação pendente (o estado normal).
--
-- Risk Level: VERY LOW — duas colunas novas (nullable) em `customers`; não
-- toca em passwords existentes, contas Google, encomendas, produtos nem stock.
-- Idempotente: pode correr as vezes que forem precisas.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'customers'
  AND COLUMN_NAME = 'password_reset_token'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE customers ADD COLUMN password_reset_token VARCHAR(64) NULL COMMENT ''SHA-256 do token de recuperação de password (NULL = sem pedido pendente)''',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'customers'
  AND COLUMN_NAME = 'password_reset_expires'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE customers ADD COLUMN password_reset_expires DATETIME NULL COMMENT ''Validade do token de recuperação'' AFTER password_reset_token',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para a procura pelo token ser directa em vez de varrer a tabela
SET @idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'customers'
  AND INDEX_NAME = 'idx_customers_reset_token'
);

SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_customers_reset_token ON customers (password_reset_token)',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 013 completed: customers.password_reset_token + _expires ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- DROP INDEX `idx_customers_reset_token` ON `customers`;
-- ALTER TABLE `customers` DROP COLUMN `password_reset_expires`;
-- ALTER TABLE `customers` DROP COLUMN `password_reset_token`;
