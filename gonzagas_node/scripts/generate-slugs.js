#!/usr/bin/env node
/**
 * Generate slugs for all products and product_families that don't have one.
 * Uses the generateSlug helper from utils/seo-helpers.js.
 * Handles duplicates by appending the record ID.
 *
 * Usage:  node scripts/generate-slugs.js
 * Env:    Reads DB config from ../.env
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool } = require('../config/database');
const { generateSlug } = require('../utils/seo-helpers');

async function populateSlugs(table, nameCol) {
  const [rows] = await pool.execute(
    `SELECT id, \`${nameCol}\` as name FROM \`${table}\` WHERE slug IS NULL OR slug = ''`
  );

  if (rows.length === 0) {
    console.log(`  ${table}: all rows already have slugs`);
    return;
  }

  const usedSlugs = new Set();
  // Pre-load existing slugs to avoid collisions
  const [existing] = await pool.execute(`SELECT slug FROM \`${table}\` WHERE slug IS NOT NULL AND slug != ''`);
  existing.forEach(r => usedSlugs.add(r.slug));

  let updated = 0;
  for (const row of rows) {
    let slug = generateSlug(row.name);
    if (!slug) slug = `item-${row.id}`;

    // Deduplicate
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${row.id}`;
    }
    usedSlugs.add(slug);

    await pool.execute(
      `UPDATE \`${table}\` SET slug = ? WHERE id = ?`,
      [slug, row.id]
    );
    updated++;
  }

  console.log(`  ${table}: ${updated} slugs generated`);
}

async function main() {
  console.log('Generating slugs...');
  await populateSlugs('products', 'name');
  await populateSlugs('product_families', 'name');
  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error generating slugs:', err);
  process.exit(1);
});
