const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('../utils/logger');

// Instância do Sequelize
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: config.database.dialectOptions,
    define: config.database.define,
    pool: config.database.pool,
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  }
);

// Testar a conexão com o banco de dados
async function testConnection() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port || 3306
    });
    
    await connection.ping();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    logger.error('Não foi possível conectar ao banco de dados:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Inicializa o pool de conexões com o banco de dados
 * @returns {Promise<Object>} Instância do pool de conexões
 */
async function createConnectionPool() {
  const dbConfig = {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: config.db.waitForConnections,
    connectionLimit: config.db.connectionLimit,
    queueLimit: config.db.queueLimit,
    timezone: config.db.timezone,
    dateStrings: config.db.dateStrings,
    multipleStatements: config.db.multipleStatements,
    charset: config.db.charset,
    namedPlaceholders: true,
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectTimeout: 10000, // 10 segundos
    acquireTimeout: 10000, // 10 segundos
    timeout: 60000, // 1 minuto
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 segundos
    typeCast: function (field, next) {
      // Converter TINY(1) para booleano
      if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1';
      }
      // Converter campos de data para string ISO
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        return field.string();
      }
      // Converter campos JSON para objeto JavaScript
      if (field.type === 'JSON') {
        try {
          return JSON.parse(field.string());
        } catch (e) {
          return field.string();
        }
      }
      return next();
    },
  };

  // Cria o pool de conexões
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  // Configura manipuladores de eventos para o pool
  pool.on('acquire', (connection) => {
    logger.info(`Conexão ${connection.threadId} adquirida`);
  });

  pool.on('release', (connection) => {
    logger.info(`Conexão ${connection.threadId} liberada`);
  });

  pool.on('enqueue', () => {
    console.log('Aguardando vaga de conexão disponível...');
  });

  return pool;
}

/**
 * Obtém uma conexão do pool
 * @returns {Promise<object>} Conexão com o banco de dados
 */
async function getConnection() {
  if (!pool) {
    await createConnectionPool();
  }
  return pool.getConnection();
}

/**
 * Executa uma consulta SQL com parâmetros
 * @param {string} sql - Consulta SQL
 * @param {Array|Object} [params] - Parâmetros para a consulta
 * @returns {Promise<Array>} Resultado da consulta
 */
async function query(sql, params = []) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Executa uma consulta SQL e retorna apenas a primeira linha
 * @param {string} sql - Consulta SQL
 * @param {Array|Object} [params] - Parâmetros para a consulta
 * @returns {Promise<Object|null>} Primeira linha do resultado ou null
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/**
 * Executa uma consulta SQL e retorna apenas um valor
 * @param {string} sql - Consulta SQL
 * @param {Array|Object} [params] - Parâmetros para a consulta
 * @returns {Promise<*>} Valor da primeira coluna da primeira linha
 */
async function queryValue(sql, params = []) {
  const row = await queryOne(sql, params);
  return row ? Object.values(row)[0] : null;
}

/**
 * Executa uma consulta SQL de inserção e retorna o ID inserido
 * @param {string} sql - Consulta SQL de inserção
 * @param {Array|Object} [params] - Parâmetros para a consulta
 * @returns {Promise<number>} ID do registro inserido
 */
async function insert(sql, params = []) {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(sql, params);
    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * Inicializa o banco de dados
 * @returns {Promise<void>}
 */
async function initialize() {
  try {
    await createConnectionPool();
    
    // Testa a conexão
    await testConnection();
    
    // Executa migrações, se necessário
    await runMigrations();
    
    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

/**
 * Executa as migrações pendentes
 * @returns {Promise<void>}
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  
  try {
    // Verifica se o diretório de migrações existe
    await fs.access(migrationsDir);
    
    // Obtém a lista de migrações já executadas
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Obtém a lista de migrações já executadas
    const executedMigrations = await query('SELECT name FROM migrations');
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));
    
    // Lê o diretório de migrações
    const migrationFiles = (await fs.readdir(migrationsDir))
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Executa as migrações pendentes
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Executando migração: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        // Executa a migração em uma transação
        const connection = await getConnection();
        try {
          await connection.beginTransaction();
          await connection.query(migrationSQL);
          await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
          await connection.commit();
          
          console.log(`✅ Migração ${file} executada com sucesso`);
        } catch (error) {
          await connection.rollback();
          console.error(`❌ Erro ao executar a migração ${file}:`, error);
          throw error;
        } finally {
          connection.release();
        }
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Nenhuma migração a ser executada');
    } else {
      throw error;
    }
  }
}

// Initialize database tables
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    
    await connection.query(`USE \`${dbConfig.database}\``);
    
    // Enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop tables in correct order to avoid foreign key constraint errors
    await connection.query('DROP TABLE IF EXISTS activity_logs');
    await connection.query('DROP TABLE IF EXISTS admin_users');
    await connection.query('DROP TABLE IF EXISTS inventory_movements');
    await connection.query('DROP TABLE IF EXISTS inventory_transactions');
    await connection.query('DROP TABLE IF EXISTS product_sales');
    await connection.query('DROP TABLE IF EXISTS product_purchases');
    await connection.query('DROP TABLE IF EXISTS product_pricing');
    await connection.query('DROP TABLE IF EXISTS product_price_history');
    await connection.query('DROP TABLE IF EXISTS product_suppliers');
    await connection.query('DROP TABLE IF EXISTS product_images');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS customers');
    await connection.query('DROP TABLE IF EXISTS suppliers');
    await connection.query('DROP TABLE IF EXISTS product_families');
    await connection.query('DROP TABLE IF EXISTS migrations');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Create migrations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_migration (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create admin_users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id CHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        avatar VARCHAR(255),
        role ENUM('super_admin', 'admin', 'manager', 'editor', 'viewer') NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        last_ip VARCHAR(45),
        password_changed_at TIMESTAMP NULL,
        password_reset_token VARCHAR(100) NULL,
        password_reset_expires TIMESTAMP NULL,
        two_factor_secret VARCHAR(255) NULL,
        two_factor_recovery_codes TEXT NULL,
        preferences JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by CHAR(36) NULL,
        updated_by CHAR(36) NULL,
        deleted_by CHAR(36) NULL,
        INDEX idx_admin_users_email (email),
        INDEX idx_admin_users_username (username),
        INDEX idx_admin_users_role (role),
        INDEX idx_admin_users_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create activity_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        log_name VARCHAR(255) NULL,
        description TEXT NOT NULL,
        subject_type VARCHAR(255) NULL,
        subject_id BIGINT UNSIGNED NULL,
        causer_type VARCHAR(255) NULL,
        causer_id BIGINT UNSIGNED NULL,
        properties JSON NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_activity_logs_log_name (log_name),
        INDEX idx_activity_logs_subject (subject_type, subject_id),
        INDEX idx_activity_logs_causer (causer_type, causer_id),
        INDEX idx_activity_logs_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create product_families table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_families (
        id CHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        image_url VARCHAR(255) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        meta_title VARCHAR(100) NULL,
        meta_description VARCHAR(255) NULL,
        meta_keywords VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by CHAR(36) NULL,
        updated_by CHAR(36) NULL,
        deleted_by CHAR(36) NULL,
        UNIQUE KEY uk_product_families_code (code),
        INDEX idx_product_families_name (name),
        INDEX idx_product_families_is_active (is_active),
        INDEX idx_product_families_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create product_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by CHAR(36) NULL,
        updated_by CHAR(36) NULL,
        deleted_by CHAR(36) NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_images_product_id (product_id),
        INDEX idx_product_images_is_primary (is_primary),
        INDEX idx_product_images_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        reference VARCHAR(50) NOT NULL,
        barcode VARCHAR(50) NULL,
        family_id CHAR(36) NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        weight DECIMAL(10,3) DEFAULT 0,
        weight_unit ENUM('g', 'kg') DEFAULT 'g',
        dimensions VARCHAR(50) NULL COMMENT 'LxAxP em mm',
        style VARCHAR(100) NULL,
        material VARCHAR(100) NULL,
        notes TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        min_stock_level INT DEFAULT 0,
        max_stock_level INT DEFAULT 0,
        location VARCHAR(50) NULL COMMENT 'Localização no armazém',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by CHAR(36) NULL,
        updated_by CHAR(36) NULL,
        deleted_by CHAR(36) NULL,
        FOREIGN KEY (family_id) REFERENCES product_families(id) ON DELETE SET NULL,
        INDEX idx_products_reference (reference),
        INDEX idx_products_name (name),
        INDEX idx_products_is_active (is_active),
        INDEX idx_products_min_stock_level (min_stock_level),
        INDEX idx_products_max_stock_level (max_stock_level)
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create product_pricing table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        pvp_price DECIMAL(10,2) NOT NULL COMMENT 'Preço de venda ao público',
        wholesale_price DECIMAL(10,2) COMMENT 'Preço de atacado',
        special_price DECIMAL(10,2) COMMENT 'Preço promocional',
        special_price_start DATE,
        special_price_end DATE,
        cost_price DECIMAL(10,2) COMMENT 'Custo médio',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create product_purchases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        supplier_id INT,
        purchase_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        purchase_date DATE NOT NULL,
        batch_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create product_sales table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        customer_id INT,
        sale_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create inventory_movements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        movement_type ENUM('purchase', 'sale', 'adjustment', 'return', 'loss') NOT NULL,
        quantity DECIMAL(10,3) NOT NULL COMMENT 'Pode ser fracionado para itens que usam casas decimais',
        reference_id INT COMMENT 'ID da transação relacionada',
        reference_type VARCHAR(50) COMMENT 'Tipo de transação relacionada',
        notes TEXT,
        created_by INT COMMENT 'ID do usuário que realizou o movimento',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  } finally {
    if (connection) await connection.release();
  }
}

// Exporta as funções principais
module.exports = {
  // Pool de conexões
  pool: {
    getConnection,
    query,
    queryOne,
    queryValue,
    insert
  },
  
  // Funções principais
  initialize,
  testConnection,
  
  // Funções auxiliares
  getConnection,
  query,
  queryOne,
  queryValue,
  insert,
  runMigrations,
  
  // Compatibilidade com código existente
  initializeDatabase,
  testConnection: testConnection
};