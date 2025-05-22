-- =============================================
-- Tabela de clientes
-- =============================================

CREATE TABLE IF NOT EXISTS `customers` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `mobile` VARCHAR(20) NULL,
  `tax_number` VARCHAR(20) NULL COMMENT 'NIF',
  `tax_office` VARCHAR(100) NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `birth_date` DATE NULL,
  `company_name` VARCHAR(200) NULL,
  `company_tax_number` VARCHAR(20) NULL,
  
  -- Endereço de faturação
  `billing_address` TEXT NULL,
  `billing_city` VARCHAR(100) NULL,
  `billing_state` VARCHAR(100) NULL,
  `billing_postal_code` VARCHAR(20) NULL,
  `billing_country` VARCHAR(100) DEFAULT 'Portugal',
  
  -- Endereço de entrega
  `shipping_same_as_billing` BOOLEAN DEFAULT TRUE,
  `shipping_address` TEXT NULL,
  `shipping_city` VARCHAR(100) NULL,
  `shipping_state` VARCHAR(100) NULL,
  `shipping_postal_code` VARCHAR(20) NULL,
  `shipping_country` VARCHAR(100) NULL,
  
  -- Dados de autenticação
  `password_hash` VARCHAR(255) NULL,
  `password_reset_token` VARCHAR(100) NULL,
  `password_reset_expires` TIMESTAMP NULL,
  `last_login` TIMESTAMP NULL,
  `last_ip` VARCHAR(45) NULL,
  
  -- Status e preferências
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verification_token` VARCHAR(100) NULL,
  `verification_expires` TIMESTAMP NULL,
  `marketing_consent` BOOLEAN DEFAULT FALSE,
  `newsletter_subscription` BOOLEAN DEFAULT FALSE,
  `preferred_language` CHAR(2) DEFAULT 'pt',
  `preferred_currency` CHAR(3) DEFAULT 'EUR',
  
  -- Metadados
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Índices
  UNIQUE KEY `uk_customers_email` (`email`),
  UNIQUE KEY `uk_customers_tax_number` (`tax_number`),
  INDEX `idx_customers_name` (`last_name`, `first_name`),
  INDEX `idx_customers_company` (`company_name`),
  INDEX `idx_customers_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de pedidos de clientes
-- =============================================

CREATE TABLE IF NOT EXISTS `customer_orders` (
  `id` CHAR(36) PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL,
  `customer_id` CHAR(36) NOT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'draft',
  `payment_status` ENUM('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'voided', 'failed') DEFAULT 'pending',
  `payment_method` VARCHAR(50) NULL,
  `shipping_method` VARCHAR(50) NULL,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) DEFAULT 'EUR',
  
  -- Endereços
  `billing_address` TEXT NULL,
  `billing_city` VARCHAR(100) NULL,
  `billing_state` VARCHAR(100) NULL,
  `billing_postal_code` VARCHAR(20) NULL,
  `billing_country` VARCHAR(100) NULL,
  
  `shipping_address` TEXT NULL,
  `shipping_city` VARCHAR(100) NULL,
  `shipping_state` VARCHAR(100) NULL,
  `shipping_postal_code` VARCHAR(20) NULL,
  `shipping_country` VARCHAR(100) NULL,
  
  -- Informações adicionais
  `customer_notes` TEXT NULL,
  `internal_notes` TEXT NULL,
  `tags` VARCHAR(255) NULL,
  
  -- Metadados
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_customer_orders_order_number` (`order_number`),
  INDEX `idx_customer_orders_customer` (`customer_id`),
  INDEX `idx_customer_orders_status` (`status`),
  INDEX `idx_customer_orders_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de itens dos pedidos de clientes
-- =============================================

CREATE TABLE IF NOT EXISTS `customer_order_items` (
  `id` CHAR(36) PRIMARY KEY,
  `order_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `quantity` DECIMAL(10,3) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 23.00,
  `tax_amount` DECIMAL(10,2) NOT NULL,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `notes` TEXT NULL,
  
  -- Metadados
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`order_id`) REFERENCES `customer_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de faturas
-- =============================================

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` CHAR(36) PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL,
  `order_id` CHAR(36) NULL,
  `customer_id` CHAR(36) NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  `payment_terms` VARCHAR(100) NULL,
  `payment_method` VARCHAR(50) NULL,
  `payment_date` DATE NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `amount_paid` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `balance_due` DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  `currency` VARCHAR(3) DEFAULT 'EUR',
  `notes` TEXT NULL,
  `footer_text` TEXT NULL,
  
  -- Metadados
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`order_id`) REFERENCES `customer_orders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_invoices_invoice_number` (`invoice_number`),
  INDEX `idx_invoices_customer` (`customer_id`),
  INDEX `idx_invoices_order` (`order_id`),
  INDEX `idx_invoices_status` (`status`),
  INDEX `idx_invoices_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de itens de fatura
-- =============================================

CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` CHAR(36) PRIMARY KEY,
  `invoice_id` CHAR(36) NOT NULL,
  `order_item_id` CHAR(36) NULL,
  `product_id` CHAR(36) NULL,
  `description` TEXT NOT NULL,
  `quantity` DECIMAL(10,3) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 23.00,
  `tax_amount` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  
  -- Metadados
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_item_id`) REFERENCES `customer_order_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX `idx_invoice_items_invoice` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de pagamentos
-- =============================================

CREATE TABLE IF NOT EXISTS `payments` (
  `id` CHAR(36) PRIMARY KEY,
  `payment_number` VARCHAR(50) NOT NULL,
  `customer_id` CHAR(36) NOT NULL,
  `invoice_id` CHAR(36) NULL,
  `order_id` CHAR(36) NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(100) NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'EUR',
  `exchange_rate` DECIMAL(10,4) DEFAULT 1.0000,
  `notes` TEXT NULL,
  
  -- Metadados
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`order_id`) REFERENCES `customer_orders`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_payments_payment_number` (`payment_number`),
  INDEX `idx_payments_customer` (`customer_id`),
  INDEX `idx_payments_invoice` (`invoice_id`),
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_date` (`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
