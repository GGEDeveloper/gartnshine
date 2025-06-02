const Product = require('../models/Product');
const path = require('path'); // Adicionado
const fs = require('fs'); // Adicionado

class CatalogController {
  /**
   * Display the public product catalog page.
   */
  static async displayCatalog(req, res) {
    try {
      // Check if catalog page is enabled in site settings
      if (res.locals.siteSettings && res.locals.siteSettings.catalog_page_enabled === false) {
        // DISABLED: Show "Catálogo em Construção" page
        // The 'public/catalog.ejs' template is used, which has the title 'Catálogo em Construção'.
        console.log('[CatalogController] Catalog page is DISABLED. Rendering construction page.');
        return res.status(200).render('public/catalog', { 
          title: 'Catálogo em Construção',
          currentPath: '/catalog', 
          layout: 'layouts/main',
          // Add any specific flags if the construction page needs to know it's in 'disabled' mode
        });
      }

      // ENABLED: Show the actual live catalog page.
      // For now, this also points to 'public/catalog.ejs'. 
      // When the live catalog is fully developed, this section will render it with actual data.
      console.log('[CatalogController] Catalog page is ENABLED. Rendering catalog page.');
      const templatePath = path.join(__dirname, '../views/public/catalog.ejs');
      // console.log('[CatalogController] Attempting to render template at absolute path:', templatePath); // Optional: for debugging
      // if (fs.existsSync(templatePath)) { // Optional: for debugging
      //   console.log('[CatalogController] Template file confirmed to exist at:', templatePath);
      // } else {
      //   console.error('[CatalogController] CRITICAL: Template file DOES NOT EXIST at:', templatePath);
      // }

      res.render('public/catalog', { 
        title: 'Catálogo', // Title for the live/enabled catalog page
        currentPath: '/catalog',
        layout: 'layouts/main' 
        // TODO: When live, fetch and pass product data here
      });
    } catch (error) {
      // Logs de erro mais detalhados
      console.error('[CatalogController] Error in displayCatalog:', error); 
      console.error('[CatalogController] Error rendering catalog placeholder page message:', error.message);
      console.error('[CatalogController] Stack trace:', error.stack);
      res.status(500).send('Error loading page. Please try again later.');
    }
  }
}

module.exports = CatalogController;