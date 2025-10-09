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
          currentPage: 'catalog',
          layout: 'layout' // Dark Nature layout
        });
      }

      console.log('[CatalogController] Catalog page is ENABLED. Rendering catalog page.');

      // Get selected family IDs from query params
      const selectedFamilyIds = req.query.families 
        ? Array.isArray(req.query.families) 
          ? req.query.families.map(id => parseInt(id))
          : [parseInt(req.query.families)]
        : [];

      // Get all active products visible in catalog
      let products = await Product.getActiveForCatalog(1000, 0);
      
      // Get all families that have products in the catalog
      let families = await ProductFamily.getAll();
      
      // Filter products by selected families if any
      if (selectedFamilyIds.length > 0) {
        products = products.filter(product => 
          selectedFamilyIds.includes(product.family_id)
        );
      }
      
      // Only show families that have visible products
      families = families.filter(family => 
        products.some(p => p.family_id === family.id)
      );
      
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

      // Render the catalog page with the products and families (Dark Nature)
      res.render('pages/catalogo-dark-nature', {
        title: 'Catálogo',
        currentPath: '/catalog',
        currentPage: 'catalogo', // Para header Dark Nature
        layout: false, // ✅ Desabilitar express-ejs-layouts (view standalone)
        produtos: products, // Dark Nature usa 'produtos'
        products: products, // Compatibilidade
        families: families,
        query: req.query,   // Dark Nature usa req.query para filtros
        selectedFamilyIds: selectedFamilyIds,
        siteTitle: 'Gonzaga\'s Art & Shine',
        siteDescription: 'Elegância que nasce da terra',
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