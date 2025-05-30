const Product = require('../models/Product');

class CatalogController {
  /**
   * Display the public product catalog page.
   * Fetches active and catalog-visible products with pagination.
   */
  static async displayCatalog(req, res) {
    try {
      res.render('public/catalog', { // Este é o novo 'views/public/catalog.ejs'
        title: 'Catálogo em Construção',
        currentPath: '/catalog', // Para o header, se necessário
        layout: 'layouts/main' // Mantendo o layout, se aplicável
      });
    } catch (error) {
      console.error('Error rendering catalog placeholder page:', error);
      res.status(500).send('Error loading page. Please try again later.');
    }
  }
}

module.exports = CatalogController;
