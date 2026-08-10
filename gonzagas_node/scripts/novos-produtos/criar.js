#!/usr/bin/env node
/**
 * Cria os produtos de um lote a partir do JSON e das fotografias originais.
 *
 * O que faz, por peça:
 *   1. escolhe a próxima referência livre da série (PAN0091, PAN0092, …),
 *      lendo o que já existe na base — não assume nada;
 *   2. copia a fotografia para public/media/products/<REF>.jpg e gera as
 *      variantes full/medium/small/thumb em jpg e webp, como o uploader do
 *      admin faz;
 *   3. insere o produto e as suas imagens.
 *
 * As peças entram **sem preço** (`sale_price = 0`, que as views mostram como
 * "Preço sob consulta") e com **stock 1**, que é o que as torna visíveis na
 * loja enquanto `hide_out_of_stock` estiver ligado. O carrinho recusa-as por
 * não terem preço — ver modules/ecommerce/cart/services/cartService.js.
 *
 *   node scripts/novos-produtos/criar.js --simular            # não escreve nada
 *   node scripts/novos-produtos/criar.js
 *   node scripts/novos-produtos/criar.js --lote=lote-2026-08-pulseiras.json
 *
 * O JSON do lote pode trazer a sua própria pasta de origem no campo `origem`;
 * sem ele fica a do lote de Julho.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { processProductImage } = require('../../utils/productImageProcessor');

const ROOT = path.join(__dirname, '..', '..');
const DESTINO = path.join(ROOT, 'public', 'media', 'products');
const ficheiroLote = (process.argv.find(a => a.startsWith('--lote=')) || '--lote=lote-2026-07.json').slice(7);
const lote = JSON.parse(fs.readFileSync(path.join(__dirname, ficheiroLote), 'utf8'));
const ORIGEM = lote.origem || '/home/ggedeveloper/gartnshine-3/temporario-novo-stocks/2026-07-FIA-Stocks';
const SIMULAR = process.argv.includes('--simular');

function env() {
  const t = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  return Object.fromEntries(t.split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }));
}

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  const cfg = env();
  const db = await mysql.createConnection({
    host: cfg.DB_HOST, port: cfg.DB_PORT, user: cfg.DB_USER,
    password: cfg.DB_PASSWORD, database: cfg.DB_NAME,
  });

  const [familias] = await db.query('SELECT id, slug, name FROM product_families');
  const porSlug = Object.fromEntries(familias.map(f => [f.slug, f]));

  // Próximo número livre por série, a partir do que já existe.
  const [refs] = await db.query("SELECT reference FROM products WHERE reference REGEXP '^[A-Z]+[0-9]+$'");
  const usados = new Set(refs.map(r => r.reference));
  const proximo = {};
  for (const r of usados) {
    const m = r.match(/^([A-Z]+)(\d+)$/);
    if (!m) continue;
    proximo[m[1]] = Math.max(proximo[m[1]] || 0, parseInt(m[2], 10));
  }
  const reservar = (prefixo) => {
    let n = (proximo[prefixo] || 0) + 1;
    let ref;
    do { ref = prefixo + String(n).padStart(4, '0'); n++; } while (usados.has(ref));
    proximo[prefixo] = n - 1;
    usados.add(ref);
    return ref;
  };

  const [slugsExistentes] = await db.query('SELECT slug FROM products WHERE slug IS NOT NULL');
  const slugs = new Set(slugsExistentes.map(s => s.slug));

  let criados = 0;
  const resumo = [];
  for (const peca of lote.pecas) {
    const fam = porSlug[peca.familia];
    if (!fam) { console.warn(`! família desconhecida: ${peca.familia} (${peca.nome})`); continue; }

    const ref = reservar(peca.prefixo);
    let slug = slugify(peca.nome);
    if (slugs.has(slug)) slug = `${slug}-${ref.toLowerCase()}`;
    slugs.add(slug);

    // Fotografias: a primeira é a principal.
    const ficheiros = [];
    for (let i = 0; i < peca.fotos.length; i++) {
      const origem = path.join(ORIGEM, `IMG_${peca.fotos[i]}.jpg`);
      if (!fs.existsSync(origem)) { console.warn(`! falta ${origem}`); continue; }
      const nome = i === 0 ? `${ref}.jpg` : `${ref}-alt${i}.jpg`;
      if (!SIMULAR) {
        fs.copyFileSync(origem, path.join(DESTINO, nome));
        await processProductImage(nome);
      }
      ficheiros.push(nome);
    }
    if (!ficheiros.length) { console.warn(`! ${peca.nome} sem fotografia — ignorado`); continue; }

    if (!SIMULAR) {
      const [r] = await db.query(
        `INSERT INTO products
           (reference, family_id, name, slug, description, purchase_price, sale_price,
            base_price, current_stock, min_stock, active, is_active, is_catalog_visible, material)
         VALUES (?, ?, ?, ?, ?, 0, 0, 0, 1, 0, 1, 1, 1, ?)`,
        [ref, fam.id, peca.nome, slug, peca.descricao, peca.material || null]
      );
      for (let i = 0; i < ficheiros.length; i++) {
        await db.query(
          'INSERT INTO product_images (product_id, image_filename, is_primary, sort_order) VALUES (?, ?, ?, ?)',
          [r.insertId, ficheiros[i], i === 0 ? 1 : 0, i]
        );
      }
    }
    criados++;
    resumo.push({ ref, nome: peca.nome, familia: fam.name, fotos: ficheiros });
    console.log(`${ref}  ${peca.nome}`);
  }

  const saida = ficheiroLote.replace(/^lote-/, 'criados-');
  fs.writeFileSync(path.join(__dirname, saida), JSON.stringify(resumo, null, 1));
  console.log(`\n${criados} peças ${SIMULAR ? '(simulação — nada foi escrito)' : 'criadas'}`);
  await db.end();
})().catch(e => { console.error(e); process.exit(1); });
