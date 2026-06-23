require('dotenv').config();
const mysql = require('mysql2/promise');


const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: { charset: "utf8mb4" },
  }
);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3, // CRÍTICO: Reduzido para shared hosting
  acquireTimeout: 30000, // 30 segundos timeout
  timeout: 30000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: 'local',
  // Connection quality settings
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// Health check automático
const healthCheck = setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1 as health_check');
    connection.release();
    console.log('[DB Health Check] OK');
  } catch (error) {
    console.error('[DB Health Check] Failed:', error.message);
  }
}, 300000); // 5 minutos

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[DB] Closing database connections...');
  clearInterval(healthCheck);
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[DB] Closing database connections...');
  clearInterval(healthCheck);
  await pool.end();
  process.exit(0);
});

// Error handling melhorado
pool.on('connection', (connection) => {
  console.log('[DB] New connection established:', connection.threadId);
});

pool.on('error', (error) => {
  console.error('[DB] Pool error:', error.code);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('[DB] Reconnecting...');
  }
});

// Test connection function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] Connection test successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] Connection test failed:', error.message);
    return false;
  }
}

module.exports = sequelize;
module.exports.pool = pool;
module.exports.testConnection = testConnection;
