const ProductFamily = require('../models/ProductFamily');
const {
  parseSelectedFamilyIds,
  parseMultiParam,
  normalizeFacetKeys,
  normalizePerPage,
  PER_PAGE_OPTIONS
} = require('../utils/catalogFilterUtils');
const { serializeCatalogQuery } = require('../utils/catalogReturnUrl');
const {
  runCatalogQuery,
  listFacetOptionLabels,
  familyProductCounts
} = require('../services/catalogQueryService');
const EcommerceSettings = require('../modules/ecommerce/settings/models/EcommerceSettings');

class CatalogController {
  static async displayCatalog(req, res) {
    try {
      if (res.locals.siteSettings && res.locals.siteSettings.catalog_page_enabled === false) {
        console.log('[CatalogController] Catalog page is DISABLED. Rendering construction page.');
        return res.status(200).render('public/catalog', {
          title: 'Catálogo em Construção',
          currentPath: '/catalog',
          layout: 'layouts/main',
          selectedFamilyIds: [],
          families: [],
          familiesTree: [],
          familyCheckboxCheckedIds: [],
          products: [],
          facetOptionLabels: { colors: [], materials: [] },
          selectedColors: [],
          selectedMaterials: [],
          catalogReturnPath: '/catalog',
          catalogPagination: null,
          initialFacets: null,
          queryParams: {},
          familyNameById: {},
          helpers: { isFamilySelected: () => '', facetKey: (l) => String(l || '').trim().toLowerCase() }
        });
      }

      console.log('[CatalogController] Catalog page is ENABLED. Rendering catalog page.');

      const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
      const flatFamilies = await ProductFamily.getAll();
      const selectedFamilyIds = parseSelectedFamilyIds(req.query.families);
      const expandedFamilyIds =
        selectedFamilyIds.length > 0
          ? ProductFamily.getFamilyIdsWithDescendants(flatFamilies, selectedFamilyIds)
          : [];

      const colorsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'colors'));
      const materialsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'materials'));
      const stylesNormalized = [];

      const sortType =
        req.query.sort && String(req.query.sort).trim() ? String(req.query.sort).trim() : 'default';
      const perPage = normalizePerPage(req.query.per_page);

      const ecommerceSettings = await EcommerceSettings.getAll();

      const result = await runCatalogQuery({
        hideOutOfStock,
        expandedFamilyIds,
        price_range: req.query.price_range,
        search: req.query.search,
        colorsNormalized,
        materialsNormalized,
        stylesNormalized,
        sortType,
        page: req.query.page,
        perPage,
        settings: ecommerceSettings
      });

      if (result.facets) result.facets.styles = {};

      const productCounts = await familyProductCounts(hideOutOfStock);
      const familiesWithProducts = flatFamilies.filter(f => {
        const selfCount = productCounts[f.id] || 0;
        const descendantIds = ProductFamily.getDescendantIds(flatFamilies, f.id);
        const descendantCount = descendantIds.reduce((sum, id) => sum + (productCounts[id] || 0), 0);
        return selfCount > 0 || descendantCount > 0;
      });
      const familiesTree = ProductFamily.buildTree(familiesWithProducts);

      function flattenTree(nodes, depth = 0) {
        const out = [];
        (nodes || []).forEach(n => {
          out.push({ id: n.id, name: n.name, depth, parent_id: n.parent_id, hasChildren: !!(n.children && n.children.length) });
          if (n.children?.length) out.push(...flattenTree(n.children, depth + 1));
        });
        return out;
      }
      const familiesForView = flattenTree(familiesTree);
      const familyCheckboxCheckedIds =
        selectedFamilyIds.length > 0 ? expandedFamilyIds : [];

      const facetOptionLabels = await listFacetOptionLabels(hideOutOfStock);
      if (facetOptionLabels) facetOptionLabels.styles = [];

      const familyNameById = {};
      flatFamilies.forEach(f => {
        familyNameById[f.id] = f.name;
      });

      const selectedColors = parseMultiParam(req.query, 'colors');
      const selectedMaterials = parseMultiParam(req.query, 'materials');

      res.render('public/catalog', {
        title: 'Catálogo',
        currentPath: '/catalog',
        layout: 'layouts/main',
        products: result.products,
        families: familiesForView,
        familiesTree,
        familyCheckboxCheckedIds,
        selectedFamilyIds,
        selectedColors,
        selectedMaterials,
        queryParams: req.query,
        catalogPagination: {
          page: result.page,
          perPage: result.perPage,
          totalPages: result.total_pages,
          totalFiltered: result.count,
          perPageOptions: PER_PAGE_OPTIONS
        },
        facetOptionLabels,
        initialFacets: result.facets,
        familyNameById,
        catalogReturnPath: serializeCatalogQuery(req.query),
        siteTitle: "Gonzaga's Art & Shine",
        siteDescription: 'Elegância que nasce da terra',
        theme: 'dark',
        helpers: {
          isFamilySelected: function (familyId) {
            return selectedFamilyIds.includes(familyId) ? 'checked' : '';
          },
          facetKey: function (label) {
            return String(label || '')
              .trim()
              .toLowerCase();
          }
        }
      });
    } catch (error) {
      console.error('Error in displayCatalog:', error);
      res.status(500).render('error', {
        title: 'Erro',
        message: 'Ocorreu um erro ao carregar o catálogo.',
        error: {},
        layout: false
      });
    }
  }
}

module.exports = CatalogController;
