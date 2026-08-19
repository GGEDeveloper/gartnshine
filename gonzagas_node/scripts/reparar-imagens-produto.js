#!/usr/bin/env node
/**
 * Repõe as linhas de `product_images` que faltam no dev local.
 *
 *   node scripts/reparar-imagens-produto.js            (só mostra)
 *   node scripts/reparar-imagens-produto.js --aplicar  (escreve)
 *
 * O problema que resolve: há fichas cujo ficheiro de imagem já está no disco
 * — foi trazido de produção — mas que não têm linha nenhuma na tabela, e por
 * isso aparecem sem fotografia. A `PPUP0002` é uma delas.
 *
 * De onde vem a informação: da própria ficha pública em produção. E há uma
 * armadilha que custou uma volta — **a página mostra mais imagens do que as da
 * peça**. No fim há uma secção «Peças semelhantes» com as miniaturas de outros
 * produtos; contá-las dava cinco imagens a um anel que só tem uma. Por isso o
 * HTML é cortado em `related-products-section` e só se lê o que vem antes.
 *
 * Nunca apaga nem altera linhas existentes: só insere as que faltam, e só se o
 * ficheiro correspondente já estiver no disco.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/database.js');

const SITE = 'https://artnshine.pt';
const MEDIA = path.join(__dirname, '..', 'public', 'media', 'products');
const CORTE = 'related-products-section';
const RE = /media\/products\/([A-Za-z0-9_-]+?)(?:-(?:full|medium|small|thumb))?\.(?:jpg|jpeg|png|webp)/g;
const SIMULTANEAS = 5;

const pega = (url) => new Promise((res) => {
  https.get(url, { timeout: 25000 }, (r) => {
    if (r.statusCode !== 200) { r.resume(); return res(null); }
    let s = ''; r.setEncoding('utf8');
    r.on('data', (d) => { s += d; });
    r.on('end', () => res(s));
  }).on('error', () => res(null)).on('timeout', function () { this.destroy(); res(null); });
});

/** As imagens da peça, sem as das «peças semelhantes». */
function daFicha(html) {
  const fim = html.indexOf(CORTE);
  const corpo = fim > 0 ? html.slice(0, fim) : html;
  const vistos = new Set();
  const ordem = [];
  for (const m of corpo.matchAll(RE)) {
    if (!vistos.has(m[1])) { vistos.add(m[1]); ordem.push(m[1]); }
  }
  return ordem;
}

/** O ficheiro que existe no disco para um nome base, se existir. */
function ficheiroDe(base) {
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    if (fs.existsSync(path.join(MEDIA, base + ext))) return base + ext;
  }
  // Algumas referências só têm as variantes derivadas.
  for (const v of ['-full', '-medium']) {
    for (const ext of ['.jpg', '.webp']) {
      if (fs.existsSync(path.join(MEDIA, base + v + ext))) return base + ext;
    }
  }
  return null;
}

(async () => {
  const aplicar = process.argv.includes('--aplicar');
  console.log(aplicar ? 'A APLICAR\n' : 'Só a mostrar (sem --aplicar não se escreve nada)\n');

  const [produtos] = await pool.query(
    'SELECT p.id, p.reference, p.slug, COUNT(pi.id) n FROM products p ' +
    'LEFT JOIN product_images pi ON pi.product_id = p.id ' +
    'WHERE p.slug IS NOT NULL GROUP BY p.id');
  const [linhas] = await pool.query('SELECT product_id, image_filename FROM product_images');
  const jaTem = new Map();
  for (const l of linhas) {
    const base = path.basename(l.image_filename).replace(/-(full|medium|small|thumb)?\.[a-z]+$/i, '').replace(/\.[a-z]+$/i, '');
    if (!jaTem.has(l.product_id)) jaTem.set(l.product_id, new Set());
    jaTem.get(l.product_id).add(base);
  }

  const paraInserir = [];
  const semFicheiro = [];
  let lidas = 0, falhas = 0;
  const fila = produtos.slice();
  async function trabalhador() {
    while (fila.length) {
      const p = fila.shift();
      const html = await pega(`${SITE}/loja/produto/${p.slug}`);
      if (!html) { falhas++; continue; }
      const bases = daFicha(html);
      const tem = jaTem.get(p.id) || new Set();
      let ordem = p.n;
      for (const b of bases) {
        if (tem.has(b)) continue;
        const f = ficheiroDe(b);
        if (!f) { semFicheiro.push(`${p.reference} ${b}`); continue; }
        paraInserir.push({ product_id: p.id, image_filename: f, is_primary: p.n === 0 && ordem === 0 ? 1 : 0, sort_order: ordem++, ref: p.reference });
      }
      if (++lidas % 80 === 0) process.stdout.write(`  ${lidas}/${produtos.length}\n`);
    }
  }
  await Promise.all(Array.from({ length: SIMULTANEAS }, trabalhador));

  console.log(`\n${lidas} fichas lidas em produção, ${falhas} falhas`);
  const produtosTocados = new Set(paraInserir.map((r) => r.ref));
  console.log(`${paraInserir.length} linhas em falta, em ${produtosTocados.size} produtos`);
  if (semFicheiro.length) console.log(`${semFicheiro.length} sem ficheiro no disco (ficam de fora): ${semFicheiro.slice(0, 5).join(', ')}`);
  for (const r of paraInserir.slice(0, 12)) console.log(`  ${r.ref.padEnd(10)} ${r.image_filename}${r.is_primary ? '  (primária)' : ''}`);
  if (paraInserir.length > 12) console.log(`  … e mais ${paraInserir.length - 12}`);

  if (aplicar) {
    for (const r of paraInserir) {
      await pool.query('INSERT INTO product_images SET ?', {
        product_id: r.product_id, image_filename: r.image_filename,
        is_primary: r.is_primary, sort_order: r.sort_order,
      });
    }
    console.log(`\n${paraInserir.length} linhas inseridas.`);
  } else {
    console.log('\nNada foi escrito.');
  }
  await pool.end();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
