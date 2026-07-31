/**
 * Catálogo público: uma fonte de verdade SQL (lista + contagem + facetas condicionais).
 *
 * Facetas condicionais: para cada dimensão, a contagem aplica todos os filtros
 * exceto os dessa dimensão, para o utilizador poder mudar essa dimensão sem ficar tudo a zero.
 * Preço e pesquisa aplicam-se sempre às queries de faceta.
 */

const { pool } = require('../config/database');

// Cache de imagens em memória para evitar subqueries repetitivas
const imageCache = new Map();
const IMAGE_CACHE_TTL = 10 * 60 * 1000; // 10 minutos em ms
const imageTimestamps = new Map();

function getCachedImage(productId) {
  const cached = imageCache.get(productId);
  const timestamp = imageTimestamps.get(productId);
  
  if (cached && timestamp && (Date.now() - timestamp) < IMAGE_CACHE_TTL) {
    return cached;
  }
  
  // Cache expirado ou não existe
  imageCache.delete(productId);
  imageTimestamps.delete(productId);
  return null;
}

function setCachedImage(productId, imageFilename) {
  imageCache.set(productId, imageFilename);
  imageTimestamps.set(productId, Date.now());
  
  // Limpar cache antigo se ficar muito grande (max 1000 entries)
  if (imageCache.size > 1000) {
    const oldestKey = imageTimestamps.keys().next().value;
    imageCache.delete(oldestKey);
    imageTimestamps.delete(oldestKey);
  }
}

async function getPrimaryImageFilename(productId) {
  const cached = getCachedImage(productId);
  if (cached !== null) {
    return cached;
  }
  
  const [rows] = await pool.query(
    `SELECT image_filename FROM product_images 
     WHERE product_id = ? 
     ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1`,
    [productId]
  );
  
  const imageFilename = rows.length > 0 ? rows[0].image_filename : null;
  setCachedImage(productId, imageFilename);
  return imageFilename;
}

const SELECT_FIELDS = `
  p.id,
  p.name,
  p.reference,
  p.slug,
  p.family_id,
  p.is_active,
  p.sale_price,
  p.purchase_price,
  p.current_stock,
  p.description,
  p.color,
  p.material,
  p.style,
  f.name AS family_name
`;

const FROM_JOIN = `
  FROM products p
  LEFT JOIN product_families f ON p.family_id = f.id
`;

/**
 * @param {string|null} excludeFacet 'families'|'price'|'colors'|'materials'|'styles'|null
 */
function buildWhereClause({
  hideOutOfStock,
  expandedFamilyIds,
  price_range,
  search,
  colorsNormalized,
  materialsNormalized,
  stylesNormalized,
  excludeFacet
}) {
  const parts = ['p.is_active = 1', 'p.is_catalog_visible = 1'];
  const params = [];

  if (hideOutOfStock) {
    parts.push('(p.current_stock IS NOT NULL AND p.current_stock > 0)');
  }

  if (excludeFacet !== 'families' && expandedFamilyIds && expandedFamilyIds.length > 0) {
    parts.push(`p.family_id IN (${expandedFamilyIds.map(() => '?').join(',')})`);
    params.push(...expandedFamilyIds);
  }

  if (excludeFacet !== 'price') {
    appendPriceRange(parts, price_range);
  }

  if (search && String(search).trim().length >= 2) {
    const t = `%${String(search).trim()}%`;
    parts.push('(p.name LIKE ? OR p.reference LIKE ? OR f.name LIKE ?)');
    params.push(t, t, t);
  }

  if (excludeFacet !== 'colors' && colorsNormalized && colorsNormalized.length > 0) {
    parts.push(
      `(p.color IS NOT NULL AND TRIM(p.color) <> '' AND LOWER(TRIM(p.color)) IN (${colorsNormalized.map(() => '?').join(',')}))`
    );
    params.push(...colorsNormalized);
  }

  if (excludeFacet !== 'materials' && materialsNormalized && materialsNormalized.length > 0) {
    parts.push(
      `(p.material IS NOT NULL AND TRIM(p.material) <> '' AND LOWER(TRIM(p.material)) IN (${materialsNormalized.map(() => '?').join(',')}))`
    );
    params.push(...materialsNormalized);
  }

  if (excludeFacet !== 'styles' && stylesNormalized && stylesNormalized.length > 0) {
    parts.push(
      `(p.style IS NOT NULL AND TRIM(p.style) <> '' AND LOWER(TRIM(p.style)) IN (${stylesNormalized.map(() => '?').join(',')}))`
    );
    params.push(...stylesNormalized);
  }

  return { whereSql: parts.length ? `WHERE ${parts.join(' AND ')}` : '', params };
}

function appendPriceRange(parts, price_range) {
  if (!price_range || price_range === 'all') return;
  const str = String(price_range);
  if (str === '0-50') {
    parts.push('COALESCE(p.sale_price, 0) >= 0 AND COALESCE(p.sale_price, 0) <= 50');
  } else if (str === '50-100') {
    parts.push('COALESCE(p.sale_price, 0) >= 50 AND COALESCE(p.sale_price, 0) <= 100');
  } else if (str === '100+') {
    parts.push('COALESCE(p.sale_price, 0) >= 100');
  }
}

function orderBySql(sortType) {
  switch (sortType) {
    case 'price-asc':
      return 'ORDER BY COALESCE(p.sale_price, 0) ASC, p.reference ASC';
    case 'price-desc':
      return 'ORDER BY COALESCE(p.sale_price, 0) DESC, p.reference ASC';
    case 'name-asc':
      return 'ORDER BY p.name ASC';
    case 'name-desc':
      return 'ORDER BY p.name DESC';
    case 'reference-asc':
      return 'ORDER BY p.reference ASC';
    case 'reference-desc':
      return 'ORDER BY p.reference DESC';
    case 'default':
    default:
      return 'ORDER BY p.featured DESC, p.reference ASC';
  }
}

function formatRow(row, settings = {}) {
  const pricesIncludeTax = settings.prices_include_tax !== false;
  const taxRate = parseFloat(settings.tax_rate ?? 23) / 100;

  let displayPrice = row.sale_price;
  let displayPurchasePrice = row.purchase_price;

  if (!pricesIncludeTax && displayPrice) {
    // Preço na BD é base (sem IVA), mostrar com IVA
    displayPrice = parseFloat(displayPrice) * (1 + taxRate);
  }
  // Se pricesIncludeTax = true, o preço na BD já tem IVA, mostrar como está

  if (!pricesIncludeTax && displayPurchasePrice) {
    displayPurchasePrice = parseFloat(displayPurchasePrice) * (1 + taxRate);
  }

  const formatted_sale_price = displayPrice
    ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(displayPrice)
    : null;
  const formatted_purchase_price = displayPurchasePrice
    ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(displayPurchasePrice)
    : null;

  return {
    ...row,
    formatted_sale_price,
    formatted_purchase_price,
    is_new: false,
    on_sale:
      row.sale_price &&
      row.purchase_price &&
      parseFloat(row.sale_price) < parseFloat(row.purchase_price)
  };
}

async function countCatalog({ whereSql, params }) {
  const sql = `SELECT COUNT(*) AS cnt ${FROM_JOIN} ${whereSql}`;
  const [rows] = await pool.query(sql, params);
  return rows[0].cnt;
}

async function selectCatalogPage({ whereSql, params, sortType, limit, offset }) {
  const order = orderBySql(sortType);
  const sql = `SELECT ${SELECT_FIELDS} ${FROM_JOIN} ${whereSql} ${order} LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(sql, [...params, limit, offset]);
  
  // Adicionar imagens usando cache em vez de subquery
  const rowsWithImages = await Promise.all(
    rows.map(async (row) => {
      const imageFilename = await getPrimaryImageFilename(row.id);
      return {
        ...row,
        image_url: imageFilename
      };
    })
  );
  
  return rowsWithImages;
}

/**
 * Máximo de peças que a intercalação carrega para memória de uma vez. Só
 * traz `id` e `family_id`, por isso o catálogo inteiro (≈400) é trivial; o
 * tecto existe para o dia em que não for.
 */
const MAX_LINHAS_INTERCALADAS = 5000;

/**
 * Espalha as subcategorias pela listagem em vez de as deixar em blocos.
 *
 * O problema: a ordem natural (referência) agrupa por família, porque as
 * referências partilham prefixo. Quem filtrava por "Prata" via 30 anéis
 * seguidos antes de chegar ao primeiro colar, e desistia a meio da primeira
 * página convencido de que só havia anéis.
 *
 * Como: cada peça recebe a posição relativa que ocupa dentro da sua família —
 * a 5.ª de 20 fica em 0,225; a 5.ª de 90 fica em 0,05 — e ordena-se tudo por
 * esse valor. O efeito é cada família ficar distribuída por igual ao longo da
 * lista toda, em vez do round-robin simples, que esgota as famílias pequenas
 * ao início e deixa um bloco da maior no fim (exactamente o que queremos
 * evitar).
 *
 * A ordem relativa dentro de cada família mantém-se — continua a ser a
 * ordenação escolhida, só que entrelaçada.
 */
function intercalarPorFamilia(linhas) {
  const familias = new Map();
  linhas.forEach((linha) => {
    const chave = linha.family_id == null ? '_' : String(linha.family_id);
    if (!familias.has(chave)) familias.set(chave, []);
    familias.get(chave).push(linha);
  });

  // Com uma só família não há nada para intercalar.
  if (familias.size < 2) return linhas;

  const comPeso = [];
  familias.forEach((itens) => {
    const total = itens.length;
    itens.forEach((linha, i) => {
      comPeso.push({ linha, peso: (i + 0.5) / total, ordem: comPeso.length });
    });
  });

  comPeso.sort((a, b) => (a.peso - b.peso) || (a.ordem - b.ordem));
  return comPeso.map((x) => x.linha);
}

/**
 * Página do catálogo com as subcategorias intercaladas.
 *
 * A intercalação tem de acontecer antes de paginar: se fosse feita só sobre
 * as 24 peças que a SQL devolve, a primeira página continuaria a ser 24
 * anéis, apenas baralhados entre si. Por isso pede-se a lista completa de ids
 * (dois inteiros por linha, barato), ordena-se em memória e só depois se
 * carrega a fatia visível.
 *
 * As peças em destaque não são postas à frente de tudo: a ordenação SQL já as
 * traz primeiro dentro de cada família, e como cada família começa no início
 * da lista intercalada, os destaques continuam a cair na primeira página. O
 * bloco de destaques à cabeça era, aliás, metade do problema — 15 dos 20
 * destaques em prata são anéis, e davam 13 anéis seguidos logo a abrir mesmo
 * com o resto intercalado.
 */
async function selectCatalogPageIntercalada({ whereSql, params, sortType, limit, offset }) {
  const order = orderBySql(sortType);
  const [linhas] = await pool.query(
    `SELECT p.id, p.family_id ${FROM_JOIN} ${whereSql} ${order}`,
    params
  );

  if (linhas.length > MAX_LINHAS_INTERCALADAS) {
    return selectCatalogPage({ whereSql, params, sortType, limit, offset });
  }

  const fatia = intercalarPorFamilia(linhas).slice(offset, offset + limit);
  if (fatia.length === 0) return [];

  const ids = fatia.map((l) => l.id);
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} ${FROM_JOIN} WHERE p.id IN (${ids.map(() => '?').join(',')})`,
    ids
  );

  // O IN não garante ordem: repõe-se a que foi calculada acima.
  const porId = new Map(rows.map((r) => [r.id, r]));
  const naOrdem = ids.map((id) => porId.get(id)).filter(Boolean);

  return Promise.all(
    naOrdem.map(async (row) => ({
      ...row,
      image_url: await getPrimaryImageFilename(row.id)
    }))
  );
}

async function facetFamilies(baseWhere, baseParams) {
  const sql = `
    SELECT p.family_id AS id, COUNT(*) AS c
    ${FROM_JOIN}
    ${baseWhere}
    GROUP BY p.family_id
  `;
  const [rows] = await pool.query(sql, baseParams);
  const out = {};
  rows.forEach(r => {
    if (r.id != null) out[r.id] = r.c;
  });
  return out;
}

async function facetColorLike(baseWhere, baseParams, column) {
  const sql = `
    SELECT LOWER(TRIM(p.${column})) AS k, MIN(TRIM(p.${column})) AS label, COUNT(*) AS c
    ${FROM_JOIN}
    ${baseWhere}
    AND p.${column} IS NOT NULL AND TRIM(p.${column}) <> ''
    GROUP BY k
    ORDER BY label ASC
  `;
  const [rows] = await pool.query(sql, baseParams);
  const out = {};
  rows.forEach(r => {
    if (r.k) out[r.k] = { count: r.c, label: r.label };
  });
  return out;
}

/**
 * @param {object} opts
 * @param {boolean} opts.hideOutOfStock
 * @param {number[]} opts.expandedFamilyIds
 * @param {string} opts.price_range
 * @param {string} opts.search
 * @param {string[]} opts.colorsNormalized
 * @param {string[]} opts.materialsNormalized
 * @param {string[]} opts.stylesNormalized
 * @param {string} opts.sortType
 * @param {number} opts.page
 * @param {number} opts.perPage
 * @param {object} opts.settings
 */
async function runCatalogQuery(opts) {
  const {
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    sortType,
    page,
    perPage,
    settings = {},
    intercalarSubcategorias = false
  } = opts;

  const main = buildWhereClause({
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    excludeFacet: null
  });

  const totalFiltered = await countCatalog(main);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage) || 1);
  let p = Math.max(1, parseInt(page, 10) || 1);
  if (p > totalPages) p = totalPages;
  const offset = (p - 1) * perPage;

  // Intercalar só faz sentido na ordem "Padrão": quem escolheu preço ou nome
  // pediu explicitamente uma sequência e não a queremos baralhar.
  const paginador = intercalarSubcategorias && (!sortType || sortType === 'default')
    ? selectCatalogPageIntercalada
    : selectCatalogPage;

  const rows = await paginador({
    whereSql: main.whereSql,
    params: main.params,
    sortType,
    limit: perPage,
    offset
  });

  const wf = buildWhereClause({
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    excludeFacet: 'families'
  });
  const wc = buildWhereClause({
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    excludeFacet: 'colors'
  });
  const wm = buildWhereClause({
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    excludeFacet: 'materials'
  });
  const ws = buildWhereClause({
    hideOutOfStock,
    expandedFamilyIds,
    price_range,
    search,
    colorsNormalized,
    materialsNormalized,
    stylesNormalized,
    excludeFacet: 'styles'
  });

  const [familiesFacet, colorsFacet, materialsFacet, stylesFacet] = await Promise.all([
    facetFamilies(wf.whereSql, wf.params),
    facetColorLike(wc.whereSql, wc.params, 'color'),
    facetColorLike(wm.whereSql, wm.params, 'material'),
    facetColorLike(ws.whereSql, ws.params, 'style')
  ]);

  return {
    products: rows.map(row => formatRow(row, settings)),
    count: totalFiltered,
    page: p,
    perPage,
    total_pages: totalPages,
    facets: {
      families: familiesFacet,
      colors: colorsFacet,
      materials: materialsFacet,
      styles: stylesFacet
    }
  };
}

/**
 * Opções iniciais para SSR (checkboxes), só produtos visíveis no catálogo.
 */
async function listFacetOptionLabels(hideOutOfStock) {
  const stockClause = hideOutOfStock
    ? ' AND (p.current_stock IS NOT NULL AND p.current_stock > 0)'
    : '';
  const whereBase = `WHERE p.is_active = 1 AND p.is_catalog_visible = 1${stockClause}`;

  const runDistinct = async (col) => {
    try {
      const [rows] = await pool.query(
        `SELECT DISTINCT TRIM(p.${col}) AS v FROM products p ${whereBase} AND p.${col} IS NOT NULL AND TRIM(p.${col}) <> '' ORDER BY v ASC`
      );
      return rows.map(r => r.v).filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  const [colors, materials, styles] = await Promise.all([
    runDistinct('color'),
    runDistinct('material'),
    runDistinct('style')
  ]);

  return { colors, materials, styles };
}

async function familyProductCounts(hideOutOfStock) {
  const stock = hideOutOfStock
    ? ' AND (p.current_stock IS NOT NULL AND p.current_stock > 0)'
    : '';
  const [rows] = await pool.query(
    `SELECT p.family_id AS id, COUNT(*) AS c FROM products p
     WHERE p.is_active = 1 AND p.is_catalog_visible = 1${stock}
     GROUP BY p.family_id`
  );
  const out = {};
  rows.forEach(r => {
    if (r.id != null) out[r.id] = r.c;
  });
  return out;
}

module.exports = {
  buildWhereClause,
  orderBySql,
  formatRow,
  runCatalogQuery,
  listFacetOptionLabels,
  countCatalog,
  selectCatalogPage,
  selectCatalogPageIntercalada,
  intercalarPorFamilia,
  familyProductCounts
};
