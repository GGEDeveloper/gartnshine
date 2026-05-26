#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../../../config/database');

async function run() {
  const migrationsDir = path.join(__dirname, '../sql/migrations');
  const files = ['006_ecommerce_unified.sql', '007_ecommerce_alter_existing.sql'];

  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    if (!fs.existsSync(sqlPath)) continue;
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql
      .split(';')
      .map((chunk) =>
        chunk
          .split('\n')
          .filter((line) => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      )
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('  OK:', statement.slice(0, 70).replace(/\s+/g, ' '));
      } catch (err) {
        if (
          err.code === 'ER_TABLE_EXISTS_ERROR' ||
          err.code === 'ER_DUP_ENTRY' ||
          err.code === 'ER_DUP_FIELDNAME'
        ) {
          continue;
        }
        console.error('Migration error:', err.message);
        console.error('Statement:', statement.slice(0, 120));
        throw err;
      }
    }
  }
  console.log('E-commerce migration completed.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
