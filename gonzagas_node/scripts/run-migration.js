#!/usr/bin/env node
/**
 * Run add_slug_columns.sql migration safely.
 * Handles "Duplicate column" (1060) and "Duplicate key" (1061) — prints info and continues.
 *
 * Usage: node scripts/run-migration.js
 * Run from: gonzagas_node/ (or project root with path adjustment)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const SQL_PATH = path.join(__dirname, '..', 'sql', 'add_slug_columns.sql');

const LABELS = {
  1: 'products (coluna)',
  2: 'products (índice)',
  3: 'product_families (coluna)',
  4: 'product_families (índice)'
};

async function run() {
  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 0);

  let idx = 0;
  for (const stmt of statements) {
    idx++;
    const label = LABELS[idx] || `statement ${idx}`;
    try {
      await pool.execute(stmt);
      if (idx === 1 || idx === 3) {
        console.log(`✅ Coluna slug adicionada em ${idx === 1 ? 'products' : 'product_families'}`);
      } else {
        console.log(`✅ Índice único adicionado em ${idx === 2 ? 'products' : 'product_families'}`);
      }
    } catch (err) {
      if (err.errno === 1060 || (err.message && err.message.includes('Duplicate column'))) {
        console.log(`ℹ️  Coluna já existe — ignorado (${label})`);
      } else if (err.errno === 1061 || (err.message && err.message.includes('Duplicate key'))) {
        console.log(`ℹ️  Índice já existe — ignorado (${label})`);
      } else {
        console.error(`❌ Erro em ${label}:`, err.message);
        process.exit(1);
      }
    }
  }

  console.log('✅ Migração concluída.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
