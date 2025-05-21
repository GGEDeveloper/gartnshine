-- Create database if not exists
CREATE DATABASE IF NOT EXISTS gonzagas_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gonzagas_catalog;

-- Create product families table (categories)
CREATE TABLE IF NOT EXISTS product_families (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL COMMENT 'Short code for the family (e.g. PAN)',
    name VARCHAR(100) NOT NULL COMMENT 'Full name of the product family',
    description TEXT COMMENT 'Description of the product family',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(20) NOT NULL COMMENT 'Product reference code (e.g. PAN0001)',
    family_id INT NOT NULL COMMENT 'Family ID this product belongs to',
    name VARCHAR(255) COMMENT 'Product name',
    description TEXT COMMENT 'Product description',
    sale_price DECIMAL(10,2) NOT NULL COMMENT 'Selling price per unit',
    purchase_price DECIMAL(10,2) NOT NULL COMMENT 'Purchase price per unit',
    current_stock INT NOT NULL DEFAULT 0 COMMENT 'Current stock quantity',
    total_sold INT NOT NULL DEFAULT 0 COMMENT 'Total units sold',
    image_filename VARCHAR(255) COMMENT 'Primary image filename',
    style VARCHAR(50) COMMENT 'Style of the jewelry (e.g. Bali, Boho)',
    material VARCHAR(50) DEFAULT 'Sterling Silver' COMMENT 'Material of the jewelry',
    weight DECIMAL(8,2) COMMENT 'Weight in grams',
    dimensions VARCHAR(100) COMMENT 'Dimensions of the product',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether product is active in catalog',
    featured BOOLEAN DEFAULT FALSE COMMENT 'Whether product is featured in catalog',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES product_families(id) ON DELETE CASCADE,
    UNIQUE KEY (reference)
) ENGINE=InnoDB;

-- Create product images table (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL COMMENT 'Image filename',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Whether this is the primary product image',
    sort_order INT DEFAULT 0 COMMENT 'Order to display images',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create inventory transactions table (for stock management)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('purchase', 'sale', 'adjustment') NOT NULL,
    quantity INT NOT NULL COMMENT 'Positive for additions, negative for reductions',
    unit_price DECIMAL(10,2) COMMENT 'Price per unit for this transaction',
    total_amount DECIMAL(10,2) COMMENT 'Total amount for this transaction',
    notes TEXT COMMENT 'Transaction notes',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) COMMENT 'User who created this transaction',
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Create checkpoints table (for data backup/restore)
CREATE TABLE IF NOT EXISTS checkpoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checkpoint_name VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL COMMENT 'Path to the backup file',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) COMMENT 'User who created this checkpoint'
) ENGINE=InnoDB;

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    user_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (session_id)
) ENGINE=InnoDB;

-- Insert initial product families
INSERT INTO product_families (code, name, description) VALUES
('PAN', 'Pandora', 'Pandora style jewelry pieces'),
('BOH', 'Boho', 'Bohemian style jewelry pieces'),
('BAL', 'Bali', 'Bali inspired jewelry pieces'),
('SIL', 'Silver', 'Pure sterling silver pieces');

-- Create a default admin user
-- Note: This is a separate table as we might add more admin users in the future
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (username)
) ENGINE=InnoDB; 