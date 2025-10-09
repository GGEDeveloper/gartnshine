-- ==========================================
-- GONZAGA ART & SHINE - DATABASE COMPLETE
-- Dark Nature E-commerce + Admin System
-- ==========================================

-- Check if tables exist before creating
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- Orders table (enhanced)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    customer_stone_preference ENUM('onix', 'olho-de-tigre', 'ametista', 'turquesa') NULL,
    
    subtotal_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('mbway', 'paypal', 'transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    
    shipping_method ENUM('standard', 'express') DEFAULT 'standard',
    tracking_number VARCHAR(100),
    
    notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_status (status),
    INDEX idx_order_date (created_at),
    INDEX idx_customer_email (customer_email),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table (enhanced)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product snapshot (for historical data)
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(255),
    stone_type VARCHAR(50),
    product_sku VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    INDEX idx_order_items_stone (stone_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers table (new)
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    preferred_stone ENUM('onix', 'olho-de-tigre', 'ametista', 'turquesa') NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    
    first_order_date TIMESTAMP NULL,
    last_order_date TIMESTAMP NULL,
    
    marketing_consent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customer_email (email),
    INDEX idx_customer_stone (preferred_stone),
    INDEX idx_customer_spent (total_spent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product analytics table (new)
CREATE TABLE IF NOT EXISTS product_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    
    date DATE NOT NULL,
    views INT DEFAULT 0,
    cart_adds INT DEFAULT 0,
    purchases INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_product_date (product_id, date),
    INDEX idx_analytics_date (date),
    INDEX idx_analytics_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity log table (new)
CREATE TABLE IF NOT EXISTS activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_type ENUM('customer', 'admin') NOT NULL,
    user_id INT,
    user_identifier VARCHAR(255), -- email or username
    
    action VARCHAR(100) NOT NULL, -- 'order_created', 'product_viewed', etc.
    entity_type VARCHAR(50), -- 'order', 'product', 'customer'
    entity_id INT,
    
    description TEXT,
    metadata JSON, -- Additional data
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_activity_user (user_type, user_id),
    INDEX idx_activity_action (action),
    INDEX idx_activity_date (created_at),
    INDEX idx_activity_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart sessions table (enhanced)
CREATE TABLE IF NOT EXISTS cart_sessions (
    id VARCHAR(255) PRIMARY KEY, -- session ID
    customer_email VARCHAR(255),
    
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_cart_customer (customer_email),
    INDEX idx_cart_product (product_id),
    INDEX idx_cart_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table (check structure and handle existing)
-- Note: site_settings may already exist with different structure
-- We'll create ecommerce_settings to avoid conflicts

CREATE TABLE IF NOT EXISTS ecommerce_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings (with IGNORE to prevent duplicates)
INSERT IGNORE INTO ecommerce_settings (setting_key, setting_value, setting_type, description, category) VALUES
('site_name', 'Gonzaga Art & Shine', 'string', 'Nome do site', 'general'),
('free_shipping_threshold', '75.00', 'number', 'Valor mínimo para portes grátis', 'shipping'),
('standard_shipping_cost', '5.99', 'number', 'Custo portes standard', 'shipping'),
('express_shipping_cost', '12.99', 'number', 'Custo portes express', 'shipping'),
('tax_rate', '23.00', 'number', 'Taxa IVA (%)', 'tax'),
('order_notification_email', 'admin@gonzagas.pt', 'string', 'Email notificações admin', 'notifications'),
('maintenance_mode', 'false', 'boolean', 'Modo manutenção', 'general');

-- Admin users table (enhance existing table - table already exists)
-- Add missing columns if they don't exist

-- Add role column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'admin_users' AND column_name = 'role');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE admin_users ADD COLUMN role ENUM(\'master\', \'admin\', \'manager\', \'viewer\') DEFAULT \'admin\' AFTER full_name',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add permissions column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'admin_users' AND column_name = 'permissions');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE admin_users ADD COLUMN permissions JSON AFTER role',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add login_count column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = 'admin_users' AND column_name = 'login_count');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE admin_users ADD COLUMN login_count INT DEFAULT 0 AFTER last_login',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing admin user with new password (covil) and role
-- Hash for 'covil': $2b$12$Wdai.cHrDOv2ZlDCldgrJuuB2UFa4MieOKFcSDbmd6njeGcOId7dK
UPDATE admin_users 
SET password_hash = '$2b$12$Wdai.cHrDOv2ZlDCldgrJuuB2UFa4MieOKFcSDbmd6njeGcOId7dK',
    role = 'master',
    permissions = '{"all": true}'
WHERE username = 'gonzaga';

-- Note: Triggers for customer statistics will be created via separate script if needed
-- MariaDB triggers via Node.js require different handling

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

