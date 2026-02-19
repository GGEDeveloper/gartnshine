const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const path = require('path');
const fs = require('fs');

class CatalogController {
  /**
   * Display the public product catalog page.
   */
  static async displayCatalog(req, res) {
    try {
      // Check if catalog page is enabled in site settings
      if (res.locals.siteSettings && res.locals.siteSettings.catalog_page_enabled === false) {
        console.log('[CatalogController] Catalog page is DISABLED. Rendering construction page.');
        return res.status(200).render('public/catalog', { 
          title: 'Catálogo em Construção',
          currentPath: '/catalog', 
          layout: 'layouts/main'
        });
      }

      console.log('[CatalogController] Catalog page is ENABLED. Rendering catalog page.');

      // Parse selected family IDs from query params (handle "all", array, single)
      let selectedFamilyIds = [];
      const familiesParam = req.query.families;
      if (familiesParam && familiesParam !== 'all') {
        selectedFamilyIds = Array.isArray(familiesParam)
          ? familiesParam.map(id => parseInt(id)).filter(n => !isNaN(n))
          : [parseInt(familiesParam)].filter(n => !isNaN(n));
      }

      // Get all active products (before filtering) for counts and family tree
      const hideOutOfStock = res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock;
      const allProducts = await Product.getActiveForCatalog(5000, 0, { hideOutOfStock: !!hideOutOfStock });
      
      // Build product counts per family (before filter)
      const productCounts = {};
      allProducts.forEach(p => {
        productCounts[p.family_id] = (productCounts[p.family_id] || 0) + 1;
      });

      // Get all families and expand selected IDs to include descendants (parent → subcategories)
      const flatFamilies = await ProductFamily.getAll();
      const expandedFamilyIds = selectedFamilyIds.length > 0
        ? ProductFamily.getFamilyIdsWithDescendants(flatFamilies, selectedFamilyIds)
        : [];

      // Filter products by expanded family IDs
      let products = selectedFamilyIds.length > 0
        ? allProducts.filter(p => expandedFamilyIds.includes(p.family_id))
        : [...allProducts];

      // Families for filter: those with products OR ancestors of families with products
      const familiesWithProducts = flatFamilies.filter(f => {
        const selfCount = productCounts[f.id] || 0;
        const descendantIds = ProductFamily.getDescendantIds(flatFamilies, f.id);
        const descendantCount = descendantIds.reduce((sum, id) => sum + (productCounts[id] || 0), 0);
        return selfCount > 0 || descendantCount > 0;
      });
      const familiesTree = ProductFamily.buildTree(familiesWithProducts);

      // Flatten tree for view (id, name, depth)
      function flattenTree(nodes, depth = 0) {
        const result = [];
        (nodes || []).forEach(n => {
          result.push({ id: n.id, name: n.name, depth });
          if (n.children?.length) result.push(...flattenTree(n.children, depth + 1));
        });
        return result;
      }
      const familiesForView = flattenTree(familiesTree);
      
      // Format prices for display
      products = products.map(product => ({
        ...product,
        formatted_sale_price: product.sale_price ? 
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
          null,
        formatted_purchase_price: product.purchase_price ?
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
          null
      }));

      // Add flags for new/sale products (can be enhanced with date logic)
      products = products.map(product => ({
        ...product,
        is_new: false, // Can be enhanced with date logic
        on_sale: product.sale_price && product.purchase_price && 
                 parseFloat(product.sale_price) < parseFloat(product.purchase_price)
      }));

      // Render the catalog page with the products and families
      res.render('public/catalog', {
        title: 'Catálogo',
        currentPath: '/catalog',
        layout: 'layouts/main',
        products: products,
        families: familiesForView,
        selectedFamilyIds: selectedFamilyIds,
        queryParams: req.query, // Pass query params for EJS
        siteTitle: 'Gonzaga\'s Art & Shine',
        siteDescription: 'Elegância que nasce da terra',
        theme: {
          colorPrimary: '#05070a',
          colorSecondary: '#0b1016',
          colorAccent: '#A8A8A8',
          colorText: '#f4f6f8',
          colorHighlight: '#C0C0C0'
        },
        helpers: {
          isFamilySelected: function(familyId) {
            return selectedFamilyIds.includes(familyId) ? 'checked' : '';
          }
        }
      });
    } catch (error) {
      console.error('Error in displayCatalog:', error);
      res.status(500).render('error', {
        message: 'Ocorreu um erro ao carregar o catálogo.',
        error: {}
      });
    }
  }
}

module.exports = CatalogController;