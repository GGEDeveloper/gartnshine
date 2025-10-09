const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Models
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');

// Controllers
const CatalogController = require('../controllers/CatalogController');
const ProductController = require('../controllers/ProductController');
const OrderController = require('../controllers/OrderController');
const AdminController = require('../controllers/AdminController');

// Middleware
const { requireAdmin } = require('../middleware/auth');
const { logActivity } = require('../middleware/activity');

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

      families = await ProductFamily.getAllWithCount();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without database data
    }
    
    // Get media files for the gallery
    const mediaPath = path.join(__dirname, '../../media');
    let mediaFiles = [];
    
    try {
      console.log(`Reading media directory: ${mediaPath}`);
      const files = await fs.readdir(mediaPath);
      console.log(`Found ${files.length} files in media directory`);
      
      mediaFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4'].includes(ext);
      }).map(file => ({
        filename: file,
        type: path.extname(file).toLowerCase() === '.mp4' ? 'video' : 'image',
        path: `/media/${file}`
      }));
      
      console.log(`Filtered to ${mediaFiles.length} media files`);
    } catch (error) {
      console.error(`Error reading media directory ${mediaPath}:`, error);
    }
    
    // If no media files found, try fallback path
    if (mediaFiles.length === 0) {
      try {
        const fallbackPath = path.join(__dirname, '../media');
        console.log(`Trying fallback media path: ${fallbackPath}`);
        const files = await fs.readdir(fallbackPath);
        console.log(`Found ${files.length} files in fallback media directory`);
        
        mediaFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.mp4'].includes(ext);
        }).map(file => ({
          filename: file,
          type: path.extname(file).toLowerCase() === '.mp4' ? 'video' : 'image',
          path: `/media/${file}`
        }));
        
        console.log(`Filtered to ${mediaFiles.length} media files from fallback`);
      } catch (error) {
        console.error('Error reading fallback media directory:', error);
      }
    }
    
    console.log(`Rendering index with ${mediaFiles.length} media files`);
    console.log('Featured products for template:', JSON.stringify(featured, null, 2)); // Log featured products
    res.render('index', { 
      title: 'Home',
      layout: false, // ✅ Desabilitar express-ejs-layouts (view standalone)
      currentPage: 'home', // Para header Dark Nature
      featured: featured || [],
      families: families || [],
      mediaFiles: mediaFiles || [],
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra'
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
        console.log(`Using media path: ${mediaPath}`);
        break;
      } catch (err) {
        console.log(`Path not found: ${possiblePath}`);
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
      title: 'Galeria',
      currentPage: 'collections',
      layout: 'layout', // Dark Nature layout
      images: imageFiles,
      user: req.user || null,
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
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
router.get('/collection/:familyId', async (req, res) => {
  try {
    const familyId = parseInt(req.params.familyId);
    const family = await ProductFamily.getById(familyId);
    
    if (!family) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Collection not found.'
      });
    }
    
    const products = await Product.getByFamily(familyId);
    const families = await ProductFamily.getAll();
    
    res.render('collection', {
      title: family.name,
      currentPage: 'collection',
      layout: 'layout', // Dark Nature layout
      family,
      products,
      families,
      siteTitle: 'Gonzaga\'s Art & Shine'
    });
  } catch (error) {
    console.error('Error loading collection:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the collection.'
    });
  }
});

// ==========================================
// PORTUGUESE CATALOG ROUTE - Dark Nature
// Filters by stone_type (onix, olho-de-tigre, ametista, turquesa)
// ==========================================
router.get('/catalogo', async (req, res) => {
  try {
    console.log('[Catalogo PT] Query params:', req.query);
    
    // Get all active products
    let products = await Product.getActiveForCatalog(1000, 0);
    
    // Filter by stone type if specified
    if (req.query.pedra) {
      const stoneName = req.query.pedra; // onix, olho-de-tigre, ametista, turquesa
      products = products.filter(p => p.stone_type === stoneName);
      console.log(`[Catalogo PT] Filtering by stone: ${stoneName}, found ${products.length} products`);
    }
    
    // Get all families for filter UI
    let families = await ProductFamily.getAll();
    
    // Format prices and image paths for display
    products = products.map(product => ({
      ...product,
      // Fix image path
      image_url: product.image_url ? `/uploads/products/${product.image_url}` : '/images/placeholders/product-dark.jpg',
      imagem_principal: product.imagem_principal ? `/uploads/products/${product.imagem_principal}` : '/images/placeholders/product-dark.jpg',
      // Format prices
      formatted_sale_price: product.sale_price ? 
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.sale_price)) :
        null,
      formatted_purchase_price: product.purchase_price ?
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(product.purchase_price)) :
        null
    }));

    // Render Dark Nature catalog
    res.render('pages/catalogo-dark-nature', {
      title: 'Catálogo - Joias Artesanais em Prata 925 | Gonzaga Art & Shine',
      currentPath: '/catalogo',
      currentPage: 'catalogo',
      layout: false,
      produtos: products,
      products: products,
      families: families,
      query: req.query,
      selectedFamilyIds: [],
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      helpers: {
        isFamilySelected: function(familyId) {
          return '';
        }
      }
    });
    
  } catch (error) {
    console.error('[Catalogo PT] Error:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar catálogo',
      layout: false
    });
  }
});

// Catalog page (English - families system)
router.get('/catalog', CatalogController.displayCatalog);

// Product detail under construction page
router.get('/product/:id/details-uc', ProductController.showProductDetailUnderConstruction);

// Product detail page
router.get('/product/:id', ProductController.showProductDetailUnderConstruction);

// Product detail route for WhatsApp
router.get('/catalog/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = require('../config/database');
    
    const [results] = await pool.execute(`
      SELECT p.*, pf.name as family_name,
             GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) as images
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ? AND p.is_active = 1
      GROUP BY p.id
    `, [id]);
    
    if (results.length === 0) {
      return res.status(404).render('error', { message: 'Produto não encontrado' });
    }
    
    const product = results[0];
    product.images = product.images ? product.images.split(',') : [];
    
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
    
    // TEMPORÁRIO: Usando layout Dark Nature
    // TODO: Criar view Dark Nature completa para detalhes de produto
    res.render('catalog/product-detail-content', { 
      product, 
      whatsappData,
      layout: 'layout', // Dark Nature layout (temporário)
      currentPage: 'product',
      title: `${product.name} - Gonzaga's Art & Shine`,
      siteTitle: 'Gonzaga\'s Art & Shine'
    });
    
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).render('error', { message: 'Erro interno' });
  }
});

// Product Detail V2 - Modern enhanced view
router.get('/catalog/product-v2/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = require('../config/database');
    
    const [results] = await pool.execute(`
      SELECT p.*, pf.name as family_name,
             GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) as images
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ? AND p.is_active = 1
      GROUP BY p.id
    `, [id]);
    
    if (results.length === 0) {
      return res.status(404).render('error', { message: 'Produto não encontrado' });
    }
    
    const product = results[0];
    product.images = product.images ? product.images.split(',') : [];
    
    // WhatsApp message
    const whatsappMessage = `Olá! Gostaria de informações sobre:

*${product.name}*
Referência: ${product.reference}
${product.sale_price ? `Preço: €${parseFloat(product.sale_price).toFixed(2)}` : 'Preço sob consulta'}

Ver produto: ${req.protocol}://${req.get('host')}/catalog/product-v2/${id}`;

    const whatsappData = {
      number: process.env.WHATSAPP_NUMBER || '351920000000',
      message: encodeURIComponent(whatsappMessage),
      url: `https://wa.me/${process.env.WHATSAPP_NUMBER || '351920000000'}?text=${encodeURIComponent(whatsappMessage)}`
    };
    
    // Additional data for V2 template
    product.specifications = {
      material: product.material || 'Prata 925',
      style: product.style || 'Artesanal',
      stock: product.current_stock,
      reference: product.reference
    };
    
    // TEMPORÁRIO: Usando layout Dark Nature
    // TODO: Criar view Dark Nature completa para detalhes de produto v2
    res.render('catalog/product-detail-content', { 
      product, 
      whatsappData,
      layout: 'layout', // Dark Nature layout (temporário)
      currentPage: 'product',
      title: `${product.name} - Gonzaga's Art & Shine`,
      siteTitle: 'Gonzaga\'s Art & Shine'
    });
    
  } catch (error) {
    console.error('Product V2 error:', error);
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
      layout: 'layout', // Dark Nature layout
      siteTitle: 'Gonzaga\'s Art & Shine'
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

// Product Detail Page Dark Nature (Nova rota principal para produtos)
router.get('/produto/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { pool } = require('../config/database');
    
    console.log('[PDP] Accessing product with slug:', slug);
    
    // Buscar produto por slug (ou ID como fallback) - Query simplificada primeiro
    const [results] = await pool.execute(`
      SELECT p.*, 
             pf.name as family_name,
             (SELECT GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) 
              FROM product_images pi 
              WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1
      LIMIT 1
    `, [slug, slug]);
    
    console.log('[PDP] Query results:', results.length, 'products found');
    
    if (results.length === 0) {
      return res.status(404).render('error-404', { 
        message: 'Produto não encontrado',
        layout: false
      });
    }
    
    const produto = results[0];
    
    // Processar imagens
    const allImages = produto.images ? produto.images.split(',') : [];
    produto.imagem_principal = allImages.length > 0 ? `/uploads/products/${allImages[0]}` : '/images/placeholders/product-dark.jpg';
    produto.imagens_galeria = allImages.slice(1).map(img => `/uploads/products/${img}`);
    
    // Mapear campos do DB para o formato esperado pela view
    produto.nome = produto.name;
    produto.preco = produto.sale_price;
    produto.preco_formatado = produto.sale_price ? 
      new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(produto.sale_price)) : 
      null;
    produto.descricao = produto.description;
    produto.slug = produto.slug || produto.id;
    
    // Stone data (se disponível no DB, senão usar defaults)
    produto.stone_type = produto.stone_type || 'natural';
    produto.pedra_nome = produto.stone_name || 'Pedra Natural';
    produto.stone_origin = produto.stone_origin || null;
    produto.stone_properties = produto.stone_properties || null;
    
    // Metal data
    produto.metal_nome = produto.metal_name || 'Prata 925';
    produto.metal_finish = produto.metal_finish || 'prata_925';
    produto.metal_purity = produto.metal_purity || '925';
    
    // Artisan data (se disponível)
    produto.artisan_name = produto.artisan_name || null;
    produto.artisan_workshop = produto.artisan_workshop || null;
    produto.artisan_specialty = produto.artisan_specialty || null;
    produto.crafting_technique = produto.crafting_technique || null;
    
    // Additional specs
    produto.peso = produto.weight || null;
    produto.dimensoes = produto.dimensions || null;
    produto.disponibilidade = produto.current_stock > 0 ? 'Em stock' : 'Esgotado';
    
    // SEO
    produto.meta_title = produto.meta_title || `${produto.nome} - Gonzaga Art & Shine`;
    produto.meta_description = produto.meta_description || produto.descricao;
    
    // Buscar produtos relacionados (mesma pedra ou mesmo metal)
    const [relatedResults] = await pool.execute(`
      SELECT p.*, pf.name as family_name,
             (SELECT pi.image_filename FROM product_images pi 
              WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as main_image
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE p.is_active = 1 
        AND p.id != ?
        AND (p.stone_type = ? OR p.metal_finish = ?)
      ORDER BY p.featured DESC, RAND()
      LIMIT 4
    `, [produto.id, produto.stone_type, produto.metal_finish]);
    
    // Format related products
    const produtosRelacionados = relatedResults.map(p => ({
      ...p,
      nome: p.name,
      preco: p.sale_price,
      preco_formatado: p.sale_price ? 
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(p.sale_price)) : 
        null,
      imagem_principal: p.main_image ? `/uploads/products/${p.main_image}` : '/images/placeholders/product-dark.jpg',
      pedra_nome: p.stone_name || 'Pedra Natural',
      metal_nome: p.metal_name || 'Prata 925',
      slug: p.slug || p.id
    }));
    
    // Increment product views (optional analytics)
    await pool.execute('UPDATE products SET views = views + 1 WHERE id = ?', [produto.id]);
    
    // Render PDP Dark Nature
    res.render('pages/produto-dark-nature', {
      layout: false, // Standalone page
      currentPage: 'produto',
      title: produto.meta_title,
      produto: produto,
      produtosRelacionados: produtosRelacionados,
      siteTitle: 'Gonzaga\'s Art & Shine',
      siteDescription: 'Elegância que nasce da terra',
      canonicalUrl: `${req.protocol}://${req.get('host')}/produto/${produto.slug}`
    });
    
  } catch (error) {
    console.error('[PDP ERROR] Full error:', error);
    console.error('[PDP ERROR] Stack:', error.stack);
    
    // Render error page with more details in development
    res.status(500).render('error', {
      title: 'Erro',
      message: 'Erro ao carregar detalhes do produto',
      error: process.env.NODE_ENV === 'development' ? error : {},
      layout: 'layout'
    });
  }
});

// Galeria Autêntica Dark Nature - Mineral Journey
// Manifesto Dark Nature - Brand Philosophy
router.get('/manifesto', (req, res) => {
  try {
    const manifestoData = {
      hero: {
        kicker: 'Manifesto Dark Nature',
        titulo: 'Elegância que Nasce da Terra',
        essencia: 'Cada joia carrega consigo milhões de anos de história terrestre e gerações de sabedoria artesanal portuguesa. Não criamos apenas acessórios - revelamos a alma ancestral dos minerais.'
      },
      filosofia: {
        principios: [
          {
            numero: '01',
            titulo: 'Autenticidade Absoluta',
            descricao: 'Zero elementos sintéticos. Cada pedra é genuína, cada processo é real, cada história é verdadeira. Não inventamos origens - honramos a verdade mineral.'
          },
          {
            numero: '02', 
            titulo: 'Origem Rastreável',
            descricao: 'Sabemos exatamente onde cada mineral nasceu. Das minas do Brasil às montanhas do Tibete - transparência total do caminho da terra às suas mãos.'
          },
          {
            numero: '03',
            titulo: 'Tradição Artesanal',
            descricao: 'Técnicas portuguesas centenárias passadas de geração em geração. Ferramentas que contam histórias. Mestres que honram o conhecimento ancestral.'
          },
          {
            numero: '04',
            titulo: 'Harmonia Natural',
            descricao: 'Respeitamos o tempo da terra e o ritmo do artesão. Beleza que emerge organicamente do encontro entre mineral e mestre, nunca forçada.'
          }
        ]
      },
      pedras: {
        quaternario: 'As 4 Pedras Sagradas representam os elementos fundamentais da existência: Terra (Ónix), Fogo (Olho-de-Tigre), Éter (Ametista), Água (Turquesa). Cada uma carrega propriedades únicas e uma história milenar.',
        colecoes: [
          {
            pedra: 'onix',
            nome: 'Ónix',
            essencia: 'Força primordial das profundezas vulcânicas',
            elemento: 'Terra',
            propriedades: 'Proteção ancestral, grounding, força interior'
          },
          {
            pedra: 'olho-de-tigre',
            nome: 'Olho-de-Tigre', 
            essencia: 'Coragem dourada capturada em fibra mineral',
            elemento: 'Fogo',
            propriedades: 'Clareza mental, decisão, proteção'
          },
          {
            pedra: 'ametista',
            nome: 'Ametista',
            essencia: 'Sabedoria cristalina dos geodas ancestrais',
            elemento: 'Éter',
            propriedades: 'Transmutação, intuição, serenidade'
          },
          {
            pedra: 'turquesa',
            nome: 'Turquesa',
            essencia: 'Proteção milenar dos oceanos antigos',
            elemento: 'Água',
            propriedades: 'Comunicação autêntica, cura emocional'
          }
        ]
      },
      tradicao: {
        heranca: 'Mais de 200 anos de tradição joalheira portuguesa',
        mestres: 'Cada artesão especializa-se numa pedra sagrada durante toda a vida',
        compromisso: 'Zero produção em massa. Cada peça é única como o mineral que a originou.',
        oficinas: 'Ateliers tradicionais no Norte de Portugal, onde o tempo ainda tem outro ritmo'
      }
    };
    
    res.render('pages/manifesto-dark-nature', {
      currentPage: 'manifesto',
      title: 'Manifesto Dark Nature - Elegância que Nasce da Terra | Gonzaga Art & Shine',
      layout: false, // ✅ Standalone page - disable express-ejs-layouts wrapper
      manifestoData,
      meta: {
        description: 'O manifesto da filosofia Dark Nature. Elegância que nasce da terra através de 4 pedras sagradas e artesanato português ancestral com mais de 200 anos de tradição.',
        keywords: 'manifesto dark nature, filosofia joias artesanais, elegância terra, 4 pedras sagradas, artesanato português, tradição familiar',
        canonical: `${req.protocol}://${req.get('host')}/manifesto`
      }
    });
    
  } catch (error) {
    console.error('Error loading manifesto:', error);
    res.status(500).render('error', { error: 'Erro ao carregar manifesto', layout: false });
  }
});

// Artesãos Dark Nature - Mestres das Pedras
router.get('/artesaos', (req, res) => {
  try {
    const artesaosData = {
      intro: {
        titulo: 'Artesãos Tradicionais Portugueses',
        descricao: 'Trabalhamos com oficinas tradicionais do Norte de Portugal que preservam técnicas centenárias de joalharia. Cada artesão desenvolve uma especialização profunda com as pedras sagradas, honrando a tradição familiar e o conhecimento ancestral.',
        nota: 'Profiles individuais completos dos mestres em breve'
      },
      valores: [
        {
          icon: '🏛️',
          titulo: 'Tradição Familiar',
          descricao: 'Oficinas com mais de 200 anos de história joalheira portuguesa'
        },
        {
          icon: '⚒️',
          titulo: 'Técnicas Centenárias',
          descricao: 'Métodos artesanais passados de geração em geração'
        },
        {
          icon: '💎',
          titulo: 'Especialização Profunda',
          descricao: 'Cada artesão dedica-se a uma pedra sagrada durante toda a vida'
        },
        {
          icon: '🤝',
          titulo: 'Compromisso Autêntico',
          descricao: 'Zero produção em massa - cada peça é única e assinada'
        }
      ],
      processo: {
        titulo: 'O Processo Artesanal',
        etapas: [
          {
            numero: '01',
            nome: 'Seleção Mineral',
            descricao: 'Cada pedra é escolhida pela sua energia, veios únicos e história geológica'
          },
          {
            numero: '02',
            nome: 'Lapidação Manual',
            descricao: 'Revelação cuidadosa da beleza interior do mineral com ferramentas tradicionais'
          },
          {
            numero: '03',
            nome: 'Fundição Prata 925',
            descricao: 'Alquimia ancestral transformando metal puro em base para a pedra'
          },
          {
            numero: '04',
            nome: 'União Sagrada',
            descricao: 'Montagem que honra tanto o mineral quanto o metal, criando harmonia perfeita'
          }
        ]
      },
      pedras: [
        {
          pedra: 'onix',
          nome: 'Ónix',
          especialidade: 'Especialistas em Ónix Negro',
          descricao: 'Ateliers especializados em revelar a força primordial do ónix vulcânico através de técnicas que preservam os veios naturais únicos de cada pedra.',
          tecnicas: ['Cravação protetora', 'Lapidação preservando veios', 'Polimento espelhado ancestral']
        },
        {
          pedra: 'olho-de-tigre',
          nome: 'Olho-de-Tigre',
          especialidade: 'Mestres da Chatoyância',
          descricao: 'Oficinas dedicadas a revelar os veios dourados capturados na fibra mineral, seguindo a direção natural da chatoyância sem forçar o brilho.',
          tecnicas: ['Corte direccional de fibras', 'Enhancement natural chatoyância', 'Preservação matriz crocidolite']
        },
        {
          pedra: 'ametista',
          nome: 'Ametista',
          especialidade: 'Artesãos de Cristais',
          descricao: 'Mestres que trabalham em harmonia com a geometria sagrada hexagonal dos cristais, respeitando a transparência e pureza violeta de cada geodo.',
          tecnicas: ['Facetação hexagonal tradicional', 'Clarity natural', 'Cravação preservando transparência']
        },
        {
          pedra: 'turquesa',
          nome: 'Turquesa',
          especialidade: 'Guardiões da Matrix',
          descricao: 'Oficinas especializadas em preservar a rocha-mãe natural da turquesa, honrando imperfeições como marcas de autenticidade mineral milenar.',
          tecnicas: ['Matrix preservation', 'Estabilização natural', 'Montagem honrando imperfeições']
        }
      ]
    };
    
    res.render('pages/artesaos-dark-nature', {
      currentPage: 'artesaos',
      title: 'Nossos Artesãos - Mestres das 4 Pedras Sagradas | Gonzaga Art & Shine',
      artesaosData,
      meta: {
        description: 'Conheça os artesãos tradicionais portugueses especializados nas 4 pedras sagradas: Ónix, Olho-de-Tigre, Ametista, Turquesa. Técnicas centenárias e tradição familiar com mais de 200 anos.',
        keywords: 'artesãos portugueses, mestres joalheria, tradição artesanal portugal, técnicas centenárias, oficinas tradicionais, ónix olho-de-tigre ametista turquesa',
        canonical: `${req.protocol}://${req.get('host')}/artesaos`
      }
    });
    
  } catch (error) {
    console.error('Error loading artesãos:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar artesãos'
    });
  }
});

// Shopping Cart Page
router.get('/cart', (req, res) => {
  try {
    res.render('pages/cart-dark-nature', {
      currentPage: 'cart',
      title: 'Carrinho de Compras - Gonzaga Art & Shine',
      layout: false, // ✅ Standalone page - disable express-ejs-layouts wrapper
      meta: {
        description: 'Reveja os seus produtos selecionados e proceda ao checkout seguro.',
        keywords: 'carrinho compras, checkout, joias artesanais portuguesas'
      }
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).render('error', { error: 'Erro ao carregar carrinho', layout: false });
  }
});

// Add to cart API endpoint (for AJAX)
router.post('/api/cart/add', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Session-based cart (optional, além do localStorage)
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    const existingItem = req.session.cart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        addedAt: new Date()
      });
    }
    
    res.json({ 
      success: true, 
      cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Erro ao adicionar ao carrinho' });
  }
});

// Checkout Page (FASE 2 - Day 3-5)
router.get('/checkout', (req, res) => {
  try {
    res.render('pages/checkout-dark-nature', {
      currentPage: 'checkout',
      title: 'Checkout Seguro - Gonzaga Art & Shine',
      layout: false, // ✅ Standalone page - disable express-ejs-layouts wrapper
      step: 1,
      meta: {
        description: 'Finalize a sua compra de forma segura com métodos de pagamento portugueses.',
        keywords: 'checkout seguro, pagamento mb way, compra joias portugal'
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).render('error', { error: 'Erro no checkout', layout: false });
  }
});

// Checkout steps (optional individual URLs)
router.get('/checkout/shipping', (req, res) => {
  res.redirect('/checkout#shipping');
});

router.get('/checkout/payment', (req, res) => {
  res.redirect('/checkout#payment');
});

// Galeria Dark Nature - Showcase jornada mineral (Lote 1)
router.get('/galeria', async (req, res) => {
  try {
    // Dados das 4 pedras (usar sistema existente)
    const pedrasInfo = {
      onix: {
        nome: 'Ónix',
        essencia: 'Força em Negro Profundo',
        origem: 'Brasil - Formação Vulcânica',
        chakra: 'Raiz',
        propriedades: 'Proteção ancestral, força interior, grounding'
      },
      'olho-de-tigre': {
        nome: 'Olho-de-tigre', 
        essencia: 'Poder Dourado da Terra',
        origem: 'África do Sul - Metamorfose Crocidolite',
        chakra: 'Plexo Solar', 
        propriedades: 'Coragem, clareza mental, proteção'
      },
      ametista: {
        nome: 'Ametista',
        essencia: 'Sabedoria do Crepúsculo', 
        origem: 'Brasil - Cristalização em Geodas',
        chakra: 'Terceiro Olho',
        propriedades: 'Transmutação, intuição, serenidade'
      },
      turquesa: {
        nome: 'Turquesa',
        essencia: 'Guardião dos Oceanos Antigos',
        origem: 'Tibete - Mineral Secundário', 
        chakra: 'Garganta',
        propriedades: 'Proteção viajantes, comunicação autêntica'
      }
    };
    
    // Assets da galeria (com os 4 que temos do Lote 1)
    const galleryAssets = {
      jornada: [
        {
          id: 'caverna-hero',
          src: '/gallery/dark-nature/hero/caverna-primordial-hero.jpg',
          titulo: 'Origem Primordial',
          descricao: 'Nas profundezas da terra nascem os minerais sagrados',
          categoria: 'origem'
        },
        {
          id: 'prata-onix',
          src: '/gallery/dark-nature/transformacao/prata-abracando-onix.jpg', 
          titulo: 'Alquimia Ancestral',
          descricao: 'Prata 925 líquida abraça o ónix numa união sagrada',
          categoria: 'transformacao',
          pedra: 'onix'
        },
        {
          id: 'bancada-artesao',
          src: '/gallery/dark-nature/transformacao/bancada-artesao-penumbra.jpg',
          titulo: 'Tradição Portuguesa', 
          descricao: 'Ferramentas centenárias nas mãos de mestres artesãos',
          categoria: 'transformacao'
        },
        {
          id: 'quaternario-natural',
          src: '/gallery/dark-nature/natureza/quaternario-natural-organic.jpg',
          titulo: 'Harmonia Quaternária',
          descricao: 'As 4 pedras sagradas em equilíbrio natural',
          categoria: 'harmonia'
        }
      ]
    };
    
    // Stats para mostrar integração com catálogo
    let catalogStats = {};
    try {
      // Contar produtos por pedra
      const [onixCount] = await Product.query('SELECT COUNT(*) as count FROM products WHERE stone_type = ? AND active = TRUE', ['onix']);
      const [tigerCount] = await Product.query('SELECT COUNT(*) as count FROM products WHERE stone_type = ? AND active = TRUE', ['olho-de-tigre']);
      const [amethystCount] = await Product.query('SELECT COUNT(*) as count FROM products WHERE stone_type = ? AND active = TRUE', ['ametista']);
      const [turquoiseCount] = await Product.query('SELECT COUNT(*) as count FROM products WHERE stone_type = ? AND active = TRUE', ['turquesa']);
      
      catalogStats = {
        onix: onixCount?.count || 4,
        'olho-de-tigre': tigerCount?.count || 4,
        ametista: amethystCount?.count || 4,
        turquesa: turquoiseCount?.count || 4,
        total: (onixCount?.count || 0) + (tigerCount?.count || 0) + (amethystCount?.count || 0) + (turquoiseCount?.count || 0) || 16
      };
    } catch (dbError) {
      console.error('Error fetching catalog stats:', dbError);
      catalogStats = { onix: 4, 'olho-de-tigre': 4, ametista: 4, turquesa: 4, total: 16 };
    }
    
    res.render('pages/galeria-dark-nature', {
      layout: false,
      currentPage: 'galeria',
      title: 'Galeria Dark Nature - Da Terra Nasce a Arte | Gonzaga Art & Shine',
      pedrasInfo,
      galleryAssets,
      catalogStats,
      meta: {
        description: 'Explore a jornada visual das 4 pedras sagradas. Do mineral bruto ao artesanato português - autenticidade pura Dark Nature.',
        keywords: 'galeria pedras naturais, artesanato português, ónix olho-de-tigre ametista turquesa, processo artesanal',
        canonical: `${req.protocol}://${req.get('host')}/galeria`
      }
    });
    
  } catch (error) {
    console.error('Erro na galeria:', error);
    res.status(500).render('error', { 
      error: 'Erro ao carregar galeria',
      layout: false
    });
  }
});

// About page (usando layout Dark Nature)
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'Sobre Nós',
    currentPage: 'about',
    layout: 'layout', // Dark Nature layout
    siteTitle: 'Gonzaga\'s Art & Shine',
    siteDescription: 'Elegância que nasce da terra'
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

// ==========================================
// E-COMMERCE ENHANCED ROUTES
// ==========================================

// Apply activity logging to all routes (from this point forward)
router.use(logActivity);

// Order confirmation & tracking
router.get('/order-confirmation/:orderNumber', OrderController.showConfirmation);
router.get('/order-tracking/:orderNumber', OrderController.showTracking);

// Checkout process endpoint
router.post('/checkout/process', OrderController.processOrder);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Admin authentication (public)
router.get('/admin/login', (req, res) => {
    if (req.session.adminUser) {
        return res.redirect('/admin');
    }
    res.render('admin/login-dark-nature', {
        title: 'Admin Login - Gonzaga Art & Shine',
        layout: false
    });
});

router.post('/admin/login', AdminController.login);
router.get('/admin/logout', AdminController.logout);

// Admin dashboard (protected)
router.get('/admin', requireAdmin, AdminController.dashboard);

// Orders management
router.get('/admin/orders', requireAdmin, AdminController.listOrders);
router.get('/admin/orders/:id', requireAdmin, AdminController.viewOrder);
router.put('/admin/orders/:id/status', requireAdmin, AdminController.updateOrderStatus);
router.post('/admin/orders/:id/notes', requireAdmin, AdminController.addOrderNote);

// Products management (basic routes - detailed CRUD can be added later)
router.get('/admin/products', requireAdmin, AdminController.listProducts);

// Customers management
router.get('/admin/customers', requireAdmin, AdminController.listCustomers);
router.get('/admin/customers/:id', requireAdmin, AdminController.viewCustomer);

// Analytics
router.get('/admin/analytics', requireAdmin, AdminController.analytics);
router.get('/admin/api/dashboard-updates', requireAdmin, AdminController.dashboardUpdates);

// Settings
router.get('/admin/settings', requireAdmin, AdminController.settings);
router.put('/admin/settings', requireAdmin, AdminController.updateSettings);

// Activity log
router.get('/admin/activities', requireAdmin, AdminController.activities);

module.exports = router; 