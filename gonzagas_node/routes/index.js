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

// Home page - Showcase page with featured products and media gallery
router.get('/', async (req, res) => {
  try {
    let featured = [];
    let families = [];
    
    try {
      featured = await Product.getFeatured();

      // Format prices for featured products
      featured = featured.map(product => ({
        ...product,
        formatted_sale_price: product.sale_price ? 
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
          null,
        formatted_purchase_price: product.purchase_price ?
          new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
          null
      }));

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
    
    // Hero image: primeira imagem da galeria (poster/fallback; placeholders podem estar vazios)
    const heroImage = mediaFiles.length > 0 ? mediaFiles[0].path : '/images/imagem-nao-disponivel.svg';
    
    res.render('index', { 
      title: 'Art&Shine — Elegância que nasce da terra',
      layout: 'layouts/main',
      metaDescription: 'Joias artesanais em prata 925 e pedras naturais. Descubra a coleção Gonzaga\'s Art & Shine — elegância que nasce da terra, feita em Portugal.',
      canonicalUrl: 'https://artnshine.pt/',
      featured: featured || [],
      families: families || [],
      mediaFiles: mediaFiles || [],
      heroImage,
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      showcaseTheme: true,
      useInstagramPreviewCssOnHome: process.env.HOME_IG_PREVIEW_CSS === 'true',
      theme: {
        colorPrimary: '#05070a',
        colorSecondary: '#0b1016',
        colorAccent: '#A8A8A8',
        colorText: '#f4f6f8',
        colorHighlight: '#C0C0C0'
      }
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
    // Try multiple possible media paths
    const possiblePaths = [
      path.join(__dirname, '../public/media/gallery'), // New dedicated gallery path
      path.join(__dirname, '../../media'),
      path.join(__dirname, '../public/media'),
      path.join(__dirname, '../media')
    ];
    
    let files = [];
    let mediaPath = '';
    
    // Find the first valid path
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        files = await fs.readdir(possiblePath);
        mediaPath = possiblePath;
        break;
      } catch (err) {
        continue;
      }
    }
    
    if (files.length === 0) {
      console.error('No valid media directory found');
      return res.status(500).render('error', {
        title: 'Error',
        message: 'Media directory not found.'
      });
    }
    
    // Filter only image files and exclude banner-about.jpg
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      const isNotBanner = !file.toLowerCase().includes('banner-about');
      return isImage && isNotBanner;
    }).map(file => ({
      filename: file,
      path: `/media/${file}`,
      url: `/media/${file}`
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
      theme: {
        colorPrimary: '#05070a',
        colorSecondary: '#0b1016',
        colorAccent: '#A8A8A8',
        colorText: '#f4f6f8',
        colorHighlight: '#C0C0C0'
      },
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
      });
    }

    // 301 redirect from numeric ID to slug URL when slug exists
    if (isNumeric && family.slug) {
      return res.redirect(301, `/collection/${family.slug}`);
    }
    
    const products = await Product.getByFamily(family.id);
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
    });
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
      return res.status(404).render('error', { message: 'Produto não encontrado' });
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
      const [related] = await pool.execute(`
        SELECT p.id, p.name, p.sale_price, p.current_stock,
               (SELECT pi.image_filename FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC LIMIT 1) as image_url,
               pf.name as family_name
        FROM products p
        LEFT JOIN product_families pf ON p.family_id = pf.id
        WHERE p.family_id = ? AND p.id != ? AND p.is_active = 1
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
      ogImage: product.images && product.images.length > 0 ? `${baseUrl}/uploads/products/${product.images[0]}` : undefined,
      ogType: 'product'
    });
    
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).render('error', { message: 'Erro interno' });
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
    res.status(500).render('error', { message: 'Erro ao carregar resultados' });
  }
});

// API endpoint for navigation featured products
router.get('/api/nav-featured', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const [featured] = await pool.query(`
      SELECT p.id, p.reference, p.name, p.sale_price,
             (SELECT pi.image_filename FROM product_images pi 
              WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as main_image
      FROM products p
      WHERE p.is_active = 1 AND p.featured = 1
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

// Instagram layout preview (standalone, sem layout do site)
router.get('/instagram-preview', async (req, res) => {
  let instagramPosts = [];
  let instagramReels = [];
  let instagramPreviewError = false;
  try {
    [instagramPosts, instagramReels] = await Promise.all([
      instagramModule.fetchInstagramPosts(8),
      instagramModule.fetchInstagramReels(4)
    ]);
  } catch (err) {
    instagramPreviewError = true;
    console.error('Instagram preview route:', err.code || '', err.message);
  }
  res.render('instagram-preview', {
    layout: false,
    instagramPosts,
    instagramReels,
    instagramPreviewError
  });
});

// Instagram — laboratório (comentários / resumo / capacidades; noindex)
router.get('/instagram-lab', async (req, res) => {
  const caps = instagramModule.getCapabilities();
  let mediaError = null;
  let media = [];
  try {
    media = await instagramModule.fetchInstagramFeed(9);
  } catch (err) {
    mediaError = err.code || 'load_failed';
    console.error('Instagram lab media:', err.message);
  }

  const items = [];
  const slice = media.slice(0, 8);
  const fbOn = caps.facebookGraph && caps.facebookGraph.enabled;

  if (fbOn && slice.length) {
    for (const m of slice) {
      let summary = null;
      let summaryErr = null;
      let comments = [];
      let commentsErr = null;
      try {
        summary = await instagramModule.fetchMediaEngagementSummary(m.id);
      } catch (e) {
        summaryErr = e.message;
      }
      try {
        const pack = await instagramModule.fetchCommentsForMedia(m.id, {
          limit: 5
        });
        comments = pack.data || [];
      } catch (e) {
        commentsErr = e.message;
      }
      items.push({
        media: m,
        summary,
        summaryErr,
        comments,
        commentsErr,
        fbSkipped: false
      });
    }
  } else {
    for (const m of slice) {
      items.push({
        media: m,
        summary: null,
        summaryErr: null,
        comments: [],
        commentsErr: null,
        fbSkipped: true
      });
    }
  }

  res.render('instagram-lab', {
    layout: false,
    caps,
    items,
    mediaError
  });
});

// Instagram feed (graph.instagram.com)
router.get('/instagram', async (req, res) => {
  const base = (process.env.BASE_URL || 'https://artnshine.pt').replace(/\/$/, '');
  let posts = [];
  let instagramError = null;
  try {
    posts = await instagramModule.fetchInstagramFeed(9);
  } catch (err) {
    const code = err.code;
    instagramError = code === 'INSTAGRAM_NO_TOKEN' ? 'not_configured' : 'load_failed';
    console.error('Instagram feed route:', code || 'error', err.message);
  }
  res.render('instagram', {
    title: 'Instagram',
    metaDescription:
      'Últimas publicações de Gonzaga\'s Art & Shine no Instagram — joias em prata e inspiração natural.',
    canonicalUrl: `${base}/instagram`,
    posts,
    instagramError,
    showcaseTheme: true
  });
});

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