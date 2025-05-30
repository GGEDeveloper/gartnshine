const Product = require('../models/Product');
const path = require('path'); // Adicionado
const fs = require('fs'); // Adicionado

class CatalogController {
  /**
   * Display the public product catalog page.
   */
  static async displayCatalog(req, res) {
    try {
      // Caminho absoluto para diagnóstico
      const templatePath = path.join(__dirname, '../views/public/catalog.ejs');
      console.log('[CatalogController] Attempting to render template at absolute path:', templatePath);

      // Verificar se o ficheiro existe com fs
      if (fs.existsSync(templatePath)) {
        console.log('[CatalogController] Template file confirmed to exist at:', templatePath);
      } else {
        console.error('[CatalogController] CRITICAL: Template file DOES NOT EXIST at:', templatePath);
      }

      res.render('public/catalog', { 
        title: 'Catálogo em Construção',
        currentPath: '/catalog',
        layout: 'layouts/main' 
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