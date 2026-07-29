const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const CatalogController = require('../controllers/CatalogController');
const ProductController = require('../controllers/ProductController'); // Added for product details UC page
const { safeCatalogReturnUrl } = require('../utils/catalogReturnUrl');
const instagramModule = require('../modules/instagram');
const EcommerceSettings = require('../modules/ecommerce/settings/models/EcommerceSettings');
const { formatRow } = require('../services/catalogQueryService');
const GalleryItem = require('../models/GalleryItem');

// Home page - Showcase page with featured products and media gallery
router.get('/', async (req, res) => {
  try {
    let featured = [];
    let families = [];
    
    try {
      const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
      featured = await Product.getFeatured(null, hideOutOfStock);
      const ecommerceSettings = await EcommerceSettings.getAll();
      const pricesIncludeTax = ecommerceSettings.prices_include_tax !== false;
      const taxRate = parseFloat(ecommerceSettings.tax_rate ?? 23) / 100;

      // Format prices for featured products
      featured = featured.map(product => {
        let displayPrice = product.sale_price;
        if (!pricesIncludeTax && displayPrice) {
          displayPrice = parseFloat(displayPrice) * (1 + taxRate);
        }
        return {
          ...product,
          formatted_sale_price: displayPrice ?
            new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(displayPrice) :
            null,
          formatted_purchase_price: product.purchase_price ?
            new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
            null
        };
      });

      families = await ProductFamily.getAll();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without database data
    }
    
    // Media para galeria: public/media/gallery
    const galleryPath = path.join(__dirname, '../public/media/gallery');
    let mediaFiles = [];
    
    try {
      const files = await fs.readdir(galleryPath);
      mediaFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      }).map(file => ({
        filename: file,
        type: 'image',
        path: `/media/gallery/${file}`
      }));
    } catch (error) {
      console.error('Error reading gallery directory:', error);
    }
    
    // Hero image: escolhida no admin (Settings > hero_image) se ainda existir
    // na galeria, senão primeira imagem da galeria, senão placeholder.
    const configuredHeroImage = res.locals.siteSettings && res.locals.siteSettings.hero_image;
    const configuredHeroExists = configuredHeroImage
      && mediaFiles.some((m) => m.path === configuredHeroImage);
    const heroImage = configuredHeroExists
      ? configuredHeroImage
      : (mediaFiles.length > 0 ? mediaFiles[0].path : '/images/placeholder-hero.jpg');

    // Instagram strip — non-blocking; silently degrades to empty array on any error
    let igPosts = [];
    try {
      igPosts = await instagramModule.fetchInstagramFeed(6);
    } catch (_) {}
    
    res.render('index', { 
      title: 'Art&Shine — Elegância que nasce da terra',
      layout: 'layouts/main',
      metaDescription: 'Joias artesanais em prata 925 e pedras naturais. Descubra a coleção Gonzaga\'s Art & Shine — elegância que nasce da terra, feita em Portugal.',
      canonicalUrl: 'https://artnshine.pt/',
      featured: featured || [],
      families: families || [],
      mediaFiles: mediaFiles || [],
      heroImage,
      igPosts,
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      theme: 'dark'
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the homepage.'
    });
  }
});

// Collections page - Show all media images
router.get('/collections', async (req, res) => {
  try {
    // Galeria curada no admin (/admin/gallery) — ordem e legendas definidas lá.
    const imageFiles = (await GalleryItem.getAllActive()).map((item) => ({
      filename: item.filename,
      caption: item.caption,
      path: `/media/gallery/${item.filename}`,
      url: `/media/gallery/${item.filename}`
    }));

    res.render('collections', {
      title: 'Galeria de Peças',
      layout: 'layouts/main',
      metaDescription: 'Galeria de joias artesanais Gonzaga\'s Art & Shine. Prata 925, latão banhado a prata e pedras naturais — ónix, olho-de-tigre, ametista e turquesa.',
      canonicalUrl: 'https://artnshine.pt/collections',
      images: imageFiles,
      user: req.user || null,
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      theme: 'dark',
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading media files:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load media files.'
    });
  }
});

// Collection page - Show products by family
router.get('/collection/:familyIdOrSlug', async (req, res) => {
  try {
    const { familyIdOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(familyIdOrSlug);
    const family = await ProductFamily.getByIdOrSlug(familyIdOrSlug);
    
    if (!family) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Collection not found.'
      }, { layout: false });
    }

    // 301 redirect from numeric ID to slug URL when slug exists
    if (isNumeric && family.slug) {
      return res.redirect(301, `/collection/${family.slug}`);
    }
    
    const rawProducts = await Product.getByFamily(family.id);
    const ecommerceSettings = await EcommerceSettings.getAll();
    const products = rawProducts.map((p) => formatRow(p, ecommerceSettings));
    const families = await ProductFamily.getAll();
    const slugOrId = family.slug || family.id;

    res.render('collection', {
      title: family.name,
      family,
      products,
      families,
      metaDescription: family.description ? family.description.substring(0, 155).replace(/"/g, "'") + '...' : 'Coleção ' + family.name + ' — joias artesanais em prata 925 e pedras naturais. Gonzaga\'s Art & Shine, elegância que nasce da terra.',
      canonicalUrl: 'https://artnshine.pt/collection/' + slugOrId
    });
  } catch (error) {
    console.error('Error loading collection:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the collection.'
    }, { layout: false });
  }
});

// Catalog page
router.get('/catalog', CatalogController.displayCatalog);

// Product detail under construction page
router.get('/product/:id/details-uc', ProductController.showProductDetailUnderConstruction);

// Product detail page
router.get('/product/:id', ProductController.showProductDetailUnderConstruction);

// Product detail route for WhatsApp
router.get('/catalog/product/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { pool } = require('../config/database');
    
    const isNumeric = /^\d+$/.test(idOrSlug);
    const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug) : idOrSlug;

    const [results] = await pool.execute(`
      SELECT p.*, pf.name as family_name,
             GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) as images
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereClause} AND p.is_active = 1
      GROUP BY p.id
    `, [param]);

    // 301 redirect from numeric ID to slug URL when slug exists
    if (isNumeric && results.length > 0 && results[0].slug) {
      return res.redirect(301, `/catalog/product/${results[0].slug}`);
    }
    const id = results.length > 0 ? results[0].id : idOrSlug;
    
    if (results.length === 0) {
      return res.status(404).render('error', { title: 'Não encontrado', message: 'Produto não encontrado' }, { layout: false });
    }
    
    const product = results[0];
    product.images = product.images ? product.images.split(',') : [];
    
    // If product has image_url but no images in product_images, add it
    if (product.image_url && (!product.images || product.images.length === 0)) {
      product.images = [product.image_url];
    } else if (product.image_url && product.images && !product.images.includes(product.image_url)) {
      // Add image_url to the beginning if not already present
      product.images.unshift(product.image_url);
    }
    
    // WhatsApp message
    const whatsappMessage = `Olá! Gostaria de informações sobre:

*${product.name}*
Referência: ${product.reference}
${product.sale_price ? `Preço: €${parseFloat(product.sale_price).toFixed(2)}` : 'Preço sob consulta'}

Ver produto: ${req.protocol}://${req.get('host')}/catalog/product/${id}`;
    
    const whatsappData = {
      number: process.env.WHATSAPP_NUMBER || '351XXXXXXXXX',
      encodedMessage: encodeURIComponent(whatsappMessage)
    };
    
    // Build rich meta description from available fields
    let metaDesc;
    if (product.description && product.description.trim()) {
      metaDesc = product.description.substring(0, 155).replace(/"/g, "'") + '...';
    } else {
      const parts = [product.name];
      if (product.material) parts.push(product.material);
      if (product.family_name) parts.push(product.family_name);
      parts.push("Gonzaga's Art & Shine");
      metaDesc = parts.join(' — ') + '. Elegância que nasce da terra.';
      if (metaDesc.length > 160) metaDesc = metaDesc.substring(0, 157) + '...';
    }

    const productSlugOrId = product.slug || id;
    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    let relatedProducts = [];
    if (product.current_stock <= 0 && product.family_id) {
      const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
      const [related] = await pool.execute(`
        SELECT p.id, p.name, p.sale_price, p.current_stock,
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC LIMIT 1) as image_url,
               pf.name as family_name
        FROM products p
        LEFT JOIN product_families pf ON p.family_id = pf.id
        WHERE p.family_id = ? AND p.id != ? AND p.is_active = 1 ${hideOutOfStock ? 'AND p.current_stock > 0' : ''}
        ORDER BY p.current_stock DESC, p.updated_at DESC
        LIMIT 4
      `, [product.family_id, product.id]);
      relatedProducts = related;
    }

    const whatsappNotifyMsg = encodeURIComponent(
      `Olá! Gostaria de ser avisado(a) quando esta peça estiver disponível:\n\n` +
      `*${product.name}*\nReferência: ${product.reference}\n` +
      `Ver produto: ${baseUrl}/catalog/product/${productSlugOrId}`
    );

    res.render('catalog/product-detail', { 
      product, 
      whatsappData,
      whatsappNotifyMsg,
      relatedProducts,
      catalogBackUrl: safeCatalogReturnUrl(req.query.return),
      layout: 'layouts/main',
      title: `${product.name} - Gonzaga's Art & Shine`,
      siteTitle: 'Gonzaga\'s Art & Shine',
      metaDescription: metaDesc,
      canonicalUrl: `${baseUrl}/catalog/product/${productSlugOrId}`,
      ogImage: product.images && product.images.length > 0 ? `${baseUrl}/media/products/${product.images[0].replace(/\.[^.]+$/, '')}-medium.jpg` : undefined,
      ogType: 'product'
    });
    
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).render('error', { title: 'Erro', message: 'Erro interno' }, { layout: false });
  }
});

// Search Results Page
router.get('/search', async (req, res) => {
  try {
    const { 
      q: query = '', 
      page = 1, 
      sort = 'relevance',
      categories = '',
      inStock,
      priceMin,
      priceMax
    } = req.query;
    
    const { pool } = require('../config/database');
    const limit = 12;
    const offset = (parseInt(page) - 1) * limit;
    
    // Build WHERE conditions
    let whereConditions = ['p.is_active = 1'];
    let params = [];
    
    // Search query
    if (query && query.trim()) {
      whereConditions.push('(p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${query.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Category filter
    if (categories) {
      const categoryIds = categories.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        whereConditions.push(`p.family_id IN (${categoryIds.join(',')})`);
      }
    }
    
    // Stock filter
    if (inStock) {
      whereConditions.push('p.current_stock > 0');
    }
    
    // Price filter
    if (priceMin && !isNaN(priceMin)) {
      whereConditions.push('p.sale_price >= ?');
      params.push(parseFloat(priceMin));
    }
    if (priceMax && !isNaN(priceMax)) {
      whereConditions.push('p.sale_price <= ?');
      params.push(parseFloat(priceMax));
    }
    
    // Build ORDER BY
    let orderBy = 'p.featured DESC, p.created_at DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'p.sale_price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.sale_price DESC';
        break;
      case 'name_asc':
        orderBy = 'p.name ASC';
        break;
      case 'newest':
        orderBy = 'p.created_at DESC';
        break;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
      params
    );
    const totalResults = countResult[0].total;
    const totalPages = Math.ceil(totalResults / limit);
    
    // Get products
    const [products] = await pool.query(`
      SELECT p.*, pf.name as family_name,
             (SELECT pi.image_filename FROM product_images pi 
              WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as main_image,
             p.current_stock > 0 as in_stock
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    // Get categories for filters
    const [categoriesData] = await pool.query(`
      SELECT pf.id, pf.name, COUNT(p.id) as count
      FROM product_families pf
      LEFT JOIN products p ON p.family_id = pf.id AND p.is_active = 1
      GROUP BY pf.id, pf.name
      HAVING count > 0
      ORDER BY pf.name
    `);
    
    // noindex filtered search pages to avoid infinite URL combinations
    const hasFilters = sort !== 'relevance' || categories || inStock || priceMin || priceMax || parseInt(page) > 1;
    const metaRobots = hasFilters ? 'noindex, follow' : 'index, follow';
    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    res.render('catalog/search-results', {
      query: query,
      products: products,
      totalResults: totalResults,
      currentPage: parseInt(page),
      totalPages: totalPages,
      sortBy: sort,
      categories: categoriesData,
      selectedCategories: categories ? categories.split(',') : [],
      inStock: !!inStock,
      priceMin: priceMin,
      priceMax: priceMax,
      title: `Pesquisa: ${query || 'Todos os produtos'}`,
      layout: 'layouts/main',
      metaRobots: metaRobots,
      canonicalUrl: `${baseUrl}/search?q=${encodeURIComponent(query || '')}`
    });
    
  } catch (error) {
    console.error('Search results error:', error);
    res.status(500).render('error', { title: 'Erro', message: 'Erro ao carregar resultados' }, { layout: false });
  }
});

// API endpoint for navigation featured products
router.get('/api/nav-featured', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
    const [featured] = await pool.query(`
      SELECT p.id, p.reference, p.name, p.sale_price,
             (SELECT pi.image_filename FROM product_images pi
              WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as main_image
      FROM products p
      WHERE p.is_active = 1 AND p.featured = 1 ${hideOutOfStock ? 'AND p.current_stock > 0' : ''}
      ORDER BY p.created_at DESC
      LIMIT 3
    `);
    
    res.json({
      success: true,
      data: featured
    });
  } catch (error) {
    console.error('Nav featured API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load navigation featured products'
    });
  }
});

// Redirects para URLs antigas (bookmarks, links externos)
router.get('/instagram', (req, res) => res.redirect(301, '/collections'));
router.get('/instagram-preview', (req, res) => res.redirect(301, '/collections'));
router.get('/instagram-lab', (req, res) => res.redirect(301, '/collections'));

// About page
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'Sobre Nós',
    metaDescription: 'Gonzaga\'s Art & Shine nasceu da paixão por transformar pedras naturais e prata 925 em joias com alma. Elegância que nasce da terra, criada em Portugal.',
    canonicalUrl: 'https://artnshine.pt/about'
  });
});

// Privacy Policy page
router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', {
    title: 'Política de Privacidade'
  });
});

// Terms of Service page
router.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', {
    title: 'Termos de Serviço'
  });
});

module.exports = router; 