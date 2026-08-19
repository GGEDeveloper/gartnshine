#!/usr/bin/env node
/**
 * Traz para o dev local os dados que só existem em produção — **sem apagar o
 * que foi feito aqui**.
 *
 *   node scripts/sincronizar-producao.js <dump.sql.gz>            (só mostra)
 *   node scripts/sincronizar-producao.js <dump.sql.gz> --aplicar  (escreve)
 *
 * Porque não é um `mysql < dump.sql`: a base local não é uma cópia atrasada da
 * de produção, é outra coisa. Tem tabelas que produção não tem (galeria,
 * colecções, analytics), tem nomes e descrições de produto reescritos para SEO
 * que ainda não subiram, e tem as imagens de categoria. Importar o dump por
 * cima apagava tudo isso. O que aqui se faz é **complementar**:
 *
 *   products   — actualiza só os campos de facto comercial (stock, preços,
 *                peso, medidas, código de barras, impostos). Nome, descrição e
 *                slug **não se tocam** se já houver texto local: são trabalho
 *                de SEO feito aqui. Só se preenchem quando estão vazios.
 *   customers  — insere as que faltam. Nunca actualiza: são registos de facto.
 *   orders e as suas filhas — o mesmo. Uma encomenda não muda de ideias.
 *
 * O dump é carregado para dentro da própria `gonzagas_local`, em tabelas com o
 * prefixo `_prod_`, porque o utilizador de dev não tem direitos para criar
 * outra base. No fim são deitadas fora.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync, spawnSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/database.js');

const PREFIXO = '_prod_';

/* Só estas tabelas interessam. As de produção que não estão nesta lista
 * (media_files, site_settings, admin_users…) ficam de fora de propósito: ou
 * são de configuração e a local está à frente, ou não são dados de facto. */
const TABELAS = ['products', 'customers', 'orders', 'order_items', 'order_status_history', 'payments'];

/* Campos de produto que produção manda. São os que descrevem a peça enquanto
 * mercadoria — o que se vende, quanto custa, quanto pesa, quanto há. */
const CAMPOS_FACTO = [
  'barcode', 'purchase_price', 'sale_price', 'base_price', 'tax_rate', 'prices_include_tax',
  'current_stock', 'last_stock_update', 'min_stock', 'min_stock_level', 'max_stock_level',
  'weight', 'weight_unit', 'dimensions', 'location', 'material', 'color', 'style',
];

/* Campos que só se preenchem se o local estiver vazio. O nome e a descrição
 * foram reescritos aqui, peça a peça, a olhar para as fotografias; produção
 * ainda tem os antigos. Sobrepor era desfazer esse trabalho. */
const CAMPOS_SE_VAZIO = ['name', 'description', 'slug', 'notes'];

const cred = () => [
  '-h', process.env.DB_HOST, '-u', process.env.DB_USER,
  `-p${process.env.DB_PASSWORD}`, process.env.DB_NAME,
];

/** Carrega o dump para tabelas `_prod_*` dentro da base local. */
function carregar(dump) {
  const bruto = dump.endsWith('.gz')
    ? zlib.gunzipSync(fs.readFileSync(dump)).toString('utf8')
    : fs.readFileSync(dump, 'utf8');

  // Renomear só as tabelas que interessam; as outras nem chegam a ser criadas.
  const querosas = new Set(TABELAS);
  const linhas = bruto.split('\n');
  const saida = [];
  let aCopiar = false;
  for (const l of linhas) {
    const criar = l.match(/^CREATE TABLE `([a-z_]+)`/);
    const inserir = l.match(/^INSERT INTO `([a-z_]+)`/);
    const largar = l.match(/^DROP TABLE IF EXISTS `([a-z_]+)`/);
    const nome = (criar || inserir || largar)?.[1];

    if (largar) { aCopiar = querosas.has(nome); continue; }
    if (criar || inserir) {
      aCopiar = querosas.has(nome);
      if (!aCopiar) continue;
      saida.push(l.replace(/`([a-z_]+)`/, `\`${PREFIXO}$1\``));
      continue;
    }
    // As linhas de continuação de um CREATE TABLE seguem a última decisão.
    if (aCopiar || /^\/\*!|^SET |^--/.test(l)) saida.push(l);
    if (/^\) ENGINE/.test(l)) aCopiar = false;
  }

  // As chaves estrangeiras do dump apontam para os nomes originais; sem isto
  // o CREATE rebenta porque `products` local não é `_prod_products`.
  const sql = saida.join('\n').replace(/^\s*CONSTRAINT .*$/gm, '').replace(/,(\s*\n\s*\)\s*ENGINE)/g, '$1');

  const tmp = path.join('/tmp', `prod-snapshot-${process.pid}.sql`);
  fs.writeFileSync(tmp, `SET FOREIGN_KEY_CHECKS=0;\n${sql}\nSET FOREIGN_KEY_CHECKS=1;\n`);
  const r = spawnSync('mysql', cred(), { input: fs.readFileSync(tmp), encoding: 'utf8' });
  fs.unlinkSync(tmp);
  if (r.status !== 0) throw new Error(`falhou a carregar o dump:\n${r.stderr.slice(0, 800)}`);
}

const colunas = async (t) => {
  const [c] = await pool.query('SHOW COLUMNS FROM ??', [t]);
  return new Set(c.map((x) => x.Field));
};

async function sincronizarProdutos(aplicar) {
  const daqui = await colunas('products');
  const dali = await colunas(`${PREFIXO}products`);
  const facto = CAMPOS_FACTO.filter((c) => daqui.has(c) && dali.has(c));
  const seVazio = CAMPOS_SE_VAZIO.filter((c) => daqui.has(c) && dali.has(c));

  const [prod] = await pool.query(`SELECT * FROM ${PREFIXO}products`);
  const [locais] = await pool.query('SELECT * FROM products');
  const porRef = new Map(locais.map((p) => [p.reference, p]));

  const mudancas = {};
  let novos = 0, tocados = 0;
  for (const p of prod) {
    const l = porRef.get(p.reference);
    if (!l) { novos++; continue; }
    const set = {};
    for (const c of facto) {
      const a = l[c], b = p[c];
      const iguais = a instanceof Date && b instanceof Date ? +a === +b : String(a ?? '') === String(b ?? '');
      if (!iguais) { set[c] = b; mudancas[c] = (mudancas[c] || 0) + 1; }
    }
    for (const c of seVazio) {
      const vazio = l[c] === null || String(l[c]).trim() === '';
      if (vazio && p[c] != null && String(p[c]).trim() !== '') {
        set[c] = p[c]; mudancas[`${c} (estava vazio)`] = (mudancas[`${c} (estava vazio)`] || 0) + 1;
      }
    }
    if (!Object.keys(set).length) continue;
    tocados++;
    if (aplicar) await pool.query('UPDATE products SET ? WHERE id = ?', [set, l.id]);
  }
  return { novos, tocados, mudancas, campos: facto.length };
}

async function inserirEmFalta(tabela, aplicar) {
  const daqui = await colunas(tabela);
  const dali = await colunas(PREFIXO + tabela);
  const comuns = [...dali].filter((c) => daqui.has(c));
  const [existentes] = await pool.query(`SELECT id FROM ??`, [tabela]);
  const tenho = new Set(existentes.map((r) => String(r.id)));
  const [linhas] = await pool.query(`SELECT ${comuns.map((c) => `\`${c}\``).join(',')} FROM ${PREFIXO}${tabela}`);
  const faltam = linhas.filter((r) => !tenho.has(String(r.id)));
  if (aplicar) {
    for (const r of faltam) {
      // INSERT IGNORE e não REPLACE: nunca se mexe numa linha que já cá esteja.
      await pool.query(`INSERT IGNORE INTO ?? SET ?`, [tabela, r]);
    }
  }
  return { total: linhas.length, faltam: faltam.length, colunasComuns: comuns.length, colunasSoDeLa: [...dali].filter((c) => !daqui.has(c)) };
}

(async () => {
  const args = process.argv.slice(2);
  const dump = args.find((a) => !a.startsWith('--'));
  const aplicar = args.includes('--aplicar');
  if (!dump || !fs.existsSync(dump)) {
    console.error('uso: node scripts/sincronizar-producao.js <dump.sql.gz> [--aplicar]');
    process.exit(1);
  }

  console.log(`${aplicar ? 'A APLICAR' : 'Só a mostrar (sem --aplicar não se escreve nada)'}\n`);
  console.log(`A carregar ${path.basename(dump)} para tabelas ${PREFIXO}* …`);
  carregar(dump);

  const p = await sincronizarProdutos(aplicar);
  console.log(`\nprodutos — ${p.campos} campos de facto comparados`);
  console.log(`  ${p.tocados} produtos com diferenças · ${p.novos} existem em produção e não aqui`);
  for (const [c, n] of Object.entries(p.mudancas).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${c}`);
  }

  for (const t of ['customers', 'orders', 'order_items', 'order_status_history', 'payments']) {
    const r = await inserirEmFalta(t, aplicar);
    console.log(`\n${t} — ${r.total} em produção, ${r.faltam} em falta aqui (${r.colunasComuns} colunas comuns)`);
    if (r.colunasSoDeLa.length) console.log(`  colunas que só produção tem: ${r.colunasSoDeLa.join(', ')}`);
  }

  for (const t of TABELAS) await pool.query(`DROP TABLE IF EXISTS ${PREFIXO}${t}`);
  console.log(`\nTabelas ${PREFIXO}* deitadas fora.`);
  if (!aplicar) console.log('Nada foi escrito. Repete com --aplicar quando concordares com o que está acima.');
  await pool.end();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
