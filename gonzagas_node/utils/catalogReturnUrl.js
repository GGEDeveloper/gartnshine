/**
 * URL de regresso à loja (apenas paths internos /loja).
 */

const CATALOG_QUERY_KEYS = [
  'families',
  'search',
  'price_range',
  'sort',
  'page',
  'per_page',
  'colors',
  'materials'
];

function serializeCatalogQuery(query) {
  if (!query || typeof query !== 'object') return '/loja';
  const params = new URLSearchParams();
  CATALOG_QUERY_KEYS.forEach(key => {
    const v = query[key];
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      v.forEach(val => {
        if (val !== undefined && val !== null && String(val) !== '') params.append(key, String(val));
      });
    } else {
      params.append(key, String(v));
    }
  });
  const qs = params.toString();
  return qs ? `/loja?${qs}` : '/loja';
}

function safeCatalogReturnUrl(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  let s = typeof raw === 'string' ? raw : String(raw);
  try {
    s = decodeURIComponent(s);
  } catch (e) {
    return null;
  }
  if (!s.startsWith('/loja')) return null;
  if (s.startsWith('//') || s.includes('://')) return null;
  if (s.includes('@')) return null;
  if (s.includes('..') || s.toLowerCase().includes('%2e%2e')) return null;
  const pathPart = s.split('?')[0];
  if (pathPart !== '/loja') return null;
  if (s.length > 2048) return null;
  return s;
}

module.exports = {
  serializeCatalogQuery,
  safeCatalogReturnUrl,
  CATALOG_QUERY_KEYS
};
