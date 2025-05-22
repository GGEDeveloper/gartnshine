-- =============================================
-- Tabela de fornecedores
-- =============================================

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `company_name` VARCHAR(200) NULL,
  `tax_number` VARCHAR(50) NULL COMMENT 'NIF',
  `tax_office` VARCHAR(100) NULL,
  `contact_person` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `mobile` VARCHAR(20) NULL,
  `website` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) DEFAULT 'Portugal',
  `payment_terms` TEXT NULL,
  `payment_method` VARCHAR(100) NULL,
  `bank_name` VARCHAR(100) NULL,
  `bank_iban` VARCHAR(50) NULL,
  `bank_swift` VARCHAR(20) NULL,
  `notes` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `lead_time_days` INT NULL COMMENT 'Prazo de entrega em dias',
  `minimum_order_value` DECIMAL(10,2) NULL,
  `discount_rate` DECIMAL(5,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  UNIQUE KEY `uk_suppliers_code` (`code`),
  UNIQUE KEY `uk_suppliers_tax_number` (`tax_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de relacionamento entre produtos e fornecedores
-- =============================================

CREATE TABLE IF NOT EXISTS `product_suppliers` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `supplier_id` CHAR(36) NOT NULL,
  `supplier_reference` VARCHAR(100) NULL,
  `supplier_price` DECIMAL(10,2) NULL,
  `currency` VARCHAR(3) DEFAULT 'EUR',
  `min_order_quantity` INT DEFAULT 1,
  `delivery_days` INT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_product_supplier` (`product_id`, `supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de ordens de compra
-- =============================================

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` CHAR(36) PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL,
  `supplier_id` CHAR(36) NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery_date` DATE NULL,
  `delivery_date` DATE NULL,
  `status` ENUM('draft', 'pending', 'confirmed', 'in_transit', 'partially_received', 'received', 'cancelled') DEFAULT 'draft',
  `payment_terms` VARCHAR(100) NULL,
  `payment_status` ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  `payment_method` VARCHAR(50) NULL,
  `payment_due_date` DATE NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) DEFAULT 'EUR',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_purchase_orders_order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de itens das ordens de compra
-- =============================================

CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` CHAR(36) PRIMARY KEY,
  `purchase_order_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `quantity` DECIMAL(10,3) NOT NULL,
  `quantity_received` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de recibos de mercadoria
-- =============================================

CREATE TABLE IF NOT EXISTS `goods_receipts` (
  `id` CHAR(36) PRIMARY KEY,
  `receipt_number` VARCHAR(50) NOT NULL,
  `purchase_order_id` CHAR(36) NOT NULL,
  `receipt_date` DATE NOT NULL,
  `received_by` CHAR(36) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`received_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_goods_receipts_receipt_number` (`receipt_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de itens dos recibos de mercadoria
-- =============================================

CREATE TABLE IF NOT EXISTS `goods_receipt_items` (
  `id` CHAR(36) PRIMARY KEY,
  `goods_receipt_id` CHAR(36) NOT NULL,
  `purchase_order_item_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `quantity_received` DECIMAL(10,3) NOT NULL,
  `unit_cost` DECIMAL(10,2) NOT NULL,
  `batch_number` VARCHAR(100) NULL,
  `expiry_date` DATE NULL,
  `location_id` CHAR(36) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
