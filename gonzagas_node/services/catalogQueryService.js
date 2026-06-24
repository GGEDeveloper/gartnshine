/**
 * Catálogo público: uma fonte de verdade SQL (lista + contagem + facetas condicionais).
 *
 * Facetas condicionais: para cada dimensão, a contagem aplica todos os filtros
 * exceto os dessa dimensão, para o utilizador poder mudar essa dimensão sem ficar tudo a zero.
 * Preço e pesquisa aplicam-se sempre às queries de faceta.
 */

const { pool } = require('../config/database');

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
  f.name AS family_name,
  (SELECT pi.image_filename FROM product_images pi
   WHERE pi.product_id = p.id
   ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS image_url
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

  if (pricesIncludeTax && displayPrice) {
    displayPrice = parseFloat(displayPrice) * (1 + taxRate);
  }
  if (pricesIncludeTax && displayPurchasePrice) {
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
  return rows;
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
    settings = {}
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

  const rows = await selectCatalogPage({
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
  familyProductCounts
};
