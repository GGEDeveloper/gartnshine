const Product = require('../models/Product');

class CatalogController {
  /**
   * Display the public product catalog page.
   * Fetches active and catalog-visible products with pagination.
   */
  static async displayCatalog(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Number of products per page
    const offset = (page - 1) * limit;

    try {
      const products = await Product.getActiveForCatalog(limit, offset);
      const totalProducts = await Product.countActiveForCatalog();
      const totalPages = Math.ceil(totalProducts / limit);

      // For now, just send JSON to test. We'll render a view later.
      // res.json({ 
      //   products,
      //   currentPage: page,
      //   totalPages,
      //   totalProducts
      // });

      // TODO: Replace with actual view rendering
      res.render('public/catalog', {
        title: 'Product Catalog',
        products: products,
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        limit: limit,
        // breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Catalog' }],
        layout: 'layouts/main' // Using the existing main layout
      });

    } catch (error) {
      console.error('Error fetching catalog products:', error);
      // req.flash('error_msg', 'Could not load the catalog. Please try again later.');
      // res.redirect('/'); // Or render an error page
      res.status(500).send('Error loading catalog. Please try again later.');
    }
  }
}

module.exports = CatalogController;
