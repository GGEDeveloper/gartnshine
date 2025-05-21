const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

async function runQuery(query) {
  try {
    const [result] = await pool.query(query);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function executeSqlFile(filePath) {
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    const queries = sql.split(';').filter(q => q.trim() !== '');
    
    for (const query of queries) {
      try {
        await runQuery(query);
      } catch (error) {
        console.error('Error executing query:', query.substring(0, 100) + '...');
        throw error;
      }
    }
    
    console.log(`Successfully executed SQL file: ${filePath}`);
  } catch (error) {
    console.error(`Error reading/executing SQL file ${filePath}:`, error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Executar o schema SQL
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    await executeSqlFile(schemaPath);
    
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  } finally {
    // Fechar a conexão com o pool
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  }
}

// Executar a inicialização
initializeDatabase();
