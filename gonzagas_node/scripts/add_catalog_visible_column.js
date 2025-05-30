require('dotenv').config();
const mysql = require('mysql2/promise');

async function addCatalogVisibleColumn() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');
    
    // Check if column already exists
    const [rows] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'is_catalog_visible';
    `, [process.env.DB_NAME]);

    if (rows.length === 0) {
      // Add the column if it doesn't exist
      console.log('Adding is_catalog_visible column to products table...');
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN is_catalog_visible BOOLEAN DEFAULT TRUE
        COMMENT 'Whether the product is visible in the public catalog';
      `);
      console.log('Successfully added is_catalog_visible column');
    } else {
      console.log('is_catalog_visible column already exists');
    }
    
    connection.release();
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addCatalogVisibleColumn();
