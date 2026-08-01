const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const CatalogController = require('../controllers/CatalogController');
const ProductController = require('../controllers/ProductController'); // Added for product details UC page
const { safeCatalogReturnUrl } = require('../utils/catalogReturnUrl');
const EcommerceSettings = require('../modules/ecommerce/settings/models/EcommerceSettings');
const { formatRow } = require('../services/catalogQueryService');
const GalleryItem = require('../models/GalleryItem');
const Collection = require('../models/Collection');
const brand = require('../config/brand');
const InstagramAccount = require('../models/InstagramAccount');
const instagramSync = require('../services/instagramSyncService');

// Home page - Showcase page with featured products and media gallery
router.get('/', async (req, res) => {
  try {
    let featured = [];
    let families = [];
    let showcaseFamilies = [];
    let showcaseCollections = [];
    let showcaseMaterials = [];

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
      showcaseFamilies = await ProductFamily.getForHomeShowcase(6);
      showcaseCollections = await Collection.getActiveWithCounts();
      showcaseMaterials = await ProductFamily.getMaterialsForHome({ hideOutOfStock });
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

    // Featured section background: escolhida no admin se ainda existir na galeria, senão null
    const configuredFeaturedBackground = res.locals.siteSettings && res.locals.siteSettings.featured_background;
    const configuredFeaturedExists = configuredFeaturedBackground
      && mediaFiles.some((m) => m.path === configuredFeaturedBackground);
    const featuredBackground = configuredFeaturedExists ? configuredFeaturedBackground : null;

    // Media strip background: escolhida no admin se ainda existir na galeria, senão null
    const configuredMediaStripBackground = res.locals.siteSettings && res.locals.siteSettings.media_strip_background;
    const configuredMediaStripExists = configuredMediaStripBackground
      && mediaFiles.some((m) => m.path === configuredMediaStripBackground);
    const mediaStripBackground = configuredMediaStripExists ? configuredMediaStripBackground : null;

    // Faixa do Instagram: vem da MESMA fonte que a galeria — a base de dados,
    // já moderada. Antes chamava a API directamente, o que trazia dois
    // problemas: uma publicação escondida no admin continuava a aparecer aqui,
    // e quando o token expirava a faixa desaparecia em vez de mostrar o que já
    // estava guardado. `getMediaPublica` nunca lança; sem dados devolve [] e a
    // secção simplesmente não é desenhada.
    const igPosts = await instagramSync.getMediaPublica(6);

    res.render('index', {
      title: `${brand.nomeSeo} — ${brand.mote}`,
      layout: 'layouts/main',
      metaDescription: `Joias artesanais em prata 925 e pedras naturais. Descubra a coleção ${brand.assinatura} — ${brand.mote.toLowerCase()}, em Portugal.`,
      canonicalUrl: 'https://artnshine.pt/',
      featured: featured || [],
      families: families || [],
      showcaseFamilies: showcaseFamilies || [],
      showcaseCollections: showcaseCollections || [],
      showcaseMaterials: showcaseMaterials || [],
      mediaFiles: mediaFiles || [],
      heroImage,
      featuredBackground,
      mediaStripBackground,
      igPosts,
      siteTitle: brand.nome,
      siteDescription: brand.mote,
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

/**
 * GALERIA de fotografias. Não são coleções nem categorias: são imagens
 * curadas em /admin/gallery, sem ligação a produtos.
 *
 * Vivia em /collections, endereço que dizia "coleções" à galeria e ficava
 * ao lado de /colecoes, que são as coleções a sério — a confusão que este
 * conjunto de alterações veio eliminar.
 */
router.get('/galeria', async (req, res) => {
  try {
    // Galeria curada no admin (/admin/gallery) — ordem e legendas definidas lá.
    const imageFiles = (await GalleryItem.getAllActive()).map((item) => ({
      filename: item.filename,
      caption: item.caption,
      path: `/media/gallery/${item.filename}`,
      url: `/media/gallery/${item.filename}`
    }));

    // Instagram: nunca pode impedir a galeria de carregar. O serviço já
    // engole os erros e devolve o que está guardado na base de dados.
    const instagramMedia = await instagramSync.getMediaPublica(18);
    let instagramUsername = null;
    try {
      const conta = await InstagramAccount.get();
      instagramUsername = conta.username || null;
    } catch (_) {}

    res.render('collections', {
      title: 'Galeria de Peças',
      layout: 'layouts/main',
      instagramMedia,
      instagramUsername,
      metaDescription: `Galeria de joias artesanais ${brand.assinatura}. Prata 925, latão banhado a prata e pedras naturais — ónix, olho-de-tigre, ametista e turquesa.`,
      canonicalUrl: 'https://artnshine.pt/galeria',
      images: imageFiles,
      user: req.user || null,
      siteTitle: brand.nome,
      siteDescription: brand.mote,
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

/** Endereço antigo da galeria, indexado no Google. */
router.get('/collections', (req, res) => res.redirect(301, '/galeria'));

/**
 * Índice das coleções curadas — conjuntos escolhidos à mão, que podem
 * atravessar várias categorias.
 */
router.get('/colecoes', async (req, res) => {
  try {
    const collections = await Collection.getActiveWithCounts();

    res.render('curated-collections', {
      title: 'Coleções',
      layout: 'layouts/main',
      collections,
      metaDescription: `Coleções de joias artesanais ${brand.assinatura} — conjuntos escolhidos peça a peça em prata 925, latão e pedras naturais.`,
      canonicalUrl: 'https://artnshine.pt/colecoes',
      user: req.user || null,
      siteTitle: brand.nome,
      siteDescription: brand.mote,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading collections index:', error);
    res.status(500).render('error', {
      title: 'Erro',
      message: 'Falha ao carregar as coleções.',
      layout: false
    });
  }
});

/**
 * Coleção curada — conjunto de peças escolhidas à mão no admin.
 * Endereço próprio (/colecao/) para não colidir com /collection/:id, que são as
 * categorias e já está indexado, nem com /collections, que é a galeria de media.
 */
// Mesma lógica das famílias: uma descrição curta do admin sozinha dá uma
// meta description fina, por isso junta-se-lhe o contexto da coleção.
function buildCollectionDescription(collection, productCount) {
  const base = (collection.description || '').trim().replace(/"/g, "'");
  const pecas = `${productCount} peça${productCount === 1 ? '' : 's'}`;
  const contexto = `Coleção ${collection.name} da ${brand.assinatura}: ${pecas} em prata 925, latão e pedras naturais, com envio para todo o país.`;
  if (base.length >= 80) return base.substring(0, 158);
  return base ? `${base} ${contexto}`.substring(0, 158) : contexto.substring(0, 158);
}

router.get('/colecao/:slug', async (req, res) => {
  try {
    const collection = await Collection.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).render('error', {
        title: 'Coleção não encontrada',
        message: 'Esta coleção não existe ou já não está disponível.',
        layout: false
      });
    }

    const rawProducts = await Collection.getProducts(collection.id);
    const ecommerceSettings = await EcommerceSettings.getAll();
    const products = rawProducts.map((p) => formatRow(p, ecommerceSettings));

    // Uma coleção pode ter o mesmo nome de uma família ("Pedras Naturais"),
    // o que daria dois títulos idênticos no Google. O sufixo "Coleção"
    // distingue-os sem estragar o título.
    const pageTitle = collection.seo_title || `${collection.name} — Coleção`;

    res.render('curated-collection', {
      title: pageTitle,
      layout: 'layouts/main',
      collection,
      products,
      metaDescription: collection.seo_description
        || buildCollectionDescription(collection, products.length),
      canonicalUrl: 'https://artnshine.pt/colecao/' + collection.slug,
      user: req.user || null,
      siteTitle: brand.nome,
      siteDescription: brand.mote,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error loading curated collection:', error);
    res.status(500).render('error', {
      title: 'Erro',
      message: 'Falha ao carregar a coleção.',
      layout: false
    });
  }
});

// Meta description de uma família: usa o texto do admin quando ele já é
// substancial e, se for curto ou inexistente, junta o contexto do catálogo.
function buildFamilyDescription(family, productCount) {
  const base = (family.description || '').trim().replace(/"/g, "'");
  const contagem = `${productCount} peça${productCount === 1 ? '' : 's'} disponíve${productCount === 1 ? 'l' : 'is'}`;
  const contexto = `${family.name} da ${brand.assinatura} — ${contagem} em prata 925, latão e pedras naturais, com envio para todo o país.`;
  if (base.length >= 80) return base.substring(0, 158);
  return base ? `${base} ${contexto}`.substring(0, 158) : contexto.substring(0, 158);
}

/**
 * Página de CATEGORIA (product_families).
 *
 * Uma categoria não é uma coleção: a categoria é a taxonomia a que cada peça
 * pertence obrigatoriamente (material → tipo+material), enquanto uma coleção
 * é um conjunto curado à mão que pode atravessar várias categorias e vive em
 * /colecao/:slug. O endereço antigo era /collection/:id, que dizia "collection"
 * a uma categoria e servia URLs numéricos — ver o 301 mais abaixo.
 */
router.get('/categoria/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const family = await ProductFamily.getByIdOrSlug(slug);

    if (!family) {
      return res.status(404).render('error', {
        title: 'Categoria não encontrada',
        message: 'Esta categoria não existe ou já não está disponível.',
        layout: false
      });
    }

    // Chegar por id a /categoria/16 é um endereço não canónico: redirecciona.
    if (/^\d+$/.test(slug) && family.slug) {
      return res.redirect(301, `/categoria/${family.slug}`);
    }

    const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
    const rawProducts = await Product.getByFamilyTree(family.id, 500, 0, { hideOutOfStock });
    const ecommerceSettings = await EcommerceSettings.getAll();
    const products = rawProducts.map((p) => formatRow(p, ecommerceSettings));
    const nav = await ProductFamily.getNavigation(family, { hideOutOfStock });

    // Numa categoria de topo os produtos vêm das subcategorias todas, por isso
    // agrupam-se — é o que dá âncoras ao índice lateral e evita uma grelha
    // corrida de 200 peças sem qualquer marco visual.
    let grupos = [];
    if (!family.parent_id && nav.children.length > 1) {
      const porFamilia = new Map();
      products.forEach((p) => {
        if (!porFamilia.has(p.family_id)) porFamilia.set(p.family_id, []);
        porFamilia.get(p.family_id).push(p);
      });
      grupos = nav.children
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          anchor: `cat-${c.slug || c.id}`,
          products: porFamilia.get(c.id) || []
        }))
        .filter((g) => g.products.length > 0);
    }

    res.render('category', {
      // Textos de SEO definidos no admin ganham ao que é derivado do conteúdo.
      title: family.seo_title || family.name,
      family,
      products,
      grupos,
      nav,
      // Descrições curtas do admin davam meta descriptions de 30 chars, que o
      // Google trata como conteúdo fino: completa-se com o contexto da família.
      metaDescription: family.seo_description
        || buildFamilyDescription(family, products.length),
      canonicalUrl: 'https://artnshine.pt/categoria/' + family.slug
    });
  } catch (error) {
    console.error('Error loading category:', error);
    res.status(500).render('error', {
      title: 'Erro',
      message: 'Falha ao carregar a categoria.',
      layout: false
    });
  }
});

/**
 * Endereço antigo das categorias. Estavam indexados no Google 23 URLs
 * numéricos (/collection/16), por isso o 301 é obrigatório — sem ele
 * perdia-se toda a autoridade acumulada nessas páginas.
 */
router.get('/collection/:familyIdOrSlug', async (req, res) => {
  try {
    const family = await ProductFamily.getByIdOrSlug(req.params.familyIdOrSlug);
    if (!family) {
      return res.status(404).render('error', {
        title: 'Categoria não encontrada',
        message: 'Esta categoria não existe ou já não está disponível.',
        layout: false
      });
    }
    return res.redirect(301, `/categoria/${family.slug || family.id}`);
  } catch (error) {
    console.error('Error redirecting legacy collection URL:', error);
    return res.redirect(301, '/catalog');
  }
});

// LOJA. O endereço era /catalog; passou a /loja para bater certo com a
// palavra do menu. Os antigos fazem 301 permanente — eram 410 URLs
// indexadas (a loja + 409 fichas de produto).
router.get('/loja', CatalogController.displayCatalog);

/** Endereço antigo da loja. */
router.get('/catalog', (req, res) => {
  // A query tem de acompanhar, senão um link partilhado com filtros perdia-os.
  const qs = req.originalUrl.includes('?')
    ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
    : '';
  res.redirect(301, '/loja' + qs);
});

// Product detail under construction page
router.get('/product/:id/details-uc', ProductController.showProductDetailUnderConstruction);

// Product detail page
router.get('/product/:id', ProductController.showProductDetailUnderConstruction);

// Product detail route for WhatsApp
// Meta description de um produto, garantindo ~110-160 chars: usa a descrição
// da ficha e, quando ela é curta, junta material, família e contexto da loja.
function buildProductDescription(product) {
  const base = (product.description || '').trim().replace(/\s+/g, ' ').replace(/"/g, "'");
  if (base.length >= 110) {
    // Modelos repetidos partilham a mesma descrição de ficha: a referência
    // evita meta descriptions idênticas em várias páginas.
    const ref = hasReferenceInSlug(product) ? ` Ref. ${product.reference}.` : '';
    const limite = 158 - ref.length;
    return (base.length > limite ? base.substring(0, limite - 3).trimEnd() + '...' : base) + ref;
  }
  const extras = [];
  if (product.material) extras.push(product.material);
  if (product.family_name) extras.push(product.family_name);
  if (hasReferenceInSlug(product)) extras.push(`ref. ${product.reference}`);
  const cauda = `${extras.length ? extras.join(', ') + '. ' : ''}Peça da ${brand.assinatura}, com envio para todo o país.`;
  const texto = base ? `${base} ${cauda}` : `${product.name}. ${cauda}`;
  return texto.length > 158 ? texto.substring(0, 155).trimEnd() + '...' : texto;
}

// 31 modelos existem em várias peças com o mesmo nome. Quando isso acontece,
// só a primeira fica com o slug igual ao nome e as restantes levam um sufixo
// (a referência ou "-variante") — é esse o sinal de que o título precisa da
// referência para não ficar duplicado no Google.
function hasReferenceInSlug(product) {
  if (!product.slug || !product.reference) return false;
  const slugDoNome = String(product.name || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return product.slug !== slugDoNome;
}

/** Endereço antigo das fichas de produto — 409 URLs indexadas. */
router.get('/catalog/product/:idOrSlug', (req, res) => {
  const qs = req.originalUrl.includes('?')
    ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
    : '';
  res.redirect(301, `/loja/produto/${encodeURIComponent(req.params.idOrSlug)}` + qs);
});

router.get('/loja/produto/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { pool } = require('../config/database');
    
    const isNumeric = /^\d+$/.test(idOrSlug);
    const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug) : idOrSlug;

    const [results] = await pool.execute(`
      SELECT p.*, pf.name as family_name, pf.slug as family_slug,
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
      return res.status(404).render('error', { title: 'Não encontrado', message: 'Produto não encontrado', layout: false });
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

Ver produto: ${brand.baseUrl}/loja/produto/${product.slug || id}`;

    const whatsappData = {
      // O fallback era o literal '351XXXXXXXXX': sem WHATSAPP_NUMBER no
      // ambiente, o botão de contacto de TODAS as fichas de produto apontava
      // para um número de telefone inexistente — e ninguém conseguia usar o
      // canal principal de contacto da loja. `brand.telefone` é a mesma
      // origem que o rodapé, o header e o schema.org já usam.
      number: process.env.WHATSAPP_NUMBER || brand.telefone.replace(/[^0-9]/g, ''),
      encodedMessage: encodeURIComponent(whatsappMessage)
    };
    
    // Meta description: a descrição da ficha é a melhor fonte, mas muitas são
    // de uma linha só (~40 chars) e sozinhas dariam snippets finos. Nesses
    // casos completa-se com material, família e contexto da loja.
    const metaDesc = buildProductDescription(product);

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
      `Ver produto: ${baseUrl}/loja/produto/${productSlugOrId}`
    );

    // Peças vizinhas na mesma categoria, para as setas da ficha. O
    // `hide_out_of_stock` tem de acompanhar: senão as setas percorriam peças
    // que a loja não mostra, e a contagem contradizia a da categoria.
    const vizinhas = await Product.getAdjacentInFamily(product.id, product.family_id, {
      hideOutOfStock: !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock)
    });

    res.render('catalog/product-detail', {
      vizinhas, 
      product, 
      whatsappData,
      whatsappNotifyMsg,
      relatedProducts,
      catalogBackUrl: safeCatalogReturnUrl(req.query.return),
      layout: 'layouts/main',
      title: hasReferenceInSlug(product)
        ? `${product.name} (${product.reference})`
        : product.name,
      siteTitle: brand.nome,
      metaDescription: metaDesc,
      canonicalUrl: `${baseUrl}/loja/produto/${productSlugOrId}`,
      ogImage: product.images && product.images.length > 0 ? `${baseUrl}/media/products/${product.images[0].replace(/\.[^.]+$/, '')}-medium.jpg` : undefined,
      ogType: 'product'
    });
    
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).render('error', { title: 'Erro', message: 'Erro interno', layout: false });
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
    res.status(500).render('error', { title: 'Erro', message: 'Erro ao carregar resultados', layout: false });
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
router.get('/instagram', (req, res) => res.redirect(301, '/galeria'));
router.get('/instagram-preview', (req, res) => res.redirect(301, '/galeria'));
router.get('/instagram-lab', (req, res) => res.redirect(301, '/galeria'));

// About page
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'Sobre Nós',
    metaDescription: `A ${brand.assinatura} nasceu da paixão por transformar pedras naturais e prata 925 em joias com alma. ${brand.mote}, em Portugal.`,
    canonicalUrl: 'https://artnshine.pt/about'
  });
});

// Privacy Policy page
router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', {
    title: 'Política de Privacidade',
    // Sem isto herdava a descrição genérica do site, ficando igual à do
    // catálogo e dos termos — três páginas com a mesma meta description.
    metaDescription: `Como a ${brand.assinatura} recolhe, usa e protege os seus dados pessoais, e quais são os seus direitos ao abrigo do RGPD.`,
    canonicalUrl: 'https://artnshine.pt/privacy-policy'
  });
});

// Terms of Service page
router.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', {
    title: 'Termos de Serviço',
    metaDescription: `Condições de utilização da loja ${brand.assinatura}: encomendas, pagamentos, envios, trocas e devoluções de joias em prata 925.`,
    canonicalUrl: 'https://artnshine.pt/terms-of-service'
  });
});

module.exports = router; 