require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createCookieTable() {
  try {
    const sqlFile = path.join(__dirname, '../sql/create_cookie_consents_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Tabela cookie_consents criada com sucesso!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️  Tabela cookie_consents já existe.');
      process.exit(0);
    } else {
      console.error('❌ Erro ao criar tabela:', error.message);
      process.exit(1);
    }
  }
}

createCookieTable();
