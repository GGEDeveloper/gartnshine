const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'geko_admin',
  password: 'gekopass',
  database: 'gonzagas_catalog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create pool connection
const pool = mysql.createPool(dbConfig);

// Initialize database tables
async function initializeTables() {
  try {
    // Create product_families table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_families (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reference VARCHAR(50) UNIQUE NOT NULL,
        family_id INT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        sale_price DECIMAL(10,2) NOT NULL,
        purchase_price DECIMAL(10,2) NOT NULL,
        current_stock INT DEFAULT 0,
        image_filename VARCHAR(255),
        style VARCHAR(100),
        material VARCHAR(100),
        weight VARCHAR(50),
        dimensions VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES product_families(id)
      )
    `);

    // Create inventory_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        transaction_type ENUM('purchase', 'sale', 'adjustment') NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Create product_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_filename VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    return false;
  }
}

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    await initializeTables();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeTables
}; 