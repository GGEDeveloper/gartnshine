#!/usr/bin/env node
/**
 * Audit products and families for missing meta descriptions.
 * Reports which items have no description that can be used as a meta description.
 *
 * Usage:  node scripts/audit-meta-descriptions.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool } = require('../config/database');

async function audit() {
  console.log('=== Meta Description Audit ===\n');

  // Products without description
  const [emptyProducts] = await pool.execute(`
    SELECT id, name, reference 
    FROM products 
    WHERE is_active = 1 AND (description IS NULL OR TRIM(description) = '')
    ORDER BY featured DESC, sale_price DESC
  `);

  const [totalProducts] = await pool.execute(
    `SELECT COUNT(*) as total FROM products WHERE is_active = 1`
  );

  console.log(`Products: ${totalProducts[0].total - emptyProducts.length}/${totalProducts[0].total} have descriptions`);
  if (emptyProducts.length > 0) {
    console.log(`\nProducts missing description (${emptyProducts.length}):`);
    emptyProducts.forEach(p => console.log(`  ID ${p.id} — ${p.reference} — ${p.name}`));
  }

  // Families without description
  const [emptyFamilies] = await pool.execute(`
    SELECT id, name, code 
    FROM product_families 
    WHERE description IS NULL OR TRIM(description) = ''
    ORDER BY name
  `);

  const [totalFamilies] = await pool.execute(
    `SELECT COUNT(*) as total FROM product_families`
  );

  console.log(`\nFamilies: ${totalFamilies[0].total - emptyFamilies.length}/${totalFamilies[0].total} have descriptions`);
  if (emptyFamilies.length > 0) {
    console.log(`\nFamilies missing description (${emptyFamilies.length}):`);
    emptyFamilies.forEach(f => console.log(`  ID ${f.id} — ${f.code} — ${f.name}`));
  }

  console.log('\n=== End Audit ===');
  process.exit(0);
}

audit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
