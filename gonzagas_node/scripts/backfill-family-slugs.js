/**
 * Preenche `product_families.slug` nas categorias que ainda o têm a NULL.
 *
 * Porquê: a coluna existe desde a migração dos slugs, mas `create`/`update`
 * nunca a escreviam. Resultado: todas as categorias ficaram sem slug e o site
 * servia URLs numéricos (`/collection/16`), maus para SEO.
 *
 * É seguro em produção:
 *   - só faz UPDATE de linhas onde `slug IS NULL` ou vazio;
 *   - não toca em produtos, encomendas, clientes ou stock;
 *   - é idempotente — correr outra vez não altera nada;
 *   - com `--dry-run` mostra o que faria sem escrever.
 *
 * Uso:
 *   node scripts/backfill-family-slugs.js --dry-run
 *   node scripts/backfill-family-slugs.js
 */

const { pool } = require('../config/database');
const ProductFamily = require('../models/ProductFamily');

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const [familias] = await pool.query(
    `SELECT id, name, slug FROM product_families
      WHERE slug IS NULL OR slug = ''
      ORDER BY parent_id IS NOT NULL, id`
  );

  if (familias.length === 0) {
    console.log('Nada a fazer: todas as categorias já têm slug.');
    return;
  }

  console.log(`${familias.length} categoria(s) sem slug${dryRun ? ' (dry-run)' : ''}:\n`);

  let escritos = 0;
  for (const f of familias) {
    // buildSlug consulta a BD para garantir unicidade, por isso tem de ser
    // sequencial: dois nomes que colidam precisam de ver o slug do anterior.
    // eslint-disable-next-line no-await-in-loop
    const slug = await ProductFamily.buildSlug(f.name, f.id);
    console.log(`  ${String(f.id).padStart(3)}  ${f.name.padEnd(32)} → ${slug}`);

    if (!dryRun) {
      // eslint-disable-next-line no-await-in-loop
      const [r] = await pool.query(
        `UPDATE product_families SET slug = ?
          WHERE id = ? AND (slug IS NULL OR slug = '')`,
        [slug, f.id]
      );
      escritos += r.affectedRows;
    }
  }

  console.log(
    dryRun
      ? `\nDry-run: nenhuma alteração escrita. ${familias.length} ficariam preenchidas.`
      : `\nSlugs preenchidos: ${escritos} de ${familias.length}.`
  );

  if (!dryRun) {
    const [[{ semSlug }]] = await pool.query(
      `SELECT COUNT(*) AS semSlug FROM product_families
        WHERE slug IS NULL OR slug = ''`
    );
    if (semSlug > 0) {
      throw new Error(`Ainda ficaram ${semSlug} categorias sem slug.`);
    }
    console.log('Verificado: nenhuma categoria ficou sem slug.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falhou:', err.message);
    process.exit(1);
  });
