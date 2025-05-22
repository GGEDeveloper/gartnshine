-- =============================================
-- Tabela de armazéns
-- =============================================

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) DEFAULT 'Portugal',
  `contact_person` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  UNIQUE KEY `uk_warehouses_code` (`code`),
  INDEX `idx_warehouses_name` (`name`),
  INDEX `idx_warehouses_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de localizações de estoque
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_locations` (
  `id` CHAR(36) PRIMARY KEY,
  `warehouse_id` CHAR(36) NOT NULL,
  `parent_id` CHAR(36) NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `barcode` VARCHAR(100) NULL,
  `location_type` ENUM('shelf', 'bin', 'rack', 'zone', 'room', 'other') NOT NULL,
  `is_pickable` BOOLEAN DEFAULT TRUE,
  `is_bulk_location` BOOLEAN DEFAULT FALSE,
  `is_return_location` BOOLEAN DEFAULT FALSE,
  `is_scrap_location` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `width` DECIMAL(10,2) NULL COMMENT 'Largura em cm',
  `height` DECIMAL(10,2) NULL COMMENT 'Altura em cm',
  `depth` DECIMAL(10,2) NULL COMMENT 'Profundidade em cm',
  `max_weight` DECIMAL(10,2) NULL COMMENT 'Peso máximo em kg',
  `posx` INT NULL COMMENT 'Posição X no layout do armazém',
  `posy` INT NULL COMMENT 'Posição Y no layout do armazém',
  `posz` INT NULL COMMENT 'Posição Z no layout do armazém',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_stock_locations_warehouse_code` (`warehouse_id`, `code`),
  INDEX `idx_stock_locations_warehouse` (`warehouse_id`),
  INDEX `idx_stock_locations_parent` (`parent_id`),
  INDEX `idx_stock_locations_location_type` (`location_type`),
  INDEX `idx_stock_locations_barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de lotes de estoque
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_lots` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `lot_number` VARCHAR(100) NOT NULL,
  `manufacture_date` DATE NULL,
  `expiry_date` DATE NULL,
  `reference` VARCHAR(100) NULL,
  `supplier_id` CHAR(36) NULL,
  `supplier_lot` VARCHAR(100) NULL,
  `customs_import_date` DATE NULL,
  `customs_import_document` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_stock_lots_product_lot` (`product_id`, `lot_number`),
  INDEX `idx_stock_lots_lot_number` (`lot_number`),
  INDEX `idx_stock_lots_expiry` (`expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de estoque por localização
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_quant` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `location_id` CHAR(36) NOT NULL,
  `lot_id` CHAR(36) NULL,
  `quantity` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `reserved_quantity` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `available_quantity` DECIMAL(10,3) GENERATED ALWAYS AS (GREATEST(0, `quantity` - `reserved_quantity`)) STORED,
  `in_date` TIMESTAMP NULL,
  `cost_price` DECIMAL(10,2) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `stock_locations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_stock_quant_product_location_lot` (`product_id`, `location_id`, IFNULL(`lot_id`, 'NULL')),
  INDEX `idx_stock_quant_product` (`product_id`),
  INDEX `idx_stock_quant_location` (`location_id`),
  INDEX `idx_stock_quant_lot` (`lot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de transações de estoque
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_moves` (
  `id` CHAR(36) PRIMARY KEY,
  `reference` VARCHAR(100) NULL,
  `product_id` CHAR(36) NOT NULL,
  `lot_id` CHAR(36) NULL,
  `move_type` ENUM('supplier_in', 'customer_out', 'inventory_adjustment', 'inventory_transfer', 'production_in', 'production_out', 'scrap', 'return_in', 'return_out') NOT NULL,
  `source_document_type` ENUM('purchase_order', 'customer_order', 'inventory_adjustment', 'inventory_transfer', 'production_order', 'return') NULL,
  `source_document_id` CHAR(36) NULL,
  `source_document_line_id` CHAR(36) NULL,
  
  -- Localização de origem
  `source_warehouse_id` CHAR(36) NULL,
  `source_location_id` CHAR(36) NULL,
  
  -- Localização de destino
  `dest_warehouse_id` CHAR(36) NULL,
  `dest_location_id` CHAR(36) NULL,
  
  -- Quantidades
  `quantity` DECIMAL(10,3) NOT NULL,
  `quantity_done` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `quantity_cancel` DECIMAL(10,3) NOT NULL DEFAULT 0,
  
  -- Preços e custos
  `unit_cost` DECIMAL(10,2) NULL,
  `total_cost` DECIMAL(10,2) NULL,
  
  -- Status
  `state` ENUM('draft', 'assigned', 'waiting', 'confirmed', 'done', 'cancel') DEFAULT 'draft',
  
  -- Datas
  `scheduled_date` DATE NULL,
  `date` DATETIME NULL,
  `date_done` DATETIME NULL,
  
  -- Informações adicionais
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  
  -- Relacionamentos
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`source_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`source_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`dest_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`dest_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  
  -- Índices
  INDEX `idx_stock_moves_product` (`product_id`),
  INDEX `idx_stock_moves_lot` (`lot_id`),
  INDEX `idx_stock_moves_reference` (`reference`),
  INDEX `idx_stock_moves_move_type` (`move_type`),
  INDEX `idx_stock_moves_state` (`state`),
  INDEX `idx_stock_moves_date` (`date`),
  INDEX `idx_stock_moves_source_doc` (`source_document_type`, `source_document_id`),
  INDEX `idx_stock_moves_source_loc` (`source_warehouse_id`, `source_location_id`),
  INDEX `idx_stock_moves_dest_loc` (`dest_warehouse_id`, `dest_location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de operações de estoque
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_operations` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `operation_type` ENUM('incoming', 'outgoing', 'internal', 'inventory') NOT NULL,
  `default_source_location_id` CHAR(36) NULL,
  `default_dest_location_id` CHAR(36) NULL,
  `show_operations` BOOLEAN DEFAULT TRUE,
  `show_reserved` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`default_source_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`default_dest_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_stock_operations_name` (`name`),
  INDEX `idx_stock_operations_type` (`operation_type`),
  INDEX `idx_stock_operations_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de regras de reabastecimento
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_replenishment_rules` (
  `id` CHAR(36) PRIMARY KEY,
  `product_id` CHAR(36) NOT NULL,
  `warehouse_id` CHAR(36) NULL,
  `location_id` CHAR(36) NULL,
  `route_id` CHAR(36) NULL,
  `supplier_id` CHAR(36) NULL,
  `product_min_qty` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `product_max_qty` DECIMAL(10,3) NULL,
  `qty_multiple` DECIMAL(10,3) DEFAULT 1,
  `lead_days` INT DEFAULT 0,
  `lead_type` ENUM('day', 'week', 'month') DEFAULT 'day',
  `is_active` BOOLEAN DEFAULT TRUE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_replenishment_rule_product_location` (`product_id`, `warehouse_id`, IFNULL(`location_id`, 'NULL')),
  INDEX `idx_replenishment_rule_product` (`product_id`),
  INDEX `idx_replenishment_rule_warehouse` (`warehouse_id`),
  INDEX `idx_replenishment_rule_location` (`location_id`),
  INDEX `idx_replenishment_rule_supplier` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de contagens de inventário
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_inventory` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `warehouse_id` CHAR(36) NULL,
  `location_id` CHAR(36) NULL,
  `category_id` CHAR(36) NULL,
  `product_family_id` CHAR(36) NULL,
  `filter` TEXT NULL,
  `state` ENUM('draft', 'in_progress', 'done', 'cancel') DEFAULT 'draft',
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `responsible_id` CHAR(36) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`product_family_id`) REFERENCES `product_families`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`responsible_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL,
  INDEX `idx_stock_inventory_name` (`name`),
  INDEX `idx_stock_inventory_state` (`state`),
  INDEX `idx_stock_inventory_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de linhas de contagem de inventário
-- =============================================

CREATE TABLE IF NOT EXISTS `stock_inventory_lines` (
  `id` CHAR(36) PRIMARY KEY,
  `inventory_id` CHAR(36) NOT NULL,
  `product_id` CHAR(36) NOT NULL,
  `location_id` CHAR(36) NOT NULL,
  `lot_id` CHAR(36) NULL,
  `theoretical_qty` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `product_qty` DECIMAL(10,3) NOT NULL DEFAULT 0,
  `difference_qty` DECIMAL(10,3) GENERATED ALWAYS AS (`product_qty` - `theoretical_qty`) STORED,
  `state` ENUM('draft', 'counted', 'validated') DEFAULT 'draft',
  `counted_by` CHAR(36) NULL,
  `counted_date` DATETIME NULL,
  `validated_by` CHAR(36) NULL,
  `validated_date` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  FOREIGN KEY (`inventory_id`) REFERENCES `stock_inventory`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `stock_locations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`counted_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`validated_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_inventory_line_product_location_lot` (`inventory_id`, `product_id`, `location_id`, IFNULL(`lot_id`, 'NULL')),
  INDEX `idx_inventory_lines_product` (`product_id`),
  INDEX `idx_inventory_lines_location` (`location_id`),
  INDEX `idx_inventory_lines_lot` (`lot_id`),
  INDEX `idx_inventory_lines_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
