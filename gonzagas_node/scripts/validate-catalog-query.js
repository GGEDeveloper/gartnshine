#!/usr/bin/env node
/**
 * Validação rápida do serviço de catálogo (BD + facetas).
 * Uso: npm run validate:catalog
 */
require('dotenv').config();
if (process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = process.env.DB_PASSWORD.replace(/^"|"$/g, '');
}

const { runCatalogQuery } = require('../services/catalogQueryService');
const { safeCatalogReturnUrl } = require('../utils/catalogReturnUrl');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

(async () => {
  const bad = safeCatalogReturnUrl('https://evil.com/catalog');
  assert(bad === null, 'safeCatalogReturnUrl must reject absolute URL');

  const bad2 = safeCatalogReturnUrl('/catalog/../../../admin');
  assert(bad2 === null, 'safeCatalogReturnUrl must reject path traversal');

  const ok = safeCatalogReturnUrl(encodeURIComponent('/catalog?search=prata'));
  assert(ok && ok.includes('search=prata'), 'safeCatalogReturnUrl must accept encoded catalog query');

  const r = await runCatalogQuery({
    hideOutOfStock: false,
    expandedFamilyIds: [],
    price_range: 'all',
    search: '',
    colorsNormalized: [],
    materialsNormalized: [],
    stylesNormalized: [],
    sortType: 'default',
    page: 1,
    perPage: 12
  });

  assert(typeof r.count === 'number' && r.count >= 0, 'count must be a number');
  assert(Array.isArray(r.products), 'products must be an array');
  assert(r.products.length <= 12, 'page size respected');
  assert(r.facets && typeof r.facets.families === 'object', 'facets.families required');
  assert(r.facets && typeof r.facets.colors === 'object', 'facets.colors required');
  assert(typeof r.total_pages === 'number' && r.total_pages >= 1, 'total_pages required');

  const r2 = await runCatalogQuery({
    hideOutOfStock: false,
    expandedFamilyIds: [],
    price_range: 'all',
    search: 'zzzznonexistentzzzz',
    colorsNormalized: [],
    materialsNormalized: [],
    stylesNormalized: [],
    sortType: 'default',
    page: 1,
    perPage: 24
  });
  assert(r2.count === 0, 'impossible search should return 0');

  console.log('OK catalog validation:', {
    totalProducts: r.count,
    firstPage: r.products.length,
    familyFacetKeys: Object.keys(r.facets.families).length,
    colorFacetKeys: Object.keys(r.facets.colors).length
  });
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
