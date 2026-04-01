const ProductFamily = require('../models/ProductFamily');

const PER_PAGE_OPTIONS = [12, 24, 48];

function parseSelectedFamilyIds(familiesParam) {
  if (!familiesParam || familiesParam === 'all') return [];
  const ids = Array.isArray(familiesParam)
    ? familiesParam.map(id => parseInt(id, 10)).filter(n => !isNaN(n))
    : [parseInt(familiesParam, 10)].filter(n => !isNaN(n));
  return ids;
}

/** Express query: repeated keys or array */
function parseMultiParam(query, name) {
  if (!query || !name) return [];
  const v = query[name];
  if (v === undefined || v === null || v === '') return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map(s => String(s).trim()).filter(Boolean);
}

function normalizeFacetKeys(list) {
  if (!list || !list.length) return [];
  return [...new Set(list.map(s => String(s).trim().toLowerCase()).filter(Boolean))];
}

function filterByFamily(products, selectedFamilyIds, flatFamilies) {
  if (!selectedFamilyIds.length) return products;
  const expandedIds = ProductFamily.getFamilyIdsWithDescendants(flatFamilies, selectedFamilyIds);
  return products.filter(p => expandedIds.includes(p.family_id));
}

function filterByPriceRange(products, price_range) {
  if (!price_range || price_range === 'all') return products;
  const parts = String(price_range).split('-');
  const minRaw = parts[0];
  const maxRaw = parts[1] !== undefined ? parts[1].replace('+', '') : '';
  const minPrice = parseFloat(minRaw) || 0;
  const maxPrice = maxRaw !== '' && maxRaw !== undefined ? parseFloat(maxRaw) : Infinity;
  return products.filter(product => {
    const price = parseFloat(product.sale_price) || 0;
    return price >= minPrice && price <= maxPrice;
  });
}

function filterBySearch(products, search) {
  if (!search || String(search).trim().length < 2) return products;
  const searchTerm = String(search).trim().toLowerCase();
  return products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const reference = (product.reference || '').toLowerCase();
    const familyName = (product.family_name || '').toLowerCase();
    return (
      name.includes(searchTerm) ||
      reference.includes(searchTerm) ||
      familyName.includes(searchTerm)
    );
  });
}

function applyCatalogFilters(products, { selectedFamilyIds, price_range, search }, flatFamilies) {
  let out = products;
  out = filterByFamily(out, selectedFamilyIds, flatFamilies);
  out = filterByPriceRange(out, price_range);
  out = filterBySearch(out, search);
  return out;
}

function sortCatalogProducts(products, sortType) {
  const arr = [...products];
  switch (sortType) {
    case 'price-asc':
      return arr.sort(
        (a, b) => (parseFloat(a.sale_price) || 0) - (parseFloat(b.sale_price) || 0)
      );
    case 'price-desc':
      return arr.sort(
        (a, b) => (parseFloat(b.sale_price) || 0) - (parseFloat(a.sale_price) || 0)
      );
    case 'name-asc':
      return arr.sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''), 'pt', { sensitivity: 'base' })
      );
    case 'name-desc':
      return arr.sort((a, b) =>
        String(b.name || '').localeCompare(String(a.name || ''), 'pt', { sensitivity: 'base' })
      );
    case 'reference-asc':
      return arr.sort((a, b) =>
        String(a.reference || '').localeCompare(String(b.reference || ''), undefined, {
          numeric: true
        })
      );
    case 'reference-desc':
      return arr.sort((a, b) =>
        String(b.reference || '').localeCompare(String(a.reference || ''), undefined, {
          numeric: true
        })
      );
    case 'default':
    default:
      return arr;
  }
}

function normalizePerPage(raw) {
  const n = parseInt(raw, 10);
  return PER_PAGE_OPTIONS.includes(n) ? n : 24;
}

function paginateSlice(products, page, perPage) {
  const totalFiltered = products.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage) || 1);
  let p = Math.max(1, parseInt(page, 10) || 1);
  if (p > totalPages) p = totalPages;
  const offset = (p - 1) * perPage;
  const slice = products.slice(offset, offset + perPage);
  return {
    slice,
    totalFiltered,
    totalPages,
    page: p,
    perPage
  };
}

module.exports = {
  PER_PAGE_OPTIONS,
  parseSelectedFamilyIds,
  parseMultiParam,
  normalizeFacetKeys,
  filterByFamily,
  filterByPriceRange,
  filterBySearch,
  applyCatalogFilters,
  sortCatalogProducts,
  normalizePerPage,
  paginateSlice
};
