#!/usr/bin/env node
/**
 * Ativa todos os produtos: is_active=1, is_catalog_visible=1
 * Uso: node scripts/activate-all-products.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');

async function main() {
  try {
    const [result] = await pool.execute(
      'UPDATE products SET is_active = 1, is_catalog_visible = 1'
    );
    console.log(`✅ Atualizados ${result.affectedRows} produtos: is_active=1, is_catalog_visible=1`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
