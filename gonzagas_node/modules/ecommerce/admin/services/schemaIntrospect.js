/**
 * Introspecção de schema — só leitura.
 *
 * O schema da BD de produção (waphix) não é necessariamente igual ao da BD
 * local de desenvolvimento. Em vez de assumir colunas, perguntamos ao MySQL
 * quais existem e construímos as queries só com essas. Assim um painel novo
 * nunca rebenta com "Unknown column" numa BD com schema diferente.
 */

const { pool } = require('../../../../config/database');

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Devolve um Set com os nomes das colunas da tabela na BD actual.
 * Se a tabela não existir (ou a query falhar), devolve um Set vazio.
 */
async function getColumns(table) {
  const cached = cache.get(table);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.cols;

  let cols = new Set();
  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table]
    );
    cols = new Set(rows.map((r) => r.COLUMN_NAME));
  } catch (err) {
    console.warn(`[admin/schema] Não foi possível ler colunas de ${table}:`, err.message);
  }

  cache.set(table, { cols, at: Date.now() });
  return cols;
}

/** True se a tabela existe (tem pelo menos uma coluna). */
async function tableExists(table) {
  return (await getColumns(table)).size > 0;
}

/** Filtra uma lista de colunas candidatas, devolvendo só as que existem. */
async function pickColumns(table, candidates) {
  const cols = await getColumns(table);
  return candidates.filter((c) => cols.has(c));
}

/** Primeira coluna da lista que exista na tabela, ou null. */
async function firstColumn(table, candidates) {
  const cols = await getColumns(table);
  return candidates.find((c) => cols.has(c)) || null;
}

function clearCache() {
  cache.clear();
}

module.exports = { getColumns, tableExists, pickColumns, firstColumn, clearCache };
