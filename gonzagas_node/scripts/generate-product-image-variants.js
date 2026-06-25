#!/usr/bin/env node
/**
 * Backfill: gera as variantes otimizadas (full/medium/small/thumb, jpg+webp) para todas
 * as imagens de produto já existentes em product_images. Não altera os ficheiros originais.
 *
 * Uso:
 *   node scripts/generate-product-image-variants.js          (salta ficheiros que já têm todas as variantes)
 *   node scripts/generate-product-image-variants.js --force  (regenera mesmo que já existam)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');
const { processProductImage, VARIANTS } = require('../utils/productImageProcessor');

const FORCE = process.argv.includes('--force');
const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'media', 'products');

async function hasAllVariants(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  for (const v of VARIANTS) {
    try {
      await fs.access(path.join(PRODUCTS_DIR, `${base}-${v.suffix}.jpg`));
    } catch {
      return false;
    }
  }
  return true;
}

async function main() {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT image_filename FROM product_images WHERE image_filename IS NOT NULL'
    );
    const filenames = rows.map(r => r.image_filename).filter(Boolean);
    console.log(`Encontradas ${filenames.length} imagens distintas em product_images.`);

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const filename of filenames) {
      if (!FORCE && await hasAllVariants(filename)) {
        skipped++;
        continue;
      }
      const result = await processProductImage(filename);
      if (result.ok) {
        processed++;
        console.log(`✅ ${filename} (${result.generated.length} ficheiros gerados)`);
      } else {
        failed++;
        console.warn(`⚠️  ${filename}: ${result.errors.join('; ')}`);
      }
    }

    console.log('---');
    console.log(`Concluído. Processadas: ${processed} | Já existentes (saltadas): ${skipped} | Falhas: ${failed}`);
    if (failed > 0) process.exitCode = 1;
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    // config/database.js mantém um setInterval de health-check vivo para
    // sempre — sem isto o script "termina" mas o processo Node nunca sai
    // (fica a tentar usar o pool já fechado a cada intervalo, indefinidamente).
    process.exit(process.exitCode || 0);
  }
}

main();
